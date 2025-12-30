//backend/routes/events.go

package routes

import (
	"net/http"
	"virtuscloud/backend/services"
	"virtuscloud/backend/utils"
)

// Rota GET /api/events — histórico técnico de containers
func EventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	events := services.GetEvents()
	utils.WriteJSON(w, map[string]interface{}{
		"events": events,
	})
}
