// store/session_store.go

package store

import (
	"encoding/json"
	"os"
	"virtuscloud/backend/models"
)

// 🗃️ Sessões ativas em memória, indexadas por username
var SessionStore = make(map[string]*models.SessionData)

// 💾 Salva sessão em memória para uso interno (ex: deploy, autenticação)
func SaveSession(session *models.SessionData) {
	SessionStore[session.Username] = session
}

// 🔐 Recupera o token JWT da sessão do usuário
func GetSessionToken(username string) string {
	if session, ok := SessionStore[username]; ok {
		return session.Token
	}
	return ""
}

// 🔐 Recupera o usuário logado a partir do arquivo de sessão
func GetLoggedUser() *models.User {
	// 📂 Lê o conteúdo do arquivo de sessão
	data, err := os.ReadFile("./database/sessions.json")
	if err != nil {
		return nil
	}

	// 📨 Estrutura temporária para capturar o e-mail da sessão
	var session struct {
		Email string `json:"email"`
	}

	// 🔍 Tenta decodificar o JSON da sessão
	if err := json.Unmarshal(data, &session); err != nil {
		return nil
	}

	// 🔎 Busca o usuário na memória usando o e-mail da sessão
	for _, user := range UserStore {
		if user.Email == session.Email {
			return user
		}
	}

	return nil
}

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

func GetLoggedUserByToken(token string) *models.User {
	session, ok := models.GetSessionByToken(token)
	if !ok {
		return nil
	}
	for _, user := range UserStore {
		if user.Email == session.Email {
			return user
		}
	}
	return nil
}
