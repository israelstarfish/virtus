//backend/routes/auth.go

package routes

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"virtuscloud/backend/middleware"
	"virtuscloud/backend/models"
	"virtuscloud/backend/services"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"

	"github.com/golang-jwt/jwt/v5"
)

type VerifyRequest struct {
	Email    string `json:"email"`
	Code     string `json:"code"`
	Username string `json:"username"` // ← novo campo
}

// 🔐 Verifica o código e autentica o usuário (cadastro ou login)
func VerifyCodeHandler(w http.ResponseWriter, r *http.Request) {
	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Code == "" {
		utils.WriteJSON(w, map[string]string{
			"error": "Dados inválidos. Verifique e tente novamente.",
		})
		return
	}

	log.Printf("🔍 Verificando código: Email=%s, Code=%s, Username=%s", req.Email, req.Code, req.Username)

	// ✅ Verifica se o código é válido
	if !services.IsValidToken(req.Email, req.Code) {
		log.Printf("❌ Código inválido ou expirado para %s", req.Email)
		utils.WriteJSON(w, map[string]string{
			"error": "Código inválido ou expirado",
		})
		return
	}

	var user *models.User
	var err error

	if req.Username == "" {
		// 🔐 Login: busca usuário pelo e-mail
		user = services.FindUserByEmail(req.Email)
		if user == nil {
			utils.WriteJSON(w, map[string]string{
				"error": "Usuário não encontrado",
			})
			return
		}
		log.Printf("✅ Usuário autenticado: %s (%s)", user.Username, user.Email)
	} else {
		// 🆕 Cadastro: autentica com username
		user, err = services.AuthenticateUserWithToken(req.Email, req.Code, req.Username)
		if err != nil {
			utils.WriteJSON(w, map[string]string{
				"error": err.Error(),
			})
			return
		}
	}

	// 📩 Envia e-mail de confirmação de login com localização dinâmica
	go func() {
		ip := r.Header.Get("X-Forwarded-For")
		if ip == "" {
			ip = r.RemoteAddr
		}
		location := utils.GetLocationFromIP(ip)
		err := utils.SendLoginConfirmationEmail(user.Email, user.Username, ip, location)
		if err != nil {
			log.Printf("⚠️ Falha ao enviar e-mail de login: %v", err)
		}
	}()

	// 🔐 Gera token JWT
	token, err := utils.GenerateJWT(user.Username, user.Role, string(user.Plan), user.Email)
	//token, err := utils.GenerateJWT(user.Username, user.Role, user.Email, string(user.Plan))
	//token, err := utils.GenerateJWT(user.Username, user.Role, string(user.Plan))
	if err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Erro ao gerar token de acesso.",
		})
		return
	}

	// 💾 Salva sessão em sessions.json
	session := models.SessionData{
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		Plan:     string(user.Plan),
		LastSeen: utils.NowISO(),
		Token:    token,
	}
	// 💾 Salva sessão em sessions.json
	//session := models.SessionData{
	//	ID:       strconv.Itoa(user.ID),
	//	Username: user.Username,
	//	Email:    user.Email,
	//	Role:     user.Role,
	//	Plan:     string(user.Plan),
	//	LastSeen: utils.NowISO(),
	//	Token:    token,
	//}

	sessions := map[string]models.SessionData{}
	file, err := os.Open("./database/sessions.json")
	if err == nil {
		_ = json.NewDecoder(file).Decode(&sessions)
		file.Close()
	}

	// ✅ Salva apenas a sessão atual por username
	sessions[user.Username] = session
	// 🧹 Limpa todas as sessões anteriores
	//sessions = map[string]models.SessionData{}

	// ✅ Salva apenas a sessão atual por token
	//sessions[token] = session

	file, err = os.Create("./database/sessions.json")
	if err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Erro ao salvar sessão.",
		})
		return
	}
	defer file.Close()

	if err := json.NewEncoder(file).Encode(sessions); err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Erro ao escrever sessão.",
		})
		return
	}

	// 🍪 Define cookie de autenticação
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // true em produção com HTTPS
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400,
	})

	langCookie, err := r.Cookie("virtuscloud.locale")
	lang := "pt-br" // valor padrão
	if err == nil && langCookie.Value != "" {
		lang = langCookie.Value
	}

	// ✅ Retorna dados do usuário
	utils.WriteJSON(w, map[string]interface{}{
		"success": true,
		"message": "Autenticação bem-sucedida",
		"user": map[string]interface{}{
			"username": user.Username,
			"role":     user.Role,
			"plan":     user.Plan,
		},
		"redirect": fmt.Sprintf("/%s/dashboard", lang),
	})

	//// ✅ Retorna dados do usuário
	//utils.WriteJSON(w, map[string]interface{}{
	//	"success": true,
	//	"message": "Autenticação bem-sucedida",
	//	"user": map[string]interface{}{
	//		"id":       user.ID,
	//		"username": user.Username,
	//		"role":     user.Role,
	//		"plan":     user.Plan,
	//	},
	//	"redirect": "/dashboard",
	//})
}

// 🔍 Verifica se o token é válido e corresponde à sessão salva
func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil || cookie.Value == "" {
		utils.WriteJSON(w, map[string]string{
			"error": "Token ausente",
		})
		return
	}

	tokenStr := cookie.Value
	claims := jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return middleware.JwtSecret, nil
	})
	if err != nil || !token.Valid {
		utils.WriteJSON(w, map[string]string{
			"error": "Token inválido ou expirado",
		})
		return
	}

	username, _ := claims["username"].(string)
	role, _ := claims["role"].(string)

	// 🔄 Carrega sessões
	sessionFile, err := os.Open("./database/sessions.json")
	if err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Erro ao abrir sessões",
		})
		return
	}
	defer sessionFile.Close()

	sessions := map[string]models.SessionData{}
	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Sessões inválidas",
		})
		return
	}

	session, ok := sessions[username]
	if !ok || session.Role != role || session.Token != tokenStr {
		utils.WriteJSON(w, map[string]string{
			"error": "Sessão não corresponde ao token",
		})
		return
	}

	// 🧠 Carrega plano atualizado do usuário
	userFile, err := os.Open("./database/users.json")
	if err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Erro ao abrir usuários",
		})
		return
	}
	defer userFile.Close()

	users := map[string]models.User{}
	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Usuários inválidos",
		})
		return
	}

	user, ok := users[username]
	if !ok {
		utils.WriteJSON(w, map[string]string{
			"error": "Usuário não encontrado",
		})
		return
	}

	// 🔁 Sincroniza plano da sessão com plano do usuário
	if session.Plan != string(user.Plan) {
		session.Plan = string(user.Plan)
		sessions[username] = session

		// 💾 Salva sessões atualizadas
		sessionFileWrite, err := os.Create("./database/sessions.json")
		if err == nil {
			json.NewEncoder(sessionFileWrite).Encode(sessions)
			sessionFileWrite.Close()
		}
	}

	// ✅ Retorna dados da sessão válida
	utils.WriteJSON(w, map[string]string{
		"username": username,
		"role":     role,
		"plan":     session.Plan,
	})
}

func PingSessionHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil || cookie.Value == "" {
		utils.WriteJSON(w, map[string]string{
			"error": "Token ausente",
		})
		return
	}

	tokenStr := cookie.Value
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return middleware.JwtSecret, nil
	})
	if err != nil || !token.Valid {
		utils.WriteJSON(w, map[string]string{
			"error": "Token inválido ou expirado",
		})
		return
	}

	username, _ := claims["username"].(string)

	// 🔄 Carrega sessões
	sessionFile, err := os.Open("./database/sessions.json")
	if err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Erro ao abrir sessões",
		})
		return
	}
	defer sessionFile.Close()

	sessions := map[string]models.SessionData{}
	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
		utils.WriteJSON(w, map[string]string{
			"error": "Sessões inválidas",
		})
		return
	}

	session, ok := sessions[username]
	if !ok || session.Token != tokenStr {
		models.DeleteSessionByEmail(claims["email"].(string))
		utils.WriteJSON(w, map[string]string{
			"error": "Sessão não corresponde ao token",
		})
		return
	}

	// 🕒 Atualiza lastSeen
	session.LastSeen = time.Now().Format(time.RFC3339)
	sessions[username] = session

	// 💾 Salva sessões atualizadas
	sessionFileWrite, err := os.Create("./database/sessions.json")
	if err == nil {
		json.NewEncoder(sessionFileWrite).Encode(sessions)
		sessionFileWrite.Close()
	}

	utils.WriteJSON(w, map[string]string{
		"message": "Sessão validada e atualizada",
	})
}

// 🔄 Sincroniza plano da sessão com users.json e move apps para o novo diretório se necessário
func syncSessionsWithUsers() {
	// 🧾 Carrega usuários
	userFile, err := os.Open("./database/users.json")
	if err != nil {
		fmt.Println("Erro ao abrir users.json:", err)
		return
	}
	defer userFile.Close()

	users := map[string]models.User{}
	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
		fmt.Println("Erro ao decodificar users.json:", err)
		return
	}

	// 🧾 Carrega sessões
	sessionFile, err := os.Open("./database/sessions.json")
	if err != nil {
		fmt.Println("Erro ao abrir sessions.json:", err)
		return
	}
	defer sessionFile.Close()

	sessions := map[string]models.SessionData{}
	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
		fmt.Println("Erro ao decodificar sessions.json:", err)
		return
	}

	// 🔄 Atualiza plano e migra apps
	updated := false
	for username, session := range sessions {
		user, ok := users[username]
		if ok && session.Plan != string(user.Plan) {
			fmt.Printf("Atualizando plano de %s: %s → %s\n", username, session.Plan, user.Plan)

			// 📦 Move apps para o novo plano
			err := services.MigrateAllUserAppsToNewPlan(username, user.Plan)
			if err != nil {
				fmt.Printf("Erro ao migrar apps de %s: %v\n", username, err)
			}

			session.Plan = string(user.Plan)
			sessions[username] = session
			updated = true
		}
	}

	// 💾 Salva sessões atualizadas
	if updated {
		sessionFileWrite, err := os.Create("./database/sessions.json")
		if err != nil {
			fmt.Println("Erro ao salvar sessions.json:", err)
			return
		}
		defer sessionFileWrite.Close()

		if err := json.NewEncoder(sessionFileWrite).Encode(sessions); err != nil {
			fmt.Println("Erro ao escrever sessions.json:", err)
		}
	}
}

// 🔓 Logout manual — remove o cookie e a sessão do usuário
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	// 🔍 Tenta extrair o token do cookie ANTES de apagá-lo
	cookie, err := r.Cookie("token")
	if err != nil || cookie.Value == "" {
		utils.WriteJSON(w, map[string]string{
			"message": "Logout realizado (sem token)",
		})
		return
	}

	tokenStr := cookie.Value
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return middleware.JwtSecret, nil
	})
	if err != nil || !token.Valid {
		utils.WriteJSON(w, map[string]string{
			"message": "Logout realizado (token inválido)",
		})
		return
	}

	email, _ := claims["email"].(string)

	// 🔓 Remove sessão do arquivo
	if err := models.DeleteSessionByEmail(email); err != nil {
		log.Printf("❌ Erro ao remover sessão: %v", err)
		utils.WriteJSON(w, map[string]string{
			"message": "Erro ao remover sessão",
		})
		return
	}

	// 🧹 Remove token da memória
	services.DeleteToken(email)

	// 🔄 Sincroniza sessões com usuários válidos
	if err := store.SyncSessionsWithUserStore(); err != nil {
		log.Printf("⚠️ Erro ao sincronizar sessões: %v", err)
	}

	// 🍪 Apaga o cookie do token
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	log.Printf("🔓 Logout realizado para %s", email)

	utils.WriteJSON(w, map[string]string{
		"message": "Logout realizado com sucesso",
	})
}

// 📜 Histórico de migração de plano
func UserPlanMigrationHistoryHandler(w http.ResponseWriter, r *http.Request) {
	clientID := utils.GetBearerToken(r)

	var userLogs []services.PlanMigrationLog
	for _, log := range services.GetMigrationLogs() {
		if log.Username == clientID {
			userLogs = append(userLogs, log)
		}
	}

	utils.WriteJSON(w, map[string]interface{}{"migrations": userLogs})
}

