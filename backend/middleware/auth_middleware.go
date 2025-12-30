//backend/middleware/auth_middleware.go

package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

var tokenStr string

// 🔐 Middleware de autenticação JWT compatível com chi.Router.Use
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("🔐 AuthMiddleware interceptou:", r.Method, r.URL.Path, "Query:", r.URL.RawQuery)

		// 📥 Recupera o cabeçalho Authorization
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			cookie, err := r.Cookie("token")
			if err != nil || cookie.Value == "" {
				http.Error(w, "Token ausente ou inválido", http.StatusUnauthorized)
				return
			}
			// ✂️ Remove o prefixo "Bearer " para obter o token puro
			tokenStr = cookie.Value
		}

		// 📥 Recupera o cabeçalho Authorization
		//authHeader := r.Header.Get("Authorization")
		//if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		//	http.Error(w, "Token ausente ou inválido", http.StatusUnauthorized)
		//	return
		//}
		//
		//// ✂️ Remove o prefixo "Bearer " para obter o token puro
		//tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		// 📦 Cria um mapa para armazenar as claims do token
		claims := jwt.MapClaims{}

		// 🔍 Faz o parsing e validação do token JWT
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return JwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Token inválido ou expirado", http.StatusUnauthorized)
			return
		}

		// 👤 Extrai dados relevantes do token
		username, _ := claims["username"].(string)
		role, _ := claims["role"].(string)
		email, _ := claims["email"].(string)
		plan, _ := claims["plan"].(string)

		// 🧠 Armazena no contexto para uso posterior
		ctx := context.WithValue(r.Context(), UsernameKey, username)
		ctx = context.WithValue(ctx, RoleKey, role)
		ctx = context.WithValue(ctx, EmailKey, email)
		ctx = context.WithValue(ctx, PlanKey, plan)

		// ▶️ Continua para o próximo handler com contexto atualizado
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

//package middleware
//
//import (
//	"context"
//	"net/http"
//	"strings"
//
//	"github.com/golang-jwt/jwt/v5"
//)
//
//// 🔐 Middleware de autenticação JWT compatível com chi.Router.Use
//func AuthMiddleware(next http.Handler) http.Handler {
//	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//		// 📥 Recupera o cabeçalho Authorization
//		authHeader := r.Header.Get("Authorization")
//		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
//			http.Error(w, "Token ausente ou inválido", http.StatusUnauthorized)
//			return
//		}
//
//		// ✂️ Remove o prefixo "Bearer " para obter o token puro
//		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
//
//		// 📦 Cria um mapa para armazenar as claims do token
//		claims := jwt.MapClaims{}
//
//		// 🔍 Faz o parsing e validação do token JWT
//		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
//			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
//				return nil, jwt.ErrSignatureInvalid
//			}
//			return JwtSecret, nil
//		})
//		if err != nil || !token.Valid {
//			http.Error(w, "Token inválido ou expirado", http.StatusUnauthorized)
//			return
//		}
//
//		// 👤 Extrai dados relevantes do token
//		username, _ := claims["username"].(string)
//		role, _ := claims["role"].(string)
//
//		// 🧠 Armazena no contexto para uso posterior
//		ctx := context.WithValue(r.Context(), UsernameKey, username)
//		ctx = context.WithValue(ctx, RoleKey, role)
//
//		// ▶️ Continua para o próximo handler com contexto atualizado
//		next.ServeHTTP(w, r.WithContext(ctx))
//	})
//}
//
