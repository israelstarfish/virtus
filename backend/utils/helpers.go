//utils/helpers.go

package utils

import (
	"fmt"
	"net/http"
	"strings"
	"time"
)

// ✅ Extrai o token Bearer do header Authorization com validação
func GetBearerToken(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(auth, "Bearer ")
}

// ✅ Calcula uptime com base no StartTime, com pluralização inteligente
func CalculateUptime(start time.Time) string {
	if start.IsZero() {
		return "0h 0m"
	}
	duration := time.Since(start)
	h := int(duration.Hours())
	m := int(duration.Minutes()) % 60

	hLabel := "h"
	mLabel := "m"

	if h == 1 {
		hLabel = "h"
	}
	if m == 1 {
		mLabel = "m"
	}

	return fmt.Sprintf("%d%s %d%s", h, hLabel, m, mLabel)
}

// ✅ Extrai valor de um header específico com fallback
func GetHeaderValue(r *http.Request, key string, fallback string) string {
	value := r.Header.Get(key)
	if value == "" {
		return fallback
	}
	return value
}

// ✅ Formata duração como "2h 15m" ou "45s"
func FormatDuration(d time.Duration) string {
	if d.Hours() >= 1 {
		return fmt.Sprintf("%dh %dm", int(d.Hours()), int(d.Minutes())%60)
	} else if d.Minutes() >= 1 {
		return fmt.Sprintf("%dm %ds", int(d.Minutes()), int(d.Seconds())%60)
	}
	return fmt.Sprintf("%ds", int(d.Seconds()))
}

// ✅ Retorna timestamp formatado como "24/08/2025 23:52"
func FormatTimestamp(t time.Time) string {
	return t.Format("02/01/2006 15:04")
}

// ✅ Verifica se o token é vazio ou contém espaços suspeitos
func IsTokenInvalid(token string) bool {
	return token == "" || strings.Contains(token, " ")
}

// ✅ Extrai IP real do usuário considerando proxies
//func GetRealIP(r *http.Request) string {
//	ip := r.Header.Get("X-Forwarded-For")
//	if ip == "" {
//		ip = r.RemoteAddr
//	}
//	return ip
//}
