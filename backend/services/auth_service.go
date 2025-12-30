//backend/services/auth_service.go

package services

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

type TokenData struct {
	Code      string
	ExpiresAt time.Time
}

type PlanMigrationLog struct {
	Username  string
	Email     string
	From      models.PlanType
	To        models.PlanType
	Timestamp time.Time
	Success   bool
	ErrorMsg  string
}

type Session struct {
	Email     string `json:"email"`
	Code      string `json:"code"`
	ExpiresAt string `json:"expiresAt"`
}

var (
	//nextID        = 1
	tokenMap      = map[string]TokenData{}
	tokenTTL      = 120 * time.Second
	migrationLogs []PlanMigrationLog
	//tokenTTL      = 5 * time.Minute
)

func createUserBaseDirs(username string, plan models.PlanType) error {
	base := fmt.Sprintf("storage/users/%s", username)
	fmt.Println("📁 Criando pastas em:", base)

	paths := []string{
		fmt.Sprintf("%s/logs", base),
		fmt.Sprintf("%s/databases", base),
		fmt.Sprintf("%s/%s", base, plan),
		fmt.Sprintf("%s/%s/uploads", base, plan),
		fmt.Sprintf("%s/%s/apps", base, plan),
		fmt.Sprintf("%s/%s/snapshots", base, plan),
	}

	for _, path := range paths {
		fmt.Println("📁 Verificando/criando:", path)
		if err := os.MkdirAll(path, 0755); err != nil {
			log.Printf("❌ Erro ao criar pasta %s: %v", path, err)
			return err
		}
	}
	return nil
}

func CreateOrGetUser(email, username string) (*models.User, error) {
	// 🔍 Verifica se já existe usuário com mesmo email ou username
	for _, u := range store.UserStore {
		if u.Email == email {
			store.SyncUserToStore(u.Username, u.Email, u.Plan, "") // 🔁 ID removido
			return u, nil
		}
		if u.Username == username {
			return nil, fmt.Errorf("nome de usuário já está em uso")
		}
	}

	// 🆕 Cria novo usuário
	user := &models.User{
		Username:  username,
		Email:     email,
		CreatedAt: time.Now(),
		Role:      "user",
		Plan:      models.PlanNothing,
	}
	store.UserStore[user.Username] = user // 🔁 chave por username
	_ = SaveUsersToFile()
	store.SyncUserToStore(user.Username, user.Email, user.Plan, "") // 🔁 ID removido
	_ = createUserBaseDirs(username, user.Plan)

	return user, nil
}

func GenerateUsername(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 || parts[0] == "" {
		return fmt.Sprintf("user%d", time.Now().Unix())
	}
	return parts[0]
}

func StoreToken(email, token string) {
	tokenMap[email] = TokenData{
		Code:      token,
		ExpiresAt: time.Now().Add(tokenTTL),
	}
	LastSentMap[email] = time.Now() // 🕒 registra o momento do envio
}

func AuthenticateUserWithToken(email, token, username string) (*models.User, error) {
	data, ok := tokenMap[email]
	if !ok || data.Code != token {
		return nil, errors.New("token inválido ou não encontrado")
	}
	if time.Now().After(data.ExpiresAt) {
		delete(tokenMap, email)
		return nil, errors.New("token expirado")
	}
	delete(tokenMap, email)

	// ✅ Captura os dois valores corretamente
	user, err := CreateOrGetUser(email, username)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func UpdateUserNameByEmail(email, newName string) (*models.User, error) {
	for _, u := range store.UserStore {
		if u.Email == email {
			u.Name = newName
			return u, nil
		}
	}
	return nil, errors.New("usuário não encontrado")
}

func SetUserAccessAndPlan(email, role string) error {
	for _, u := range store.UserStore {
		if u.Email == email {
			u.Role = role
			u.Plan = GetDefaultPlanForRole(role)
			store.SyncUserToStore(u.Username, u.Email, u.Plan, "") // 🔁 ID removido
			return nil
		}
	}
	return errors.New("usuário não encontrado")
}

func UpgradeUserPlan(email string, newPlan models.PlanType) error {
	for _, u := range store.UserStore {
		if u.Email == email {
			u.Plan = newPlan
			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
				return fmt.Errorf("erro ao criar diretórios para o novo plano: %w", err)
			}
			store.SyncUserToStore(u.Username, u.Email, newPlan, "") // 🔁 ID removido
			return nil
		}
	}
	return errors.New("usuário não encontrado")
}