// 🔎 Verifica se nome de usuário ou e-mail já estão em uso
func CheckUserAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Username string `json:"username"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Username == "" {
		utils.WriteJSON(w, map[string]string{
			"error": "Dados inválidos",
		})
		return
	}

	// 🔍 Percorre usuários existentes
	for _, u := range services.LoadAllUsers() {
		if u.Email == req.Email || u.Username == req.Username {
			utils.WriteJSON(w, map[string]bool{
				"exists": true,
			})
			return
		}
	}

	utils.WriteJSON(w, map[string]bool{
		"exists": false,
	})
}

// 🔎 Verifica se o e-mail está cadastrado para login
func CheckLoginEligibilityHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
		utils.WriteJSON(w, map[string]string{
			"error": "Dados inválidos",
		})
		return
	}

	for _, u := range services.LoadAllUsers() {
		if u.Email == req.Email {
			utils.WriteJSON(w, map[string]bool{
				"exists": true,
			})
			return
		}
	}

	utils.WriteJSON(w, map[string]bool{
		"exists": false,
	})
}

//backend/routes/auth.go

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"log"
//	"net/http"
//	"os"
//	"time"
//
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//
//	"github.com/golang-jwt/jwt/v5"
//)
//
//type VerifyRequest struct {
//	Email    string `json:"email"`
//	Code     string `json:"code"`
//	Username string `json:"username"` // ← novo campo
//}
//
//// 🔐 Verifica o código e autentica o usuário (cadastro ou login)
//func VerifyCodeHandler(w http.ResponseWriter, r *http.Request) {
//	var req VerifyRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Code == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Dados inválidos. Verifique e tente novamente.",
//		})
//		return
//	}
//
//	log.Printf("🔍 Verificando código: Email=%s, Code=%s, Username=%s", req.Email, req.Code, req.Username)
//
//	// ✅ Verifica se o código é válido
//	if !services.IsValidToken(req.Email, req.Code) {
//		log.Printf("❌ Código inválido ou expirado para %s", req.Email)
//		utils.WriteJSON(w, map[string]string{
//			"error": "Código inválido ou expirado",
//		})
//		return
//	}
//
//	var user *models.User
//	var err error
//
//	if req.Username == "" {
//		// 🔐 Login: busca usuário pelo e-mail
//		user = services.FindUserByEmail(req.Email)
//		if user == nil {
//			utils.WriteJSON(w, map[string]string{
//				"error": "Usuário não encontrado",
//			})
//			return
//		}
//		log.Printf("✅ Usuário autenticado: %s (%s)", user.Username, user.Email)
//	} else {
//		// 🆕 Cadastro: autentica com username
//		user, err = services.AuthenticateUserWithToken(req.Email, req.Code, req.Username)
//		if err != nil {
//			utils.WriteJSON(w, map[string]string{
//				"error": err.Error(),
//			})
//			return
//		}
//	}
//
//	// 📩 Envia e-mail de confirmação de login com localização dinâmica
//	go func() {
//		ip := r.Header.Get("X-Forwarded-For")
//		if ip == "" {
//			ip = r.RemoteAddr
//		}
//		location := utils.GetLocationFromIP(ip)
//		err := utils.SendLoginConfirmationEmail(user.Email, user.Username, ip, location)
//		if err != nil {
//			log.Printf("⚠️ Falha ao enviar e-mail de login: %v", err)
//		}
//	}()
//
//	// 🔐 Gera token JWT
//	token, err := utils.GenerateJWT(user.Username, user.Role, string(user.Plan), user.Email)
//	//token, err := utils.GenerateJWT(user.Username, user.Role, user.Email, string(user.Plan))
//	//token, err := utils.GenerateJWT(user.Username, user.Role, string(user.Plan))
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao gerar token de acesso.",
//		})
//		return
//	}
//
//	// 💾 Salva sessão em sessions.json
//	session := models.SessionData{
//		Username: user.Username,
//		Email:    user.Email,
//		Role:     user.Role,
//		Plan:     string(user.Plan),
//		LastSeen: utils.NowISO(),
//		Token:    token,
//	}
//	// 💾 Salva sessão em sessions.json
//	//session := models.SessionData{
//	//	ID:       strconv.Itoa(user.ID),
//	//	Username: user.Username,
//	//	Email:    user.Email,
//	//	Role:     user.Role,
//	//	Plan:     string(user.Plan),
//	//	LastSeen: utils.NowISO(),
//	//	Token:    token,
//	//}
//
//	sessions := map[string]models.SessionData{}
//	file, err := os.Open("./database/sessions.json")
//	if err == nil {
//		_ = json.NewDecoder(file).Decode(&sessions)
//		file.Close()
//	}
//
//	// ✅ Salva apenas a sessão atual por username
//	sessions[user.Username] = session
//	// 🧹 Limpa todas as sessões anteriores
//	//sessions = map[string]models.SessionData{}
//
//	// ✅ Salva apenas a sessão atual por token
//	//sessions[token] = session
//
//	file, err = os.Create("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao salvar sessão.",
//		})
//		return
//	}
//	defer file.Close()
//
//	if err := json.NewEncoder(file).Encode(sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao escrever sessão.",
//		})
//		return
//	}
//
//	// 🍪 Define cookie de autenticação
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    token,
//		Path:     "/",
//		HttpOnly: true,
//		Secure:   false, // true em produção com HTTPS
//		SameSite: http.SameSiteStrictMode,
//		MaxAge:   86400,
//	})
//
//	langCookie, err := r.Cookie("virtuscloud.lang")
//	lang := "pt-br" // valor padrão
//	if err == nil && langCookie.Value != "" {
//		lang = langCookie.Value
//	}
//
//	// ✅ Retorna dados do usuário
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Autenticação bem-sucedida",
//		"user": map[string]interface{}{
//			"username": user.Username,
//			"role":     user.Role,
//			"plan":     user.Plan,
//		},
//		"redirect": fmt.Sprintf("/%s/dashboard", lang),
//	})
//
//	//// ✅ Retorna dados do usuário
//	//utils.WriteJSON(w, map[string]interface{}{
//	//	"success": true,
//	//	"message": "Autenticação bem-sucedida",
//	//	"user": map[string]interface{}{
//	//		"id":       user.ID,
//	//		"username": user.Username,
//	//		"role":     user.Role,
//	//		"plan":     user.Plan,
//	//	},
//	//	"redirect": "/dashboard",
//	//})
//}
//
//// 🔍 Verifica se o token é válido e corresponde à sessão salva
//func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token ausente",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token inválido ou expirado",
//		})
//		return
//	}
//
//	username, _ := claims["username"].(string)
//	role, _ := claims["role"].(string)
//
//	// 🔄 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir sessões",
//		})
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessões inválidas",
//		})
//		return
//	}
//
//	session, ok := sessions[username]
//	if !ok || session.Role != role || session.Token != tokenStr {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessão não corresponde ao token",
//		})
//		return
//	}
//
//	// 🧠 Carrega plano atualizado do usuário
//	userFile, err := os.Open("./database/users.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir usuários",
//		})
//		return
//	}
//	defer userFile.Close()
//
//	users := map[string]models.User{}
//	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Usuários inválidos",
//		})
//		return
//	}
//
//	user, ok := users[username]
//	if !ok {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	// 🔁 Sincroniza plano da sessão com plano do usuário
//	if session.Plan != string(user.Plan) {
//		session.Plan = string(user.Plan)
//		sessions[username] = session
//
//		// 💾 Salva sessões atualizadas
//		sessionFileWrite, err := os.Create("./database/sessions.json")
//		if err == nil {
//			json.NewEncoder(sessionFileWrite).Encode(sessions)
//			sessionFileWrite.Close()
//		}
//	}
//
//	// ✅ Retorna dados da sessão válida
//	utils.WriteJSON(w, map[string]string{
//		"username": username,
//		"role":     role,
//		"plan":     session.Plan,
//	})
//}
//
//func PingSessionHandler(w http.ResponseWriter, r *http.Request) {
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token ausente",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token inválido ou expirado",
//		})
//		return
//	}
//
//	username, _ := claims["username"].(string)
//
//	// 🔄 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir sessões",
//		})
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessões inválidas",
//		})
//		return
//	}
//
//	session, ok := sessions[username]
//	if !ok || session.Token != tokenStr {
//		models.DeleteSessionByEmail(claims["email"].(string))
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessão não corresponde ao token",
//		})
//		return
//	}
//
//	// 🕒 Atualiza lastSeen
//	session.LastSeen = time.Now().Format(time.RFC3339)
//	sessions[username] = session
//
//	// 💾 Salva sessões atualizadas
//	sessionFileWrite, err := os.Create("./database/sessions.json")
//	if err == nil {
//		json.NewEncoder(sessionFileWrite).Encode(sessions)
//		sessionFileWrite.Close()
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "Sessão validada e atualizada",
//	})
//}
//
//// 🔄 Sincroniza plano da sessão com users.json e move apps para o novo diretório se necessário
//func syncSessionsWithUsers() {
//	// 🧾 Carrega usuários
//	userFile, err := os.Open("./database/users.json")
//	if err != nil {
//		fmt.Println("Erro ao abrir users.json:", err)
//		return
//	}
//	defer userFile.Close()
//
//	users := map[string]models.User{}
//	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
//		fmt.Println("Erro ao decodificar users.json:", err)
//		return
//	}
//
//	// 🧾 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		fmt.Println("Erro ao abrir sessions.json:", err)
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		fmt.Println("Erro ao decodificar sessions.json:", err)
//		return
//	}
//
//	// 🔄 Atualiza plano e migra apps
//	updated := false
//	for username, session := range sessions {
//		user, ok := users[username]
//		if ok && session.Plan != string(user.Plan) {
//			fmt.Printf("Atualizando plano de %s: %s → %s\n", username, session.Plan, user.Plan)
//
//			// 📦 Move apps para o novo plano
//			err := services.MigrateAllUserAppsToNewPlan(username, user.Plan)
//			if err != nil {
//				fmt.Printf("Erro ao migrar apps de %s: %v\n", username, err)
//			}
//
//			session.Plan = string(user.Plan)
//			sessions[username] = session
//			updated = true
//		}
//	}
//
//	// 💾 Salva sessões atualizadas
//	if updated {
//		sessionFileWrite, err := os.Create("./database/sessions.json")
//		if err != nil {
//			fmt.Println("Erro ao salvar sessions.json:", err)
//			return
//		}
//		defer sessionFileWrite.Close()
//
//		if err := json.NewEncoder(sessionFileWrite).Encode(sessions); err != nil {
//			fmt.Println("Erro ao escrever sessions.json:", err)
//		}
//	}
//}
//
//// 🔓 Logout manual — remove o cookie e a sessão do usuário
//func LogoutHandler(w http.ResponseWriter, r *http.Request) {
//	// 🔍 Tenta extrair o token do cookie ANTES de apagá-lo
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (sem token)",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (token inválido)",
//		})
//		return
//	}
//
//	email, _ := claims["email"].(string)
//
//	// 🔓 Remove sessão do arquivo
//	if err := models.DeleteSessionByEmail(email); err != nil {
//		log.Printf("❌ Erro ao remover sessão: %v", err)
//		utils.WriteJSON(w, map[string]string{
//			"message": "Erro ao remover sessão",
//		})
//		return
//	}
//
//	// 🧹 Remove token da memória
//	services.DeleteToken(email)
//
//	// 🔄 Sincroniza sessões com usuários válidos
//	if err := store.SyncSessionsWithUserStore(); err != nil {
//		log.Printf("⚠️ Erro ao sincronizar sessões: %v", err)
//	}
//
//	// 🍪 Apaga o cookie do token
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    "",
//		Path:     "/",
//		HttpOnly: true,
//		MaxAge:   -1,
//	})
//
//	log.Printf("🔓 Logout realizado para %s", email)
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "Logout realizado com sucesso",
//	})
//}
//
//// 📜 Histórico de migração de plano
//func UserPlanMigrationHistoryHandler(w http.ResponseWriter, r *http.Request) {
//	clientID := utils.GetBearerToken(r)
//
//	var userLogs []services.PlanMigrationLog
//	for _, log := range services.GetMigrationLogs() {
//		if log.Username == clientID {
//			userLogs = append(userLogs, log)
//		}
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{"migrations": userLogs})
//}
//
//// 🔎 Verifica se nome de usuário ou e-mail já estão em uso
//func CheckUserAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Email    string `json:"email"`
//		Username string `json:"username"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Username == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Dados inválidos",
//		})
//		return
//	}
//
//	// 🔍 Percorre usuários existentes
//	for _, u := range services.LoadAllUsers() {
//		if u.Email == req.Email || u.Username == req.Username {
//			utils.WriteJSON(w, map[string]bool{
//				"exists": true,
//			})
//			return
//		}
//	}
//
//	utils.WriteJSON(w, map[string]bool{
//		"exists": false,
//	})
//}
//
//// 🔎 Verifica se o e-mail está cadastrado para login
//func CheckLoginEligibilityHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Email string `json:"email"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Dados inválidos",
//		})
//		return
//	}
//
//	for _, u := range services.LoadAllUsers() {
//		if u.Email == req.Email {
//			utils.WriteJSON(w, map[string]bool{
//				"exists": true,
//			})
//			return
//		}
//	}
//
//	utils.WriteJSON(w, map[string]bool{
//		"exists": false,
//	})
//}

