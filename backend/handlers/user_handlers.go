//backend/handlers/user_handlers.go

package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"virtuscloud/backend/limits"
	"virtuscloud/backend/middleware"
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

// 📦 Handler para atribuir um plano a um usuário
func AssignPlanHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string          `json:"username"` // 🔄 atualizado de email para username
		Plan     models.PlanType `json:"plan"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Erro ao decodificar requisição JSON", http.StatusBadRequest)
		return
	}

	user := store.UserStore[req.Username]
	if user == nil {
		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	planDetails, ok := models.Plans[req.Plan]
	if !ok {
		http.Error(w, "Plano inválido", http.StatusBadRequest)
		return
	}

	user.Plan = req.Plan

	log.Printf(
		"Plano atribuído: %s → Usuário: %s | Memória: %dMB | Projetos: %d-%d",
		planDetails.Name,
		req.Username,
		planDetails.MemoryMB, // ✅ corrigido para %d
		planDetails.MinProjects,
		planDetails.MaxProjects,
	)

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Plano '%s' atribuído ao usuário '%s' com sucesso.", req.Plan, req.Username)
}

// GET /api/user/status
func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	user := store.UserStore[username]
	if user == nil {
		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	plan := models.Plans[user.Plan]

	appCount := limits.CountUserContainers(user.Username)
	ramUsed := limits.SumUserRAM(user.Username) // float32
	cpuUsed := limits.SumUserCPU(user.Username) // float32

	perAppLimit := plan.PerAppMB // ✅ agora vem do plano
	totalMB := plan.MemoryMB

	// 🔧 Corrige tipos: converte totalMB para float32
	ramAvailable := float32(totalMB) - ramUsed
	if ramAvailable < 0 {
		ramAvailable = 0
	}

	canDeploy := appCount < plan.MaxProjects

	utils.WriteJSON(w, map[string]interface{}{
		"username":       user.Username,
		"plan":           plan.Name,
		"canDeploy":      canDeploy,
		"ramUsedMB":      ramUsed,
		"ramAvailableMB": ramAvailable,
		"cpuUsedPct":     cpuUsed,
		"memoryMB":       perAppLimit, // ✅ limite por aplicação (256 MB)
		"totalMB":        totalMB,     // limite global do plano
		"maxProjects":    plan.MaxProjects,
		"currentApps":    appCount,
	})
}

// GET /api/user/status
//func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	plan := models.Plans[user.Plan]
//
//	appCount := limits.CountUserContainers(user.Username)
//	ramUsed := limits.SumUserRAM(user.Username) // float32
//	cpuUsed := limits.SumUserCPU(user.Username) // float32
//
//	const perAppLimit = 100
//	totalMB := plan.MemoryMB
//
//	// 🔧 Corrige tipos: converte totalMB para float32
//	ramAvailable := float32(totalMB) - ramUsed
//	if ramAvailable < 0 {
//		ramAvailable = 0
//	}
//
//	canDeploy := appCount < plan.MaxProjects
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"username":       user.Username,
//		"plan":           plan.Name,
//		"canDeploy":      canDeploy,
//		"ramUsedMB":      ramUsed,
//		"ramAvailableMB": ramAvailable,
//		"cpuUsedPct":     cpuUsed,
//		"memoryMB":       perAppLimit,
//		"totalMB":        totalMB,
//		"maxProjects":    plan.MaxProjects,
//		"currentApps":    appCount,
//	})
//}

// GET /api/user/status
//func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	// 🔐 Recupera usuário logado via contexto
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	// 📦 Plano atual do usuário
//	plan := models.Plans[user.Plan]
//
//	// 📊 Conta containers e uso de recursos
//	appCount := limits.CountUserContainers(user.Username)
//	ramUsed := limits.SumUserRAM(user.Username) // uso real de RAM em MB
//	cpuUsed := limits.SumUserCPU(user.Username) // uso real de CPU em %
//
//	// ✅ Cada aplicação reserva 100 MB
//	const perAppLimit = 100
//
//	// ✅ Limite global vem do plano
//	totalMB := plan.MemoryMB
//
//	// 🔧 Calcula RAM disponível (não deixa negativo)
//	ramAvailable := float32(totalMB) - ramUsed
//	if ramAvailable < 0 {
//		ramAvailable = 0
//	}
//
//	// 🚀 Pode criar nova app se não exceder maxProjects
//	canDeploy := appCount < plan.MaxProjects
//
//	// 📤 Retorna status em JSON
//	utils.WriteJSON(w, map[string]interface{}{
//		"username":       user.Username,
//		"plan":           plan.Name,
//		"canDeploy":      canDeploy,
//		"ramUsedMB":      ramUsed,      // uso real somado
//		"ramAvailableMB": ramAvailable, // memória disponível
//		"cpuUsedPct":     cpuUsed,      // uso agregado de CPU (%)
//		"memoryMB":       perAppLimit,  // limite por aplicação (100 MB)
//		"totalMB":        totalMB,      // limite global do plano
//		"maxProjects":    plan.MaxProjects,
//		"currentApps":    appCount,
//	})
//}

// GET /api/user/status
//func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	plan := models.Plans[user.Plan]
//
//	// Conta containers e uso de RAM
//	appCount := limits.CountUserContainers(user.Username)
//	ramUsed := limits.SumUserRAM(user.Username)
//
//	// ✅ Cada aplicação reserva 100 MB
//	const perAppLimit = 100
//
//	// ✅ Limite global vem do plano
//	totalMB := plan.MemoryMB
//
//	// Pode criar nova app se não exceder maxProjects
//	canDeploy := appCount < plan.MaxProjects
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"username":    user.Username,
//		"plan":        plan.Name,
//		"canDeploy":   canDeploy,
//		"ramUsedMB":   ramUsed,     // uso real somado
//		"memoryMB":    perAppLimit, // limite por aplicação (100 MB)
//		"totalMB":     totalMB,     // limite global do plano
//		"maxProjects": plan.MaxProjects,
//		"currentApps": appCount,
//	})
//}

// GET /api/user/status
//func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	plan := models.Plans[user.Plan]
//
//	// Conta containers e uso de RAM
//	appCount := limits.CountUserContainers(user.Username)
//	ramUsed := limits.SumUserRAM(user.Username)
//
//	// ✅ Cada aplicação reserva 100 MB
//	const perAppLimit = 100
//	totalMB := perAppLimit * appCount
//	if totalMB == 0 {
//		// se não houver apps, mostra pelo menos 100 MB
//		totalMB = perAppLimit
//	}
//
//	// Pode criar nova app se não exceder maxProjects
//	canDeploy := appCount < plan.MaxProjects
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"username":    user.Username,
//		"plan":        plan.Name,
//		"canDeploy":   canDeploy,
//		"ramUsedMB":   ramUsed,
//		"memoryMB":    perAppLimit, // limite por aplicação
//		"totalMB":     totalMB,     // limite total reservado
//		"maxProjects": plan.MaxProjects,
//		"currentApps": appCount,
//	})
//}

// GET /api/user/status
//func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	plan := models.Plans[user.Plan]
//
//	// ✅ Usa username e plano corretamente
//	appCount := limits.CountUserContainers(user.Username)
//	//appCount := limits.CountUserApps(user.Username, string(user.Plan))
//	ramUsed := limits.SumUserRAM(user.Username)
//
//	canDeploy := float32(plan.MemoryMB)-ramUsed >= 256 && appCount < plan.MaxProjects
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"username":    user.Username,
//		"plan":        plan.Name,
//		"canDeploy":   canDeploy,
//		"ramUsedMB":   ramUsed,
//		"memoryMB":    plan.MemoryMB,
//		"maxProjects": plan.MaxProjects,
//		"currentApps": appCount,
//	})
//}

//backend/handlers/user_handlers.go

//package handlers
//
//import (
//	"encoding/json"
//	"fmt"
//	"log"
//	"net/http"
//
//	"virtuscloud/backend/limits"
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//// 📦 Handler para atribuir um plano a um usuário
//func AssignPlanHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Username string          `json:"username"` // 🔄 atualizado de email para username
//		Plan     models.PlanType `json:"plan"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		http.Error(w, "Erro ao decodificar requisição JSON", http.StatusBadRequest)
//		return
//	}
//
//	user := store.UserStore[req.Username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	planDetails, ok := models.Plans[req.Plan]
//	if !ok {
//		http.Error(w, "Plano inválido", http.StatusBadRequest)
//		return
//	}
//
//	user.Plan = req.Plan
//
//	log.Printf(
//		"Plano atribuído: %s → Usuário: %s | Memória: %dMB | Projetos: %d-%d",
//		planDetails.Name,
//		req.Username,
//		planDetails.MemoryMB, // ✅ corrigido para %d
//		planDetails.MinProjects,
//		planDetails.MaxProjects,
//	)
//
//	w.WriteHeader(http.StatusOK)
//	fmt.Fprintf(w, "Plano '%s' atribuído ao usuário '%s' com sucesso.", req.Plan, req.Username)
//}
//
//// GET /api/user/status
//func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	plan := models.Plans[user.Plan]
//
//	// ✅ Usa username e plano corretamente
//	appCount := limits.CountUserContainers(user.Username)
//	//appCount := limits.CountUserApps(user.Username, string(user.Plan))
//	ramUsed := limits.SumUserRAM(user.Username)
//
//	canDeploy := float32(plan.MemoryMB)-ramUsed >= 256 && appCount < plan.MaxProjects
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"username":    user.Username,
//		"plan":        plan.Name,
//		"canDeploy":   canDeploy,
//		"ramUsedMB":   ramUsed,
//		"memoryMB":    plan.MemoryMB,
//		"maxProjects": plan.MaxProjects,
//		"currentApps": appCount,
//	})
//}

