//backend/routes/email.go

package routes

import (
	"encoding/json"
	"log"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	"virtuscloud/backend/services"
	"virtuscloud/backend/utils"

	"github.com/joho/godotenv"
)

//var (
//	tokenMap = map[string]TokenData{}
//)

type TokenData struct {
	Code      string
	ExpiresAt time.Time
}

type EmailRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"` // ✅ necessário para diferenciar cadastro

}

//var lastSentMap = make(map[string]time.Time)

// 🔄 Carrega .env de múltiplos caminhos possíveis
func init() {
	paths := []string{".env", "../.env", "../../.env"}
	for _, path := range paths {
		if err := godotenv.Load(path); err == nil {
			//log.Println("✅ .env carregado de:", path)
			//log.Println("🌍 ENV carregado:", os.Getenv("ENV"))
			return
		}
	}
	log.Println("⚠️ Nenhum .env encontrado nos caminhos padrão")
}

// 📩 Gera e envia código para login ou cadastro
func SendCodeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Método não permitido",
		})
		return
	}
	log.Println("🌍 Ambiente:", os.Getenv("ENV"))

	var req EmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "JSON inválido",
		})
		return
	}
	//==============================================================================================
	// 🧭 LOG DE RASTREAMENTO — estado atual do token e tempo
	//services.LogTokenState(req.Email)
	//==============================================================================================

	log.Printf("📦 Recebido: email=%s, username='%s' (len=%d)", req.Email, req.Username, len(strings.TrimSpace(req.Username)))
	if req.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Campo 'email' é obrigatório",
		})
		return
	}

	// 🛡️ Validação de e-mail apenas fora do ambiente dev
	if os.Getenv("ENV") != "prod" {
		if _, err := mail.ParseAddress(req.Email); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			utils.WriteJSON(w, map[string]interface{}{
				"error": "E-mail inválido",
			})
			return
		}
	}

	// 🔍 Se for login (sem username), bloqueia envio se e-mail não existir
	if req.Username == "" {
		found := false
		for _, u := range services.LoadAllUsers() {
			if u.Email == req.Email {
				found = true
				break
			}
		}
		if !found {
			log.Printf("⚠️ Login: tentativa de envio para e-mail não cadastrado: %s", req.Email)
			// ✅ Resposta genérica: não revela nada ao frontend
			utils.WriteJSON(w, map[string]interface{}{
				"success":  true,
				"message":  "Código enviado com sucesso",
				"codeSent": false, // 👈 não envia de fato
			})
			return
		}
		log.Printf("🔐 Login: e-mail localizado: %s", req.Email)
	}

	// ⏱️ Verifica tempo mínimo de reenvio — só se o token ainda estiver ativo
	if services.HasToken(req.Email) {
		if last, ok := services.LastSentMap[req.Email]; ok {
			if time.Since(last) < 2*time.Minute {
				log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
				utils.WriteJSON(w, map[string]interface{}{
					"success":  true,
					"message":  "Código já enviado recentemente",
					"codeSent": false,
				})
				return
			}
		}
	}

	// 🔐 Gera código e armazena token temporário
	code := utils.GenerateCode(8)
	services.StoreToken(req.Email, code)
	//services.LastSentMap[req.Email] = time.Now()
	//lastSentMap[req.Email] = time.Now()

	log.Printf("🔐 Código gerado para %s: %s", req.Email, code)

	// 📤 Envia e-mail com o código
	if err := utils.SendVerificationEmail(req.Email, code); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao enviar e-mail: " + err.Error(),
		})
		return
	}

	// ✅ Resposta de sucesso (sempre igual, independente do estado do e-mail)
	utils.WriteJSON(w, map[string]interface{}{
		"success": true,
		"message": "Código enviado com sucesso",
	})
}

//backend/routes/email.go