//backend/routes/auth.go

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"log"
//	"net/http"
//	"os"
//	"time"
//
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//
//	"github.com/golang-jwt/jwt/v5"
//)
//
//type VerifyRequest struct {
//	Email    string `json:"email"`
//	Code     string `json:"code"`
//	Username string `json:"username"` // ← novo campo
//}
//
//// 🔐 Verifica o código e autentica o usuário (cadastro ou login)
//func VerifyCodeHandler(w http.ResponseWriter, r *http.Request) {
//	var req VerifyRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Code == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Dados inválidos. Verifique e tente novamente.",
//		})
//		return
//	}
//
//	log.Printf("🔍 Verificando código: Email=%s, Code=%s, Username=%s", req.Email, req.Code, req.Username)
//
//	// ✅ Verifica se o código é válido
//	if !services.IsValidToken(req.Email, req.Code) {
//		log.Printf("❌ Código inválido ou expirado para %s", req.Email)
//		utils.WriteJSON(w, map[string]string{
//			"error": "Código inválido ou expirado",
//		})
//		return
//	}
//
//	var user *models.User
//	var err error
//
//	if req.Username == "" {
//		// 🔐 Login: busca usuário pelo e-mail
//		user = services.FindUserByEmail(req.Email)
//		if user == nil {
//			utils.WriteJSON(w, map[string]string{
//				"error": "Usuário não encontrado",
//			})
//			return
//		}
//		log.Printf("✅ Usuário autenticado: %s (%s)", user.Username, user.Email)
//	} else {
//		// 🆕 Cadastro: autentica com username
//		user, err = services.AuthenticateUserWithToken(req.Email, req.Code, req.Username)
//		if err != nil {
//			utils.WriteJSON(w, map[string]string{
//				"error": err.Error(),
//			})
//			return
//		}
//	}
//
//	// 📩 Envia e-mail de confirmação de login com localização dinâmica
//	go func() {
//		ip := r.Header.Get("X-Forwarded-For")
//		if ip == "" {
//			ip = r.RemoteAddr
//		}
//		location := utils.GetLocationFromIP(ip)
//		err := utils.SendLoginConfirmationEmail(user.Email, user.Username, ip, location)
//		if err != nil {
//			log.Printf("⚠️ Falha ao enviar e-mail de login: %v", err)
//		}
//	}()
//
//	// 🔐 Gera token JWT
//	token, err := utils.GenerateJWT(user.Username, user.Role, string(user.Plan), user.Email)
//	//token, err := utils.GenerateJWT(user.Username, user.Role, user.Email, string(user.Plan))
//	//token, err := utils.GenerateJWT(user.Username, user.Role, string(user.Plan))
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao gerar token de acesso.",
//		})
//		return
//	}
//
//	// 💾 Salva sessão em sessions.json
//	session := models.SessionData{
//		Username: user.Username,
//		Email:    user.Email,
//		Role:     user.Role,
//		Plan:     string(user.Plan),
//		LastSeen: utils.NowISO(),
//		Token:    token,
//	}
//	// 💾 Salva sessão em sessions.json
//	//session := models.SessionData{
//	//	ID:       strconv.Itoa(user.ID),
//	//	Username: user.Username,
//	//	Email:    user.Email,
//	//	Role:     user.Role,
//	//	Plan:     string(user.Plan),
//	//	LastSeen: utils.NowISO(),
//	//	Token:    token,
//	//}
//
//	sessions := map[string]models.SessionData{}
//	file, err := os.Open("./database/sessions.json")
//	if err == nil {
//		_ = json.NewDecoder(file).Decode(&sessions)
//		file.Close()
//	}
//
//	// ✅ Salva apenas a sessão atual por username
//	sessions[user.Username] = session
//	// 🧹 Limpa todas as sessões anteriores
//	//sessions = map[string]models.SessionData{}
//
//	// ✅ Salva apenas a sessão atual por token
//	//sessions[token] = session
//
//	file, err = os.Create("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao salvar sessão.",
//		})
//		return
//	}
//	defer file.Close()
//
//	if err := json.NewEncoder(file).Encode(sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao escrever sessão.",
//		})
//		return
//	}
//
//	// 🍪 Define cookie de autenticação
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    token,
//		Path:     "/",
//		HttpOnly: true,
//		Secure:   false, // true em produção com HTTPS
//		SameSite: http.SameSiteStrictMode,
//		MaxAge:   86400,
//	})
//
//	// ✅ Retorna dados do usuário
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Autenticação bem-sucedida",
//		"user": map[string]interface{}{
//			"username": user.Username,
//			"role":     user.Role,
//			"plan":     user.Plan,
//		},
//		"redirect": "/dashboard",
//	})
//
//	//// ✅ Retorna dados do usuário
//	//utils.WriteJSON(w, map[string]interface{}{
//	//	"success": true,
//	//	"message": "Autenticação bem-sucedida",
//	//	"user": map[string]interface{}{
//	//		"id":       user.ID,
//	//		"username": user.Username,
//	//		"role":     user.Role,
//	//		"plan":     user.Plan,
//	//	},
//	//	"redirect": "/dashboard",
//	//})
//}
//
//// 🔍 Verifica se o token é válido e corresponde à sessão salva
//func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token ausente",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token inválido ou expirado",
//		})
//		return
//	}
//
//	username, _ := claims["username"].(string)
//	role, _ := claims["role"].(string)
//
//	// 🔄 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir sessões",
//		})
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessões inválidas",
//		})
//		return
//	}
//
//	session, ok := sessions[username]
//	if !ok || session.Role != role || session.Token != tokenStr {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessão não corresponde ao token",
//		})
//		return
//	}
//
//	// 🧠 Carrega plano atualizado do usuário
//	userFile, err := os.Open("./database/users.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir usuários",
//		})
//		return
//	}
//	defer userFile.Close()
//
//	users := map[string]models.User{}
//	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Usuários inválidos",
//		})
//		return
//	}
//
//	user, ok := users[username]
//	if !ok {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	// 🔁 Sincroniza plano da sessão com plano do usuário
//	if session.Plan != string(user.Plan) {
//		session.Plan = string(user.Plan)
//		sessions[username] = session
//
//		// 💾 Salva sessões atualizadas
//		sessionFileWrite, err := os.Create("./database/sessions.json")
//		if err == nil {
//			json.NewEncoder(sessionFileWrite).Encode(sessions)
//			sessionFileWrite.Close()
//		}
//	}
//
//	// ✅ Retorna dados da sessão válida
//	utils.WriteJSON(w, map[string]string{
//		"username": username,
//		"role":     role,
//		"plan":     session.Plan,
//	})
//}
//
//func PingSessionHandler(w http.ResponseWriter, r *http.Request) {
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token ausente",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token inválido ou expirado",
//		})
//		return
//	}
//
//	username, _ := claims["username"].(string)
//
//	// 🔄 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir sessões",
//		})
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessões inválidas",
//		})
//		return
//	}
//
//	session, ok := sessions[username]
//	if !ok || session.Token != tokenStr {
//		models.DeleteSessionByEmail(claims["email"].(string))
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessão não corresponde ao token",
//		})
//		return
//	}
//
//	// 🕒 Atualiza lastSeen
//	session.LastSeen = time.Now().Format(time.RFC3339)
//	sessions[username] = session
//
//	// 💾 Salva sessões atualizadas
//	sessionFileWrite, err := os.Create("./database/sessions.json")
//	if err == nil {
//		json.NewEncoder(sessionFileWrite).Encode(sessions)
//		sessionFileWrite.Close()
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "Sessão validada e atualizada",
//	})
//}
//
//// 🔄 Sincroniza plano da sessão com users.json e move apps para o novo diretório se necessário
//func syncSessionsWithUsers() {
//	// 🧾 Carrega usuários
//	userFile, err := os.Open("./database/users.json")
//	if err != nil {
//		fmt.Println("Erro ao abrir users.json:", err)
//		return
//	}
//	defer userFile.Close()
//
//	users := map[string]models.User{}
//	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
//		fmt.Println("Erro ao decodificar users.json:", err)
//		return
//	}
//
//	// 🧾 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		fmt.Println("Erro ao abrir sessions.json:", err)
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		fmt.Println("Erro ao decodificar sessions.json:", err)
//		return
//	}
//
//	// 🔄 Atualiza plano e migra apps
//	updated := false
//	for username, session := range sessions {
//		user, ok := users[username]
//		if ok && session.Plan != string(user.Plan) {
//			fmt.Printf("Atualizando plano de %s: %s → %s\n", username, session.Plan, user.Plan)
//
//			// 📦 Move apps para o novo plano
//			err := services.MigrateAllUserAppsToNewPlan(username, user.Plan)
//			if err != nil {
//				fmt.Printf("Erro ao migrar apps de %s: %v\n", username, err)
//			}
//
//			session.Plan = string(user.Plan)
//			sessions[username] = session
//			updated = true
//		}
//	}
//
//	// 💾 Salva sessões atualizadas
//	if updated {
//		sessionFileWrite, err := os.Create("./database/sessions.json")
//		if err != nil {
//			fmt.Println("Erro ao salvar sessions.json:", err)
//			return
//		}
//		defer sessionFileWrite.Close()
//
//		if err := json.NewEncoder(sessionFileWrite).Encode(sessions); err != nil {
//			fmt.Println("Erro ao escrever sessions.json:", err)
//		}
//	}
//}
//
//// 🔓 Logout manual — remove o cookie e a sessão do usuário
//func LogoutHandler(w http.ResponseWriter, r *http.Request) {
//	// 🔍 Tenta extrair o token do cookie ANTES de apagá-lo
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (sem token)",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (token inválido)",
//		})
//		return
//	}
//
//	email, _ := claims["email"].(string)
//
//	// 🔓 Remove sessão do arquivo
//	if err := models.DeleteSessionByEmail(email); err != nil {
//		log.Printf("❌ Erro ao remover sessão: %v", err)
//		utils.WriteJSON(w, map[string]string{
//			"message": "Erro ao remover sessão",
//		})
//		return
//	}
//
//	// 🧹 Remove token da memória
//	services.DeleteToken(email)
//
//	// 🔄 Sincroniza sessões com usuários válidos
//	if err := store.SyncSessionsWithUserStore(); err != nil {
//		log.Printf("⚠️ Erro ao sincronizar sessões: %v", err)
//	}
//
//	// 🍪 Apaga o cookie do token
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    "",
//		Path:     "/",
//		HttpOnly: true,
//		MaxAge:   -1,
//	})
//
//	log.Printf("🔓 Logout realizado para %s", email)
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "Logout realizado com sucesso",
//	})
//}
//
//// 📜 Histórico de migração de plano
//func UserPlanMigrationHistoryHandler(w http.ResponseWriter, r *http.Request) {
//	clientID := utils.GetBearerToken(r)
//
//	var userLogs []services.PlanMigrationLog
//	for _, log := range services.GetMigrationLogs() {
//		if log.Username == clientID {
//			userLogs = append(userLogs, log)
//		}
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{"migrations": userLogs})
//}
//
//// 🔎 Verifica se nome de usuário ou e-mail já estão em uso
//func CheckUserAvailabilityHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Email    string `json:"email"`
//		Username string `json:"username"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Username == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Dados inválidos",
//		})
//		return
//	}
//
//	// 🔍 Percorre usuários existentes
//	for _, u := range services.LoadAllUsers() {
//		if u.Email == req.Email || u.Username == req.Username {
//			utils.WriteJSON(w, map[string]bool{
//				"exists": true,
//			})
//			return
//		}
//	}
//
//	utils.WriteJSON(w, map[string]bool{
//		"exists": false,
//	})
//}
//
//// 🔎 Verifica se o e-mail está cadastrado para login
//func CheckLoginEligibilityHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Email string `json:"email"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Dados inválidos",
//		})
//		return
//	}
//
//	for _, u := range services.LoadAllUsers() {
//		if u.Email == req.Email {
//			utils.WriteJSON(w, map[string]bool{
//				"exists": true,
//			})
//			return
//		}
//	}
//
//	utils.WriteJSON(w, map[string]bool{
//		"exists": false,
//	})
//}