// 📦 Copia conteúdo de uma pasta para outra (recursivamente)
func copyDir(src string, dst string) error {
	return filepath.Walk(src, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		targetPath := filepath.Join(dst, relPath)

		if info.IsDir() {
			return os.MkdirAll(targetPath, os.ModePerm)
		}

		srcFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer srcFile.Close()

		dstFile, err := os.Create(targetPath)
		if err != nil {
			return err
		}
		defer dstFile.Close()

		_, err = io.Copy(dstFile, srcFile)
		return err
	})
}

// 🔄 Migra dados do plano antigo para o novo, preservando estrutura
func RenameUserPlanFolder(email string, newPlan models.PlanType) error {
	for _, u := range store.UserStore {
		if u.Email == email {
			oldPlan := u.Plan
			u.Plan = newPlan

			base := fmt.Sprintf("storage/users/%s", u.Username)
			oldPath := fmt.Sprintf("%s/%s", base, oldPlan)
			newPath := fmt.Sprintf("%s/%s", base, newPlan)

			logEntry := PlanMigrationLog{
				Username:  u.Username,
				Email:     u.Email,
				From:      oldPlan,
				To:        newPlan,
				Timestamp: time.Now(),
			}

			if _, err := os.Stat(oldPath); os.IsNotExist(err) {
				logEntry.Success = false
				logEntry.ErrorMsg = "Pasta antiga não existe"
				migrationLogs = append(migrationLogs, logEntry)
				return fmt.Errorf("pasta antiga '%s' não encontrada", oldPath)
			}

			if _, err := os.Stat(newPath); err == nil {
				logEntry.Success = false
				logEntry.ErrorMsg = "Pasta destino já existe"
				migrationLogs = append(migrationLogs, logEntry)
				return fmt.Errorf("pasta destino '%s' já existe", newPath)
			}

			if err := copyDir(oldPath, newPath); err != nil {
				logEntry.Success = false
				logEntry.ErrorMsg = err.Error()
				migrationLogs = append(migrationLogs, logEntry)
				return fmt.Errorf("erro ao copiar dados: %w", err)
			}

			entries, _ := os.ReadDir(oldPath)
			for _, entry := range entries {
				_ = os.RemoveAll(filepath.Join(oldPath, entry.Name()))
			}

			store.SyncUserToStore(u.Username, u.Email, newPlan, "") // 🔁 ID removido
			_ = NormalizeAppPrefixes(u.Username, newPlan)

			logEntry.Success = true
			migrationLogs = append(migrationLogs, logEntry)
			return nil
		}
	}
	return fmt.Errorf("usuário com email '%s' não encontrado", email)
}

func PrintMigrationLogs() {
	for _, log := range migrationLogs {
		status := "\033[32m✔\033[0m"
		if !log.Success {
			status = "\033[31m✘\033[0m"
		}
		fmt.Printf("[%s] %s migrou de %s para %s | Status: %s | Erro: %s\n",
			log.Timestamp.Format("2006-01-02 15:04:05"),
			log.Username,
			log.From,
			log.To,
			status,
			log.ErrorMsg,
		)
	}
}

func GetMigrationLogs() []PlanMigrationLog {
	return migrationLogs
}

func GenerateTokenCode() string {
	const digits = "0123456789"
	code := make([]byte, 6)
	for i := range code {
		b := make([]byte, 1)
		_, err := rand.Read(b)
		if err != nil {
			code[i] = digits[0]
			continue
		}
		code[i] = digits[int(b[0])%len(digits)]
	}
	return string(code)
}

