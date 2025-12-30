//backend/services/token.go

package services

import (
	"log"
	"time"
)

// var TokenMap = make(map[string]TokenData) // 👈 exportável
var LastSentMap = make(map[string]time.Time)

var lastSentMap = make(map[string]time.Time)

// ✅ Verifica se o código armazenado para o e-mail é igual ao recebido
func IsValidToken(email, code string) bool {
	tokenData, exists := tokenMap[email]
	if !exists {
		return false
	}
	if tokenData.Code != code {
		return false
	}
	if time.Now().After(tokenData.ExpiresAt) {
		return false
	}
	return true
}

func HasToken(email string) bool {
	tokenData, exists := tokenMap[email]
	return exists && tokenData.Code != "" && time.Now().Before(tokenData.ExpiresAt)
}

func DeleteToken(email string) {
	delete(tokenMap, email)
	delete(LastSentMap, email) // 🧹 limpa o tempo também
	delete(lastSentMap, email)
}

func LogTokenState(email string) {
	data, tokenExists := tokenMap[email]
	last, timeExists := LastSentMap[email]

	log.Printf("🧭 Rastreamento para %s", email)
	log.Printf("🔐 Token existe? %v", tokenExists)
	if tokenExists {
		log.Printf("🔐 Token: %s | Expira em: %s", data.Code, data.ExpiresAt.Format(time.RFC3339))
	}
	log.Printf("⏱️ Tempo registrado? %v", timeExists)
	if timeExists {
		log.Printf("⏱️ Último envio: %s | Faz %v", last.Format(time.RFC3339), time.Since(last))
	}
}

//func HasToken(email string) bool {
//	token := tokenStore[email] // ou o nome da sua estrutura de armazenamento
//	return token != ""
//}

//var tokenStore = make(map[string]string)
//var tokenMutex sync.RWMutex
