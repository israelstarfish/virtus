//backend/handlers/debug_handlers.go

package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"virtuscloud/backend/middleware"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

// 🧪 Retorna todos os usuários carregados no UserStore (debug, exclusivo para admin)
func DebugUsersHandler(w http.ResponseWriter, r *http.Request) {
	username, role := middleware.GetUserFromContext(r)
	log.Printf("Admin %s acessou DebugUsersHandler", username)
	if role != "admin" {
		http.Error(w, "Acesso negado: apenas administradores podem visualizar todos os usuários", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(store.UserStore)
}

// 🧪 Retorna os dados do contexto do usuário logado (debug individual)
func DebugUserContextHandler(w http.ResponseWriter, r *http.Request) {
	username, role := middleware.GetUserFromContext(r)
	plan := middleware.GetPlanFromContext(r)
	email, _ := middleware.GetEmailFromContext(r.Context())

	utils.WriteJSON(w, map[string]string{
		"username": username,
		"role":     role,
		"plan":     plan,
		"email":    email,
	})
}

//package handlers
//
//import (
//	"encoding/json"
//	"net/http"
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//// 🧪 Retorna todos os usuários carregados no UserStore (debug)
//func DebugUsersHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Content-Type", "application/json")
//	json.NewEncoder(w).Encode(store.UserStore)
//}
//func DebugUserContextHandler(w http.ResponseWriter, r *http.Request) {
//	username, role := middleware.GetUserFromContext(r)
//	plan := middleware.GetPlanFromContext(r)
//	email, _ := middleware.GetEmailFromContext(r.Context())
//
//	utils.WriteJSON(w, map[string]string{
//		"username": username,
//		"role":     role,
//		"plan":     plan,
//		"email":    email,
//	})
//}