// 🔍 Verifica se o token é válido e corresponde à sessão salva
//func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token ausente",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token inválido ou expirado",
//		})
//		return
//	}
//
//	username, _ := claims["username"].(string)
//	role, _ := claims["role"].(string)
//
//	// 🔄 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir sessões",
//		})
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessões inválidas",
//		})
//		return
//	}
//
//	session, ok := sessions[username]
//	if !ok || session.Role != role || session.Token != tokenStr {
//		models.DeleteSessionByEmail(claims["email"].(string)) // limpa sessão inválida
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessão não corresponde ao token",
//		})
//		return
//	}
//
//	//session, ok := sessions[username]
//	//if !ok || session.Role != role || session.Token != tokenStr {
//	//	utils.WriteJSON(w, map[string]string{
//	//		"error": "Sessão não corresponde ao token",
//	//	})
//	//	return
//	//}
//
//	// 🧠 Carrega plano atualizado do usuário
//	userFile, err := os.Open("./database/users.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir usuários",
//		})
//		return
//	}
//	defer userFile.Close()
//
//	users := map[string]models.User{}
//	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Usuários inválidos",
//		})
//		return
//	}
//
//	user, ok := users[username]
//	if !ok {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	// 🔁 Sincroniza plano da sessão com plano do usuário
//	if session.Plan != string(user.Plan) {
//		session.Plan = string(user.Plan)
//		sessions[username] = session
//
//		// 💾 Salva sessões atualizadas
//		sessionFileWrite, err := os.Create("./database/sessions.json")
//		if err == nil {
//			json.NewEncoder(sessionFileWrite).Encode(sessions)
//			sessionFileWrite.Close()
//		}
//	}
//
//	// ✅ Retorna dados da sessão válida
//	utils.WriteJSON(w, map[string]string{
//		"username": username,
//		"role":     role,
//		"plan":     session.Plan,
//	})
//}

