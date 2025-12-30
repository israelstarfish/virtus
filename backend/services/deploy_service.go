//backend/services/deploy_service.go

package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"time"

	"virtuscloud/backend/limits"
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

var AppStore = make(map[string]*models.App)

// 🚀 Deploy a partir de um arquivo ZIP
func HandleDeploy(zipPath, username, plan, customID string) (*models.App, error) {
	if !isValidIdentifier(plan) || (customID != "" && !isValidIdentifier(customID)) {
		return nil, fmt.Errorf("identificador inválido: plan='%s', customID='%s'", plan, customID)
	}

	var appID string
	if customID != "" {
		appID = customID // ✅ usa apenas o ID fornecido
		//appID = fmt.Sprintf("%s-%s", plan, customID)
	} else {
		//appID = fmt.Sprintf("%s-%d", plan, GenerateID())
		rawID := GenerateID()
		appID = fmt.Sprintf("%d", rawID) // sem plano
	}

	if AppIDExists(appID) {
		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
	}

	Log(appID, username, plan, "🚀 Iniciando deploy da aplicação")

	extractPath := filepath.Join("storage", "users", username, plan, "apps", appID)
	if err := utils.ExtractZip(zipPath, extractPath); err != nil {
		Log(appID, username, plan, "❌ Falha ao extrair ZIP")
		return nil, err
	}
	Log(appID, username, plan, "📦 ZIP extraído com sucesso")

	return handleDeployCommon(extractPath, username, plan, appID)
}

// 🚀 Deploy direto de uma pasta já existente (sem ZIP)
func HandleDeployFromFolder(folderPath, username, plan, appID string) (*models.App, error) {
	if !isValidIdentifier(plan) || !isValidIdentifier(appID) {
		return nil, fmt.Errorf("identificador inválido: plan='%s', appID='%s'", plan, appID)
	}

	if AppIDExists(appID) {
		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
	}

	Log(appID, username, plan, "🚀 Iniciando deploy direto da pasta")

	return handleDeployCommon(folderPath, username, plan, appID)
}

// 🔁 Lógica compartilhada entre ZIP e pasta // HYBRID
func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
	// ✅ Cria flag de deploy incompleto ANTES da verificação
	flagPath := filepath.Join(path, "incomplete.flag")
	_ = os.WriteFile(flagPath, []byte("deploy em andamento"), 0644)
	Log(appID, username, plan, "🚧 Flag 'incomplete.flag' criado para controle de deploy")

	// ✅ Verifica se o usuário pode fazer deploy conforme o plano
	user := store.UserStore[username]
	if user == nil {
		Log(appID, username, plan, "❌ Usuário não encontrado para verificação de plano")
		return nil, fmt.Errorf("usuário não encontrado")
	}

	// ✅ Corrigido: passa username e plano como string
	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
		Log(appID, username, plan, "❌ Deploy bloqueado por limite de plano: "+err.Error())
		return nil, fmt.Errorf("deploy bloqueado: %v", err)
	}

	entryPoints, err := DetectEntryPoint(path)
	if err != nil {
		Log(appID, username, plan, "❌ Erro ao detectar entry point")
		return nil, err
	}

	if len(entryPoints) == 0 {
		Log(appID, username, plan, "❌ Nenhum entry point detectado — verifique se há arquivos como Main.java, index.js, etc.")
		return nil, fmt.Errorf("nenhum entry point detectado")
	}
	selectedEntry := entryPoints[0]

	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))

	runtimeType := DetectRuntime(filepath.Join(path, selectedEntry))
	visualRuntime := DetectVisualRuntime(filepath.Join(path, selectedEntry)) // para o frontend

	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtimeType))

	SyncDependencies(runtimeType, path, username, plan)

	if err := LinkRuntime(runtimeType, path); err != nil {
		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
	} else {
		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
	}

	config := map[string]string{
		"entry":   selectedEntry,
		"runtime": runtimeType,
	}
	configData, _ := json.MarshalIndent(config, "", "  ")
	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
	Log(appID, username, plan, "📝 Arquivo config.json gerado")

	// 🔗 Symlink/junction híbrido
	userSymlink := filepath.Join("storage", "users", username, "current-app")
	_ = os.MkdirAll(filepath.Dir(userSymlink), os.ModePerm)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		Log(appID, username, plan, fmt.Sprintf("⚠️ Pasta da aplicação '%s' ainda não existe. Abortando criação do atalho.", path))
		return nil, fmt.Errorf("pasta da aplicação não encontrada: %s", path)
	}

	_ = os.Remove(userSymlink)

	if runtime.GOOS == "windows" {
		cmd := exec.Command("cmd", "/C", "mklink", "/J", userSymlink, path)
		if err := cmd.Run(); err != nil {
			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao criar junction no Windows: %v", err))
		} else {
			Log(appID, username, plan, "🔗 Junction 'current-app' criado com sucesso em "+userSymlink)
		}
	} else {
		if err := os.Symlink(path, userSymlink); err != nil {
			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", userSymlink, err))
		} else {
			Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+userSymlink)
		}
	}

	dockerContent, err := LoadDockerTemplate(runtimeType, selectedEntry)
	if err != nil {
		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
	} else {
		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
	}

	app := &models.App{
		ID:            appID,
		Username:      username,
		Runtime:       visualRuntime, // este é o que será salvo no JSON //runtimeType,
		Path:          path,
		Entry:         selectedEntry,
		Plan:          plan,
		Status:        models.StatusRunning,
		ContainerName: fmt.Sprintf("%s-%s", username, appID), // ✅ Adicionado
	}

	store.SaveApp(app)
	//app := &models.App{
	//	ID:       appID,
	//	Username: username,
	//	Runtime:  runtimeType,
	//	Path:     path,
	//	Entry:    selectedEntry,
	//	Plan:     plan,
	//	Status:   models.StatusRunning, // ✅ define como ativo
	//}
	//
	//store.SaveApp(app) // ✅ salva no AppStore global
	//app := &models.App{
	//	ID:       appID,
	//	Username: username,
	//	Runtime:  runtimeType,
	//	Path:     path,
	//	Entry:    selectedEntry,
	//	Plan:     plan,
	//}
	//AppStore[appID] = app

	Log(appID, username, plan, "✅ Deploy concluído com sucesso")

	// ✅ Remove flag após deploy bem-sucedido
	_ = os.Remove(flagPath)
	Log(appID, username, plan, "✅ Flag 'incomplete.flag' removido após deploy")

	buildAndCreateContainer(app)

	return app, nil
}

