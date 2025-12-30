//backend/routes/status.go

package routes

import (
	"net/http"
	"strings"

	"virtuscloud/backend/services"
)

// Handler para verificar o status de uma aplicação
func StatusHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Método não permitido")
		return
	}

	id := strings.TrimSpace(r.URL.Query().Get("id"))
	if id == "" {
		respondError(w, http.StatusBadRequest, "ID da aplicação é obrigatório")
		return
	}

	app := services.AppStore[id]
	if app == nil {
		respondError(w, http.StatusNotFound, "Aplicação não encontrada")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"status": app,
	})
}
