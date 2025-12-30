//backend/routes/health.go

package routes

import (
	"net/http"
	"time"

	"virtuscloud/backend/utils"
)

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	utils.WriteJSON(w, map[string]interface{}{
		"status":    "ok",
		"message":   "API is healthy!",
		"uptime":    time.Since(startTime).String(),
		"timestamp": time.Now().Format(time.RFC3339),
		"version":   "1.0.0",
	})
}

var startTime = time.Now()
