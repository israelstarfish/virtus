//backend/routes/admin.go

package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"virtuscloud/backend/middleware"
	"virtuscloud/backend/models"
	"virtuscloud/backend/services"
	"virtuscloud/backend/utils"
)

// 📊 Retorna métricas de todos os usuários (admin only)
func AdminUsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	if !middleware.HasMinimumAccess(r, "admin") {
		http.Error(w, "acesso não autorizado", http.StatusForbidden)
		return
	}

	metrics := services.GetAllUserMetrics()
	utils.WriteJSON(w, map[string]interface{}{
		"users": metrics,
	})
}

// 📦 Exporta apps de um usuário específico (dev only)
func AdminExportAppsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	if !middleware.HasMinimumAccess(r, "dev") {
		http.Error(w, "acesso não autorizado", http.StatusForbidden)
		return
	}

	username := r.URL.Query().Get("username") // ✅ substituído
	nameFilter := r.URL.Query().Get("name")

	if username == "" {
		http.Error(w, "parâmetro 'username' é obrigatório", http.StatusBadRequest)
		return
	}

	apps := services.ListAppsByUsername(username) // ✅ substituído

	if nameFilter != "" {
		nameFilter = strings.ToLower(nameFilter)
		var filtered []*models.App
		for _, app := range apps {
			if strings.Contains(strings.ToLower(app.ContainerName), nameFilter) {
				filtered = append(filtered, app)
			}
		}
		apps = filtered
	}

	utils.WriteJSON(w, map[string]interface{}{
		"apps": apps,
	})
}

// 🔄 Retorna histórico de migrações de plano (admin only)
func AdminPlanMigrationsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	if !middleware.HasMinimumAccess(r, "admin") {
		http.Error(w, "acesso não autorizado", http.StatusForbidden)
		return
	}

	utils.WriteJSON(w, map[string]interface{}{
		"migrations": services.GetMigrationLogs(),
	})
}

// 🛡️ Rota para promover usuários (staff ou superior)
func AdminPromoteUserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	if !middleware.HasMinimumAccess(r, "staff") {
		http.Error(w, "acesso não autorizado", http.StatusForbidden)
		return
	}

	var req struct {
		Email string `json:"email"`
		Role  string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Role == "" {
		http.Error(w, "email e cargo são obrigatórios", http.StatusBadRequest)
		return
	}

	if _, ok := middleware.RoleHierarchy[req.Role]; !ok {
		http.Error(w, "cargo inválido", http.StatusBadRequest)
		return
	}

	err := services.SetUserAccessAndPlan(req.Email, req.Role)
	if err != nil {
		http.Error(w, "erro ao promover usuário: "+err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Usuário %s promovido para %s", req.Email, req.Role),
	})
}

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"net/http"
//	"strings"
//
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//)
//
//// 📊 Retorna métricas de todos os usuários (admin only)
//func AdminUsersHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	if !middleware.HasMinimumAccess(r, "admin") {
//		http.Error(w, "acesso não autorizado", http.StatusForbidden)
//		return
//	}
//
//	metrics := services.GetAllUserMetrics()
//	utils.WriteJSON(w, map[string]interface{}{
//		"users": metrics,
//	})
//}
//
//// 📦 Exporta apps de um usuário específico (dev only)
//func AdminExportAppsHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	if !middleware.HasMinimumAccess(r, "dev") {
//		http.Error(w, "acesso não autorizado", http.StatusForbidden)
//		return
//	}
//
//	username := r.URL.Query().Get("username") // ✅ substituído
//	nameFilter := r.URL.Query().Get("name")
//
//	if username == "" {
//		http.Error(w, "parâmetro 'username' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	apps := services.ListAppsByUsername(username) // ✅ substituído
//
//	if nameFilter != "" {
//		nameFilter = strings.ToLower(nameFilter)
//		var filtered []*models.App
//		for _, app := range apps {
//			if strings.Contains(strings.ToLower(app.Name), nameFilter) {
//				filtered = append(filtered, app)
//			}
//		}
//		apps = filtered
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"apps": apps,
//	})
//}
//
//// 🔄 Retorna histórico de migrações de plano (admin only)
//func AdminPlanMigrationsHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	if !middleware.HasMinimumAccess(r, "admin") {
//		http.Error(w, "acesso não autorizado", http.StatusForbidden)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"migrations": services.GetMigrationLogs(),
//	})
//}
//
//// 🛡️ Rota para promover usuários (staff ou superior)
//func AdminPromoteUserHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	if !middleware.HasMinimumAccess(r, "staff") {
//		http.Error(w, "acesso não autorizado", http.StatusForbidden)
//		return
//	}
//
//	var req struct {
//		Email string `json:"email"`
//		Role  string `json:"role"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	if req.Email == "" || req.Role == "" {
//		http.Error(w, "email e cargo são obrigatórios", http.StatusBadRequest)
//		return
//	}
//
//	if _, ok := middleware.RoleHierarchy[req.Role]; !ok {
//		http.Error(w, "cargo inválido", http.StatusBadRequest)
//		return
//	}
//
//	err := services.SetUserAccessAndPlan(req.Email, req.Role)
//	if err != nil {
//		http.Error(w, "erro ao promover usuário: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"success": true,
//		"message": fmt.Sprintf("Usuário %s promovido para %s", req.Email, req.Role),
//	})
//}

// 📦 Exporta apps de um usuário específico (dev only)
//func AdminExportAppsHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	if !middleware.HasMinimumAccess(r, "dev") {
//		http.Error(w, "acesso não autorizado", http.StatusForbidden)
//		return
//	}
//
//	userID := r.URL.Query().Get("userId")
//	nameFilter := r.URL.Query().Get("name")
//
//	if userID == "" {
//		http.Error(w, "parâmetro 'userId' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	apps := services.ListAppsByUserID(userID)
//
//	if nameFilter != "" {
//		nameFilter = strings.ToLower(nameFilter)
//		var filtered []*models.App
//		for _, app := range apps {
//			if strings.Contains(strings.ToLower(app.Name), nameFilter) {
//				filtered = append(filtered, app)
//			}
//		}
//		apps = filtered
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"apps": apps,
//	})
//}
