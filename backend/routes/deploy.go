//backend/routes/deploy.go

package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"virtuscloud/backend/limits"
	"virtuscloud/backend/middleware"
	"virtuscloud/backend/models"
	"virtuscloud/backend/services"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"

	"github.com/go-chi/chi/v5"
)

func DeployHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Método não permitido",
		})
		return
	}

	plan := r.URL.Query().Get("plan")
	customID := r.URL.Query().Get("customID")

	username, _ := middleware.GetUserFromContext(r)
	user := store.UserStore[username]
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Usuário não encontrado",
		})
		return
	}

	if plan == "" {
		plan = string(user.Plan)
	}

	// ✅ Verifica elegibilidade com username e plano
	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
		log.Printf("[DeployHandler] Deploy bloqueado por plano: %v", err)
		w.WriteHeader(http.StatusForbidden)
		utils.WriteJSON(w, map[string]interface{}{
			"error":   "❌ Deploy bloqueado por limite de plano",
			"details": err.Error(),
		})
		return
	}

	file, header, err := r.FormFile("zipfile")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao receber o arquivo",
		})
		return
	}
	defer file.Close()

	if filepath.Ext(header.Filename) != ".zip" {
		w.WriteHeader(http.StatusBadRequest)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Formato inválido. Apenas arquivos .zip são permitidos",
		})
		return
	}

	fileSize := header.Size
	ramTotalMB := models.Plans[user.Plan].MemoryMB
	ramUsed := limits.SumUserRAM(username)
	ramAvailable := float32(ramTotalMB) - ramUsed

	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
	if fileSize > maxUploadBytes {
		msg := fmt.Sprintf("Arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
		w.WriteHeader(http.StatusRequestEntityTooLarge)
		utils.WriteJSON(w, map[string]interface{}{
			"error": msg,
		})
		return
	}

	appID := services.GenerateID()
	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)

	out, err := os.Create(uploadPath)
	if err != nil {
		log.Printf("[DeployHandler] Erro ao criar arquivo: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao salvar arquivo: " + err.Error(),
		})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao gravar conteúdo do arquivo",
		})
		return
	}

	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.WriteJSON(w, map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	// ❌ app.UserID = strconv.Itoa(user.ID) — REMOVIDO

	//app, err := services.HandleDeploy(uploadPath, username, plan, customID)
	//if err != nil {
	//	w.WriteHeader(http.StatusInternalServerError)
	//	utils.WriteJSON(w, map[string]interface{}{
	//		"error": err.Error(),
	//	})
	//	return
	//}
	//app.UserID = strconv.Itoa(user.ID)
	//app.Username = username

	app.Username = username
	go func() {
		containerName := fmt.Sprintf("%s-%s", username, app.ID)
		payload := map[string]string{
			"name":     containerName,
			"image":    app.ID,
			"username": username,
		}
		log.Println("📡 Enviando criação de container:", payload)

		// 🔐 Recupera token da sessão do usuário via arquivo
		session, ok := models.GetSessionByTokenFromUsername(username)
		token := ""
		if ok {
			token = session.Token
		}

		err := services.CallContainerCreation(payload, token)
		if err != nil {
			log.Printf("⚠️ Falha ao criar container: %v", err)
			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
		} else {
			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
		}
	}()

	entryPoints, _ := services.DetectEntryPoint(app.Path)
	log.Println("🧩 Entry points detectados:", entryPoints)

	if len(entryPoints) > 0 {
		cmd := exec.Command("node", entryPoints[0])
		cmd.Dir = app.Path
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Start(); err == nil {
			app.PID = cmd.Process.Pid
			app.Status = models.StatusRunning
			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
			log.Println("✅ App iniciada com PID:", app.PID)

			if len(entryPoints) == 1 {
				config := map[string]string{"entry": entryPoints[0]}
				data, _ := json.MarshalIndent(config, "", "  ")
				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
			}
		} else {
			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
			log.Println("❌ Erro ao iniciar app:", err)
		}
	} else {
		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
	}

	utils.WriteJSON(w, map[string]interface{}{
		"message":     "Deploy realizado e app iniciada com sucesso!",
		"app":         app,
		"entryPoints": entryPoints,
	})
}