func SaveUsersToFile() error {
	file, err := os.Create("./database/users.json")
	if err != nil {
		return err
	}
	defer file.Close()

	data := make(map[string]*models.User)
	for _, u := range store.UserStore {
		data[u.Username] = u
	}

	return json.NewEncoder(file).Encode(data)
}

func LoadUsersFromFile() {
	file, err := os.Open("./database/users.json")
	if err != nil {
		fmt.Println("⚠️ Nenhum arquivo de usuários encontrado")
		return
	}
	defer file.Close()

	var data map[string]*models.User
	if err := json.NewDecoder(file).Decode(&data); err != nil {
		fmt.Println("⚠️ Erro ao carregar usuários:", err)
		return
	}

	for username, u := range data {
		store.UserStore[username] = u // 🔁 chave por username
	}
}

func GetDefaultPlanForRole(role string) models.PlanType {
	switch role {
	case "admin", "staff", "dev":
		return models.PlanPro
	case "support":
		return models.PlanBasic
	default:
		return models.PlanNothing
	}
}

func LoadSession(code string) *Session {
	file, err := os.Open("./database/sessions.json")
	if err != nil {
		fmt.Println("⚠️ Erro ao abrir sessions.json:", err)
		return nil
	}
	defer file.Close()

	var sessions map[string]Session
	if err := json.NewDecoder(file).Decode(&sessions); err != nil {
		fmt.Println("⚠️ Erro ao decodificar sessions.json:", err)
		return nil
	}

	session, ok := sessions[code]
	if !ok {
		return nil
	}
	return &session
}

func IsCodeValid(code string) bool {
	session := LoadSession(code)
	if session == nil {
		return false
	}

	expiresAt, err := time.Parse(time.RFC3339, session.ExpiresAt)
	if err != nil || time.Now().After(expiresAt) {
		return false
	}

	return true
}
func VerifyToken(email, code string) bool {
	data, ok := tokenMap[email]
	if !ok || data.Code != code {
		return false
	}
	if time.Now().After(data.ExpiresAt) {
		return false
	}
	return true
}

//backend/services/auth_service.go

