//backend/store/user_store.go

package store

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
	"virtuscloud/backend/middleware"
	"virtuscloud/backend/models"
)

// Armazena os usuários indexados por username (imutável e único)
var UserStore = map[string]*models.User{} // username como chave

// Inicializa o usuário admin no sistema
func InitAdminUser() {
	UserStore["admin"] = &models.User{
		Name:     "Admin",
		Username: "admin",
		Email:    "admin@virtuscloud.com",
		Plan:     models.PlanPremium,
		Role:     "admin",
	}
}

// Busca usuário pelo username
func GetUserByUsername(username string) (*models.User, error) {
	user, ok := UserStore[username]
	if !ok {
		return nil, nil
	}
	return user, nil
}

func SyncSessionsWithUserStore() error {
	sessions := models.LoadSessions()
	valid := map[string]models.SessionData{}

	for username, session := range sessions {
		user, err := GetUserByUsername(username)
		if err != nil || user == nil {
			fmt.Printf("⚠️ Sessão ignorada: usuário '%s' não encontrado\n", username)
			continue
		}

		lastSeen, err := time.Parse(time.RFC3339, session.LastSeen)
		fmt.Printf("🕒 lastSeen: %s → parsed: %v\n", session.LastSeen, lastSeen)

		if err != nil || time.Since(lastSeen) > 24*time.Hour {
			fmt.Printf("⏳ Removendo sessão expirada: %s\n", username)
			continue
		}
		//lastSeen, err := time.Parse(time.RFC3339, session.LastSeen)
		//if err != nil || time.Since(lastSeen) > 24*time.Hour {
		//	fmt.Printf("⏳🧹 Sessão expirada: %s\n", username)
		//	continue
		//}

		valid[username] = session
	}

	return models.SaveSessions(valid)
}

// Cria ou atualiza usuário e salva em arquivo
func SyncUser(username, name, email string, plan models.PlanType, _ int, role string) {
	if username == "" || email == "" {
		fmt.Println("⚠️ SyncUser ignorado: username ou email vazio")
		return
	}

	if user, ok := UserStore[username]; ok {
		user.Name = name
		user.Email = email
		user.Plan = plan
		if role != "" {
			user.Role = role // atualiza cargo se informado
		}
	} else {
		UserStore[username] = &models.User{
			Name:     name,
			Username: username,
			Email:    email,
			Plan:     plan,
			Role:     "user", // padrão para novos cadastros
		}
	}

	fmt.Printf("🔄 SyncUser: %s (%s) → plano %s\n", username, email, plan)
	_ = SaveUsersToFile(middleware.ClientsFilePath)
}

// Salva todos os usuários em arquivo JSON
func SaveUsersToFile(filename string) error {
	data, err := json.MarshalIndent(UserStore, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filename, data, 0644)
}

// Carrega usuários do arquivo JSON
func LoadUsersFromFile(filename string) error {
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		if err := os.MkdirAll(filepath.Dir(filename), os.ModePerm); err != nil {
			return fmt.Errorf("erro ao criar diretório: %w", err)
		}
		empty := map[string]*models.User{}
		data, _ := json.MarshalIndent(empty, "", "  ")
		if err := os.WriteFile(filename, data, 0644); err != nil {
			return fmt.Errorf("erro ao criar arquivo: %w", err)
		}
		return nil
	}

	data, err := os.ReadFile(filename)
	if err != nil {
		return err
	}

	var loaded map[string]*models.User
	if err := json.Unmarshal(data, &loaded); err != nil {
		return err
	}

	for k, v := range loaded {
		UserStore[k] = v
	}
	return nil
}

//func RemoveInactiveSessions() error {
//	sessions := models.LoadSessions()
//	active := map[string]models.SessionData{}
//
//	for username, session := range sessions {
//		if session.Token == "" {
//			fmt.Printf("🚫 Sessão removida: %s (sem token)\n", username)
//			continue
//		}
//		active[username] = session
//	}
//
//	return models.SaveSessions(active)
//}

//func RemoveInactiveSessions() ([]string, error) {
//	sessions := models.LoadSessions()
//	removidos := []string{}
//
//	for _, session := range sessions {
//		claims := jwt.MapClaims{}
//		token, err := jwt.ParseWithClaims(session.Token, claims, func(t *jwt.Token) (interface{}, error) {
//			return middleware.JwtSecret, nil
//		})
//
//		if err != nil || !token.Valid {
//			// Remove usando a função confiável
//			if err := models.DeleteSessionByEmail(session.Email); err == nil {
//				removidos = append(removidos, session.Username)
//			}
//		}
//	}
//
//	return removidos, nil
//}
//func ForceRemoveInvalidSessions() ([]string, error) {
//	sessions := models.LoadSessions()
//	removidos := []string{}
//
//	for _, session := range sessions {
//		claims := jwt.MapClaims{}
//		token, err := jwt.ParseWithClaims(session.Token, claims, func(t *jwt.Token) (interface{}, error) {
//			return middleware.JwtSecret, nil
//		})
//
//		if err != nil || !token.Valid {
//			// Token inválido → remove usando a função confiável
//			if err := models.DeleteSessionByEmail(session.Email); err == nil {
//				removidos = append(removidos, session.Username)
//			}
//		}
//	}
//
//	return removidos, nil
//}

