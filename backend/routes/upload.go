//backend/routes/upload.go

package routes

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"virtuscloud/backend/limits"
	"virtuscloud/backend/middleware"
	"virtuscloud/backend/services"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Método não permitido",
		})
		return
	}

	log.Println("📦 Recebendo upload ZIP para deploy...")

	plan := r.URL.Query().Get("plan")
	if plan == "" {
		w.WriteHeader(http.StatusBadRequest)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Parâmetro 'plan' é obrigatório",
		})
		return
	}

	username, _ := middleware.GetUserFromContext(r)
	user := store.UserStore[username]
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Usuário não encontrado",
		})
		return
	}

	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
		log.Println("[UploadHandler] Deploy bloqueado por plano:", err)
		w.WriteHeader(http.StatusForbidden)
		utils.WriteJSON(w, map[string]interface{}{
			"error":   "❌ Deploy bloqueado por limite de plano",
			"details": err.Error(),
		})
		return
	}

	uploadDir := fmt.Sprintf("storage/users/%s/%s/uploads", username, plan)
	snapshotDir := fmt.Sprintf("storage/users/%s/%s/snapshots", username, plan)
	_ = os.MkdirAll(uploadDir, os.ModePerm)
	_ = os.MkdirAll(snapshotDir, os.ModePerm)

	file, header, err := r.FormFile("file")
	if err != nil {
		log.Println("[UploadHandler] Erro ao processar arquivo:", err)
		w.WriteHeader(http.StatusBadRequest)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao processar arquivo: " + err.Error(),
		})
		return
	}
	defer file.Close()

	uploadPath := filepath.Join(uploadDir, header.Filename)
	out, err := os.Create(uploadPath)
	if err != nil {
		log.Println("[UploadHandler] Erro ao salvar arquivo:", err)
		w.WriteHeader(http.StatusInternalServerError)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao salvar arquivo: " + err.Error(),
		})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		log.Println("[UploadHandler] Erro ao gravar conteúdo:", err)
		w.WriteHeader(http.StatusInternalServerError)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao gravar conteúdo: " + err.Error(),
		})
		return
	}

	customID := r.URL.Query().Get("custom")
	appID := customID
	if appID == "" {
		appID = fmt.Sprintf("%d", services.GenerateID())
	}

	// 📦 Copia o arquivo para snapshots antes do deploy
	snapshotPath := filepath.Join(snapshotDir, appID+".zip")
	input, err := os.ReadFile(uploadPath)
	if err == nil {
		_ = os.WriteFile(snapshotPath, input, 0644)
		log.Println("📦 Snapshot salvo em:", snapshotPath)
	}

	// 🚀 Realiza o deploy a partir do snapshot
	app, err := services.HandleDeploy(snapshotPath, username, plan, appID)
	if err != nil {
		log.Println("[UploadHandler] Erro ao realizar deploy:", err)
		if strings.Contains(err.Error(), "RAM insuficiente") || strings.Contains(err.Error(), "limite de") {
			w.WriteHeader(http.StatusForbidden)
			utils.WriteJSON(w, map[string]interface{}{
				"error":   "❌ Deploy bloqueado por limite de plano",
				"details": err.Error(),
			})
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		utils.WriteJSON(w, map[string]interface{}{
			"error": "Erro ao realizar deploy: " + err.Error(),
		})
		return
	}

	_ = os.Remove(uploadPath)

	log.Println("🚀 Deploy concluído para:", app.ID)
	utils.WriteJSON(w, map[string]interface{}{
		"message": "Upload e deploy concluídos",
		"app":     app,
	})
}