// 🛠️ Build da imagem e criação do container
func buildAndCreateContainer(app *models.App) {
	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)

	buildSucceeded := false // ✅ Flag para controlar se a build foi bem-sucedida

	for {
		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", imageName, app.Path)
		out, err := buildCmd.CombinedOutput()
		cancel()

		if err == nil {
			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
			buildSucceeded = true
			break
		}

		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no buildx: %v\nSaída: %s", err, string(out)))

		// 🧪 Fallback para build simples
		Log(app.ID, app.Username, app.Plan, "🔁 Tentando build simples como fallback...")
		ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
		buildCmd = exec.CommandContext(ctx, "docker", "build", "-t", imageName, app.Path)
		out, err = buildCmd.CombinedOutput()
		cancel()

		if err == nil {
			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com build simples")
			buildSucceeded = true
			break
		}

		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build simples: %v\nSaída: %s", err, string(out)))

		// ⏳ Espera até Docker estar ativo
		for {
			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
			if exec.Command("docker", "info").Run() == nil {
				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
				break
			}
			time.Sleep(10 * time.Second)
		}

		time.Sleep(10 * time.Second)
	}

	// 🔐 Recupera token da sessão do usuário via arquivo
	session, ok := models.GetSessionByTokenFromUsername(app.Username)
	if !ok || session.Token == "" {
		Log(app.ID, app.Username, app.Plan, "❌ Token ausente — container não será criado")
		app.Logs = append(app.Logs, "❌ Token ausente — container não criado")
		return
	}
	token := session.Token

	// 🐳 Criação do container via função centralizada — somente se a build foi bem-sucedida
	if buildSucceeded {
		app.ContainerName = containerName
		err := CreateContainerFromApp(app, token)
		if err != nil {
			Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
			app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
		} else {
			Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
			app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso")

			// 🧹 Remove a pasta da aplicação após deploy
			err = os.RemoveAll(app.Path)
			if err != nil {
				Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Erro ao remover pasta da aplicação: %v", err))
				app.Logs = append(app.Logs, "⚠️ Erro ao remover pasta da aplicação: "+err.Error())
			} else {
				Log(app.ID, app.Username, app.Plan, "🧹 Pasta da aplicação removida após deploy")
				app.Logs = append(app.Logs, "🧹 Pasta da aplicação removida após deploy")
			}
		}
	} else {
		Log(app.ID, app.Username, app.Plan, "⚠️ Build falhou — container não criado e pasta preservada")
		app.Logs = append(app.Logs, "⚠️ Build falhou — container não criado e pasta preservada")
	}
}

// 🔍 Validação de identificadores
func isValidIdentifier(id string) bool {
	valid := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	return valid.MatchString(id)
}

// 🔢 Geração de ID único
func GenerateID() int64 {
	return time.Now().UnixNano()
}

// 🔎 Verifica se o App já existe
func AppIDExists(appID string) bool {
	_, exists := AppStore[appID]
	return exists
}

// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", imageName, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no buildx: %v\nSaída: %s", err, string(out)))
//
//		// 🧪 Fallback para build simples
//		Log(app.ID, app.Username, app.Plan, "🔁 Tentando build simples como fallback...")
//		ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd = exec.CommandContext(ctx, "docker", "build", "-t", imageName, app.Path)
//		out, err = buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com build simples")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build simples: %v\nSaída: %s", err, string(out)))
//
//		// ⏳ Espera até Docker estar ativo
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(app.Username)
//	if !ok || session.Token == "" {
//		Log(app.ID, app.Username, app.Plan, "❌ Token ausente — container não será criado")
//		app.Logs = append(app.Logs, "❌ Token ausente — container não criado")
//		return
//	}
//	token := session.Token
//
//	// 🐳 Criação do container via função centralizada
//	app.ContainerName = containerName
//	err := CreateContainerFromApp(app, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//		app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//		app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso")
//		// 🧹 Remove a pasta da aplicação após deploy
//		err = os.RemoveAll(app.Path)
//		if err != nil {
//			Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Erro ao remover pasta da aplicação: %v", err))
//			app.Logs = append(app.Logs, "⚠️ Erro ao remover pasta da aplicação: "+err.Error())
//		} else {
//			Log(app.ID, app.Username, app.Plan, "🧹 Pasta da aplicação removida após deploy")
//			app.Logs = append(app.Logs, "🧹 Pasta da aplicação removida após deploy")
//		}
//
//	}
//}

// services/deploy_service.go

