//utils/logger.go

package utils

import (
	"log"
	"net/http"
	"time"
)

// Log informativo
func Info(msg string) {
	log.Println("ℹ️ [INFO]", msg)
}

// Log de sucesso
func Success(msg string) {
	log.Println("✅ [SUCCESS]", msg)
}

// Log de erro com contexto
func Error(context string, err error) {
	log.Printf("[%s] ❌ [ERROR] [%s] %v", time.Now().Format("15:04:05"), context, err)
	//log.Printf("❌ [ERROR] [%s] %v", context, err)
}

// Log de erro + resposta HTTP
func RespondWithError(w http.ResponseWriter, context string, err error, status int) {
	Error(context, err)
	http.Error(w, "Erro interno: "+err.Error(), status)
}
func Warn(msg string) {
	log.Println("⚠️ [WARN]", msg)
}
func RespondWithJSONError(w http.ResponseWriter, context string, err error, status int) {
	Error(context, err)
	WriteJSONStatus(w, status, map[string]string{"error": err.Error()})
}