//package services
//
//import (
//	"crypto/rand"
//	"encoding/json"
//	"errors"
//	"fmt"
//	"io"
//	"io/fs"
//	"log"
//	"os"
//	"path/filepath"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//type TokenData struct {
//	Code      string
//	ExpiresAt time.Time
//}
//
//type PlanMigrationLog struct {
//	Username  string
//	Email     string
//	From      models.PlanType
//	To        models.PlanType
//	Timestamp time.Time
//	Success   bool
//	ErrorMsg  string
//}
//
//type Session struct {
//	Email     string `json:"email"`
//	Code      string `json:"code"`
//	ExpiresAt string `json:"expiresAt"`
//}
//
//var (
//	//nextID        = 1
//	tokenMap      = map[string]TokenData{}
//	tokenTTL      = 120 * time.Second
//	migrationLogs []PlanMigrationLog
//	//tokenTTL      = 5 * time.Minute
//)
//
//func createUserBaseDirs(username string, plan models.PlanType) error {
//	base := fmt.Sprintf("storage/users/%s", username)
//	fmt.Println("📁 Criando pastas em:", base)
//
//	paths := []string{
//		fmt.Sprintf("%s/logs", base),
//		//fmt.Sprintf("%s/uploads", base),
//		fmt.Sprintf("%s/%s", base, plan),
//		fmt.Sprintf("%s/%s/apps", base, plan),
//		fmt.Sprintf("%s/%s/snapshots", base, plan),
//	}
//
//	for _, path := range paths {
//		fmt.Println("📁 Verificando/criando:", path)
//		if err := os.MkdirAll(path, 0755); err != nil {
//			log.Printf("❌ Erro ao criar pasta %s: %v", path, err)
//			return err
//		}
//	}
//	return nil
//}
//
//func CreateOrGetUser(email, username string) (*models.User, error) {
//	// 🔍 Verifica se já existe usuário com mesmo email ou username
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			store.SyncUserToStore(u.Username, u.Email, u.Plan, "") // 🔁 ID removido
//			return u, nil
//		}
//		if u.Username == username {
//			return nil, fmt.Errorf("nome de usuário já está em uso")
//		}
//	}
//
//	// 🆕 Cria novo usuário
//	user := &models.User{
//		Username:  username,
//		Email:     email,
//		CreatedAt: time.Now(),
//		Role:      "user",
//		Plan:      models.PlanNothing,
//	}
//	store.UserStore[user.Username] = user // 🔁 chave por username
//	_ = SaveUsersToFile()
//	store.SyncUserToStore(user.Username, user.Email, user.Plan, "") // 🔁 ID removido
//	_ = createUserBaseDirs(username, user.Plan)
//
//	return user, nil
//}
//
//func GenerateUsername(email string) string {
//	parts := strings.Split(email, "@")
//	if len(parts) != 2 || parts[0] == "" {
//		return fmt.Sprintf("user%d", time.Now().Unix())
//	}
//	return parts[0]
//}
//
//func StoreToken(email, token string) {
//	tokenMap[email] = TokenData{
//		Code:      token,
//		ExpiresAt: time.Now().Add(tokenTTL),
//	}
//	LastSentMap[email] = time.Now() // 🕒 registra o momento do envio
//}
//
//func AuthenticateUserWithToken(email, token, username string) (*models.User, error) {
//	data, ok := tokenMap[email]
//	if !ok || data.Code != token {
//		return nil, errors.New("token inválido ou não encontrado")
//	}
//	if time.Now().After(data.ExpiresAt) {
//		delete(tokenMap, email)
//		return nil, errors.New("token expirado")
//	}
//	delete(tokenMap, email)
//
//	// ✅ Captura os dois valores corretamente
//	user, err := CreateOrGetUser(email, username)
//	if err != nil {
//		return nil, err
//	}
//	return user, nil
//}
//
//func UpdateUserNameByEmail(email, newName string) (*models.User, error) {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			u.Name = newName
//			return u, nil
//		}
//	}
//	return nil, errors.New("usuário não encontrado")
//}
//
//func SetUserAccessAndPlan(email, role string) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			u.Role = role
//			u.Plan = GetDefaultPlanForRole(role)
//			store.SyncUserToStore(u.Username, u.Email, u.Plan, "") // 🔁 ID removido
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}
//
//func UpgradeUserPlan(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			u.Plan = newPlan
//			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
//				return fmt.Errorf("erro ao criar diretórios para o novo plano: %w", err)
//			}
//			store.SyncUserToStore(u.Username, u.Email, newPlan, "") // 🔁 ID removido
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}
//
//// 📦 Copia conteúdo de uma pasta para outra (recursivamente)
//func copyDir(src string, dst string) error {
//	return filepath.Walk(src, func(path string, info fs.FileInfo, err error) error {
//		if err != nil {
//			return err
//		}
//		relPath, err := filepath.Rel(src, path)
//		if err != nil {
//			return err
//		}
//		targetPath := filepath.Join(dst, relPath)
//
//		if info.IsDir() {
//			return os.MkdirAll(targetPath, os.ModePerm)
//		}
//
//		srcFile, err := os.Open(path)
//		if err != nil {
//			return err
//		}
//		defer srcFile.Close()
//
//		dstFile, err := os.Create(targetPath)
//		if err != nil {
//			return err
//		}
//		defer dstFile.Close()
//
//		_, err = io.Copy(dstFile, srcFile)
//		return err
//	})
//}
//
//// 🔄 Migra dados do plano antigo para o novo, preservando estrutura
//func RenameUserPlanFolder(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			oldPlan := u.Plan
//			u.Plan = newPlan
//
//			base := fmt.Sprintf("storage/users/%s", u.Username)
//			oldPath := fmt.Sprintf("%s/%s", base, oldPlan)
//			newPath := fmt.Sprintf("%s/%s", base, newPlan)
//
//			logEntry := PlanMigrationLog{
//				Username:  u.Username,
//				Email:     u.Email,
//				From:      oldPlan,
//				To:        newPlan,
//				Timestamp: time.Now(),
//			}
//
//			if _, err := os.Stat(oldPath); os.IsNotExist(err) {
//				logEntry.Success = false
//				logEntry.ErrorMsg = "Pasta antiga não existe"
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("pasta antiga '%s' não encontrada", oldPath)
//			}
//
//			if _, err := os.Stat(newPath); err == nil {
//				logEntry.Success = false
//				logEntry.ErrorMsg = "Pasta destino já existe"
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("pasta destino '%s' já existe", newPath)
//			}
//
//			if err := copyDir(oldPath, newPath); err != nil {
//				logEntry.Success = false
//				logEntry.ErrorMsg = err.Error()
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("erro ao copiar dados: %w", err)
//			}
//
//			entries, _ := os.ReadDir(oldPath)
//			for _, entry := range entries {
//				_ = os.RemoveAll(filepath.Join(oldPath, entry.Name()))
//			}
//
//			store.SyncUserToStore(u.Username, u.Email, newPlan, "") // 🔁 ID removido
//			_ = NormalizeAppPrefixes(u.Username, newPlan)
//
//			logEntry.Success = true
//			migrationLogs = append(migrationLogs, logEntry)
//			return nil
//		}
//	}
//	return fmt.Errorf("usuário com email '%s' não encontrado", email)
//}
//
//func PrintMigrationLogs() {
//	for _, log := range migrationLogs {
//		status := "\033[32m✔\033[0m"
//		if !log.Success {
//			status = "\033[31m✘\033[0m"
//		}
//		fmt.Printf("[%s] %s migrou de %s para %s | Status: %s | Erro: %s\n",
//			log.Timestamp.Format("2006-01-02 15:04:05"),
//			log.Username,
//			log.From,
//			log.To,
//			status,
//			log.ErrorMsg,
//		)
//	}
//}
//
//func GetMigrationLogs() []PlanMigrationLog {
//	return migrationLogs
//}
//
//func GenerateTokenCode() string {
//	const digits = "0123456789"
//	code := make([]byte, 6)
//	for i := range code {
//		b := make([]byte, 1)
//		_, err := rand.Read(b)
//		if err != nil {
//			code[i] = digits[0]
//			continue
//		}
//		code[i] = digits[int(b[0])%len(digits)]
//	}
//	return string(code)
//}
//
//func SaveUsersToFile() error {
//	file, err := os.Create("./database/users.json")
//	if err != nil {
//		return err
//	}
//	defer file.Close()
//
//	data := make(map[string]*models.User)
//	for _, u := range store.UserStore {
//		data[u.Username] = u
//	}
//
//	return json.NewEncoder(file).Encode(data)
//}
//
//func LoadUsersFromFile() {
//	file, err := os.Open("./database/users.json")
//	if err != nil {
//		fmt.Println("⚠️ Nenhum arquivo de usuários encontrado")
//		return
//	}
//	defer file.Close()
//
//	var data map[string]*models.User
//	if err := json.NewDecoder(file).Decode(&data); err != nil {
//		fmt.Println("⚠️ Erro ao carregar usuários:", err)
//		return
//	}
//
//	for username, u := range data {
//		store.UserStore[username] = u // 🔁 chave por username
//	}
//}
//
//func GetDefaultPlanForRole(role string) models.PlanType {
//	switch role {
//	case "admin", "staff", "dev":
//		return models.PlanPro
//	case "support":
//		return models.PlanBasic
//	default:
//		return models.PlanNothing
//	}
//}
//
//func LoadSession(code string) *Session {
//	file, err := os.Open("./database/sessions.json")
//	if err != nil {
//		fmt.Println("⚠️ Erro ao abrir sessions.json:", err)
//		return nil
//	}
//	defer file.Close()
//
//	var sessions map[string]Session
//	if err := json.NewDecoder(file).Decode(&sessions); err != nil {
//		fmt.Println("⚠️ Erro ao decodificar sessions.json:", err)
//		return nil
//	}
//
//	session, ok := sessions[code]
//	if !ok {
//		return nil
//	}
//	return &session
//}
//
//func IsCodeValid(code string) bool {
//	session := LoadSession(code)
//	if session == nil {
//		return false
//	}
//
//	expiresAt, err := time.Parse(time.RFC3339, session.ExpiresAt)
//	if err != nil || time.Now().After(expiresAt) {
//		return false
//	}
//
//	return true
//}
//func VerifyToken(email, code string) bool {
//	data, ok := tokenMap[email]
//	if !ok || data.Code != code {
//		return false
//	}
//	if time.Now().After(data.ExpiresAt) {
//		return false
//	}
//	return true
//}

