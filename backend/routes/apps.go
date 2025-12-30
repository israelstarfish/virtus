//backend/routes/apps.go

package routes

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"virtuscloud/backend/limits"
	"virtuscloud/backend/middleware"
	"virtuscloud/backend/models"
	"virtuscloud/backend/services"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

// 🚀 Inicia uma aplicação
func StartAppHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	container := r.URL.Query().Get("id")
	log.Println("📡 Requisição recebida:", r.Method, r.URL.Path, "Query:", r.URL.RawQuery)
	//log.Println("🔧 Ação recebida:", r.URL.Path, "para container:", container)

	app := services.GetAppByContainerName(container)
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
		return
	}

	if err := services.StartApp(app.ID, username); err != nil {
		http.Error(w, fmt.Sprintf("Erro ao iniciar app: %v", err), http.StatusInternalServerError)
		return
	}
	utils.WriteJSON(w, map[string]string{"message": "Aplicação iniciada com sucesso!"})
}

// 🛑 Para uma aplicação
func StopAppHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("📡 StopAppHandler foi chamado")

	username, _ := middleware.GetUserFromContext(r)
	container := r.URL.Query().Get("id")
	log.Println("🔍 Aplicação recebido:", container)

	app := services.GetAppByContainerName(container)
	if app == nil || app.Username != username {
		log.Println("❌ App não encontrado ou pertence a outro usuário")
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
		return
	}

	log.Println("✅ App localizado:", app.ID, "Aplicação:", app.ContainerName)

	if err := services.StopApp(app.ID, username); err != nil {
		log.Println("❌ Erro ao parar app:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, map[string]string{"message": "Aplicação parada com sucesso"})
}

// 🔄 Reinicia uma aplicação
func RestartAppHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	container := r.URL.Query().Get("id")
	log.Println("📡 Requisição recebida:", r.Method, r.URL.Path, "Query:", r.URL.RawQuery)
	//log.Println("🔧 Ação recebida:", r.URL.Path, "para container:", container)

	app := services.GetAppByContainerName(container)
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
		return
	}

	if err := services.RestartApp(app.ID, username); err != nil {
		http.Error(w, fmt.Sprintf("Erro ao reiniciar app: %v", err), http.StatusInternalServerError)
		return
	}
	utils.WriteJSON(w, map[string]string{"message": "Aplicação reiniciada com sucesso!"})
}
func CleanAppID(rawID string) string {
	parts := strings.Split(rawID, "-")
	if len(parts) > 1 {
		return parts[len(parts)-1] // pega só o ID final
	}
	return rawID
}

// 🧱 Reconstrói uma aplicação
func RebuildAppHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	rawID := r.URL.Query().Get("id")
	log.Println("📡 RebuildAppHandler foi chamado com id =", rawID)

	cleanID := services.CleanAppID(rawID)
	app := store.AppStore[cleanID]
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
		return
	}

	if err := services.RebuildApp(app.ID, username); err != nil {
		http.Error(w, fmt.Sprintf("Erro ao rebuildar app: %v", err), http.StatusInternalServerError)
		return
	}
	utils.WriteJSON(w, map[string]string{"message": "Aplicação rebuildada com sucesso!"})
}

//func RebuildAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	container := r.URL.Query().Get("id")
//	log.Println("📡 RebuildAppHandler foi chamado com id =", container)
//
//	app := services.GetAppByContainerName(container)
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.RebuildApp(app.ID, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao rebuildar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação rebuildada com sucesso!"})
//}

// 💾 Gera backup da aplicação
func BackupAppHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	container := r.URL.Query().Get("id")

	app := services.GetAppByContainerName(container)
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
		return
	}

	if err := services.BackupAppFromContainer(app.ID, username); err != nil {
		//if err := services.BackupApp(app.ID, username); err != nil {
		http.Error(w, fmt.Sprintf("Erro ao gerar backup: %v", err), http.StatusInternalServerError)
		return
	}
	utils.WriteJSON(w, map[string]string{"message": "Backup gerado com sucesso!"})
}

