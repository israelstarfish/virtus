//backend/models/sessions.go

package models

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

func NowISO() string {
	return time.Now().Format(time.RFC3339)
}

type SessionData struct {
	//ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Plan     string `json:"plan"`
	LastSeen string `json:"lastSeen"`
	Token    string `json:"token"`
}

func SaveSessions(sessions map[string]SessionData) error {
	file, err := os.Create("./database/sessions.json")
	if err != nil {
		return fmt.Errorf("erro ao abrir arquivo de sessões: %w", err)
	}
	defer file.Close()

	if err := json.NewEncoder(file).Encode(sessions); err != nil {
		return fmt.Errorf("erro ao salvar sessões: %w", err)
	}
	return nil
}

func LoadSessions() map[string]SessionData {
	file, err := os.Open("./database/sessions.json")
	if err != nil {
		return map[string]SessionData{}
	}
	defer file.Close()

	sessions := map[string]SessionData{}
	_ = json.NewDecoder(file).Decode(&sessions)

	// ⏳ Expiração automática (24h)
	expired := map[string]bool{}
	for username, session := range sessions {
		lastSeen, err := time.Parse(time.RFC3339, session.LastSeen)
		if err != nil || time.Since(lastSeen) > 24*time.Hour {
			expired[username] = true
		}
	}

	for username := range expired {
		delete(sessions, username)
	}

	if len(expired) > 0 {
		_ = SaveSessions(sessions)
	}

	return sessions
}

func DeleteSessionByEmail(email string) error {
	file, err := os.Open("./database/sessions.json")
	if err != nil {
		return err
	}
	defer file.Close()

	var sessions map[string]SessionData
	if err := json.NewDecoder(file).Decode(&sessions); err != nil {
		return err
	}

	// Remove a sessão com base no email
	for username, session := range sessions {
		if session.Email == email {
			delete(sessions, username)
			break
		}
	}

	// Salva de volta
	data, err := json.MarshalIndent(sessions, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile("./database/sessions.json", data, 0644)
}

func GetSessionByToken(tokenStr string) (*SessionData, bool) {
	sessions := LoadSessions()
	for _, s := range sessions {
		if s.Token == tokenStr {
			return &s, true
		}
	}
	return nil, false
}
func UpdateSessionActivity(username string) error {
	sessions := LoadSessions()

	session, ok := sessions[username]
	if !ok {
		return fmt.Errorf("sessão não encontrada para %s", username)
	}

	session.LastSeen = NowISO()
	sessions[username] = session

	return SaveSessions(sessions)
}
func DeleteSession(username string) error {
	sessions := LoadSessions()
	delete(sessions, username)
	return SaveSessions(sessions)
}
func LoadAllSessions() map[string]SessionData {
	sessions := map[string]SessionData{}
	file, err := os.Open("./database/sessions.json")
	if err == nil {
		_ = json.NewDecoder(file).Decode(&sessions)
		file.Close()
	}
	return sessions
}
func GetSessionByTokenFromUsername(username string) (*SessionData, bool) {
	sessions := LoadSessions()
	session, ok := sessions[username]
	return &session, ok
}

//func SaveSessions(sessions map[string]SessionData) error {
//	dir, _ := os.Getwd()
//	path := filepath.Join(dir, "database", "sessions.json")
//
//	file, err := os.Create(path)
//	if err != nil {
//		return fmt.Errorf("erro ao abrir arquivo de sessões: %w", err)
//	}
//	defer file.Close()
//
//	if err := json.NewEncoder(file).Encode(sessions); err != nil {
//		return fmt.Errorf("erro ao salvar sessões: %w", err)
//	}
//	return nil
//}

//type Session struct {
//	ID       string `json:"id"`
//	Username string `json:"username"`
//	Email    string `json:"email"`
//	Role     string `json:"role"`
//	Plan     string `json:"plan"`
//	LastSeen string `json:"last_activity"`
//	Token    string `json:"token"`
//}
//
//type UserSession struct {
//	ID       string `json:"id"`
//	Username string `json:"username"`
//	Email    string `json:"email"`
//	Role     string `json:"role"`
//	Plan     string `json:"plan"`
//	LastSeen string `json:"last_activity"`
//	Token    string `json:"token"`
//}
//
//type DataSession struct {
//	ID       string `json:"id"`
//	Username string `json:"username"`
//	Email    string `json:"email"`
//	Role     string `json:"role"`
//	Plan     string `json:"plan"`
//	LastSeen string `json:"last_activity"`
//	Token    string `json:"token"`
//}