//func AuthenticateUserWithToken(email, token, username string) (*models.User, error) {
//	data, ok := tokenMap[email]
//	if !ok || data.Code != token {
//		return nil, errors.New("token inválido ou não encontrado")
//	}
//	if time.Now().After(data.ExpiresAt) {
//		delete(tokenMap, email)
//		delete(LastSentMap, email) // ✅ limpa tempo após expiração
//		return nil, errors.New("token expirado")
//	}
//	delete(tokenMap, email)
//	delete(LastSentMap, email) // ✅ limpa tempo após login
//
//	user, err := CreateOrGetUser(email, username)
//	if err != nil {
//		return nil, err
//	}
//	return user, nil
//}

//func createUserBaseDirs(username string, plan models.PlanType) error {
//	base := fmt.Sprintf("storage/users/%s", username)
//	// 🐞 Log para verificar o caminho da pasta sendo criada
//	fmt.Println("📁 Criando pastas em:", base)
//	paths := []string{
//		fmt.Sprintf("%s/logs", base),
//		fmt.Sprintf("%s/uploads", base),
//		fmt.Sprintf("%s/%s", base, plan),
//		fmt.Sprintf("%s/%s/apps", base, plan),      // ← ADICIONADO
//		fmt.Sprintf("%s/%s/snapshots", base, plan), // ← ADICIONADO
//		//fmt.Sprintf("%s/%s/logs", base, plan),    // ← ADICIONADO
//	}
//	for _, path := range paths {
//		if err := os.MkdirAll(path, 0755); err != nil {
//			return err
//		}
//	}
//	return nil
//}