//func RemoveInactiveSessions() ([]string, error) {
//	sessions := models.LoadSessions()
//	active := map[string]models.SessionData{}
//	removidos := []string{}
//
//	for username, session := range sessions {
//		// Verifica se o token é válido
//		claims := jwt.MapClaims{}
//		token, err := jwt.ParseWithClaims(session.Token, claims, func(t *jwt.Token) (interface{}, error) {
//			return middleware.JwtSecret, nil
//		})
//
//		if err != nil || !token.Valid {
//			removidos = append(removidos, username)
//			continue
//		}
//
//		active[username] = session
//	}
//
//	err := models.SaveSessions(active)
//	return removidos, err
//}

//func RemoveInactiveSessions() ([]string, error) {
//	sessions := models.LoadSessions()
//	active := map[string]models.SessionData{}
//	removidos := []string{}
//
//	for username, session := range sessions {
//		if session.Token == "" {
//			removidos = append(removidos, username)
//			continue
//		}
//		active[username] = session
//	}
//
//	err := models.SaveSessions(active)
//	return removidos, err
//}

//package store
//
//import (
//	"encoding/json"
//	"fmt"
//	"os"
//	"path/filepath"
//	"strconv"
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//)
//
//// Armazena os usuários indexados por username (imutável e único)
//var UserStore = map[string]*models.User{} // username como chave
//
//// Inicializa o usuário admin no sistema
//func InitAdminUser() {
//	UserStore["admin"] = &models.User{
//		ID:       1,
//		Name:     "Admin",
//		Username: "admin",
//		Email:    "admin@virtuscloud.com",
//		Plan:     models.PlanPremium,
//		Role:     "admin",
//	}
//}
//
//// Busca usuário pelo username
//func GetUserByUsername(username string) (*models.User, error) {
//	user, ok := UserStore[username]
//	if !ok {
//		return nil, nil
//	}
//	return user, nil
//}
//
//// Cria ou atualiza usuário e salva em arquivo
//func SyncUser(username, name, email string, plan models.PlanType, userID int, role string) {
//	if username == "" || email == "" {
//		fmt.Println("⚠️ SyncUser ignorado: username ou email vazio")
//		return
//	}
//
//	if user, ok := UserStore[username]; ok {
//		user.Name = name
//		user.Email = email
//		user.Plan = plan
//		user.ID = userID
//		if role != "" {
//			user.Role = role // atualiza cargo se informado
//		}
//	} else {
//		UserStore[username] = &models.User{
//			ID:       userID,
//			Name:     name,
//			Username: username,
//			Email:    email,
//			Plan:     plan,
//			Role:     "user", // padrão para novos cadastros
//		}
//	}
//
//	fmt.Printf("🔄 SyncUser: %s (%s) → plano %s [ID: %03d]\n", username, email, plan, userID)
//	_ = SaveUsersToFile(middleware.ClientsFilePath)
//}
//
//// Salva todos os usuários em arquivo JSON
//func SaveUsersToFile(filename string) error {
//	data, err := json.MarshalIndent(UserStore, "", "  ")
//	if err != nil {
//		return err
//	}
//	return os.WriteFile(filename, data, 0644)
//}
//
//// Carrega usuários do arquivo JSON
//func LoadUsersFromFile(filename string) error {
//	if _, err := os.Stat(filename); os.IsNotExist(err) {
//		if err := os.MkdirAll(filepath.Dir(filename), os.ModePerm); err != nil {
//			return fmt.Errorf("erro ao criar diretório: %w", err)
//		}
//		empty := map[string]*models.User{}
//		data, _ := json.MarshalIndent(empty, "", "  ")
//		if err := os.WriteFile(filename, data, 0644); err != nil {
//			return fmt.Errorf("erro ao criar arquivo: %w", err)
//		}
//		return nil
//	}
//
//	data, err := os.ReadFile(filename)
//	if err != nil {
//		return err
//	}
//
//	var loaded map[string]*models.User
//	if err := json.Unmarshal(data, &loaded); err != nil {
//		return err
//	}
//
//	for k, v := range loaded {
//		UserStore[k] = v
//	}
//	return nil
//}
//func GetUserByID(id string) *models.User {
//	for _, user := range UserStore {
//		if strconv.Itoa(user.ID) == id {
//			return user
//		}
//	}
//	return nil
//}