// 🚦 Valida se o usuário pode criar uma nova aplicação
func ValidateDeployHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
		return
	}

	username, _ := middleware.GetUserFromContext(r)
	user := store.UserStore[username]
	if user == nil {
		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
		return
	}

	if err := limits.IsUserEligibleForDeploy(username, string(user.Plan)); err != nil {
		utils.WriteJSON(w, map[string]interface{}{
			"eligible": false,
			"message":  err.Error(),
		})
		return
	}

	utils.WriteJSON(w, map[string]interface{}{
		"eligible": true,
		"message":  "usuário elegível para deploy",
	})
}

func EntryPointListHandler(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "appID")
	appPath := filepath.Join("./apps", appID)

	entryPoints, err := services.DetectEntryPoint(appPath)
	if err != nil {
		http.Error(w, "Erro ao detectar entry points", http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, map[string]interface{}{
		"entryPoints": entryPoints, // ✅ retorna como objeto
	})
}

//func EntryPointListHandler(w http.ResponseWriter, r *http.Request) {
//	appID := chi.URLParam(r, "appID")
//	appPath := filepath.Join("./apps", appID)
//
//	entryPoints, err := services.DetectEntryPoint(appPath)
//	if err != nil {
//		http.Error(w, "Erro ao detectar entry points", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, entryPoints)
//}

func DeployStartHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		AppID string `json:"appID"`
		Entry string `json:"entry"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	configPath := filepath.Join("./apps", payload.AppID, "config.json")
	config := map[string]string{"entry": payload.Entry}
	data, _ := json.MarshalIndent(config, "", "  ")
	_ = os.WriteFile(configPath, data, 0644)

	scriptPath := filepath.Join("./apps", payload.AppID, "init-app.sh")
	cmd := exec.Command("bash", scriptPath)
	cmd.Dir = filepath.Join("./apps", payload.AppID)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		http.Error(w, "Falha ao iniciar aplicação", http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, map[string]string{
		"message": "App iniciado com sucesso via " + payload.Entry,
	})
}

func DeployEntryRouter() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.AuthMiddleware)
	r.Get("/api/deploy/entrypoints/{appID}", EntryPointListHandler)
	return r
}

//backend/routes/deploy.go

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"os/exec"
//	"path/filepath"
//
//	"virtuscloud/backend/limits"
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//
//	"github.com/go-chi/chi/v5"
//)
//
//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		w.WriteHeader(http.StatusUnauthorized)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	if plan == "" {
//		plan = string(user.Plan)
//	}
//
//	// ✅ Verifica elegibilidade com username e plano
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		log.Printf("[DeployHandler] Deploy bloqueado por plano: %v", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao receber o arquivo",
//		})
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Formato inválido. Apenas arquivos .zip são permitidos",
//		})
//		return
//	}
//
//	fileSize := header.Size
//	ramTotalMB := models.Plans[user.Plan].MemoryMB
//	ramUsed := limits.SumUserRAM(username)
//	ramAvailable := float32(ramTotalMB) - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("Arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		w.WriteHeader(http.StatusRequestEntityTooLarge)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": msg,
//		})
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[DeployHandler] Erro ao criar arquivo: %v", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo do arquivo",
//		})
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	if err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": err.Error(),
//		})
//		return
//	}
//
//	// ❌ app.UserID = strconv.Itoa(user.ID) — REMOVIDO
//
//	//app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	//if err != nil {
//	//	w.WriteHeader(http.StatusInternalServerError)
//	//	utils.WriteJSON(w, map[string]interface{}{
//	//		"error": err.Error(),
//	//	})
//	//	return
//	//}
//	//app.UserID = strconv.Itoa(user.ID)
//	//app.Username = username
//
//	app.Username = username
//	go func() {
//		containerName := fmt.Sprintf("%s-%s", username, app.ID)
//		payload := map[string]string{
//			"name":     containerName,
//			"image":    app.ID,
//			"username": username,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//
//		// 🔐 Recupera token da sessão do usuário via arquivo
//		session, ok := models.GetSessionByTokenFromUsername(username)
//		token := ""
//		if ok {
//			token = session.Token
//		}
//
//		err := services.CallContainerCreation(payload, token)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}
//
//// 🚦 Valida se o usuário pode criar uma nova aplicação
//func ValidateDeployHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//
//	if err := limits.IsUserEligibleForDeploy(username, string(user.Plan)); err != nil {
//		utils.WriteJSON(w, map[string]interface{}{
//			"eligible": false,
//			"message":  err.Error(),
//		})
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"eligible": true,
//		"message":  "usuário elegível para deploy",
//	})
//}
//
//func EntryPointListHandler(w http.ResponseWriter, r *http.Request) {
//	appID := chi.URLParam(r, "appID")
//	appPath := filepath.Join("./apps", appID)
//
//	entryPoints, err := services.DetectEntryPoint(appPath)
//	if err != nil {
//		http.Error(w, "Erro ao detectar entry points", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, entryPoints)
//}
//
//func DeployStartHandler(w http.ResponseWriter, r *http.Request) {
//	var payload struct {
//		AppID string `json:"appID"`
//		Entry string `json:"entry"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	configPath := filepath.Join("./apps", payload.AppID, "config.json")
//	config := map[string]string{"entry": payload.Entry}
//	data, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(configPath, data, 0644)
//
//	scriptPath := filepath.Join("./apps", payload.AppID, "init-app.sh")
//	cmd := exec.Command("bash", scriptPath)
//	cmd.Dir = filepath.Join("./apps", payload.AppID)
//	cmd.Stdout = os.Stdout
//	cmd.Stderr = os.Stderr
//
//	if err := cmd.Start(); err != nil {
//		http.Error(w, "Falha ao iniciar aplicação", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "App iniciado com sucesso via " + payload.Entry,
//	})
//}

