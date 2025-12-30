//backend/routes/profile.go

package routes

import (
	"encoding/json"
	"net/http"
	"virtuscloud/backend/middleware"
	"virtuscloud/backend/services"
	"virtuscloud/backend/utils"
)

type ProfileUpdate struct {
	Name string `json:"name"`
}

func UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := middleware.ExtractEmailFromToken(r)
	if !ok {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	var req ProfileUpdate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
		http.Error(w, "Nome inválido", http.StatusBadRequest)
		return
	}

	user, err := services.UpdateUserNameByEmail(email, req.Name)
	if err != nil {
		http.Error(w, "Erro ao atualizar perfil: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, map[string]interface{}{
		"message": "Nome atualizado com sucesso",
		"user":    user,
	})
}
