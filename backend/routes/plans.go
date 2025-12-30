//backend/routes/plans.go

package routes

import (
	"net/http"
	"virtuscloud/backend/models"
	"virtuscloud/backend/utils"
)

// Rota GET /api/plans/details
func PlansDetailsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	// Converte o mapa para slice
	details := []models.Plan{}
	for _, plan := range models.Plans {
		details = append(details, plan)
	}

	// Retorna os detalhes em JSON
	utils.WriteJSON(w, map[string]interface{}{
		"plans": details,
	})
}