//package services
//
//import (
//	"context"
//	"encoding/json"
//	"fmt"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"regexp"
//	"runtime"
//	"time"
//
//	"virtuscloud/backend/limits"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//var AppStore = make(map[string]*models.App)
//
//// 🚀 Deploy a partir de um arquivo ZIP
//func HandleDeploy(zipPath, username, plan, customID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || (customID != "" && !isValidIdentifier(customID)) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', customID='%s'", plan, customID)
//	}
//
//	var appID string
//	if customID != "" {
//		appID = customID // ✅ usa apenas o ID fornecido
//		//appID = fmt.Sprintf("%s-%s", plan, customID)
//	} else {
//		//appID = fmt.Sprintf("%s-%d", plan, GenerateID())
//		rawID := GenerateID()
//		appID = fmt.Sprintf("%d", rawID) // sem plano
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, username, plan, "🚀 Iniciando deploy da aplicação")
//
//	extractPath := filepath.Join("storage", "users", username, plan, "apps", appID)
//	if err := utils.ExtractZip(zipPath, extractPath); err != nil {
//		Log(appID, username, plan, "❌ Falha ao extrair ZIP")
//		return nil, err
//	}
//	Log(appID, username, plan, "📦 ZIP extraído com sucesso")
//
//	return handleDeployCommon(extractPath, username, plan, appID)
//}
//
//// 🚀 Deploy direto de uma pasta já existente (sem ZIP)
//func HandleDeployFromFolder(folderPath, username, plan, appID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || !isValidIdentifier(appID) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', appID='%s'", plan, appID)
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, username, plan, "🚀 Iniciando deploy direto da pasta")
//
//	return handleDeployCommon(folderPath, username, plan, appID)
//}
//
//// 🔁 Lógica compartilhada entre ZIP e pasta // HYBRID
//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	// ✅ Cria flag de deploy incompleto ANTES da verificação
//	flagPath := filepath.Join(path, "incomplete.flag")
//	_ = os.WriteFile(flagPath, []byte("deploy em andamento"), 0644)
//	Log(appID, username, plan, "🚧 Flag 'incomplete.flag' criado para controle de deploy")
//
//	// ✅ Verifica se o usuário pode fazer deploy conforme o plano
//	user := store.UserStore[username]
//	if user == nil {
//		Log(appID, username, plan, "❌ Usuário não encontrado para verificação de plano")
//		return nil, fmt.Errorf("usuário não encontrado")
//	}
//
//	// ✅ Corrigido: passa username e plano como string
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		Log(appID, username, plan, "❌ Deploy bloqueado por limite de plano: "+err.Error())
//		return nil, fmt.Errorf("deploy bloqueado: %v", err)
//	}
//
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtimeType := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtimeType))
//
//	SyncDependencies(runtimeType, path, username, plan)
//
//	if err := LinkRuntime(runtimeType, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtimeType,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//
//	// 🔗 Symlink/junction híbrido
//	userSymlink := filepath.Join("storage", "users", username, "current-app")
//	_ = os.MkdirAll(filepath.Dir(userSymlink), os.ModePerm)
//
//	if _, err := os.Stat(path); os.IsNotExist(err) {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Pasta da aplicação '%s' ainda não existe. Abortando criação do atalho.", path))
//		return nil, fmt.Errorf("pasta da aplicação não encontrada: %s", path)
//	}
//
//	_ = os.Remove(userSymlink)
//
//	if runtime.GOOS == "windows" {
//		cmd := exec.Command("cmd", "/C", "mklink", "/J", userSymlink, path)
//		if err := cmd.Run(); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao criar junction no Windows: %v", err))
//		} else {
//			Log(appID, username, plan, "🔗 Junction 'current-app' criado com sucesso em "+userSymlink)
//		}
//	} else {
//		if err := os.Symlink(path, userSymlink); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", userSymlink, err))
//		} else {
//			Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+userSymlink)
//		}
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtimeType, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:            appID,
//		Username:      username,
//		Runtime:       runtimeType,
//		Path:          path,
//		Entry:         selectedEntry,
//		Plan:          plan,
//		Status:        models.StatusRunning,
//		ContainerName: fmt.Sprintf("%s-%s", username, appID), // ✅ Adicionado
//	}
//
//	store.SaveApp(app)
//	//app := &models.App{
//	//	ID:       appID,
//	//	Username: username,
//	//	Runtime:  runtimeType,
//	//	Path:     path,
//	//	Entry:    selectedEntry,
//	//	Plan:     plan,
//	//	Status:   models.StatusRunning, // ✅ define como ativo
//	//}
//	//
//	//store.SaveApp(app) // ✅ salva no AppStore global
//	//app := &models.App{
//	//	ID:       appID,
//	//	Username: username,
//	//	Runtime:  runtimeType,
//	//	Path:     path,
//	//	Entry:    selectedEntry,
//	//	Plan:     plan,
//	//}
//	//AppStore[appID] = app
//
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//
//	// ✅ Remove flag após deploy bem-sucedido
//	_ = os.Remove(flagPath)
//	Log(appID, username, plan, "✅ Flag 'incomplete.flag' removido após deploy")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}
//
//// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", imageName, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no buildx: %v\nSaída: %s", err, string(out)))
//
//		// 🧪 Fallback para build simples
//		Log(app.ID, app.Username, app.Plan, "🔁 Tentando build simples como fallback...")
//		ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd = exec.CommandContext(ctx, "docker", "build", "-t", imageName, app.Path)
//		out, err = buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com build simples")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build simples: %v\nSaída: %s", err, string(out)))
//
//		// ⏳ Espera até Docker estar ativo
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(app.Username)
//	if !ok || session.Token == "" {
//		Log(app.ID, app.Username, app.Plan, "❌ Token ausente — container não será criado")
//		app.Logs = append(app.Logs, "❌ Token ausente — container não criado")
//		return
//	}
//	token := session.Token
//
//	// 🐳 Criação do container via função centralizada
//	app.ContainerName = containerName
//	err := CreateContainerFromApp(app, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//		app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//		app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso")
//		// 🧹 Remove a pasta da aplicação após deploy
//		err = os.RemoveAll(app.Path)
//		if err != nil {
//			Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Erro ao remover pasta da aplicação: %v", err))
//			app.Logs = append(app.Logs, "⚠️ Erro ao remover pasta da aplicação: "+err.Error())
//		} else {
//			Log(app.ID, app.Username, app.Plan, "🧹 Pasta da aplicação removida após deploy")
//			app.Logs = append(app.Logs, "🧹 Pasta da aplicação removida após deploy")
//		}
//
//	}
//}
//
//// 🔍 Validação de identificadores
//func isValidIdentifier(id string) bool {
//	valid := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
//	return valid.MatchString(id)
//}
//
//// 🔢 Geração de ID único
//func GenerateID() int64 {
//	return time.Now().UnixNano()
//}
//
//// 🔎 Verifica se o App já existe
//func AppIDExists(appID string) bool {
//	_, exists := AppStore[appID]
//	return exists
//}

// services/deploy_service.go