//func GetLoggedUserByToken(token string) *models.User {
//	session, ok := models.GetSessionByToken(token)
//	if !ok {
//		return nil
//	}
//	for _, user := range store.UserStore {
//		if user.Email == session.Email {
//			// ✅ Garante que as pastas base existem após login
//			if err := createUserBaseDirs(user.Username, user.Plan); err != nil {
//				log.Printf("❌ Erro ao criar pastas base para %s: %v", user.Username, err)
//			}
//			return user
//		}
//	}
//	return nil
//}

//func GetLoggedUserByToken(token string) *models.User {
//	session, ok := models.GetSessionByToken(token)
//	if !ok {
//		return nil
//	}
//	for _, user := range store.UserStore {
//		if user.Email == session.Email {
//			// ✅ Garante que as pastas base existem
//			_ = createUserBaseDirs(user.Username, user.Plan)
//			return user
//		}
//	}
//	return nil
//}

//func CreateOrGetUser(email, username string) (*models.User, error) {
//	// 🔍 Verifica se já existe usuário com mesmo email ou username
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			store.SyncUserToStore(u.Username, u.Email, u.Plan, strconv.Itoa(u.ID))
//			return u, nil
//		}
//		if u.Username == username {
//			return nil, fmt.Errorf("nome de usuário já está em uso")
//		}
//	}
//
//	// 🆕 Cria novo usuário
//	user := &models.User{
//		ID:        nextID,
//		Username:  username,
//		Email:     email,
//		CreatedAt: time.Now(),
//		Role:      "user",
//		Plan:      models.PlanNothing,
//	}
//	nextID++
//	store.UserStore[strconv.Itoa(user.ID)] = user
//	_ = SaveUsersToFile()
//	store.SyncUserToStore(user.Username, user.Email, user.Plan, strconv.Itoa(user.ID))
//	_ = createUserBaseDirs(username, user.Plan)
//
//	return user, nil
//}