// GET /api/user/status
//func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	plan := models.Plans[user.Plan]
//	appCount := limits.CountUserApps(strconv.Itoa(user.ID))
//	ramUsed := limits.SumUserRAM(strconv.Itoa(user.ID))
//
//	canDeploy := float32(plan.MemoryMB)-ramUsed >= 256 && appCount < plan.MaxProjects
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"username":    user.Username,
//		"plan":        plan.Name,
//		"canDeploy":   canDeploy,
//		"ramUsedMB":   ramUsed,
//		"memoryMB":    plan.MemoryMB,
//		"maxProjects": plan.MaxProjects,
//		"currentApps": appCount,
//	})
//}

// 📋 Handler para obter detalhes completos de um usuário
func GetUserDetailsHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username") // 🔄 atualizado de email para username
	if username == "" {
		http.Error(w, "Parâmetro 'username' é obrigatório", http.StatusBadRequest)
		return
	}

	user := store.UserStore[username]
	if user == nil {
		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	planDetails, ok := models.Plans[user.Plan]
	if !ok {
		http.Error(w, "Plano do usuário é inválido", http.StatusInternalServerError)
		return
	}

	type Response struct {
		User        *models.User `json:"user"`
		PlanDetails models.Plan  `json:"plan_details"`
	}

	resp := Response{
		User:        user,
		PlanDetails: planDetails,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// 📊 Handler para obter apenas o plano do usuário autenticado
func GetUserPlanHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r) // ✅ usa contexto preenchido pelo AuthMiddleware

	user := store.UserStore[username]
	if user == nil {
		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	plan := string(user.Plan)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"plan": plan,
	})
}