//package routes
//
//import (
//	"encoding/json"
//	"log"
//	"net/http"
//	"net/mail"
//	"os"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//
//	"github.com/joho/godotenv"
//)
//
////var (
////	tokenMap = map[string]TokenData{}
////)
//
//type TokenData struct {
//	Code      string
//	ExpiresAt time.Time
//}
//
//type EmailRequest struct {
//	Email    string `json:"email"`
//	Username string `json:"username"` // ✅ necessário para diferenciar cadastro
//
//}
//
////var lastSentMap = make(map[string]time.Time)
//
////func init() {
////	if err := godotenv.Load("../.env"); err != nil {
////		log.Println("⚠️ Erro ao carregar .env:", err)
////	}
////}
//
//// 🔄 Carrega .env de múltiplos caminhos possíveis
//func init() {
//	paths := []string{".env", "../.env", "../../.env"}
//	for _, path := range paths {
//		if err := godotenv.Load(path); err == nil {
//			//log.Println("✅ .env carregado de:", path)
//			//log.Println("🌍 ENV carregado:", os.Getenv("ENV"))
//			return
//		}
//	}
//	log.Println("⚠️ Nenhum .env encontrado nos caminhos padrão")
//}
//
//// 📩 Gera e envia código para login ou cadastro
//func SendCodeHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//	log.Println("🌍 Ambiente:", os.Getenv("ENV"))
//
//	var req EmailRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "JSON inválido",
//		})
//		return
//	}
//	//==============================================================================================
//	// 🧭 LOG DE RASTREAMENTO — estado atual do token e tempo
//	services.LogTokenState(req.Email)
//	//tokenData, tokenExists := tokenMap[req.Email]
//	//lastTime, timeExists := services.LastSentMap[req.Email]
//	//
//	//log.Printf("🧭 Rastreamento para %s", req.Email)
//	//log.Printf("🔐 Token existe? %v", tokenExists)
//	//if tokenExists {
//	//	log.Printf("🔐 Token: %s | Expira em: %s", tokenData.Code, tokenData.ExpiresAt.Format(time.RFC3339))
//	//}
//	//log.Printf("⏱️ Tempo registrado? %v", timeExists)
//	//if timeExists {
//	//	log.Printf("⏱️ Último envio: %s | Faz %v", lastTime.Format(time.RFC3339), time.Since(lastTime))
//	//}
//	//==============================================================================================
//
//	log.Printf("📦 Recebido: email=%s, username='%s' (len=%d)", req.Email, req.Username, len(strings.TrimSpace(req.Username)))
//	if req.Email == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Campo 'email' é obrigatório",
//		})
//		return
//	}
//
//	// 🛡️ Validação de e-mail apenas fora do ambiente dev
//	if os.Getenv("ENV") != "prod" {
//		if _, err := mail.ParseAddress(req.Email); err != nil {
//			w.WriteHeader(http.StatusBadRequest)
//			utils.WriteJSON(w, map[string]interface{}{
//				"error": "E-mail inválido",
//			})
//			return
//		}
//	}
//
//	// 🔍 Se for login (sem username), bloqueia envio se e-mail não existir
//	if req.Username == "" {
//		found := false
//		for _, u := range services.LoadAllUsers() {
//			if u.Email == req.Email {
//				found = true
//				break
//			}
//		}
//		if !found {
//			log.Printf("⚠️ Login: tentativa de envio para e-mail não cadastrado: %s", req.Email)
//			// ✅ Resposta genérica: não revela nada ao frontend
//			utils.WriteJSON(w, map[string]interface{}{
//				"success":  true,
//				"message":  "Código enviado com sucesso",
//				"codeSent": false, // 👈 não envia de fato
//			})
//			return
//		}
//		log.Printf("🔐 Login: e-mail localizado: %s", req.Email)
//	}
//
//	if services.HasToken(req.Email) {
//		if last, ok := services.LastSentMap[req.Email]; ok {
//			if time.Since(last) < 2*time.Minute {
//				log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//				utils.WriteJSON(w, map[string]interface{}{
//					"success":  true,
//					"message":  "Código já enviado recentemente",
//					"codeSent": false,
//				})
//				return
//			}
//		}
//	}
//
//	// ⏱️ Verifica tempo mínimo de reenvio — só se o token ainda estiver ativo
//	//if services.HasToken(req.Email) {
//	//	if last, ok := services.LastSentMap[req.Email]; ok {
//	//		if time.Since(last) < 2*time.Minute {
//	//			log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//	//			utils.WriteJSON(w, map[string]interface{}{
//	//				"success":  true,
//	//				"message":  "Código já enviado recentemente",
//	//				"codeSent": false,
//	//			})
//	//			return
//	//		}
//	//	}
//	//}
//
//	// ⏱️ Verifica tempo mínimo de reenvio
//	//if last, ok := services.LastSentMap[req.Email]; ok {
//	//	if services.HasToken(req.Email) && time.Since(last) < 2*time.Minute {
//	//		log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//	//		utils.WriteJSON(w, map[string]interface{}{
//	//			"success":  true,
//	//			"message":  "Código já enviado recentemente",
//	//			"codeSent": false,
//	//		})
//	//		return
//	//	}
//	//}
//
//	//if last, ok := lastSentMap[req.Email]; ok {
//	//	if time.Since(last) < 2*time.Minute {
//	//		log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//	//		utils.WriteJSON(w, map[string]interface{}{
//	//			"success":  true,
//	//			"message":  "Código já enviado recentemente",
//	//			"codeSent": false, // 👈 novo campo // ✅ CORRETO: não foi enviado
//	//		})
//	//		return
//	//	}
//	//}
//
//	// 🔐 Gera código e armazena token temporário
//	code := utils.GenerateCode(8)
//	services.StoreToken(req.Email, code)
//	//services.LastSentMap[req.Email] = time.Now()
//	//lastSentMap[req.Email] = time.Now()
//
//	log.Printf("🔐 Código gerado para %s: %s", req.Email, code)
//
//	// 📤 Envia e-mail com o código
//	if err := utils.SendVerificationEmail(req.Email, code); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao enviar e-mail: " + err.Error(),
//		})
//		return
//	}
//
//	// ✅ Resposta de sucesso (sempre igual, independente do estado do e-mail)
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Código enviado com sucesso",
//	})
//}