//package services
//
//import (
//	"context"
//	"encoding/json"
//	"fmt"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"regexp"
//	"runtime"
//	"time"
//
//	"virtuscloud/backend/limits"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//var AppStore = make(map[string]*models.App)
//
//// 🚀 Deploy a partir de um arquivo ZIP
//func HandleDeploy(zipPath, username, plan, customID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || (customID != "" && !isValidIdentifier(customID)) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', customID='%s'", plan, customID)
//	}
//
//	var appID string
//	if customID != "" {
//		appID = customID // ✅ usa apenas o ID fornecido
//		//appID = fmt.Sprintf("%s-%s", plan, customID)
//	} else {
//		//appID = fmt.Sprintf("%s-%d", plan, GenerateID())
//		rawID := GenerateID()
//		appID = fmt.Sprintf("%d", rawID) // sem plano
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, username, plan, "🚀 Iniciando deploy da aplicação")
//
//	extractPath := filepath.Join("storage", "users", username, plan, "apps", appID)
//	if err := utils.ExtractZip(zipPath, extractPath); err != nil {
//		Log(appID, username, plan, "❌ Falha ao extrair ZIP")
//		return nil, err
//	}
//	Log(appID, username, plan, "📦 ZIP extraído com sucesso")
//
//	return handleDeployCommon(extractPath, username, plan, appID)
//}
//
//// 🚀 Deploy direto de uma pasta já existente (sem ZIP)
//func HandleDeployFromFolder(folderPath, username, plan, appID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || !isValidIdentifier(appID) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', appID='%s'", plan, appID)
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, username, plan, "🚀 Iniciando deploy direto da pasta")
//
//	return handleDeployCommon(folderPath, username, plan, appID)
//}
//
//// 🔁 Lógica compartilhada entre ZIP e pasta // HYBRID
//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	// ✅ Cria flag de deploy incompleto ANTES da verificação
//	flagPath := filepath.Join(path, "incomplete.flag")
//	_ = os.WriteFile(flagPath, []byte("deploy em andamento"), 0644)
//	Log(appID, username, plan, "🚧 Flag 'incomplete.flag' criado para controle de deploy")
//
//	// ✅ Verifica se o usuário pode fazer deploy conforme o plano
//	user := store.UserStore[username]
//	if user == nil {
//		Log(appID, username, plan, "❌ Usuário não encontrado para verificação de plano")
//		return nil, fmt.Errorf("usuário não encontrado")
//	}
//
//	// ✅ Corrigido: passa username e plano como string
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		Log(appID, username, plan, "❌ Deploy bloqueado por limite de plano: "+err.Error())
//		return nil, fmt.Errorf("deploy bloqueado: %v", err)
//	}
//
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtimeType := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtimeType))
//
//	SyncDependencies(runtimeType, path, username, plan)
//
//	if err := LinkRuntime(runtimeType, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtimeType,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//
//	// 🔗 Symlink/junction híbrido
//	userSymlink := filepath.Join("storage", "users", username, "current-app")
//	_ = os.MkdirAll(filepath.Dir(userSymlink), os.ModePerm)
//
//	if _, err := os.Stat(path); os.IsNotExist(err) {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Pasta da aplicação '%s' ainda não existe. Abortando criação do atalho.", path))
//		return nil, fmt.Errorf("pasta da aplicação não encontrada: %s", path)
//	}
//
//	_ = os.Remove(userSymlink)
//
//	if runtime.GOOS == "windows" {
//		cmd := exec.Command("cmd", "/C", "mklink", "/J", userSymlink, path)
//		if err := cmd.Run(); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao criar junction no Windows: %v", err))
//		} else {
//			Log(appID, username, plan, "🔗 Junction 'current-app' criado com sucesso em "+userSymlink)
//		}
//	} else {
//		if err := os.Symlink(path, userSymlink); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", userSymlink, err))
//		} else {
//			Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+userSymlink)
//		}
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtimeType, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:            appID,
//		Username:      username,
//		Runtime:       runtimeType,
//		Path:          path,
//		Entry:         selectedEntry,
//		Plan:          plan,
//		Status:        models.StatusRunning,
//		ContainerName: fmt.Sprintf("%s-%s", username, appID), // ✅ Adicionado
//	}
//
//	store.SaveApp(app)
//	//app := &models.App{
//	//	ID:       appID,
//	//	Username: username,
//	//	Runtime:  runtimeType,
//	//	Path:     path,
//	//	Entry:    selectedEntry,
//	//	Plan:     plan,
//	//	Status:   models.StatusRunning, // ✅ define como ativo
//	//}
//	//
//	//store.SaveApp(app) // ✅ salva no AppStore global
//	//app := &models.App{
//	//	ID:       appID,
//	//	Username: username,
//	//	Runtime:  runtimeType,
//	//	Path:     path,
//	//	Entry:    selectedEntry,
//	//	Plan:     plan,
//	//}
//	//AppStore[appID] = app
//
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//
//	// ✅ Remove flag após deploy bem-sucedido
//	_ = os.Remove(flagPath)
//	Log(appID, username, plan, "✅ Flag 'incomplete.flag' removido após deploy")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}
//
//// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", imageName, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no buildx: %v\nSaída: %s", err, string(out)))
//
//		// 🧪 Fallback para build simples
//		Log(app.ID, app.Username, app.Plan, "🔁 Tentando build simples como fallback...")
//		ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd = exec.CommandContext(ctx, "docker", "build", "-t", imageName, app.Path)
//		out, err = buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com build simples")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build simples: %v\nSaída: %s", err, string(out)))
//
//		// ⏳ Espera até Docker estar ativo
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(app.Username)
//	if !ok || session.Token == "" {
//		Log(app.ID, app.Username, app.Plan, "❌ Token ausente — container não será criado")
//		app.Logs = append(app.Logs, "❌ Token ausente — container não criado")
//		return
//	}
//	token := session.Token
//
//	// 🐳 Criação do container via função centralizada
//	app.ContainerName = containerName
//	err := CreateContainerFromApp(app, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//		app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//		app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso")
//		// 🧹 Remove a pasta da aplicação após deploy
//		err = os.RemoveAll(app.Path)
//		if err != nil {
//			Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Erro ao remover pasta da aplicação: %v", err))
//			app.Logs = append(app.Logs, "⚠️ Erro ao remover pasta da aplicação: "+err.Error())
//		} else {
//			Log(app.ID, app.Username, app.Plan, "🧹 Pasta da aplicação removida após deploy")
//			app.Logs = append(app.Logs, "🧹 Pasta da aplicação removida após deploy")
//		}
//
//	}
//}
//
//// 🔍 Validação de identificadores
//func isValidIdentifier(id string) bool {
//	valid := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
//	return valid.MatchString(id)
//}
//
//// 🔢 Geração de ID único
//func GenerateID() int64 {
//	return time.Now().UnixNano()
//}
//
//// 🔎 Verifica se o App já existe
//func AppIDExists(appID string) bool {
//	_, exists := AppStore[appID]
//	return exists
//}

// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", imageName, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no buildx: %v\nSaída: %s", err, string(out)))
//
//		// 🧪 Fallback para build simples
//		Log(app.ID, app.Username, app.Plan, "🔁 Tentando build simples como fallback...")
//		ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd = exec.CommandContext(ctx, "docker", "build", "-t", imageName, app.Path)
//		out, err = buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com build simples")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build simples: %v\nSaída: %s", err, string(out)))
//
//		// ⏳ Espera até Docker estar ativo
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(app.Username)
//	if !ok || session.Token == "" {
//		Log(app.ID, app.Username, app.Plan, "❌ Token ausente — container não será criado")
//		app.Logs = append(app.Logs, "❌ Token ausente — container não criado")
//		return
//	}
//	token := session.Token
//
//	// 🐳 Criação do container via função centralizada
//	app.ContainerName = containerName
//	err := CreateContainerFromApp(app, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//		app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//		app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso")
//	}
//}

// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", imageName, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no buildx: %v\nSaída: %s", err, string(out)))
//
//		// 🧪 Fallback para build simples
//		Log(app.ID, app.Username, app.Plan, "🔁 Tentando build simples como fallback...")
//		ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd = exec.CommandContext(ctx, "docker", "build", "-t", imageName, app.Path)
//		out, err = buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com build simples")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build simples: %v\nSaída: %s", err, string(out)))
//
//		// ⏳ Espera até Docker estar ativo
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(app.Username)
//	if !ok || session.Token == "" {
//		Log(app.ID, app.Username, app.Plan, "❌ Token ausente — container não será criado")
//		app.Logs = append(app.Logs, "❌ Token ausente — container não criado")
//		return
//	}
//	token := session.Token
//
//	// 🐳 Criação do container via função centralizada
//	app.ContainerName = containerName
//	err := CreateContainerFromApp(app, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//		app.Logs = append(app.Logs, "⚠️ Falha ao criar container: "+err.Error())
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//		// 📦 Compacta a pasta da aplicação e salva como snapshot
//		snapshotPath := filepath.Join("storage", "users", app.Username, app.Plan, "snapshots", app.ID+".zip")
//		err := utils.ZipFolder(app.Path, snapshotPath)
//		if err != nil {
//			Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro ao compactar pasta da aplicação: %v", err))
//			app.Logs = append(app.Logs, "❌ Erro ao gerar snapshot: "+err.Error())
//		} else {
//			Log(app.ID, app.Username, app.Plan, "📦 Snapshot salvo em: "+snapshotPath)
//			app.Logs = append(app.Logs, "📦 Snapshot salvo em: "+snapshotPath)
//
//			// 🧹 Remove a pasta original
//			err = os.RemoveAll(app.Path)
//			if err != nil {
//				Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Erro ao remover pasta original: %v", err))
//				app.Logs = append(app.Logs, "⚠️ Erro ao remover pasta original: "+err.Error())
//			} else {
//				Log(app.ID, app.Username, app.Plan, "🧹 Pasta original removida após snapshot")
//				app.Logs = append(app.Logs, "🧹 Pasta original removida após snapshot")
//			}
//		}
//		app.Logs = append(app.Logs, "🐳 Container Docker criado com sucesso")
//	}
//}

//func buildAndCreateContainer(app *models.App) {
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", app.ID, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build: %v\nSaída: %s", err, string(out)))
//
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	// ✅ Nome do container: username + appID
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	payload := map[string]string{
//		"name":  containerName,
//		"image": app.ID, // manter app.ID como imagem por enquanto
//	}
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(app.Username)
//	token := ""
//	if ok {
//		token = session.Token
//	}
//
//	Log(app.ID, app.Username, app.Plan, fmt.Sprintf("📦 Criando container: %s com imagem: %s", containerName, app.ID))
//	Log(app.ID, app.Username, app.Plan, fmt.Sprintf("🔐 Token usado: %s", token))
//	err := CallContainerCreation(payload, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//	}
//}

// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", app.ID, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build: %v\nSaída: %s", err, string(out)))
//
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	payload := map[string]string{
//		"name":  app.ID,
//		"image": app.ID,
//	}
//
//	// 🔐 Recupera token da sessão do usuário via arquivo
//	session, ok := models.GetSessionByTokenFromUsername(app.Username)
//	token := ""
//	if ok {
//		token = session.Token
//	}
//
//	Log(app.ID, app.Username, app.Plan, fmt.Sprintf("🔐 Token usado: %s", token))
//	err := CallContainerCreation(payload, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//	}
//}

//func buildAndCreateContainer(app *models.App) {
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", app.ID, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build: %v\nSaída: %s", err, string(out)))
//
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	payload := map[string]string{
//		"name":  app.ID,
//		"image": app.ID,
//	}
//
//	// 🔐 Recupera token da sessão do usuário para autenticação
//	token := ""
//	if session, ok := store.SessionStore[app.Username]; ok {
//		token = session.Token
//	}
//	Log(app.ID, app.Username, app.Plan, fmt.Sprintf("🔐 Token usado: %s", token))
//	err := CallContainerCreation(payload, token)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//	}
//}

// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "buildx", "build", "-t", app.ID, app.Path)
//		out, err := buildCmd.CombinedOutput()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Erro no build: %v\nSaída: %s", err, string(out)))
//
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	payload := map[string]string{
//		"name":  app.ID,
//		"image": app.ID,
//	}
//	err := CallContainerCreation(payload)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//	}
//}

// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	for {
//		Log(app.ID, app.Username, app.Plan, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "build", "-t", app.ID, app.Path)
//		err := buildCmd.Run()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, app.Username, app.Plan, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("❌ Build da imagem Docker falhou: %v", err))
//
//		for {
//			Log(app.ID, app.Username, app.Plan, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, app.Username, app.Plan, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	payload := map[string]string{
//		"name":  app.ID,
//		"image": app.ID,
//	}
//	err := CallContainerCreation(payload)
//	if err != nil {
//		Log(app.ID, app.Username, app.Plan, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//	} else {
//		Log(app.ID, app.Username, app.Plan, "🐳 Container Docker criado com sucesso")
//	}
//}

// 🔁 Lógica compartilhada entre ZIP e pasta // HYBRID
//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	// ✅ Verifica se o usuário pode fazer deploy conforme o plano
//	user := store.UserStore[username]
//	if user == nil {
//		Log(appID, username, plan, "❌ Usuário não encontrado para verificação de plano")
//		return nil, fmt.Errorf("usuário não encontrado")
//	}
//
//	// ✅ Corrigido: passa username e plano como string
//	if err := limits.IsUserEligibleForDeploy(username, plan); err != nil {
//		Log(appID, username, plan, "❌ Deploy bloqueado por limite de plano: "+err.Error())
//		return nil, fmt.Errorf("deploy bloqueado: %v", err)
//	}
//
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtimeType := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtimeType))
//
//	SyncDependencies(runtimeType, path, username, plan)
//
//	if err := LinkRuntime(runtimeType, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtimeType,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//
//	// 🔗 Symlink/junction híbrido
//	userSymlink := filepath.Join("storage", "users", username, "current-app")
//	_ = os.MkdirAll(filepath.Dir(userSymlink), os.ModePerm)
//
//	if _, err := os.Stat(path); os.IsNotExist(err) {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Pasta da aplicação '%s' ainda não existe. Abortando criação do atalho.", path))
//		return nil, fmt.Errorf("pasta da aplicação não encontrada: %s", path)
//	}
//
//	_ = os.Remove(userSymlink)
//
//	if runtime.GOOS == "windows" {
//		cmd := exec.Command("cmd", "/C", "mklink", "/J", userSymlink, path)
//		if err := cmd.Run(); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao criar junction no Windows: %v", err))
//		} else {
//			Log(appID, username, plan, "🔗 Junction 'current-app' criado com sucesso em "+userSymlink)
//		}
//	} else {
//		if err := os.Symlink(path, userSymlink); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", userSymlink, err))
//		} else {
//			Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+userSymlink)
//		}
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtimeType, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtimeType,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}