//package handlers
//
//import (
//	"encoding/json"
//	"fmt"
//	"log"
//	"net/http"
//
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 📦 Handler para atribuir um plano a um usuário
//func AssignPlanHandler(w http.ResponseWriter, r *http.Request) {
//	var req struct {
//		Username string          `json:"username"` // 🔄 atualizado de email para username
//		Plan     models.PlanType `json:"plan"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		http.Error(w, "Erro ao decodificar requisição JSON", http.StatusBadRequest)
//		return
//	}
//
//	user := store.UserStore[req.Username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	planDetails, ok := models.Plans[req.Plan]
//	if !ok {
//		http.Error(w, "Plano inválido", http.StatusBadRequest)
//		return
//	}
//
//	user.Plan = req.Plan
//
//	log.Printf(
//		"Plano atribuído: %s → Usuário: %s | Memória: %.1fGB | Projetos: %d-%d",
//		planDetails.Name,
//		req.Username,
//		planDetails.MemoryMB,
//		planDetails.MinProjects,
//		planDetails.MaxProjects,
//	)
//
//	w.WriteHeader(http.StatusOK)
//	fmt.Fprintf(w, "Plano '%s' atribuído ao usuário '%s' com sucesso.", req.Plan, req.Username)
//}
//
//// 📋 Handler para obter detalhes completos de um usuário
//func GetUserDetailsHandler(w http.ResponseWriter, r *http.Request) {
//	username := r.URL.Query().Get("username") // 🔄 atualizado de email para username
//	if username == "" {
//		http.Error(w, "Parâmetro 'username' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	planDetails, ok := models.Plans[user.Plan]
//	if !ok {
//		http.Error(w, "Plano do usuário é inválido", http.StatusInternalServerError)
//		return
//	}
//
//	type Response struct {
//		User        *models.User `json:"user"`
//		PlanDetails models.Plan  `json:"plan_details"`
//	}
//
//	resp := Response{
//		User:        user,
//		PlanDetails: planDetails,
//	}
//
//	w.Header().Set("Content-Type", "application/json")
//	json.NewEncoder(w).Encode(resp)
//}
//
//// 📊 Handler para obter apenas o plano do usuário autenticado
//func GetUserPlanHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r) // ✅ usa contexto preenchido pelo AuthMiddleware
//
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	plan := string(user.Plan)
//
//	w.Header().Set("Content-Type", "application/json")
//	json.NewEncoder(w).Encode(map[string]string{
//		"plan": plan,
//	})
//}
