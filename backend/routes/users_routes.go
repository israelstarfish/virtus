//backend/routes/users_routes.go

package routes

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"virtuscloud/backend/handlers"
	auth "virtuscloud/backend/middleware" // ✅ Corrigido: import do AuthMiddleware
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

// 🧩 Agrupador de rotas relacionadas ao usuário
func UserRoutes() http.Handler {
	r := chi.NewRouter()

	// 🛡️ Middlewares úteis para logging e recuperação de panics
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// 🔐 Grupo protegido por autenticação JWT
	r.Group(func(r chi.Router) {
		r.Use(auth.AuthMiddleware) // ✅ Corrigido: uso do middleware correto

		// 🔧 Rotas relacionadas a usuários autenticados
		r.Post("/assign-plan", handlers.AssignPlanHandler) // 📝 Atribui plano ao usuário
		r.Get("/plan", handlers.GetUserPlanHandler)        // ✅ Retorna plano atual do usuário
		//r.Get("/api/user/plan-migrations", handlers.GetUserPlanMigrationsHandler)
		// 📌 Futuras rotas protegidas que você pode adicionar:
		// r.Get("/api/user/details", handlers.GetUserDetailsHandler)
		// r.Get("/api/user/usage", handlers.GetUserUsageHandler)
	})

	return r
}

// 🔍 Lista todos os usuários salvos no sistema (admin only)
func ListUsersHandler(w http.ResponseWriter, r *http.Request) {
	users := []*models.User{}

	// 🧠 Converte o map para slice
	for _, user := range store.UserStore {
		users = append(users, user)
	}

	// 📤 Retorna como JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

//backend/routes/users_routes.go

//ackage routes
//
//mport (
//	"encoding/json"
//	"net/http"
//
//	"github.com/go-chi/chi/v5"
//	"github.com/go-chi/chi/v5/middleware"
//
//	"virtuscloud/backend/handlers"
//	auth "virtuscloud/backend/middleware" // ✅ Corrigido: import do AuthMiddleware
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//
//
/// 🧩 Agrupador de rotas relacionadas ao usuário
//unc UserRoutes() http.Handler {
//	r := chi.NewRouter()
//
//	// 🛡️ Middlewares úteis para logging e recuperação de panics
//	r.Use(middleware.Logger)
//	r.Use(middleware.Recoverer)
//
//	// 🔐 Grupo protegido por autenticação JWT
//	r.Group(func(r chi.Router) {
//		r.Use(auth.AuthMiddleware) // ✅ Corrigido: uso do middleware correto
//
//		// 🔧 Rotas relacionadas a usuários autenticados
//		r.Post("/api/user/assign-plan", handlers.AssignPlanHandler) // 📝 Atribui plano ao usuário
//		r.Get("/api/user/plan", handlers.GetUserPlanHandler)        // ✅ Retorna plano atual do usuário
//		//r.Get("/api/user/plan-migrations", handlers.GetUserPlanMigrationsHandler)
//		// 📌 Futuras rotas protegidas que você pode adicionar:
//		// r.Get("/api/user/details", handlers.GetUserDetailsHandler)
//		// r.Get("/api/user/usage", handlers.GetUserUsageHandler)
//	})
//
//	return r
//
//
/// 🔍 Lista todos os usuários salvos no sistema (admin only)
//unc ListUsersHandler(w http.ResponseWriter, r *http.Request) {
//	users := []*models.User{}
//
//	// 🧠 Converte o map para slice
//	for _, user := range store.UserStore {
//		users = append(users, user)
//	}
//
//	// 📤 Retorna como JSON
//	w.Header().Set("Content-Type", "application/json")
//	json.NewEncoder(w).Encode(users)
//