//	func GetNextUserID() int {
//		users := LoadAllUsers() // ← função que lê todos os usuários do users.json
//		maxID := 0
//		for _, user := range users {
//			if user.ID > maxID {
//				maxID = user.ID
//			}
//		}
//		return maxID + 1
//	}

//func SetUserAccessAndPlan(email, role string) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			u.Role = role
//			u.Plan = GetDefaultPlanForRole(role)
//			store.SyncUserToStore(u.Username, u.Email, u.Plan, strconv.Itoa(u.ID))
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}

//func UpgradeUserPlan(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			u.Plan = newPlan
//			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
//				return fmt.Errorf("erro ao criar diretórios para o novo plano: %w", err)
//			}
//			store.SyncUserToStore(u.Username, u.Email, newPlan, strconv.Itoa(u.ID))
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}

//func RenameUserPlanFolder(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			oldPlan := u.Plan
//			u.Plan = newPlan
//
//			base := fmt.Sprintf("storage/users/%s", u.Username)
//			oldPath := fmt.Sprintf("%s/%s", base, oldPlan)
//			newPath := fmt.Sprintf("%s/%s", base, newPlan)
//
//			logEntry := PlanMigrationLog{
//				Username:  u.Username,
//				Email:     u.Email,
//				From:      oldPlan,
//				To:        newPlan,
//				Timestamp: time.Now(),
//			}
//
//			if _, err := os.Stat(oldPath); os.IsNotExist(err) {
//				logEntry.Success = false
//				logEntry.ErrorMsg = "Pasta antiga não existe"
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("pasta antiga '%s' não encontrada", oldPath)
//			}
//
//			if _, err := os.Stat(newPath); err == nil {
//				logEntry.Success = false
//				logEntry.ErrorMsg = "Pasta destino já existe"
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("pasta destino '%s' já existe", newPath)
//			}
//
//			// 🧭 Copia dados para nova pasta
//			if err := copyDir(oldPath, newPath); err != nil {
//				logEntry.Success = false
//				logEntry.ErrorMsg = err.Error()
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("erro ao copiar dados: %w", err)
//			}
//
//			// 🧹 Limpa conteúdo da pasta antiga
//			entries, _ := os.ReadDir(oldPath)
//			for _, entry := range entries {
//				_ = os.RemoveAll(filepath.Join(oldPath, entry.Name()))
//			}
//
//			// 🔄 Atualiza plano no store
//			store.SyncUserToStore(u.Username, u.Email, newPlan, strconv.Itoa(u.ID))
//
//			// 🔤 Corrige prefixos das pastas de aplicação
//			_ = NormalizeAppPrefixes(u.Username, newPlan)
//
//			logEntry.Success = true
//			migrationLogs = append(migrationLogs, logEntry)
//			return nil
//		}
//	}
//	return fmt.Errorf("usuário com email '%s' não encontrado", email)
//}

//func LoadUsersFromFile() {
//	file, err := os.Open("./database/users.json")
//	if err != nil {
//		fmt.Println("⚠️ Nenhum arquivo de usuários encontrado")
//		return
//	}
//	defer file.Close()
//
//	var data map[string]*models.User
//	if err := json.NewDecoder(file).Decode(&data); err != nil {
//		fmt.Println("⚠️ Erro ao carregar usuários:", err)
//		return
//	}
//
//	for _, u := range data {
//		store.UserStore[strconv.Itoa(u.ID)] = u
//	}
//}