//app.Username = username
//go func() {
//	payload := map[string]string{
//		"name":     app.ID,
//		"image":    app.ID,
//		"username": username,
//	}
//	log.Println("📡 Enviando criação de container:", payload)
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(username)
//	token := ""
//	if ok {
//		token = session.Token
//	}
//
//	err := services.CallContainerCreation(payload, token)
//	if err != nil {
//		log.Printf("⚠️ Falha ao criar container: %v", err)
//		app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//	} else {
//		app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//	}
//}()

//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		w.WriteHeader(http.StatusUnauthorized)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	if plan == "" {
//		plan = string(user.Plan)
//	}
//
//	// ✅ Verifica elegibilidade com username e plano
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		log.Printf("[DeployHandler] Deploy bloqueado por plano: %v", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao receber o arquivo",
//		})
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Formato inválido. Apenas arquivos .zip são permitidos",
//		})
//		return
//	}
//
//	fileSize := header.Size
//	ramTotalMB := models.Plans[user.Plan].MemoryMB
//	ramUsed := limits.SumUserRAM(username)
//	ramAvailable := float32(ramTotalMB) - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("Arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		w.WriteHeader(http.StatusRequestEntityTooLarge)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": msg,
//		})
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[DeployHandler] Erro ao criar arquivo: %v", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo do arquivo",
//		})
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	if err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": err.Error(),
//		})
//		return
//	}
//
//	// ❌ app.UserID = strconv.Itoa(user.ID) — REMOVIDO
//
//	//app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	//if err != nil {
//	//	w.WriteHeader(http.StatusInternalServerError)
//	//	utils.WriteJSON(w, map[string]interface{}{
//	//		"error": err.Error(),
//	//	})
//	//	return
//	//}
//	//app.UserID = strconv.Itoa(user.ID)
//	//app.Username = username
//
//	app.Username = username
//	go func() {
//		payload := map[string]string{
//			"name":     app.ID,
//			"image":    app.ID,
//			"username": username,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//
//		// 🔐 Recupera token da sessão do usuário
//		token := store.GetSessionToken(username)
//
//		err := services.CallContainerCreation(payload, token)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}

//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		w.WriteHeader(http.StatusUnauthorized)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	if plan == "" {
//		plan = string(user.Plan)
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao receber o arquivo",
//		})
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Formato inválido. Apenas arquivos .zip são permitidos",
//		})
//		return
//	}
//
//	fileSize := header.Size
//	ramTotalMB := models.Plans[user.Plan].MemoryMB
//	ramUsed := limits.SumUserRAM(username)
//	ramAvailable := float32(ramTotalMB) - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("Arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		w.WriteHeader(http.StatusRequestEntityTooLarge)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": msg,
//		})
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[DeployHandler] Erro ao criar arquivo: %v", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo do arquivo",
//		})
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	if err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": err.Error(),
//		})
//		return
//	}
//	app.UserID = strconv.Itoa(user.ID)
//	app.Username = username
//
//	// ✅ Cria flag de deploy incompleto
//	flagPath := filepath.Join(app.Path, "incomplete.flag")
//	_ = os.WriteFile(flagPath, []byte("deploy em andamento"), 0644)
//
//	// ✅ Verifica elegibilidade após pasta e flag existirem
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		log.Printf("[DeployHandler] Deploy bloqueado por plano: %v", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	go func() {
//		payload := map[string]string{
//			"name":  app.ID,
//			"image": app.ID,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//		err := services.CallContainerCreation(payload)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	// ✅ Remove flag após deploy bem-sucedido
//	_ = os.Remove(flagPath)
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}

//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		w.WriteHeader(http.StatusUnauthorized)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	if plan == "" {
//		plan = string(user.Plan)
//	}
//
//	// ✅ Verifica elegibilidade com username e plano
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		log.Printf("[DeployHandler] Deploy bloqueado por plano: %v", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao receber o arquivo",
//		})
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Formato inválido. Apenas arquivos .zip são permitidos",
//		})
//		return
//	}
//
//	fileSize := header.Size
//	ramTotalMB := models.Plans[user.Plan].MemoryMB
//	ramUsed := limits.SumUserRAM(username)
//	ramAvailable := float32(ramTotalMB) - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("Arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		w.WriteHeader(http.StatusRequestEntityTooLarge)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": msg,
//		})
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[DeployHandler] Erro ao criar arquivo: %v", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo do arquivo",
//		})
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	if err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": err.Error(),
//		})
//		return
//	}
//	app.UserID = strconv.Itoa(user.ID)
//	app.Username = username
//
//	// ✅ Cria flag de deploy incompleto
//	flagPath := filepath.Join(app.Path, "incomplete.flag")
//	_ = os.WriteFile(flagPath, []byte("deploy em andamento"), 0644)
//
//	go func() {
//		payload := map[string]string{
//			"name":  app.ID,
//			"image": app.ID,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//		err := services.CallContainerCreation(payload)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	// ✅ Remove flag após deploy bem-sucedido
//	_ = os.Remove(flagPath)
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strconv"
//
//	"github.com/go-chi/chi/v5"
//
//	"virtuscloud/backend/limits"
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		w.WriteHeader(http.StatusUnauthorized)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Usuário não encontrado",
//		})
//		return
//	}
//
//	if err := limits.IsUserEligibleForDeploy(strconv.Itoa(user.ID)); err != nil {
//		log.Printf("[UploadHandler] Deploy bloqueado por plano: %v", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	if plan == "" {
//		plan = string(user.Plan)
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao receber o arquivo",
//		})
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Formato inválido. Apenas arquivos .zip são permitidos",
//		})
//		return
//	}
//
//	fileSize := header.Size
//	ramTotalMB := models.Plans[user.Plan].MemoryMB
//	ramUsed := limits.SumUserRAM(strconv.Itoa(user.ID))
//	ramAvailable := float32(ramTotalMB) - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("Arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		w.WriteHeader(http.StatusRequestEntityTooLarge)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": msg,
//		})
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[UploadHandler] Erro ao criar arquivo: %v", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo do arquivo",
//		})
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	if err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": err.Error(),
//		})
//		return
//	}
//	app.UserID = strconv.Itoa(user.ID)
//	app.Username = username
//
//	go func() {
//		payload := map[string]string{
//			"name":  app.ID,
//			"image": app.ID,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//		err := services.CallContainerCreation(payload)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}
//
//// 🚦 Valida se o usuário pode criar uma nova aplicação
//func ValidateDeployHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//
//	if err := limits.IsUserEligibleForDeploy(strconv.Itoa(user.ID)); err != nil {
//		utils.WriteJSON(w, map[string]interface{}{
//			"eligible": false,
//			"message":  err.Error(),
//		})
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"eligible": true,
//		"message":  "usuário elegível para deploy",
//	})
//}
//
//func EntryPointListHandler(w http.ResponseWriter, r *http.Request) {
//	appID := chi.URLParam(r, "appID")
//	appPath := filepath.Join("./apps", appID)
//
//	entryPoints, err := services.DetectEntryPoint(appPath)
//	if err != nil {
//		http.Error(w, "Erro ao detectar entry points", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, entryPoints)
//}
//
//func DeployStartHandler(w http.ResponseWriter, r *http.Request) {
//	var payload struct {
//		AppID string `json:"appID"`
//		Entry string `json:"entry"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	configPath := filepath.Join("./apps", payload.AppID, "config.json")
//	config := map[string]string{"entry": payload.Entry}
//	data, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(configPath, data, 0644)
//
//	scriptPath := filepath.Join("./apps", payload.AppID, "init-app.sh")
//	cmd := exec.Command("bash", scriptPath)
//	cmd.Dir = filepath.Join("./apps", payload.AppID)
//	cmd.Stdout = os.Stdout
//	cmd.Stderr = os.Stderr
//
//	if err := cmd.Start(); err != nil {
//		http.Error(w, "Falha ao iniciar aplicação", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "App iniciado com sucesso via " + payload.Entry,
//	})
//}

//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//	// ✅ Verifica se o usuário pode fazer deploy conforme o plano
//	if err := limits.IsUserEligibleForDeploy(strconv.Itoa(user.ID)); err != nil {
//		http.Error(w, "deploy bloqueado: "+err.Error(), http.StatusForbidden)
//		return
//	}
//
//	if plan == "" {
//		plan = string(user.Plan) // usa plano do usuário se não vier na query
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		http.Error(w, "erro ao receber o arquivo", http.StatusBadRequest)
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		http.Error(w, "formato inválido. Apenas arquivos .zip são permitidos", http.StatusBadRequest)
//		return
//	}
//
//	fileSize := header.Size
//
//	ramTotal := models.Plans[user.Plan].MemoryGB
//	ramUsed := limits.SumUserRAM(strconv.Itoa(user.ID))
//	ramAvailable := ramTotal - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		http.Error(w, msg, http.StatusRequestEntityTooLarge)
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
//
//	// ✅ Garante que o diretório uploads existe
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[UploadHandler] Erro ao criar arquivo: %v", err)
//		http.Error(w, "erro ao salvar arquivo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		http.Error(w, "erro ao gravar conteúdo do arquivo", http.StatusInternalServerError)
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	if err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//	app.UserID = strconv.Itoa(user.ID)
//	app.Username = username
//
//	// 🐳 Criação do container com imagem personalizada (com reinício automático já garantido)
//	go func() {
//		payload := map[string]string{
//			"name":  app.ID,
//			"image": app.ID,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//		err := services.CallContainerCreation(payload)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}

//func ValidateDeployHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//
//	if err := limits.IsUserEligibleForDeploy(strconv.Itoa(user.ID)); err != nil {
//		utils.WriteJSON(w, map[string]interface{}{
//			"eligible": false,
//			"message":  err.Error(),
//		})
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"eligible": true,
//		"message":  "usuário elegível para deploy",
//	})
//}

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strconv"
//
//	"github.com/go-chi/chi/v5"
//
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//
//	if plan == "" {
//		plan = string(user.Plan)
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		http.Error(w, "erro ao receber o arquivo", http.StatusBadRequest)
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		http.Error(w, "formato inválido. Apenas arquivos .zip são permitidos", http.StatusBadRequest)
//		return
//	}
//
//	fileSize := header.Size
//	ramTotal := models.Plans[user.Plan].MemoryGB
//	ramUsed := utils.SumUserRAM(strconv.Itoa(user.ID))
//	ramAvailable := ramTotal - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		http.Error(w, msg, http.StatusRequestEntityTooLarge)
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("storage/users/%s/uploads/%d.zip", username, appID)
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[UploadHandler] Erro ao criar arquivo: %v", err)
//		http.Error(w, "erro ao salvar arquivo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		http.Error(w, "erro ao gravar conteúdo do arquivo", http.StatusInternalServerError)
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, username, plan, customID)
//	if err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//	app.UserID = strconv.Itoa(user.ID)
//	app.Username = username
//
//	go func() {
//		payload := map[string]string{
//			"name":  app.ID,
//			"image": app.ID,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//		err := services.CallContainerCreation(payload)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}
//
//func ValidateDeployHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//
//	if err := utils.IsUserEligibleForDeploy(strconv.Itoa(user.ID)); err != nil {
//		utils.WriteJSON(w, map[string]interface{}{
//			"eligible": false,
//			"message":  err.Error(),
//		})
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"eligible": true,
//		"message":  "usuário elegível para deploy",
//	})
//}
//
//func EntryPointListHandler(w http.ResponseWriter, r *http.Request) {
//	appID := chi.URLParam(r, "appID")
//	username, _ := middleware.GetUserFromContext(r)
//	appPath := filepath.Join("storage", "users", username, "apps", appID)
//
//	entryPoints, err := services.DetectEntryPoint(appPath)
//	if err != nil {
//		http.Error(w, "Erro ao detectar entry points", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, entryPoints)
//}
//
//func DeployStartHandler(w http.ResponseWriter, r *http.Request) {
//	var payload struct {
//		AppID string `json:"appID"`
//		Entry string `json:"entry"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	appPath := filepath.Join("storage", "users", username, "apps", payload.AppID)
//
//	configPath := filepath.Join(appPath, "config.json")
//	config := map[string]string{"entry": payload.Entry}
//	data, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(configPath, data, 0644)
//
//	scriptPath := filepath.Join(appPath, "init-app.sh")
//	cmd := exec.Command("bash", scriptPath)
//	cmd.Dir = appPath
//	cmd.Stdout = os.Stdout
//	cmd.Stderr = os.Stderr
//
//	if err := cmd.Start(); err != nil {
//		http.Error(w, "Falha ao iniciar aplicação", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "App iniciado com sucesso via " + payload.Entry,
//	})
//}

//func DeployStartHandler(w http.ResponseWriter, r *http.Request) {
//	var payload struct {
//		AppID string `json:"appID"`
//		Entry string `json:"entry"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	appPath := filepath.Join("storage", "users", username, "apps", payload.AppID)
//
//	configPath := filepath.Join(appPath, "config.json")
//	config := map[string]string{"entry": payload.Entry}
//	data, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(configPath, data, 0644)
//
//	// ✅ Inicia diretamente com base na extensão do entry point
//	var cmd *exec.Cmd
//	switch {
//	case strings.HasSuffix(payload.Entry, ".ts"):
//		cmd = exec.Command("ts-node", payload.Entry)
//	case strings.HasSuffix(payload.Entry, ".js"):
//		cmd = exec.Command("node", payload.Entry)
//	case strings.HasSuffix(payload.Entry, ".py"):
//		cmd = exec.Command("python", payload.Entry)
//	case strings.HasSuffix(payload.Entry, ".go"):
//		cmd = exec.Command("go", "run", payload.Entry)
//	default:
//		http.Error(w, "Tipo de arquivo não suportado para execução", http.StatusBadRequest)
//		return
//	}
//
//	cmd.Dir = appPath
//	cmd.Stdout = os.Stdout
//	cmd.Stderr = os.Stderr
//
//	if err := cmd.Start(); err != nil {
//		http.Error(w, "Falha ao iniciar aplicação: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "App iniciado com sucesso via " + payload.Entry,
//	})
//}

//package routes
//
//import (
//	"encoding/json"
//	"fmt"
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"os/exec"
//	"path/filepath"
//
//	"github.com/go-chi/chi/v5"
//
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//func DeployHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	if r.Method != http.MethodPost {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	plan := r.URL.Query().Get("plan")
//	customID := r.URL.Query().Get("customID")
//	userID := utils.GetBearerToken(r)
//
//	if plan == "" {
//		http.Error(w, "parâmetro 'plan' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	file, header, err := r.FormFile("zipfile")
//	if err != nil {
//		http.Error(w, "erro ao receber o arquivo", http.StatusBadRequest)
//		return
//	}
//	defer file.Close()
//
//	if filepath.Ext(header.Filename) != ".zip" {
//		http.Error(w, "formato inválido. Apenas arquivos .zip são permitidos", http.StatusBadRequest)
//		return
//	}
//
//	fileSize := header.Size
//	user := store.UserStore[userID]
//	if user == nil {
//		http.Error(w, "usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//
//	ramTotal := models.Plans[user.Plan].MemoryGB
//	ramUsed := utils.SumUserRAM(userID)
//	ramAvailable := ramTotal - ramUsed
//
//	maxUploadBytes := int64(ramAvailable * 200 * 1024 * 1024)
//	if fileSize > maxUploadBytes {
//		msg := fmt.Sprintf("arquivo excede o limite permitido (%d MB disponíveis)", maxUploadBytes/1024/1024)
//		http.Error(w, msg, http.StatusRequestEntityTooLarge)
//		return
//	}
//
//	appID := services.GenerateID()
//	uploadPath := fmt.Sprintf("./uploads/%d.zip", appID)
//
//	// ✅ Garante que o diretório uploads existe
//	os.MkdirAll(filepath.Dir(uploadPath), os.ModePerm)
//
//	out, err := os.Create(uploadPath)
//	if err != nil {
//		log.Printf("[UploadHandler] Erro ao criar arquivo: %v", err)
//		http.Error(w, "erro ao salvar arquivo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		http.Error(w, "erro ao gravar conteúdo do arquivo", http.StatusInternalServerError)
//		return
//	}
//
//	app, err := services.HandleDeploy(uploadPath, plan, customID)
//	if err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//	app.UserID = userID
//
//	// 🐳 Criação do container com imagem personalizada (com reinício automático já garantido)
//	go func() {
//		payload := map[string]string{
//			"name":  app.ID,
//			"image": app.ID,
//		}
//		log.Println("📡 Enviando criação de container:", payload)
//		err := services.CallContainerCreation(payload)
//		if err != nil {
//			log.Printf("⚠️ Falha ao criar container: %v", err)
//			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//		} else {
//			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso!")
//		}
//	}()
//
//	entryPoints, _ := services.DetectEntryPoint(app.Path)
//	log.Println("🧩 Entry points detectados:", entryPoints)
//
//	if len(entryPoints) > 0 {
//		cmd := exec.Command("node", entryPoints[0])
//		cmd.Dir = app.Path
//		cmd.Stdout = os.Stdout
//		cmd.Stderr = os.Stderr
//
//		if err := cmd.Start(); err == nil {
//			app.PID = cmd.Process.Pid
//			app.Status = models.StatusRunning
//			app.Logs = append(app.Logs, "🟢 App iniciada automaticamente via "+entryPoints[0])
//			log.Println("✅ App iniciada com PID:", app.PID)
//
//			if len(entryPoints) == 1 {
//				config := map[string]string{"entry": entryPoints[0]}
//				data, _ := json.MarshalIndent(config, "", "  ")
//				_ = os.WriteFile(filepath.Join(app.Path, "config.json"), data, 0644)
//			}
//		} else {
//			app.Logs = append(app.Logs, "⚠️ Falha ao iniciar: "+err.Error())
//			log.Println("❌ Erro ao iniciar app:", err)
//		}
//	} else {
//		app.Logs = append(app.Logs, "⚠️ Nenhum entry point detectado")
//		log.Println("⚠️ Nenhum entry point detectado para:", app.ID)
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"message":     "Deploy realizado e app iniciada com sucesso!",
//		"app":         app,
//		"entryPoints": entryPoints,
//	})
//}
//
//func ValidateDeployHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	userID := utils.GetBearerToken(r)
//	if userID == "" {
//		http.Error(w, "id do usuário não localizado", http.StatusUnauthorized)
//		return
//	}
//
//	if err := utils.IsUserEligibleForDeploy(userID); err != nil {
//		utils.WriteJSON(w, map[string]interface{}{
//			"eligible": false,
//			"message":  err.Error(),
//		})
//		return
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"eligible": true,
//		"message":  "usuário elegível para deploy",
//	})
//}
//
//func EntryPointListHandler(w http.ResponseWriter, r *http.Request) {
//	appID := chi.URLParam(r, "appID")
//	appPath := filepath.Join("./apps", appID)
//
//	entryPoints, err := services.DetectEntryPoint(appPath)
//	if err != nil {
//		http.Error(w, "Erro ao detectar entry points", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, entryPoints)
//}
//
//func DeployStartHandler(w http.ResponseWriter, r *http.Request) {
//	var payload struct {
//		AppID string `json:"appID"`
//		Entry string `json:"entry"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	configPath := filepath.Join("./apps", payload.AppID, "config.json")
//	config := map[string]string{"entry": payload.Entry}
//	data, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(configPath, data, 0644)
//
//	scriptPath := filepath.Join("./apps", payload.AppID, "init-app.sh")
//	cmd := exec.Command("bash", scriptPath)
//	cmd.Dir = filepath.Join("./apps", payload.AppID)
//	cmd.Stdout = os.Stdout
//	cmd.Stderr = os.Stderr
//
//	if err := cmd.Start(); err != nil {
//		http.Error(w, "Falha ao iniciar aplicação", http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message": "App iniciado com sucesso via " + payload.Entry,
//	})
//}
//