// 🔁 Lógica compartilhada entre ZIP e pasta // HYBRID
//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	// ✅ Verifica se o usuário pode fazer deploy conforme o plano
//	user := store.UserStore[username]
//	if user == nil {
//		Log(appID, username, plan, "❌ Usuário não encontrado para verificação de plano")
//		return nil, fmt.Errorf("usuário não encontrado")
//	}
//
//	if err := limits.IsUserEligibleForDeploy(strconv.Itoa(user.ID)); err != nil {
//		Log(appID, username, plan, "❌ Deploy bloqueado por limite de plano: "+err.Error())
//		return nil, fmt.Errorf("deploy bloqueado: %v", err)
//	}
//
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtimeType := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtimeType))
//
//	SyncDependencies(runtimeType, path, username, plan)
//
//	if err := LinkRuntime(runtimeType, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtimeType,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//
//	// 🔗 Symlink/junction híbrido
//	userSymlink := filepath.Join("storage", "users", username, "current-app")
//	_ = os.MkdirAll(filepath.Dir(userSymlink), os.ModePerm)
//
//	if _, err := os.Stat(path); os.IsNotExist(err) {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Pasta da aplicação '%s' ainda não existe. Abortando criação do atalho.", path))
//		return nil, fmt.Errorf("pasta da aplicação não encontrada: %s", path)
//	}
//
//	_ = os.Remove(userSymlink)
//
//	if runtime.GOOS == "windows" {
//		cmd := exec.Command("cmd", "/C", "mklink", "/J", userSymlink, path)
//		if err := cmd.Run(); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao criar junction no Windows: %v", err))
//		} else {
//			Log(appID, username, plan, "🔗 Junction 'current-app' criado com sucesso em "+userSymlink)
//		}
//	} else {
//		if err := os.Symlink(path, userSymlink); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", userSymlink, err))
//		} else {
//			Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+userSymlink)
//		}
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtimeType, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtimeType,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}

//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtimeType := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtimeType))
//
//	SyncDependencies(runtimeType, path, username, plan)
//
//	if err := LinkRuntime(runtimeType, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtimeType,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//
//	// 🔗 Symlink/junction híbrido
//	userSymlink := filepath.Join("storage", "users", username, "current-app")
//	_ = os.MkdirAll(filepath.Dir(userSymlink), os.ModePerm)
//
//	if _, err := os.Stat(path); os.IsNotExist(err) {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Pasta da aplicação '%s' ainda não existe. Abortando criação do atalho.", path))
//		return nil, fmt.Errorf("pasta da aplicação não encontrada: %s", path)
//	}
//
//	_ = os.Remove(userSymlink)
//
//	if runtime.GOOS == "windows" {
//		cmd := exec.Command("cmd", "/C", "mklink", "/J", userSymlink, path)
//		if err := cmd.Run(); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao criar junction no Windows: %v", err))
//		} else {
//			Log(appID, username, plan, "🔗 Junction 'current-app' criado com sucesso em "+userSymlink)
//		}
//	} else {
//		if err := os.Symlink(path, userSymlink); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", userSymlink, err))
//		} else {
//			Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+userSymlink)
//		}
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtimeType, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtimeType,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}

// 🔁 Lógica compartilhada entre ZIP e pasta // Windows
//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtime := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtime))
//
//	SyncDependencies(runtime, path, username, plan)
//
//	if err := LinkRuntime(runtime, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtime,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//
//	// 🔗 Symlink ou junction dentro da pasta do usuário
//	userSymlink := filepath.Join("storage", "users", username, "current-app")
//	_ = os.MkdirAll(filepath.Dir(userSymlink), os.ModePerm)
//
//	if _, err := os.Stat(path); os.IsNotExist(err) {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Pasta da aplicação '%s' ainda não existe. Abortando criação do atalho.", path))
//		return nil, fmt.Errorf("pasta da aplicação não encontrada: %s", path)
//	}
//
//	_ = os.Remove(userSymlink)
//
//	if isWindows() {
//		// Usa junction no Windows
//		cmd := exec.Command("cmd", "/C", "mklink", "/J", userSymlink, path)
//		if err := cmd.Run(); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao criar junction no Windows: %v", err))
//		} else {
//			Log(appID, username, plan, "🔗 Junction 'current-app' criado com sucesso em "+userSymlink)
//		}
//	} else {
//		// Usa symlink em sistemas Unix-like
//		if err := os.Symlink(path, userSymlink); err != nil {
//			Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", userSymlink, err))
//		} else {
//			Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+userSymlink)
//		}
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtime, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtime,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}