//backend/routes/email.go

//package routes
//
//import (
//	"encoding/json"
//	"log"
//	"net/http"
//	"net/mail"
//	"os"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//
//	"github.com/joho/godotenv"
//)
//
//type EmailRequest struct {
//	Email    string `json:"email"`
//	Username string `json:"username"` // ✅ necessário para diferenciar cadastro
//
//}
//
////var lastSentMap = make(map[string]time.Time)
//
//// 🔄 Carrega .env de múltiplos caminhos possíveis
//func init() {
//	paths := []string{".env", "../.env", "../../.env"}
//	for _, path := range paths {
//		if err := godotenv.Load(path); err == nil {
//			//log.Println("✅ .env carregado de:", path)
//			//log.Println("🌍 ENV carregado:", os.Getenv("ENV"))
//			return
//		}
//	}
//	log.Println("⚠️ Nenhum .env encontrado nos caminhos padrão")
//}
//
//// 📩 Gera e envia código para login ou cadastro
//func SendCodeHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//	log.Println("🌍 Ambiente:", os.Getenv("ENV"))
//
//	var req EmailRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "JSON inválido",
//		})
//		return
//	}
//
//	log.Printf("📦 Recebido: email=%s, username='%s' (len=%d)", req.Email, req.Username, len(strings.TrimSpace(req.Username)))
//	if req.Email == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Campo 'email' é obrigatório",
//		})
//		return
//	}
//
//	// 🛡️ Validação de e-mail apenas fora do ambiente dev
//	if os.Getenv("ENV") != "prod" {
//		if _, err := mail.ParseAddress(req.Email); err != nil {
//			w.WriteHeader(http.StatusBadRequest)
//			utils.WriteJSON(w, map[string]interface{}{
//				"error": "E-mail inválido",
//			})
//			return
//		}
//	}
//
//	// 🔍 Se for login (sem username), bloqueia envio se e-mail não existir
//	if req.Username == "" {
//		found := false
//		for _, u := range services.LoadAllUsers() {
//			if u.Email == req.Email {
//				found = true
//				break
//			}
//		}
//		if !found {
//			log.Printf("⚠️ Login: tentativa de envio para e-mail não cadastrado: %s", req.Email)
//			utils.WriteJSON(w, map[string]interface{}{
//				"success":  true,
//				"message":  "Código enviado com sucesso",
//				"codeSent": false,
//			})
//			return
//		}
//		log.Printf("🔐 Login: e-mail localizado: %s", req.Email)
//	}
//
//	// ⏱️ Verifica tempo mínimo de reenvio — só se o token ainda estiver ativo
//	if services.HasToken(req.Email) {
//		if last, ok := services.LastSentMap[req.Email]; ok {
//			if time.Since(last) < 2*time.Minute {
//				log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//				utils.WriteJSON(w, map[string]interface{}{
//					"success":  true,
//					"message":  "Código já enviado recentemente",
//					"codeSent": false,
//				})
//				return
//			}
//		}
//	}
//
//	// 🔐 Gera código e armazena token temporário
//	code := utils.GenerateCode(8)
//	services.StoreToken(req.Email, code)
//
//	log.Printf("✅ Código autorizado e enviado para %s: %s", req.Email, code)
//
//	// 📤 Envia e-mail com o código
//	if err := utils.SendVerificationEmail(req.Email, code); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao enviar e-mail: " + err.Error(),
//		})
//		return
//	}
//
//	// ✅ Resposta de sucesso
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Código enviado com sucesso",
//	})
//}

