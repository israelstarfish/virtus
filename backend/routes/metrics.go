//backend/routes/metrics.go

package routes

import (
	"log"
	"net/http"
	"time"
	"virtuscloud/backend/services"
	"virtuscloud/backend/utils"
)

// Inicia cache ao carregar o roteador (chamar em main.go)
func InitMetricsRoutes() {
	services.StartMetricsCache()
}

// Rota GET /metrics
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	log.Println("▶ Requisição recebida em /metrics")

	// Filtro opcional por plano
	planFilter := r.URL.Query().Get("plan")

	// Métricas reais dos containers agrupadas por plano
	plans := services.GetCachedMetrics()

	// Se houver filtro por plano, aplicamos
	if planFilter != "" {
		filtered := []services.PlanMetrics{}
		for _, pm := range plans {
			if pm.PlanName == planFilter {
				filtered = append(filtered, pm)
			}
		}
		plans = filtered
	}

	// Eventos técnicos mockados
	events := services.GetMockedEvents()

	// Retorno JSON
	utils.WriteJSON(w, map[string]interface{}{
		"plans":      plans,
		"events":     events,
		"updated_at": time.Now().Format(time.RFC3339),
	})
}