//func LogoutHandler(w http.ResponseWriter, r *http.Request) {
//	// 🔍 Tenta extrair o token do cookie ANTES de apagá-lo
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (sem token)",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (token inválido)",
//		})
//		return
//	}
//
//	email, _ := claims["email"].(string)
//
//	// 🔓 Remove sessão do arquivo
//	if err := models.DeleteSessionByEmail(email); err != nil {
//		log.Printf("❌ Erro ao remover sessão: %v", err)
//		utils.WriteJSON(w, map[string]string{
//			"message": "Erro ao remover sessão",
//		})
//		return
//	}
//
//	// 🧹 Remove token da memória
//	services.DeleteToken(email)
//
//	// 🍪 Apaga o cookie do token
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    "",
//		Path:     "/",
//		HttpOnly: true,
//		MaxAge:   -1,
//	})
//
//	log.Printf("🔓 Logout realizado para %s", email)
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "Logout realizado com sucesso",
//	})
//}

// 🔓 Logout manual — remove o cookie e a sessão do usuário
//func LogoutHandler(w http.ResponseWriter, r *http.Request) {
//	// 🔍 Tenta extrair o token do cookie ANTES de apagá-lo
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (sem token)",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (token inválido)",
//		})
//		return
//	}
//
//	email, _ := claims["email"].(string)
//
//	// 🔓 Remove sessão do arquivo
//	if err := models.DeleteSession(email); err != nil {
//		log.Printf("❌ Erro ao remover sessão: %v", err)
//		utils.WriteJSON(w, map[string]string{
//			"message": "Erro ao remover sessão",
//		})
//		return
//	}
//
//	// 🧹 Remove token da memória
//	services.DeleteToken(email)
//
//	// 🍪 Apaga o cookie do token
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    "",
//		Path:     "/",
//		HttpOnly: true,
//		MaxAge:   -1,
//	})
//
//	log.Printf("🔓 Logout realizado para %s", email)
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "Logout realizado com sucesso",
//	})
//}