//backend/routes/email.go

//package routes
//
//import (
//	"encoding/json"
//	"log"
//	"net/http"
//	"net/mail"
//	"os"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//
//	"github.com/joho/godotenv"
//)
//
//type EmailRequest struct {
//	Email    string `json:"email"`
//	Username string `json:"username"` // ✅ necessário para diferenciar cadastro
//
//}
//
//var lastSentMap = make(map[string]time.Time)
//
////func init() {
////	if err := godotenv.Load("../.env"); err != nil {
////		log.Println("⚠️ Erro ao carregar .env:", err)
////	}
////}
//
//// 🔄 Carrega .env de múltiplos caminhos possíveis
//func init() {
//	paths := []string{".env", "../.env", "../../.env"}
//	for _, path := range paths {
//		if err := godotenv.Load(path); err == nil {
//			//log.Println("✅ .env carregado de:", path)
//			//log.Println("🌍 ENV carregado:", os.Getenv("ENV"))
//			return
//		}
//	}
//	log.Println("⚠️ Nenhum .env encontrado nos caminhos padrão")
//}
//
//// 📩 Gera e envia código para login ou cadastro
//func SendCodeHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//	log.Println("🌍 Ambiente:", os.Getenv("ENV"))
//
//	var req EmailRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "JSON inválido",
//		})
//		return
//	}
//	log.Printf("📦 Recebido: email=%s, username='%s' (len=%d)", req.Email, req.Username, len(strings.TrimSpace(req.Username)))
//	if req.Email == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Campo 'email' é obrigatório",
//		})
//		return
//	}
//
//	// 🛡️ Validação de e-mail apenas fora do ambiente dev
//	if os.Getenv("ENV") != "prod" {
//		if _, err := mail.ParseAddress(req.Email); err != nil {
//			w.WriteHeader(http.StatusBadRequest)
//			utils.WriteJSON(w, map[string]interface{}{
//				"error": "E-mail inválido",
//			})
//			return
//		}
//	}
//
//	// 🔍 Se for login (sem username), bloqueia envio se e-mail não existir
//	if req.Username == "" {
//		found := false
//		for _, u := range services.LoadAllUsers() {
//			if u.Email == req.Email {
//				found = true
//				break
//			}
//		}
//		if !found {
//			log.Printf("⚠️ Login: e-mail não encontrado: %s", req.Email)
//			utils.WriteJSON(w, map[string]interface{}{
//				"success": false,
//				"error":   "E-mail não cadastrado",
//			})
//			return // 👈 ESSENCIAL: impede envio do código
//		}
//		log.Printf("🔐 Login: e-mail localizado: %s", req.Email)
//	}
//	//// 🔍 Se for login (sem username), loga no terminal se o e-mail não existir
//	//if req.Username == "" {
//	//	found := false
//	//	for _, u := range services.LoadAllUsers() {
//	//		if u.Email == req.Email {
//	//			found = true
//	//			break
//	//		}
//	//	}
//	//	if !found {
//	//		log.Printf("⚠️ Login: e-mail não encontrado: %s", req.Email)
//	//		// ⚠️ Mas continua normalmente sem revelar nada ao frontend
//	//	}
//	//}
//
//	// ⏱️ Verifica tempo mínimo de reenvio
//	if last, ok := lastSentMap[req.Email]; ok {
//		if time.Since(last) < 2*time.Minute {
//			log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//			utils.WriteJSON(w, map[string]interface{}{
//				"success":  true,
//				"message":  "Código já enviado recentemente",
//				"codeSent": false, // 👈 novo campo // ✅ CORRETO: não foi enviado
//			})
//			return
//		}
//	}
//
//	// 🔐 Gera código e armazena token temporário
//	code := utils.GenerateCode(8)
//	services.StoreToken(req.Email, code)
//	lastSentMap[req.Email] = time.Now()
//
//	log.Printf("🔐 Código gerado para %s: %s", req.Email, code)
//
//	// 📤 Envia e-mail com o código
//	if err := utils.SendVerificationEmail(req.Email, code); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao enviar e-mail: " + err.Error(),
//		})
//		return
//	}
//
//	// ✅ Resposta de sucesso (sempre igual, independente do estado do e-mail)
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Código enviado com sucesso",
//	})
//}

