//backend/middleware/recover.go

package middleware

import (
	"log"
	"net/http"
)

func Recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("🚨 Panic recuperado: %v", err)
				http.Error(w, "Erro interno", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}