//func LogoutHandler(w http.ResponseWriter, r *http.Request) {
//	// 🍪 Remove o cookie
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    "",
//		Path:     "/",
//		HttpOnly: true,
//		MaxAge:   -1,
//	})
//
//	// 🔍 Tenta extrair o token do cookie
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (sem token)",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Logout realizado (token inválido)",
//		})
//		return
//	}
//
//	//	username, _ := claims["username"].(string)
//	email, _ := claims["email"].(string)
//	//if err := models.DeleteSession(username); err != nil {
//	if err := models.DeleteSession(email); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"message": "Erro ao remover sessão",
//		})
//		return
//	}
//	services.DeleteToken(email)
//	//	services.DeleteToken(username)
//	log.Printf("🔓 Logout realizado para %s", email)
//	//log.Printf("🔓 Logout realizado para %s", username)
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "Logout realizado com sucesso",
//	})
//}

// 🔐 Verifica o código e autentica o usuário (cadastro ou login)
//func VerifyCodeHandler(w http.ResponseWriter, r *http.Request) {
//	var req VerifyRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Code == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Dados inválidos. Verifique e tente novamente.",
//		})
//		return
//	}
//
//	log.Printf("🔍 Verificando código: Email=%s, Code=%s, Username=%s", req.Email, req.Code, req.Username)
//
//	// ✅ Verifica se o código é válido
//	if !services.IsValidToken(req.Email, req.Code) {
//		log.Printf("❌ Código inválido ou expirado para %s", req.Email)
//		utils.WriteJSON(w, map[string]string{
//			"error": "Código inválido ou expirado",
//		})
//		return
//	}
//
//	var user *models.User
//	var err error
//
//	if req.Username == "" {
//		// 🔐 Login: busca usuário pelo e-mail
//		user = services.FindUserByEmail(req.Email)
//		if user == nil {
//			utils.WriteJSON(w, map[string]string{
//				"error": "Usuário não encontrado",
//			})
//			return
//		}
//		log.Printf("✅ Usuário autenticado: %s (%s)", user.Username, user.Email)
//	} else {
//		// 🆕 Cadastro: autentica com username
//		user, err = services.AuthenticateUserWithToken(req.Email, req.Code, req.Username)
//		if err != nil {
//			utils.WriteJSON(w, map[string]string{
//				"error": err.Error(),
//			})
//			return
//		}
//	}
//
//	// 🔐 Gera token JWT
//	token, err := utils.GenerateJWT(user.Username, user.Role, string(user.Plan))
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao gerar token de acesso.",
//		})
//		return
//	}
//
//	// 💾 Salva sessão em sessions.json
//	session := models.SessionData{
//		Username: user.Username,
//		Email:    user.Email,
//		Role:     user.Role,
//		Plan:     string(user.Plan),
//		LastSeen: utils.NowISO(),
//		Token:    token,
//	}
//	// 💾 Salva sessão em sessions.json
//	//session := models.SessionData{
//	//	ID:       strconv.Itoa(user.ID),
//	//	Username: user.Username,
//	//	Email:    user.Email,
//	//	Role:     user.Role,
//	//	Plan:     string(user.Plan),
//	//	LastSeen: utils.NowISO(),
//	//	Token:    token,
//	//}
//
//	sessions := map[string]models.SessionData{}
//	file, err := os.Open("./database/sessions.json")
//	if err == nil {
//		_ = json.NewDecoder(file).Decode(&sessions)
//		file.Close()
//	}
//
//	// ✅ Salva apenas a sessão atual por username
//	sessions[user.Username] = session
//	// 🧹 Limpa todas as sessões anteriores
//	//sessions = map[string]models.SessionData{}
//
//	// ✅ Salva apenas a sessão atual por token
//	//sessions[token] = session
//
//	file, err = os.Create("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao salvar sessão.",
//		})
//		return
//	}
//	defer file.Close()
//
//	if err := json.NewEncoder(file).Encode(sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao escrever sessão.",
//		})
//		return
//	}
//
//	// 🍪 Define cookie de autenticação
//	http.SetCookie(w, &http.Cookie{
//		Name:     "token",
//		Value:    token,
//		Path:     "/",
//		HttpOnly: true,
//		Secure:   false, // true em produção com HTTPS
//		SameSite: http.SameSiteStrictMode,
//		MaxAge:   86400,
//	})
//
//	// ✅ Retorna dados do usuário
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Autenticação bem-sucedida",
//		"user": map[string]interface{}{
//			"username": user.Username,
//			"role":     user.Role,
//			"plan":     user.Plan,
//		},
//		"redirect": "/dashboard",
//	})
//
//	//// ✅ Retorna dados do usuário
//	//utils.WriteJSON(w, map[string]interface{}{
//	//	"success": true,
//	//	"message": "Autenticação bem-sucedida",
//	//	"user": map[string]interface{}{
//	//		"id":       user.ID,
//	//		"username": user.Username,
//	//		"role":     user.Role,
//	//		"plan":     user.Plan,
//	//	},
//	//	"redirect": "/dashboard",
//	//})
//}