// 📩 Gera e envia código para login ou cadastro
//func SendCodeHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	log.Println("🌍 Ambiente:", os.Getenv("ENV"))
//
//	var req EmailRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "JSON inválido",
//		})
//		return
//	}
//
//	if req.Email == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Campo 'email' é obrigatório",
//		})
//		return
//	}
//
//	// 🛡️ Validação de e-mail apenas fora do ambiente dev
//	if os.Getenv("ENV") != "prod" {
//		if _, err := mail.ParseAddress(req.Email); err != nil {
//			w.WriteHeader(http.StatusBadRequest)
//			utils.WriteJSON(w, map[string]interface{}{
//				"error": "E-mail inválido",
//			})
//			return
//		}
//	}
//
//	// 🔍 Verifica se é login (sem username) e se o e-mail existe
//	if req.Username == "" {
//		found := false
//		for _, u := range services.LoadAllUsers() {
//			if u.Email == req.Email {
//				found = true
//				break
//			}
//		}
//		if !found {
//			log.Printf("⚠️ Login: e-mail não encontrado: %s", req.Email)
//			utils.WriteJSON(w, map[string]interface{}{
//				"success": true,
//				"message": "Código não enviado (e-mail não encontrado)",
//			})
//			return
//		}
//	}
//
//	// ⏱️ Verifica tempo mínimo de reenvio
//	if last, ok := lastSentMap[req.Email]; ok {
//		if time.Since(last) < 2*time.Minute {
//			log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//			utils.WriteJSON(w, map[string]interface{}{
//				"success": true,
//				"message": "Código já enviado recentemente",
//			})
//			return
//		}
//	}
//
//	// 🔐 Gera código e armazena token temporário
//	code := utils.GenerateCode(8)
//	services.StoreToken(req.Email, code)
//	lastSentMap[req.Email] = time.Now()
//
//	log.Printf("🔐 Código gerado para %s: %s", req.Email, code)
//
//	// 📤 Envia e-mail com o código
//	if err := utils.SendVerificationEmail(req.Email, code); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao enviar e-mail: " + err.Error(),
//		})
//		return
//	}
//
//	// ✅ Resposta de sucesso
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Código enviado com sucesso",
//	})
//}