// 🔁 Lógica compartilhada entre ZIP e pasta // Linux

//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		//Log(appID, "❌ Erro ao detectar entry point")
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//	//Log(appID, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtime := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtime))
//	//Log(appID, fmt.Sprintf("🧠 Runtime detectado: %s", runtime))
//
//	SyncDependencies(runtime, path, username, plan)
//
//	if err := LinkRuntime(runtime, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//		//Log(appID, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//		//Log(appID, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtime,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//	//Log(appID, "📝 Arquivo config.json gerado")
//
//	_ = os.Remove("current-app")
//	if err := os.Symlink(path, "current-app"); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", err))
//		//Log(appID, fmt.Sprintf("⚠️ Erro ao atualizar symlink 'current-app': %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em ")
//		//Log(appID, "🔗 Symlink 'current-app' atualizado")
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtime, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//		//Log(appID, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//		//Log(appID, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtime,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//	//Log(appID, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}

//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, username, plan, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, username, plan, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtime := DetectRuntime(selectedEntry)
//	Log(appID, username, plan, fmt.Sprintf("🧠 Runtime detectado: %s", runtime))
//
//	SyncDependencies(runtime, path, username, plan)
//
//	if err := LinkRuntime(runtime, path); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtime,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, username, plan, "📝 Arquivo config.json gerado")
//
//	symlinkPath := filepath.Join("storage", "users", username, "current-app")
//	_ = os.Remove(symlinkPath)
//	if err := os.Symlink(path, symlinkPath); err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", symlinkPath, err))
//	} else {
//		Log(appID, username, plan, "🔗 Symlink 'current-app' atualizado em "+symlinkPath)
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtime, selectedEntry)
//	if err != nil {
//		Log(appID, username, plan, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, username, plan, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtime,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, username, plan, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}

//package services
//
//import (
//	"context"
//	"encoding/json"
//	"fmt"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"regexp"
//	"time"
//
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/utils"
//)
//
//var AppStore = make(map[string]*models.App)
//
//// 🚀 Deploy a partir de um arquivo ZIP
//func HandleDeploy(zipPath, username, plan, customID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || (customID != "" && !isValidIdentifier(customID)) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', customID='%s'", plan, customID)
//	}
//
//	var appID string
//	if customID != "" {
//		appID = fmt.Sprintf("%s-%s", plan, customID)
//	} else {
//		appID = fmt.Sprintf("%s-%d", plan, GenerateID())
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, "🚀 Iniciando deploy da aplicação")
//
//	extractPath := filepath.Join("storage", "users", username, plan, "apps", appID)
//	if err := utils.ExtractZip(zipPath, extractPath); err != nil {
//		Log(appID, "❌ Falha ao extrair ZIP")
//		return nil, err
//	}
//	Log(appID, "📦 ZIP extraído com sucesso")
//
//	return handleDeployCommon(extractPath, username, plan, appID)
//}
//
//// 🚀 Deploy direto de uma pasta já existente (sem ZIP)
//func HandleDeployFromFolder(folderPath, username, plan, appID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || !isValidIdentifier(appID) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', appID='%s'", plan, appID)
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, "🚀 Iniciando deploy direto da pasta")
//
//	return handleDeployCommon(folderPath, username, plan, appID)
//}
//
//// 🔁 Lógica compartilhada entre ZIP e pasta
//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtime := DetectRuntime(selectedEntry)
//	Log(appID, fmt.Sprintf("🧠 Runtime detectado: %s", runtime))
//
//	//SyncDependencies(runtime, path)
//
//	if err := LinkRuntime(runtime, path); err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtime,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, "📝 Arquivo config.json gerado")
//
//	// ✅ Symlink 'current-app' agora dentro da pasta do usuário
//	symlinkPath := filepath.Join("storage", "users", username, "current-app")
//	_ = os.Remove(symlinkPath)
//	if err := os.Symlink(path, symlinkPath); err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Erro ao atualizar symlink '%s': %v", symlinkPath, err))
//	} else {
//		Log(appID, "🔗 Symlink 'current-app' atualizado em "+symlinkPath)
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtime, selectedEntry)
//	if err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtime,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}
//
//// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	for {
//		Log(app.ID, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "build", "-t", app.ID, app.Path)
//		err := buildCmd.Run()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, fmt.Sprintf("❌ Build da imagem Docker falhou: %v", err))
//
//		for {
//			Log(app.ID, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		time.Sleep(10 * time.Second)
//	}
//
//	payload := map[string]string{
//		"name":  app.ID,
//		"image": app.ID,
//	}
//	err := CallContainerCreation(payload)
//	if err != nil {
//		Log(app.ID, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//	} else {
//		Log(app.ID, "🐳 Container Docker criado com sucesso")
//	}
//}
//
//// 🔍 Validação de identificadores
//func isValidIdentifier(id string) bool {
//	valid := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
//	return valid.MatchString(id)
//}
//
//// 🔢 Geração de ID único
//func GenerateID() int64 {
//	return time.Now().UnixNano()
//}
//
//// 🔎 Verifica se o App já existe
//func AppIDExists(appID string) bool {
//	_, exists := AppStore[appID]
//	return exists
//}

//func handleDeployCommon(path, username, plan, appID string) (*models.App, error) {
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtime := DetectRuntime(selectedEntry)
//	Log(appID, fmt.Sprintf("🧠 Runtime detectado: %s", runtime))
//
//	SyncDependencies(runtime, path)
//
//	if err := LinkRuntime(runtime, path); err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtime,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, "📝 Arquivo config.json gerado")
//
//	_ = os.Remove("current-app")
//	if err := os.Symlink(path, "current-app"); err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Erro ao atualizar symlink 'current-app': %v", err))
//	} else {
//		Log(appID, "🔗 Symlink 'current-app' atualizado")
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtime, selectedEntry)
//	if err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:       appID,
//		Username: username,
//		Runtime:  runtime,
//		Path:     path,
//		Entry:    selectedEntry,
//		Plan:     plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}