//func syncSessionsWithUsers() {
//	// 🧾 Carrega usuários
//	userFile, err := os.Open("./database/users.json")
//	if err != nil {
//		fmt.Println("Erro ao abrir users.json:", err)
//		return
//	}
//	defer userFile.Close()
//
//	users := map[string]models.User{}
//	if err := json.NewDecoder(userFile).Decode(&users); err != nil {
//		fmt.Println("Erro ao decodificar users.json:", err)
//		return
//	}
//
//	// 🧾 Carrega sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		fmt.Println("Erro ao abrir sessions.json:", err)
//		return
//	}
//	defer sessionFile.Close()
//
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		fmt.Println("Erro ao decodificar sessions.json:", err)
//		return
//	}
//
//	// 🔄 Sincroniza planos
//	updated := false
//	for username, session := range sessions {
//		user, ok := users[username]
//		if ok && session.Plan != string(user.Plan) {
//			fmt.Printf("Atualizando plano de %s: %s → %s\n", username, session.Plan, user.Plan)
//			session.Plan = string(user.Plan)
//			sessions[username] = session
//			updated = true
//		}
//	}
//
//	// 💾 Salva sessões atualizadas
//	if updated {
//		sessionFileWrite, err := os.Create("./database/sessions.json")
//		if err != nil {
//			fmt.Println("Erro ao salvar sessions.json:", err)
//			return
//		}
//		defer sessionFileWrite.Close()
//
//		if err := json.NewEncoder(sessionFileWrite).Encode(sessions); err != nil {
//			fmt.Println("Erro ao escrever sessions.json:", err)
//		}
//	}
//}

//func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
//	cookie, err := r.Cookie("token")
//	if err != nil || cookie.Value == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token ausente",
//		})
//		return
//	}
//
//	tokenStr := cookie.Value
//	claims := jwt.MapClaims{}
//
//	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//		return middleware.JwtSecret, nil
//	})
//	if err != nil || !token.Valid {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Token inválido ou expirado",
//		})
//		return
//	}
//
//	username, _ := claims["username"].(string)
//	role, _ := claims["role"].(string)
//
//	// 💾 Corrigido: abre o arquivo correto de sessões
//	sessionFile, err := os.Open("./database/sessions.json")
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Erro ao abrir sessões",
//		})
//		return
//	}
//	defer sessionFile.Close()
//
//	// 🔄 Carrega todas as sessões
//	sessions := map[string]models.SessionData{}
//	if err := json.NewDecoder(sessionFile).Decode(&sessions); err != nil {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessões inválidas",
//		})
//		return
//	}
//
//	session, ok := sessions[username]
//	if !ok || session.Role != role || session.Token != tokenStr {
//		utils.WriteJSON(w, map[string]string{
//			"error": "Sessão não corresponde ao token",
//		})
//		return
//	}
//
//	// ✅ Retorna dados da sessão válida
//	utils.WriteJSON(w, map[string]string{
//		"username": username,
//		"role":     role,
//		"plan":     session.Plan, // ✅ Adiciona o plano da sessão
//	})
//}

// 🔐 Rota dedicada para login via e-mail
//func SigninHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Email string `json:"email"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
//		utils.WriteJSON(w, map[string]string{
//			"error": "E-mail inválido",
//		})
//		return
//	}
//
//	// 🔍 Verifica se o e-mail está cadastrado
//	userExists := false
//	for _, u := range services.LoadAllUsers() {
//		if u.Email == req.Email {
//			userExists = true
//			break
//		}
//	}
//
//	if userExists {
//		// 🔐 Gera e envia código
//		code := utils.GenerateCode(8)
//		services.StoreToken(req.Email, code)
//		if err := utils.SendVerificationEmail(req.Email, code); err != nil {
//			utils.WriteJSON(w, map[string]string{
//				"error": "Erro ao enviar código",
//			})
//			return
//		}
//	}
//
//	// ✅ Sempre responde sucesso, mesmo se e-mail não existir
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Código enviado com sucesso",
//	})
//}

// 🔐 Login direto com username + email (sem código)
//func SigninDirectHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Username string `json:"username"`
//		Email    string `json:"email"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Email == "" {
//		utils.WriteJSON(w, map[string]string{"error": "Dados inválidos"})
//		return
//	}
//
//	users := services.LoadAllUsers()
//	user, exists := users[req.Username]
//
//	if !exists || user.Email != req.Email || !user.Active {
//		utils.WriteJSON(w, map[string]string{"error": "Usuário não encontrado ou inativo"})
//		return
//	}
//
//	token, err := utils.GenerateJWT(user.Username, user.Role)
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{"error": "Erro ao gerar token"})
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"token": token,
//		"user": map[string]interface{}{
//			"id":       user.ID,
//			"username": user.Username,
//			"email":    user.Email,
//			"role":     user.Role,
//			"plan":     user.Plan,
//		},
//	})
//}

// 📩 Envia código de verificação para cadastro
//func SignupHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Email string `json:"email"`
//	}
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
//		utils.WriteJSON(w, map[string]string{"error": "Email inválido"})
//		return
//	}
//
//	_, err := services.GetUserByEmail(req.Email)
//	if err == nil {
//		utils.WriteJSON(w, map[string]string{"error": "Email já cadastrado"})
//		return
//	}
//
//	code := services.GenerateTokenCode()
//	services.StoreToken(req.Email, code)
//	utils.SendVerificationEmail(req.Email, code)
//
//	utils.WriteJSON(w, map[string]string{"message": "Código enviado para cadastro"})
//}
//
//// 📩 Envia código de verificação para login
//func SigninHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Email string `json:"email"`
//	}
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
//		utils.WriteJSON(w, map[string]string{"error": "Email inválido"})
//		return
//	}
//
//	_, err := services.GetUserByEmail(req.Email)
//	if err != nil {
//		utils.WriteJSON(w, map[string]string{"error": "Email não cadastrado"})
//		return
//	}
//
//	code := services.GenerateTokenCode()
//	services.StoreToken(req.Email, code)
//	utils.SendVerificationEmail(req.Email, code)
//
//	utils.WriteJSON(w, map[string]string{"message": "Código enviado para login"})
//}