//func SendCodeHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	log.Println("🌍 Ambiente:", os.Getenv("ENV"))
//
//	var req EmailRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	if req.Email == "" {
//		http.Error(w, "Campo 'email' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	// 🛡️ Validação de e-mail apenas fora do ambiente dev
//	if os.Getenv("ENV") != "prod" {
//		if _, err := mail.ParseAddress(req.Email); err != nil {
//			http.Error(w, "E-mail inválido", http.StatusBadRequest)
//			return
//		}
//	}
//
//	// 🔍 Verifica se é login (sem username) e se o e-mail existe
//	if req.Username == "" {
//		found := false
//		for _, u := range services.LoadAllUsers() {
//			if u.Email == req.Email {
//				found = true
//				break
//			}
//		}
//		if !found {
//			log.Printf("⚠️ Login: e-mail não encontrado: %s", req.Email)
//			utils.WriteJSON(w, map[string]interface{}{
//				"success": true,
//				"message": "Código não enviado (e-mail não encontrado)",
//			})
//			return
//		}
//	}
//
//	// ⏱️ Verifica tempo mínimo de reenvio
//	if last, ok := lastSentMap[req.Email]; ok {
//		if time.Since(last) < 2*time.Minute {
//			log.Printf("⏳ Código já enviado recentemente para %s — aguardando tempo", req.Email)
//			utils.WriteJSON(w, map[string]interface{}{
//				"success": true,
//				"message": "Código já enviado recentemente",
//			})
//			return
//		}
//	}
//
//	// 🔐 Gera código e armazena token temporário
//	code := utils.GenerateCode(8)
//	services.StoreToken(req.Email, code)
//	lastSentMap[req.Email] = time.Now()
//
//	log.Printf("🔐 Código gerado para %s: %s", req.Email, code)
//
//	// 📤 Envia e-mail com o código
//	if err := utils.SendVerificationEmail(req.Email, code); err != nil {
//		http.Error(w, "Erro ao enviar e-mail: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	// ✅ Resposta de sucesso
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "Código enviado com sucesso",
//	})
//}

// ❌ Função duplicada — agora mantida apenas em utils/email.go
//func SendVerificationEmail(to string, code string) error {
//	// Carrega variáveis de ambiente
//	smtpHost := os.Getenv("SMTP_HOST")
//	smtpPort := os.Getenv("SMTP_PORT")
//	smtpUser := os.Getenv("SMTP_USER")
//	smtpPass := os.Getenv("SMTP_PASS")
//	fromName := os.Getenv("SMTP_FROM_NAME")
//
//	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
//		return fmt.Errorf("configuração SMTP incompleta")
//	}
//
//	from := fmt.Sprintf("%s <%s>", fromName, smtpUser)
//	subject := "Seu código de verificação"
//	body := fmt.Sprintf("Olá!\n\nSeu código de verificação é: %s\n\nUse-o para acessar a plataforma.\n\nAbraços,\nVirtusCloud", code)
//
//	msg := []byte("To: " + to + "\r\n" +
//		"Subject: " + subject + "\r\n" +
//		"From: " + from + "\r\n" +
//		"Content-Type: text/plain; charset=\"utf-8\"\r\n" +
//		"\r\n" + body)
//
//	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
//
//	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, smtpUser, []string{to}, msg)
//	if err != nil {
//		return fmt.Errorf("falha ao enviar e-mail: %w", err)
//	}
//
//	return nil
//}

//func generateCode() string {
//	const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
//	var b strings.Builder
//	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
//	for i := 0; i < 8; i++ {
//		b.WriteByte(charset[rng.Intn(len(charset))])
//	}
//	return b.String()
//}

//func DebugEmailHandler(w http.ResponseWriter, r *http.Request) {
//	// Endpoint de teste para envio de e-mail
//	testEmail := "seuemail@teste.com"
//	testCode := "ABC12345"
//	err := utils.SendVerificationEmail(testEmail, testCode)
//	if err != nil {
//		http.Error(w, "Erro ao enviar e-mail de teste: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": "E-mail de teste enviado com sucesso",
//	})
//}