//package services
//
//import (
//	"context"
//	"encoding/json"
//	"fmt"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"regexp"
//	"time"
//
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/utils"
//)
//
//var AppStore = make(map[string]*models.App)
//
//// 🚀 Deploy a partir de um arquivo ZIP
//func HandleDeploy(zipPath, plan, customID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || (customID != "" && !isValidIdentifier(customID)) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', customID='%s'", plan, customID)
//	}
//
//	var appID string
//	if customID != "" {
//		appID = fmt.Sprintf("%s-%s", plan, customID)
//	} else {
//		appID = fmt.Sprintf("%s-%d", plan, GenerateID())
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, "🚀 Iniciando deploy da aplicação")
//
//	extractPath := filepath.Join("storage", "users", "apps", appID)
//	if err := utils.ExtractZip(zipPath, extractPath); err != nil {
//		Log(appID, "❌ Falha ao extrair ZIP")
//		return nil, err
//	}
//	Log(appID, "📦 ZIP extraído com sucesso")
//
//	return handleDeployCommon(extractPath, plan, appID)
//}
//
//// 🚀 Deploy direto de uma pasta já existente (sem ZIP)
//func HandleDeployFromFolder(folderPath, plan, appID string) (*models.App, error) {
//	if !isValidIdentifier(plan) || !isValidIdentifier(appID) {
//		return nil, fmt.Errorf("identificador inválido: plan='%s', appID='%s'", plan, appID)
//	}
//
//	if AppIDExists(appID) {
//		return nil, fmt.Errorf("já existe uma aplicação com o ID: %s", appID)
//	}
//
//	Log(appID, "🚀 Iniciando deploy direto da pasta")
//
//	return handleDeployCommon(folderPath, plan, appID)
//}
//
//// 🔁 Lógica compartilhada entre ZIP e pasta
//func handleDeployCommon(path, plan, appID string) (*models.App, error) {
//	entryPoints, err := DetectEntryPoint(path)
//	if err != nil {
//		Log(appID, "❌ Erro ao detectar entry point")
//		return nil, err
//	}
//
//	selectedEntry := "main"
//	if len(entryPoints) > 0 {
//		selectedEntry = entryPoints[0]
//	}
//	Log(appID, fmt.Sprintf("📁 Entry point detectado: %s", selectedEntry))
//
//	runtime := DetectRuntime(selectedEntry)
//	Log(appID, fmt.Sprintf("🧠 Runtime detectado: %s", runtime))
//
//	SyncDependencies(runtime, path)
//
//	if err := LinkRuntime(runtime, path); err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Falha ao criar symlink: %v", err))
//	} else {
//		Log(appID, "🔗 Symlink do runtime criado com sucesso")
//	}
//
//	config := map[string]string{
//		"entry":   selectedEntry,
//		"runtime": runtime,
//	}
//	configData, _ := json.MarshalIndent(config, "", "  ")
//	_ = os.WriteFile(filepath.Join(path, "config.json"), configData, 0644)
//	Log(appID, "📝 Arquivo config.json gerado")
//
//	_ = os.Remove("current-app")
//	if err := os.Symlink(path, "current-app"); err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Erro ao atualizar symlink 'current-app': %v", err))
//	} else {
//		Log(appID, "🔗 Symlink 'current-app' atualizado")
//	}
//
//	dockerContent, err := LoadDockerTemplate(runtime, selectedEntry)
//	if err != nil {
//		Log(appID, fmt.Sprintf("⚠️ Template de Dockerfile não encontrado: %v", err))
//	} else {
//		_ = os.WriteFile(filepath.Join(path, "Dockerfile"), []byte(dockerContent), 0644)
//		Log(appID, "📄 Dockerfile gerado com sucesso")
//	}
//
//	app := &models.App{
//		ID:      appID,
//		Runtime: runtime,
//		Path:    path,
//		Entry:   selectedEntry,
//		Plan:    plan,
//	}
//	AppStore[appID] = app
//
//	Log(appID, "✅ Deploy concluído com sucesso")
//
//	go buildAndCreateContainer(app)
//
//	return app, nil
//}
//
//// 🛠️ Build da imagem e criação do container
//func buildAndCreateContainer(app *models.App) {
//	for {
//		Log(app.ID, "🔨 Tentando construir imagem Docker...")
//
//		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
//		buildCmd := exec.CommandContext(ctx, "docker", "build", "-t", app.ID, app.Path)
//		err := buildCmd.Run()
//		cancel()
//
//		if err == nil {
//			Log(app.ID, "✅ Imagem Docker criada com sucesso")
//			break
//		}
//
//		Log(app.ID, fmt.Sprintf("❌ Build da imagem Docker falhou: %v", err))
//
//		// Verifica se o Docker está ativo
//		for {
//			Log(app.ID, "⏳ Verificando ativação do Docker...")
//			if exec.Command("docker", "info").Run() == nil {
//				Log(app.ID, "✅ Docker está ativo! Retentando build...")
//				break
//			}
//			time.Sleep(10 * time.Second)
//		}
//
//		// Aguarda antes de tentar novamente
//		time.Sleep(10 * time.Second)
//	}
//
//	// Criação do container após build bem-sucedido
//	payload := map[string]string{
//		"name":  app.ID,
//		"image": app.ID,
//	}
//	err := CallContainerCreation(payload)
//	if err != nil {
//		Log(app.ID, fmt.Sprintf("⚠️ Falha ao criar container: %v", err))
//	} else {
//		Log(app.ID, "🐳 Container Docker criado com sucesso")
//	}
//}
//
//// 🔍 Validação de identificadores
//func isValidIdentifier(id string) bool {
//	valid := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
//	return valid.MatchString(id)
//}
//
//// 🔢 Geração de ID único
//func GenerateID() int64 {
//	return time.Now().UnixNano()
//}
//
//// 🔎 Verifica se o App já existe
//func AppIDExists(appID string) bool {
//	_, exists := AppStore[appID]
//	return exists
//}
//
