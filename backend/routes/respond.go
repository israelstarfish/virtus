//backend/routes/respond.go

package routes

import (
	"encoding/json"
	"net/http"
)

func respond(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respond(w, status, map[string]string{"error": message})
}

func respondSuccess(w http.ResponseWriter, payload interface{}) {
	respond(w, http.StatusOK, payload)
}