// ❌ Remove uma aplicação
func DeleteAppHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	container := r.URL.Query().Get("id")
	log.Println("🔧 Ação recebida:", r.URL.Path, "para aplicação:", container)

	app := services.GetAppByContainerName(container)
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
		return
	}

	if err := services.DeleteApp(app.ID, username); err != nil {
		http.Error(w, fmt.Sprintf("Erro ao excluir app: %v", err), http.StatusInternalServerError)
		return
	}
	utils.WriteJSON(w, map[string]string{"message": "Aplicação excluída com sucesso!"})
}

// ✏️ Atualiza o nome da aplicação
func UpdateAppNameHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		ID      string `json:"id"`
		NewName string `json:"newName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	app := store.AppStore[payload.ID]
	if app == nil {
		http.Error(w, "Aplicação não encontrada", http.StatusNotFound)
		return
	}

	app.Name = payload.NewName
	app.Logs = append(app.Logs, "Nome da aplicação alterado para "+payload.NewName)

	utils.WriteJSON(w, map[string]string{"message": "Nome atualizado com sucesso!"})
}

// 📋 Lista todas as aplicações do usuário
func ListUserAppsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	username, _ := middleware.GetUserFromContext(r)

	apps, err := services.ListUserContainers(username)
	if err != nil {
		http.Error(w, "Erro ao listar containers do usuário", http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, map[string]interface{}{"apps": apps})
}

// 📊 Métricas das aplicações do usuário
func AppMetricsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	username, _ := middleware.GetUserFromContext(r)
	var metrics []map[string]interface{}

	for _, app := range store.AppStore {
		if app.Username != username {
			continue
		}

		uptime := utils.CalculateUptime(app.StartTime)

		metrics = append(metrics, map[string]interface{}{
			"id":     app.ID,
			"name":   app.ContainerName,
			"uptime": uptime,
			"ram":    fmt.Sprintf("%.2f MB", app.RAMUsage),
			"status": app.Status,
			"alert":  app.Alert,
		})
	}

	utils.WriteJSON(w, map[string]interface{}{"metrics": metrics})
}

// 🧠 Visão consolidada da aplicação
func AppOverviewHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	container := r.URL.Query().Get("id")

	app := services.GetAppByContainerName(container)
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
		return
	}

	uptime := utils.CalculateUptime(app.StartTime)
	overview := map[string]interface{}{
		"id":       app.ID,
		"name":     app.ContainerName,
		"uptime":   uptime,
		"ramUsage": fmt.Sprintf("%.2f MB", app.RAMUsage),
		"status":   app.Status,
		"logs":     app.Logs,
		"alert":    app.Alert,
	}

	utils.WriteJSON(w, overview)
}

// 📜 Histórico por aplicação
func AppHistoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	username, _ := middleware.GetUserFromContext(r)
	appID := r.URL.Query().Get("id")

	app := store.AppStore[appID]
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
		return
	}

	utils.WriteJSON(w, map[string]interface{}{"logs": app.Logs})
}

// 📦 Exporta metadados da aplicação
func ExportAppMetadataHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	username, _ := middleware.GetUserFromContext(r)
	container := r.URL.Query().Get("id")

	app := services.GetAppByContainerName(container)
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
		return
	}

	data := map[string]interface{}{
		"id":        app.ID,
		"name":      app.ContainerName,
		"status":    app.Status,
		"startTime": app.StartTime,
		"ramUsage":  fmt.Sprintf("%.2f MB", app.RAMUsage),
		"logs":      app.Logs,
		"alert":     app.Alert,
		"uptime":    utils.CalculateUptime(app.StartTime),
	}

	utils.WriteJSON(w, data)
}

// 🧮 Classifica consumo da aplicação
func ClassifyAppUsageHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	appID := r.URL.Query().Get("id")

	app := store.AppStore[appID]
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
		return
	}

	var usage string
	switch {
	case app.RAMUsage < 0.5:
		usage = "Leve"
	case app.RAMUsage < 1.5:
		usage = "Moderado"
	default:
		usage = "Crítico"
	}

	utils.WriteJSON(w, map[string]string{
		"id":     app.ID,
		"usage":  usage,
		"status": string(app.Status),
	})
}

// 📊 Retorna status do usuário logado
func UserStatusHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r) // ✅ substituído

	user := store.UserStore[username] // ✅ substituído
	if user == nil {
		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	response := map[string]interface{}{
		"plan":      user.Plan,
		"canDeploy": user.CanDeploy,
	}

	utils.WriteJSON(w, response)
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

	// ✅ Usa username e plano corretamente
	appCount := limits.CountUserContainers(user.Username)
	//appCount := limits.CountUserApps(user.Username, string(user.Plan))
	ramUsed := limits.SumUserRAM(user.Username)

	canDeploy := float32(plan.MemoryMB)-ramUsed >= 256 && appCount < plan.MaxProjects

	utils.WriteJSON(w, map[string]interface{}{
		"username":    user.Username,
		"plan":        plan.Name,
		"canDeploy":   canDeploy,
		"ramUsedMB":   ramUsed,
		"memoryMB":    plan.MemoryMB,
		"maxProjects": plan.MaxProjects,
		"currentApps": appCount,
	})
}

// 📥 Retorna dados completos da aplicação
func GetAppInfoHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)
	if username == "" {
		http.Error(w, "Usuário não autenticado", http.StatusUnauthorized)
		return
	}

	id := r.URL.Query().Get("id")
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
		return
	}

	utils.WriteJSON(w, app)
}

// 📊 Lista aplicações por status
func ListAppsByStatusHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)

	// 🧠 Apps registrados
	var active, stopped, backups []*models.App
	for _, app := range store.AppStore {
		if app.Username != username {
			continue
		}
		switch app.Status {
		case models.StatusRunning:
			active = append(active, app)
		case models.StatusStopped:
			stopped = append(stopped, app)
		default:
			backups = append(backups, app)
		}
	}

	// 🐳 Apps detectados via Docker (não registrados)
	detected, _ := services.ListAllContainersWithStatusFast()
	for _, app := range detected {
		if app.Username != username {
			continue
		}
		if _, exists := store.AppStore[app.ID]; exists {
			continue // já listado
		}
		switch app.Status {
		case models.StatusRunning:
			active = append(active, app)
		case models.StatusStopped:
			stopped = append(stopped, app)
		default:
			backups = append(backups, app)
		}
	}

	utils.WriteJSON(w, map[string]interface{}{
		"active":  active,
		"stopped": stopped,
		"backups": backups,
	})
}

//func StopAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	container := r.URL.Query().Get("id")
//
//	log.Println("📡 StopAppHandler recebido")
//	log.Println("🔍 Container recebido:", container)
//	log.Println("🔍 Usuário autenticado:", username)
//
//	app := services.GetAppByContainerName(container)
//	if app == nil {
//		log.Println("❌ App não encontrado via GetAppByContainerName")
//		http.Error(w, "Aplicação não encontrada", http.StatusForbidden)
//		return
//	}
//	if app.Username != username {
//		log.Println("❌ App pertence a outro usuário:", app.Username)
//		http.Error(w, "Aplicação não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	log.Println("✅ App localizado:", app.ID, "Container:", app.ContainerName)
//
//	if err := services.StopApp(app.ID, username); err != nil {
//		log.Println("❌ Erro ao parar app:", err)
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação parada com sucesso"})
//}

//func StopAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	container := r.URL.Query().Get("id")
//	//log.Println("📡 Requisição recebida:", r.Method, r.URL.Path, "Query:", r.URL.RawQuery)
//	//log.Println("🔧 Ação recebida:", r.URL.Path, "para container:", container)
//
//	app := services.GetAppByContainerName(container)
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.StopApp(app.ID, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao parar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação parada com sucesso!"})
//}

// 📥 Retorna dados completos da aplicação
//func GetAppInfoHandler(w http.ResponseWriter, r *http.Request) {
//	token := r.Header.Get("Authorization")
//	token = strings.TrimPrefix(token, "Bearer ")
//	user := store.GetLoggedUserByToken(token)
//	if user == nil {
//		http.Error(w, "Usuário não autenticado", http.StatusUnauthorized)
//		return
//	}
//
//	id := r.URL.Query().Get("id")
//	app := store.AppStore[id]
//	if app == nil || app.Username != user.Username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	utils.WriteJSON(w, app)
//}

//func ListUserAppsHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	name := r.URL.Query().Get("name")
//
//	var apps []*models.App
//	for _, app := range store.AppStore {
//		if app.Username != username {
//			continue
//		}
//		if name != "" && !strings.Contains(strings.ToLower(app.ContainerName), strings.ToLower(name)) {
//			continue
//		}
//		apps = append(apps, app)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{"apps": apps})
//}

//func ExportAppMetadataHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	appID := r.URL.Query().Get("id")
//
//	app := store.AppStore[appID]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
//		return
//	}
//
//	data := map[string]interface{}{
//		"id":        app.ID,
//		"name":      app.ContainerName,
//		"status":    app.Status,
//		"startTime": app.StartTime,
//		"ramUsage":  fmt.Sprintf("%.2f MB", app.RAMUsage),
//		"logs":      app.Logs,
//		"alert":     app.Alert,
//		"uptime":    utils.CalculateUptime(app.StartTime),
//	}
//
//	utils.WriteJSON(w, data)
//}

//func StartAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.StartApp(id, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao iniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação iniciada com sucesso!"})
//}

//func StopAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.StopApp(id, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao parar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação parada com sucesso!"})
//}

//func RestartAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.RestartApp(id, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reiniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reiniciada com sucesso!"})
//}

//func BackupAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.BackupApp(id, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao fazer backup: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Backup gerado com sucesso!"})
//}

//func DeleteAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//	log.Println("🗑️ Requisição de exclusão recebida para:", id, "por", username)
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.DeleteApp(id, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao deletar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//
//	// 💾 Salva o AppStore após exclusão
//	if err := store.SaveAppStoreToDisk("./database/appstore.json"); err != nil {
//		log.Println("❌ Erro ao salvar AppStore após exclusão:", err)
//	}
//
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação removida com sucesso!"})
//}

//func RebuildAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.RebuildApp(id, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reconstruir app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reconstruída com sucesso!"})
//}

//func AppOverviewHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	appID := r.URL.Query().Get("id")
//
//	app := store.AppStore[appID]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
//		return
//	}
//
//	uptime := utils.CalculateUptime(app.StartTime)
//	overview := map[string]interface{}{
//		"id":       app.ID,
//		"name":     app.ContainerName,
//		"uptime":   uptime,
//		"ramUsage": fmt.Sprintf("%.2f MB", app.RAMUsage),
//		"status":   app.Status,
//		"logs":     app.Logs,
//		"alert":    app.Alert,
//	}
//
//	utils.WriteJSON(w, overview)
//}

//func DeleteAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//	log.Println("🗑️ Requisição de exclusão recebida para:", id, "por", username)
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.DeleteApp(id, username); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao deletar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação removida com sucesso!"})
//}

//func ListAppsByStatusHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//
//	var active, stopped, backups []*models.App
//	for _, app := range store.AppStore {
//		if app.Username != username {
//			continue
//		}
//		switch app.Status {
//		case models.StatusRunning:
//			active = append(active, app)
//		case models.StatusStopped:
//			stopped = append(stopped, app)
//		default:
//			backups = append(backups, app)
//		}
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"active":  active,
//		"stopped": stopped,
//		"backups": backups,
//	})
//}

//// 🚀 Inicia uma aplicação
//func StartAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.StartApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao iniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação iniciada com sucesso!"})
//}
//
//// 🛑 Para uma aplicação
//func StopAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.StopApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao parar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação parada com sucesso!"})
//}
//
//// 🔄 Reinicia uma aplicação
//func RestartAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.RestartApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reiniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reiniciada com sucesso!"})
//}
//
//// 🧱 Reconstrói uma aplicação
//func RebuildAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.RebuildApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reconstruir app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reconstruída com sucesso!"})
//}
//
//// 💾 Gera backup da aplicação
//func BackupAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.BackupApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao fazer backup: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Backup gerado com sucesso!"})
//}
//
//// ❌ Remove uma aplicação
//func DeleteAppHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	id := r.URL.Query().Get("id")
//
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	if err := services.DeleteApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao deletar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação removida com sucesso!"})
//}

//// 🚀 Inicia uma aplicação
//func StartAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.StartApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao iniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação iniciada com sucesso!"})
//}
//
//// 🛑 Para uma aplicação
//func StopAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.StopApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao parar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação parada com sucesso!"})
//}
//
//// 🔄 Reinicia uma aplicação
//func RestartAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.RestartApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reiniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reiniciada com sucesso!"})
//}
//
//// 🧱 Reconstrói uma aplicação
//func RebuildAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.RebuildApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reconstruir app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reconstruída com sucesso!"})
//}
//
//// 💾 Gera backup da aplicação
//func BackupAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.BackupApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao fazer backup: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Backup gerado com sucesso!"})
//}
//
//// ❌ Remove uma aplicação
//func DeleteAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.DeleteApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao deletar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação removida com sucesso!"})
//}

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"net/http"
//	"strings"
//
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//// 🚀 Inicia uma aplicação
//func StartAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.StartApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao iniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação iniciada com sucesso!"})
//}
//
//// 🛑 Para uma aplicação
//func StopAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.StopApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao parar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação parada com sucesso!"})
//}
//
//// 🔄 Reinicia uma aplicação
//func RestartAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.RestartApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reiniciar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reiniciada com sucesso!"})
//}
//
//// 🧱 Reconstrói uma aplicação
//func RebuildAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.RebuildApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao reconstruir app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação reconstruída com sucesso!"})
//}
//
//// 💾 Gera backup da aplicação
//func BackupAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.BackupApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao fazer backup: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Backup gerado com sucesso!"})
//}
//
//// ❌ Remove uma aplicação
//func DeleteAppHandler(w http.ResponseWriter, r *http.Request) {
//	id := r.URL.Query().Get("id")
//	if err := services.DeleteApp(id); err != nil {
//		http.Error(w, fmt.Sprintf("Erro ao deletar app: %v", err), http.StatusInternalServerError)
//		return
//	}
//	utils.WriteJSON(w, map[string]string{"message": "Aplicação removida com sucesso!"})
//}
//
//// ✏️ Atualiza o nome da aplicação
//func UpdateAppNameHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	var payload struct {
//		ID      string `json:"id"`
//		NewName string `json:"newName"`
//	}
//	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	app := store.AppStore[payload.ID]
//	if app == nil {
//		http.Error(w, "Aplicação não encontrada", http.StatusNotFound)
//		return
//	}
//
//	app.Name = payload.NewName
//	app.Logs = append(app.Logs, "Nome da aplicação alterado para "+payload.NewName)
//
//	utils.WriteJSON(w, map[string]string{"message": "Nome atualizado com sucesso!"})
//}
//
//// 📋 Lista todas as aplicações do usuário
//func ListUserAppsHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	userID := utils.GetBearerToken(r)
//	name := r.URL.Query().Get("name")
//
//	var apps []*models.App
//	for _, app := range store.AppStore {
//		if app.UserID != userID {
//			continue
//		}
//		if name != "" && !strings.Contains(strings.ToLower(app.Name), strings.ToLower(name)) {
//			continue
//		}
//		apps = append(apps, app)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{"apps": apps})
//}
//
//// 📊 Métricas das aplicações do usuário
//func AppMetricsHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	userID := utils.GetBearerToken(r)
//	var metrics []map[string]interface{}
//
//	for _, app := range store.AppStore {
//		if app.UserID != userID {
//			continue
//		}
//
//		uptime := utils.CalculateUptime(app.StartTime)
//
//		metrics = append(metrics, map[string]interface{}{
//			"id":     app.ID,
//			"name":   app.Name,
//			"uptime": uptime,
//			"ram":    fmt.Sprintf("%.2f MB", app.RAMUsage),
//			"status": app.Status,
//			"alert":  app.Alert,
//		})
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{"metrics": metrics})
//}
//
//// 🧠 Visão consolidada da aplicação
//func AppOverviewHandler(w http.ResponseWriter, r *http.Request) {
//	userID := utils.GetBearerToken(r)
//	appID := r.URL.Query().Get("id")
//
//	app := store.AppStore[appID]
//	if app == nil || app.UserID != userID {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
//		return
//	}
//
//	uptime := utils.CalculateUptime(app.StartTime)
//	overview := map[string]interface{}{
//		"id":       app.ID,
//		"name":     app.Name,
//		"uptime":   uptime,
//		"ramUsage": fmt.Sprintf("%.2f MB", app.RAMUsage),
//		"status":   app.Status,
//		"logs":     app.Logs,
//		"alert":    app.Alert,
//	}
//
//	utils.WriteJSON(w, overview)
//}
//
//// 📜 Histórico por aplicação
//func AppHistoryHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	userID := utils.GetBearerToken(r)
//	appID := r.URL.Query().Get("id")
//
//	app := store.AppStore[appID]
//	if app == nil || app.UserID != userID {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{"logs": app.Logs})
//}
//
//// 📦 Exporta metadados da aplicação
//func ExportAppMetadataHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	userID := utils.GetBearerToken(r)
//	appID := r.URL.Query().Get("id")
//
//	app := store.AppStore[appID]
//	if app == nil || app.UserID != userID {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
//		return
//	}
//
//	data := map[string]interface{}{
//		"id":        app.ID,
//		"name":      app.Name,
//		"status":    app.Status,
//		"startTime": app.StartTime,
//		"ramUsage":  fmt.Sprintf("%.2f MB", app.RAMUsage),
//		"logs":      app.Logs,
//		"alert":     app.Alert,
//		"uptime":    utils.CalculateUptime(app.StartTime),
//	}
//
//	utils.WriteJSON(w, data)
//}
//
//// 🧮 Classifica consumo da aplicação
//func ClassifyAppUsageHandler(w http.ResponseWriter, r *http.Request) {
//	userID := utils.GetBearerToken(r)
//	appID := r.URL.Query().Get("id")
//
//	app := store.AppStore[appID]
//	if app == nil || app.UserID != userID {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusNotFound)
//		return
//	}
//
//	var usage string
//	switch {
//	case app.RAMUsage < 0.5:
//		usage = "Leve"
//	case app.RAMUsage < 1.5:
//		usage = "Moderado"
//	default:
//		usage = "Crítico"
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"id":     app.ID,
//		"usage":  usage,
//		"status": string(app.Status),
//	})
//}
//func UserStatusHandler(w http.ResponseWriter, r *http.Request) {
//	userID := utils.GetBearerToken(r)
//
//	user := store.UserStore[userID]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
//		return
//	}
//
//	response := map[string]interface{}{
//		"plan":      user.Plan,
//		"canDeploy": user.CanDeploy,
//	}
//
//	utils.WriteJSON(w, response)
//}