//func UploadHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	log.Println("📦 Recebendo upload ZIP para deploy...")
//
//	plan := r.URL.Query().Get("plan")
//	if plan == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Parâmetro 'plan' é obrigatório",
//		})
//		return
//	}
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
//	// ✅ Verifica se o usuário pode fazer deploy com base no plano
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		log.Println("[UploadHandler] Deploy bloqueado por plano:", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	tempDir := fmt.Sprintf("storage/users/%s/uploads", username)
//	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
//		log.Println("[UploadHandler] Erro ao criar diretório:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao criar diretório temporário: " + err.Error(),
//		})
//		return
//	}
//
//	file, header, err := r.FormFile("file")
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao processar arquivo:", err)
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao processar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer file.Close()
//
//	tempPath := filepath.Join(tempDir, header.Filename)
//	out, err := os.Create(tempPath)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao salvar arquivo:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		log.Println("[UploadHandler] Erro ao gravar conteúdo:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo: " + err.Error(),
//		})
//		return
//	}
//
//	customID := r.URL.Query().Get("custom")
//	app, err := services.HandleDeploy(tempPath, username, plan, customID)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao realizar deploy:", err)
//		if strings.Contains(err.Error(), "RAM insuficiente") || strings.Contains(err.Error(), "limite de") {
//			w.WriteHeader(http.StatusForbidden)
//			utils.WriteJSON(w, map[string]interface{}{
//				"error":   "❌ Deploy bloqueado por limite de plano",
//				"details": err.Error(),
//			})
//			return
//		}
//
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao realizar deploy: " + err.Error(),
//		})
//		return
//	}
//
//	_ = os.Remove(tempPath)
//
//	log.Println("🚀 Deploy concluído para:", app.ID)
//	utils.WriteJSON(w, map[string]interface{}{
//		"message": "Upload e deploy concluídos",
//		"app":     app,
//	})
//}

//func UploadHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	log.Println("📦 Recebendo upload ZIP para deploy...")
//
//	plan := r.URL.Query().Get("plan")
//	if plan == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Parâmetro 'plan' é obrigatório",
//		})
//		return
//	}
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
//	// ✅ Verifica se o usuário pode fazer deploy com base no plano
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		log.Println("[UploadHandler] Deploy bloqueado por plano:", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	tempDir := fmt.Sprintf("storage/users/%s/uploads", username)
//	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
//		log.Println("[UploadHandler] Erro ao criar diretório:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao criar diretório temporário: " + err.Error(),
//		})
//		return
//	}
//
//	file, header, err := r.FormFile("file")
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao processar arquivo:", err)
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao processar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer file.Close()
//
//	tempPath := filepath.Join(tempDir, header.Filename)
//	out, err := os.Create(tempPath)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao salvar arquivo:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		log.Println("[UploadHandler] Erro ao gravar conteúdo:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo: " + err.Error(),
//		})
//		return
//	}
//
//	// 🧱 Salva snapshot da aplicação para futuros rebuilds
//	customID := r.URL.Query().Get("custom")
//	appID := customID
//	if appID == "" {
//		appID = strings.TrimSuffix(header.Filename, filepath.Ext(header.Filename))
//	}
//	snapshotPath := fmt.Sprintf("storage/users/%s/%s/snapshots/%s.zip", username, plan, appID)
//	os.MkdirAll(filepath.Dir(snapshotPath), os.ModePerm)
//
//	snapshotFile, err := os.Create(snapshotPath)
//	if err != nil {
//		log.Printf("[UploadHandler] ⚠️ Erro ao criar snapshot: %v", err)
//	} else {
//		defer snapshotFile.Close()
//		originalZip, err := os.Open(tempPath)
//		if err == nil {
//			defer originalZip.Close()
//			_, err = io.Copy(snapshotFile, originalZip)
//			if err != nil {
//				log.Printf("[UploadHandler] ⚠️ Erro ao copiar snapshot: %v", err)
//			} else {
//				log.Printf("[UploadHandler] 📦 Snapshot salvo em: %s", snapshotPath)
//			}
//		}
//	}
//
//	app, err := services.HandleDeploy(tempPath, username, plan, customID)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao realizar deploy:", err)
//		if strings.Contains(err.Error(), "RAM insuficiente") || strings.Contains(err.Error(), "limite de") {
//			w.WriteHeader(http.StatusForbidden)
//			utils.WriteJSON(w, map[string]interface{}{
//				"error":   "❌ Deploy bloqueado por limite de plano",
//				"details": err.Error(),
//			})
//			return
//		}
//
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao realizar deploy: " + err.Error(),
//		})
//		return
//	}
//
//	_ = os.Remove(tempPath)
//
//	log.Println("🚀 Deploy concluído para:", app.ID)
//	utils.WriteJSON(w, map[string]interface{}{
//		"message": "Upload e deploy concluídos",
//		"app":     app,
//	})
//}

//package routes
//
//import (
//	"fmt"
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"path/filepath"
//	"strconv"
//	"strings"
//
//	"virtuscloud/backend/limits"
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//func UploadHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		w.WriteHeader(http.StatusMethodNotAllowed)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Método não permitido",
//		})
//		return
//	}
//
//	log.Println("📦 Recebendo upload ZIP para deploy...")
//
//	plan := r.URL.Query().Get("plan")
//	if plan == "" {
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Parâmetro 'plan' é obrigatório",
//		})
//		return
//	}
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
//		log.Println("[UploadHandler] Deploy bloqueado por plano:", err)
//		w.WriteHeader(http.StatusForbidden)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error":   "❌ Deploy bloqueado por limite de plano",
//			"details": err.Error(),
//		})
//		return
//	}
//
//	tempDir := fmt.Sprintf("storage/users/%s/uploads", username)
//	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
//		log.Println("[UploadHandler] Erro ao criar diretório:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao criar diretório temporário: " + err.Error(),
//		})
//		return
//	}
//
//	file, header, err := r.FormFile("file")
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao processar arquivo:", err)
//		w.WriteHeader(http.StatusBadRequest)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao processar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer file.Close()
//
//	tempPath := filepath.Join(tempDir, header.Filename)
//	out, err := os.Create(tempPath)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao salvar arquivo:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao salvar arquivo: " + err.Error(),
//		})
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		log.Println("[UploadHandler] Erro ao gravar conteúdo:", err)
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao gravar conteúdo: " + err.Error(),
//		})
//		return
//	}
//
//	customID := r.URL.Query().Get("custom")
//	app, err := services.HandleDeploy(tempPath, username, plan, customID)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao realizar deploy:", err)
//		if strings.Contains(err.Error(), "RAM insuficiente") || strings.Contains(err.Error(), "limite de") {
//			//if strings.Contains(err.Error(), "RAM insuficiente") {
//			w.WriteHeader(http.StatusForbidden)
//			utils.WriteJSON(w, map[string]interface{}{
//				"error":   "❌ Deploy bloqueado por limite de plano",
//				"details": err.Error(),
//			})
//			return
//		}
//
//		w.WriteHeader(http.StatusInternalServerError)
//		utils.WriteJSON(w, map[string]interface{}{
//			"error": "Erro ao realizar deploy: " + err.Error(),
//		})
//		return
//	}
//
//	_ = os.Remove(tempPath)
//
//	log.Println("🚀 Deploy concluído para:", app.ID)
//	utils.WriteJSON(w, map[string]interface{}{
//		"message": "Upload e deploy concluídos",
//		"app":     app,
//	})
//}

//func UploadHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	log.Println("📦 Recebendo upload ZIP para deploy...")
//
//	plan := r.URL.Query().Get("plan")
//	if plan == "" {
//		http.Error(w, "Parâmetro 'plan' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//	user := store.UserStore[username]
//	if user == nil {
//		http.Error(w, "Usuário não encontrado", http.StatusUnauthorized)
//		return
//	}
//
//	// ✅ Verifica se o usuário pode fazer deploy conforme o plano
//	if err := limits.IsUserEligibleForDeploy(strconv.Itoa(user.ID)); err != nil {
//		log.Println("[UploadHandler] Deploy bloqueado por plano:", err)
//		http.Error(w, err.Error(), http.StatusForbidden)
//		return
//	}
//
//	tempDir := fmt.Sprintf("storage/users/%s/uploads", username)
//	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
//		log.Println("[UploadHandler] Erro ao criar diretório:", err)
//		http.Error(w, "Erro ao criar diretório temporário: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	file, header, err := r.FormFile("file")
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao processar arquivo:", err)
//		http.Error(w, "Erro ao processar arquivo: "+err.Error(), http.StatusBadRequest)
//		return
//	}
//	defer file.Close()
//
//	tempPath := filepath.Join(tempDir, header.Filename)
//	out, err := os.Create(tempPath)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao salvar arquivo:", err)
//		http.Error(w, "Erro ao salvar arquivo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//	defer out.Close()
//
//	if _, err := io.Copy(out, file); err != nil {
//		log.Println("[UploadHandler] Erro ao gravar conteúdo:", err)
//		http.Error(w, "Erro ao gravar conteúdo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	customID := r.URL.Query().Get("custom")
//	app, err := services.HandleDeploy(tempPath, username, plan, customID)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao realizar deploy:", err)
//
//		if err.Error() != "" && (err.Error()[0:15] == "deploy bloqueado") {
//			http.Error(w, err.Error(), http.StatusForbidden)
//			return
//		}
//
//		http.Error(w, "Erro ao realizar deploy: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	_ = os.Remove(tempPath)
//
//	log.Println("🚀 Deploy concluído para:", app.ID)
//	utils.WriteJSON(w, map[string]interface{}{
//		"message": "Upload e deploy concluídos",
//		"app":     app,
//	})
//}

//package routes
//
//import (
//	"fmt"
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"path/filepath"
//
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//)
//
//func UploadHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	log.Println("📦 Recebendo upload ZIP para deploy...")
//
//	plan := r.URL.Query().Get("plan")
//	if plan == "" {
//		http.Error(w, "Parâmetro 'plan' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	username, _ := middleware.GetUserFromContext(r)
//
//	tempDir := fmt.Sprintf("storage/users/%s/uploads", username)
//
//	//tempDir := "./uploads"
//	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
//		log.Println("[UploadHandler] Erro ao criar diretório:", err)
//		http.Error(w, "Erro ao criar diretório temporário: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	file, header, err := r.FormFile("file")
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao processar arquivo:", err)
//		http.Error(w, "Erro ao processar arquivo: "+err.Error(), http.StatusBadRequest)
//		return
//	}
//	defer file.Close()
//
//	tempPath := filepath.Join(tempDir, header.Filename)
//	out, err := os.Create(tempPath)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao salvar arquivo:", err)
//		http.Error(w, "Erro ao salvar arquivo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//	defer out.Close()
//	if _, err := io.Copy(out, file); err != nil {
//		log.Println("[UploadHandler] Erro ao gravar conteúdo:", err)
//		http.Error(w, "Erro ao gravar conteúdo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	customID := r.URL.Query().Get("custom")
//	app, err := services.HandleDeploy(tempPath, username, plan, customID)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao realizar deploy:", err)
//		http.Error(w, "Erro ao realizar deploy: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	_ = os.Remove(tempPath)
//
//	log.Println("🚀 Deploy concluído para:", app.ID)
//	utils.WriteJSON(w, map[string]interface{}{
//		"message": "Upload e deploy concluídos",
//		"app":     app,
//	})
//}

//package routes
//
//import (
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"path/filepath"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//)
//
//func UploadHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	log.Println("📦 Recebendo upload ZIP para deploy...")
//
//	// Extrai o ID do plano (?plan=pro)
//	plan := r.URL.Query().Get("plan")
//	if plan == "" {
//		http.Error(w, "Parâmetro 'plan' é obrigatório", http.StatusBadRequest)
//		return
//	}
//
//	// Cria a pasta temporária se não existir
//	tempDir := "./uploads"
//	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
//		log.Println("[UploadHandler] Erro ao criar arquivo:", err)
//		http.Error(w, "Erro ao criar diretório temporário: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	// Processa o arquivo recebido
//	file, header, err := r.FormFile("file")
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao criar arquivo:", err)
//		http.Error(w, "Erro ao processar arquivo: "+err.Error(), http.StatusBadRequest)
//		return
//	}
//	defer file.Close()
//
//	// Caminho completo para salvar o arquivo temporário
//	tempPath := filepath.Join(tempDir, header.Filename)
//	out, err := os.Create(tempPath)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao criar arquivo:", err)
//		http.Error(w, "Erro ao salvar arquivo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//	defer out.Close()
//	if _, err := io.Copy(out, file); err != nil {
//		log.Println("[UploadHandler] Erro ao criar arquivo:", err)
//		http.Error(w, "Erro ao gravar conteúdo: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	// Gera ID personalizado se informado (?custom=myapp)
//	customID := r.URL.Query().Get("custom")
//	app, err := services.HandleDeploy(tempPath, plan, customID)
//	if err != nil {
//		log.Println("[UploadHandler] Erro ao criar arquivo:", err)
//		http.Error(w, "Erro ao realizar deploy: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	// (Opcional) Remove o arquivo temporário após deploy
//	_ = os.Remove(tempPath)
//
//	log.Println("🚀 Deploy concluído para:", app.ID)
//	utils.WriteJSON(w, map[string]interface{}{
//		"message": "Upload e deploy concluídos",
//		"app":     app,
//	})
//}
//
