//utils/jwt.go

package utils

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// 🔐 Chave secreta para assinar o token JWT
var JwtSecret = []byte(os.Getenv("JWT_SECRET"))

//var JwtSecret = []byte("sua-chave-secreta-super-segura") // ⚠️ use os.Getenv em produção

// 🧪 Gera um token JWT com username, role e plan
func GenerateJWT(username, role, plan, email string) (string, error) {
	claims := jwt.MapClaims{
		"username": username,                              // 👤 identificador principal
		"email":    email,                                 // ✅ isso precisa estar aqui
		"role":     role,                                  // 🛡️ nível de acesso
		"plan":     plan,                                  // 📍 emitido em
		"iat":      time.Now().Unix(),                     // 📍 emitido em
		"exp":      time.Now().Add(24 * time.Hour).Unix(), // ⏳ expiração
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecret)
}

//func GenerateJWT(username string, role string, plan string, email string) (string, error) {
//	claims := jwt.MapClaims{
//		"username": username,                              // 👤 identificador principal
//		"email":    email,                                 // ✅ necessário para logout funcionar
//		"role":     role,                                  // 🛡️ nível de acesso
//		"plan":     plan,                                  // 📦 plano do usuário
//		"iat":      time.Now().Unix(),                     // 📍 emitido em
//		"exp":      time.Now().Add(24 * time.Hour).Unix(), // ⏳ expiração
//	}
//	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
//	return token.SignedString(JwtSecret)
//}

// 🔍 Extrai o token JWT do cabeçalho Authorization
func extractToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(authHeader, "Bearer ")
}

// ✅ Valida e extrai username e role do token JWT
func ParseJWT(r *http.Request) (string, string, error) {
	tokenStr := extractToken(r)
	if tokenStr == "" {
		return "", "", http.ErrNoCookie
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})
	if err != nil || !token.Valid {
		return "", "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", http.ErrNoCookie
	}

	username, _ := claims["username"].(string)
	role, _ := claims["role"].(string)

	return username, role, nil
}

// 🕒 Retorna o timestamp atual em formato ISO 8601 (RFC3339)
func NowISO() string {
	return time.Now().Format(time.RFC3339)
}
func IsTokenExpired(token *jwt.Token) bool {
	claims := token.Claims.(jwt.MapClaims)
	exp := int64(claims["exp"].(float64))
	return time.Now().Unix() > exp
}
