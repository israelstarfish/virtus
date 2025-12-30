//backend/routes/users_create.go

package routes

//import (
//	"encoding/json"
//	"net/http"
//	"strings"
//
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//)
//
//// Estrutura da requisição
//type CreateUserRequest struct {
//	Email string `json:"email"`
//}
//
//// Gera username simples a partir do email
//func generateUsername(email string) string {
//	at := strings.LastIndex(email, "@")
//	if at == -1 {
//		return "user"
//	}
//	return email[:at]
//}
//
//// Handler para criação ou recuperação de usuário
//func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		respondError(w, http.StatusMethodNotAllowed, "Método não permitido")
//		return
//	}
//
//	var req CreateUserRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" {
//		respondError(w, http.StatusBadRequest, "Email inválido")
//		return
//	}
//
//	username := generateUsername(req.Email)
//	user, err := services.CreateUser(username, req.Email, models.PlanBasic)
//	if err != nil {
//		respondError(w, http.StatusConflict, err.Error())
//		return
//	}
//
//	respondSuccess(w, map[string]interface{}{
//		"message": "Usuário criado com sucesso",
//		"user":    user,
//	})
//}
