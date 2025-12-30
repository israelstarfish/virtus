//utils/rate_limit.go

package utils

import (
	"net/http"
	"sync"
	"time"
)

var visitors = make(map[string]time.Time)
var mu sync.Mutex

// Intervalo configurável para limitar requisições por IP
var RateLimitInterval = time.Second

// Inicializa limpeza periódica de IPs antigos
func init() {
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			mu.Lock()
			for ip, last := range visitors {
				if time.Since(last) > 10*time.Minute {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

// Middleware de rate limit por IP
func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := GetRealIP(r)

		mu.Lock()
		lastSeen, exists := visitors[ip]
		if exists && time.Since(lastSeen) < RateLimitInterval {
			mu.Unlock()
			http.Error(w, "Muitas requisições", http.StatusTooManyRequests)
			return
		}
		visitors[ip] = time.Now()
		mu.Unlock()

		next.ServeHTTP(w, r)
	})
}

// Extrai IP real considerando proxies
//func getRealIP(r *http.Request) string {
//	ip := r.Header.Get("X-Forwarded-For")
//	if ip != "" {
//		// Pode conter múltiplos IPs separados por vírgula
//		parts := strings.Split(ip, ",")
//		return strings.TrimSpace(parts[0])
//	}
//	ip, _, _ = net.SplitHostPort(r.RemoteAddr)
//	return ip
//}

//package utils
//
//import (
//	"net/http"
//	"sync"
//	"time"
//)
//
//var visitors = make(map[string]time.Time)
//var mu sync.Mutex
//
//func RateLimitMiddleware(next http.Handler) http.Handler {
//	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//		ip := r.RemoteAddr
//		mu.Lock()
//		lastSeen, exists := visitors[ip]
//		if exists && time.Since(lastSeen) < time.Second {
//			mu.Unlock()
//			http.Error(w, "Muitas requisições", http.StatusTooManyRequests)
//			return
//		}
//		visitors[ip] = time.Now()
//		mu.Unlock()
//		next.ServeHTTP(w, r)
//	})
//}
