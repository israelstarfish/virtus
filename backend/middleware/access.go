//backend/middleware/access.go

package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// 🔐 Hierarquia de papéis para controle de acesso
var RoleHierarchy = map[string]int{
	"admin":   6,
	"staff":   5,
	"dev":     4,
	"support": 3,
	"user":    1,
}

// 🔑 Tipo seguro para chaves de contexto
type ContextKey string

// 🔐 Chaves usadas para armazenar dados do usuário no contexto
const (
	EmailKey    ContextKey = "email"    // 📧 e-mail do usuário
	AccessKey   ContextKey = "access"   // 🛡️ nível de acesso
	UsernameKey ContextKey = "username" // 👤 identificador principal
	RoleKey     ContextKey = "role"     // 🛡️ papel do usuário
	PlanKey     ContextKey = "plan"     // 📦 plano do usuário
)

func RequireDeployPermission(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		plan := GetPlanFromContext(r)
		if plan == "no-plan" || plan == "" {
			http.Error(w, "Plano atual não permite deploy", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

// 🔍 Extrai o token JWT do cabeçalho Authorization
func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}
	return parts[1]
}

// 📧 Extrai o e-mail do token JWT
func ExtractEmailFromToken(r *http.Request) (string, bool) {
	tokenStr := extractToken(r)
	if tokenStr == "" {
		return "", false
	}

	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})
	if err != nil {
		return "", false
	}

	email, ok := claims["email"].(string)
	return email, ok
}

// 🛡️ Extrai o nível de acesso do token JWT
func ExtractAccessFromToken(r *http.Request) (string, bool) {
	tokenStr := extractToken(r)
	if tokenStr == "" {
		return "", false
	}

	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})
	if err != nil {
		return "", false
	}

	access, ok := claims["role"].(string)
	return access, ok
}

// ✅ Verifica se o usuário tem acesso exato ao papel exigido
func HasAccessLevel(r *http.Request, required string) bool {
	access, ok := ExtractAccessFromToken(r)
	if !ok {
		return false
	}
	return access == required
}

// ✅ Verifica se o usuário tem acesso mínimo exigido
func HasMinimumAccess(r *http.Request, required string) bool {
	access, ok := ExtractAccessFromToken(r)
	if !ok {
		return false
	}
	userLevel := RoleHierarchy[access]
	requiredLevel := RoleHierarchy[required]
	return userLevel >= requiredLevel
}

// 🔐 Middleware que exige acesso exato
func RequireAccess(required string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !HasAccessLevel(r, required) {
			http.Error(w, "acesso não autorizado", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

// 🔐 Middleware que exige acesso mínimo
func RequireMinimumAccess(required string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !HasMinimumAccess(r, required) {
			http.Error(w, "acesso não autorizado", http.StatusForbidden)
			return
		}
		next(w, r)
	}
}

// 📥 Recupera o e-mail do contexto
func GetEmailFromContext(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(EmailKey).(string)
	return email, ok
}

// 📥 Recupera o nível de acesso do contexto
func GetAccessFromContext(ctx context.Context) (string, bool) {
	access, ok := ctx.Value(AccessKey).(string)
	return access, ok
}

// 📥 Recupera username e role do contexto (novo helper)
func GetUserFromContext(r *http.Request) (string, string) {
	username, _ := r.Context().Value(UsernameKey).(string)
	role, _ := r.Context().Value(RoleKey).(string)
	return username, role
}

// 📥 Recupera plano do contexto
func GetPlanFromContext(r *http.Request) string {
	plan, _ := r.Context().Value(PlanKey).(string)
	return plan
}
func ExtractUsernameFromToken(r *http.Request) (string, bool) {
	tokenStr := extractToken(r)
	if tokenStr == "" {
		return "", false
	}

	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})
	if err != nil {
		return "", false
	}

	username, ok := claims["username"].(string)
	return username, ok
}
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil || cookie.Value == "" {
			http.Error(w, "Token ausente", http.StatusUnauthorized)
			return
		}

		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(cookie.Value, claims, func(t *jwt.Token) (interface{}, error) {
			return JwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Token inválido ou expirado", http.StatusUnauthorized)
			return
		}

		username, _ := claims["username"].(string)
		role, _ := claims["role"].(string)
		plan, _ := claims["plan"].(string)

		ctx := context.WithValue(r.Context(), UsernameKey, username)
		ctx = context.WithValue(ctx, RoleKey, role)
		ctx = context.WithValue(ctx, PlanKey, plan)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