// 🔄 Migra dados do plano antigo para o novo, preservando estrutura
//func RenameUserPlanFolder(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			oldPlan := u.Plan
//			u.Plan = newPlan
//
//			base := fmt.Sprintf("storage/users/%s", u.Username)
//			oldPath := fmt.Sprintf("%s/%s", base, oldPlan)
//			newPath := fmt.Sprintf("%s/%s", base, newPlan)
//
//			logEntry := PlanMigrationLog{
//				Username:  u.Username,
//				Email:     u.Email,
//				From:      oldPlan,
//				To:        newPlan,
//				Timestamp: time.Now(),
//			}
//
//			if _, err := os.Stat(oldPath); os.IsNotExist(err) {
//				logEntry.Success = false
//				logEntry.ErrorMsg = "Pasta antiga não existe"
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("pasta antiga '%s' não encontrada", oldPath)
//			}
//
//			if _, err := os.Stat(newPath); err == nil {
//				logEntry.Success = false
//				logEntry.ErrorMsg = "Pasta destino já existe"
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("pasta destino '%s' já existe", newPath)
//			}
//
//			// 🧭 Copia dados para nova pasta
//			if err := copyDir(oldPath, newPath); err != nil {
//				logEntry.Success = false
//				logEntry.ErrorMsg = err.Error()
//				migrationLogs = append(migrationLogs, logEntry)
//				return fmt.Errorf("erro ao copiar dados: %w", err)
//			}
//
//			// 🧹 Limpa conteúdo da pasta antiga
//			entries, _ := os.ReadDir(oldPath)
//			for _, entry := range entries {
//				_ = os.RemoveAll(filepath.Join(oldPath, entry.Name()))
//			}
//
//			// 🔄 Atualiza plano no store
//			store.SyncUserToStore(u.Username, u.Email, newPlan, strconv.Itoa(u.ID))
//
//			logEntry.Success = true
//			migrationLogs = append(migrationLogs, logEntry)
//			return nil
//		}
//	}
//	return fmt.Errorf("usuário com email '%s' não encontrado", email)
//}

//func RenameUserPlanFolder(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			oldPlan := u.Plan
//			u.Plan = newPlan
//
//			base := fmt.Sprintf("storage/users/%s", u.Username)
//			oldPath := fmt.Sprintf("%s/%s", base, oldPlan)
//			newPath := fmt.Sprintf("%s/%s", base, newPlan)
//
//			log := PlanMigrationLog{
//				Username:  u.Username,
//				Email:     u.Email,
//				From:      oldPlan,
//				To:        newPlan,
//				Timestamp: time.Now(),
//			}
//
//			if _, err := os.Stat(oldPath); os.IsNotExist(err) {
//				log.Success = false
//				log.ErrorMsg = "Pasta antiga não existe"
//				migrationLogs = append(migrationLogs, log)
//				return fmt.Errorf("pasta antiga '%s' não encontrada", oldPath)
//			}
//
//			if _, err := os.Stat(newPath); err == nil {
//				log.Success = false
//				log.ErrorMsg = "Pasta destino já existe"
//				migrationLogs = append(migrationLogs, log)
//				return fmt.Errorf("pasta destino '%s' já existe", newPath)
//			}
//
//			if err := os.Rename(oldPath, newPath); err != nil {
//				log.Success = false
//				log.ErrorMsg = err.Error()
//				migrationLogs = append(migrationLogs, log)
//				return fmt.Errorf("erro ao renomear pasta: %w", err)
//			}
//
//			store.SyncUserToStore(u.Username, u.Email, newPlan, strconv.Itoa(u.ID))
//			log.Success = true
//			migrationLogs = append(migrationLogs, log)
//			return nil
//		}
//	}
//	return fmt.Errorf("usuário com email '%s' não encontrado", email)
//}
