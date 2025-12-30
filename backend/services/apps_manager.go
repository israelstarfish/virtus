//services/apps_manager.go

package services

import (
	"archive/zip"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

// 🔍 Busca aplicação pelo nome real do container
func GetAppByContainerName(name string) *models.App {
	log.Println("🔍 Buscando container:", name)

	for _, app := range store.AppStore {
		log.Printf("🔍 Comparando: app.ID=%s, app.ContainerName=%s", app.ID, app.ContainerName)
		if app.ContainerName == name || app.ID == name {
			log.Println("✅ Localizado:", app.ID)
			return app
		}
	}

	log.Println("❌ Container não encontrado")
	return nil
}

//func GetAppByContainerName(name string) *models.App {
//	log.Println("🔍 Buscando container:", name)
//
//	// Primeiro tenta buscar diretamente pela chave
//	if app, ok := store.AppStore[name]; ok {
//		log.Println("✅ Localizado por chave direta:", app.ID)
//		return app
//	}
//
//	// Se não encontrar, busca por comparação de ContainerName
//	for _, app := range store.AppStore {
//		log.Printf("🔍 Comparando: app.ID=%s, app.ContainerName=%s", app.ID, app.ContainerName)
//		//log.Println("🔍 Comparando com:", app.ContainerName)
//		if app.ContainerName == name || app.ID == name {
//			//if app.ContainerName == name {
//			log.Println("✅ Localizado por ContainerName:", app.ID)
//			return app
//		}
//	}
//
//	log.Println("❌ Container não encontrado")
//	return nil
//}

// ▶️ Inicia a aplicação
func StartApp(id, username string) error {
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
	}
	if app.Status == models.StatusRunning {
		app.Logs = append(app.Logs, "Tentativa de iniciar app que já está rodando")
		return fmt.Errorf("a aplicação %s já está em execução", id)
	}

	log.Println("▶️ Iniciando aplicação:", app.ContainerName)
	cmd := exec.Command("docker", "start", app.ContainerName)
	if err := cmd.Run(); err != nil {
		log.Println("❌ Erro ao iniciar aplicação:", err)
		return fmt.Errorf("erro ao iniciar aplicação: %w", err)
	}

	app.Status = models.StatusRunning
	app.Logs = append(app.Logs, "Aplicação iniciada!")
	store.SaveApp(app)
	Log(app.ID, username, app.Plan, "▶️ Aplicação iniciada com sucesso!")
	return nil
}

// ⏸️ Para a aplicação
func StopApp(id, username string) error {
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
	}

	log.Println("📡 StopApp chamado para ID:", id)
	log.Println("⏸️ Atualizando política de restart para 'no'")

	// Desativa reinício automático
	updateCmd := exec.Command("docker", "update", "--restart=no", app.ContainerName)
	updateOut, updateErr := updateCmd.CombinedOutput()
	if updateErr != nil {
		log.Println("❌ Erro ao atualizar política de restart:", updateErr)
		log.Println("🪵 Saída do comando:", string(updateOut))
		return fmt.Errorf("erro ao atualizar política de restart: %w", updateErr)
	}

	log.Println("⏸️ Parando aplicação:", app.ContainerName)
	stopCmd := exec.Command("docker", "stop", app.ContainerName)
	stopOut, stopErr := stopCmd.CombinedOutput()
	if stopErr != nil {
		log.Println("❌ Erro ao parar aplicação:", stopErr)
		log.Println("🪵 Saída do comando:", string(stopOut))
		return fmt.Errorf("erro ao parar aplicação: %w", stopErr)
	}

	app.Status = models.StatusStopped
	app.Logs = append(app.Logs, "Aplicação parada!")
	store.SaveApp(app)
	Log(app.ID, username, app.Plan, "⏸️ Aplicação parada com sucesso")
	return nil
}

// 🔁 Reinicia a aplicação
func RestartApp(id, username string) error {
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
	}

	log.Println("🔁 Reiniciando aplicação:", app.ContainerName)
	cmd := exec.Command("docker", "restart", app.ContainerName)
	if err := cmd.Run(); err != nil {
		log.Println("❌ Erro ao reiniciar aplicação:", err)
		return fmt.Errorf("erro ao reiniciar aplicação: %w", err)
	}

	app.Status = models.StatusRunning
	app.Logs = append(app.Logs, "Aplicação reiniciada com sucesso!")
	store.SaveApp(app)
	Log(app.ID, username, app.Plan, "🔁 Aplicação reiniciada!")
	return nil
}
func CleanAppID(rawID string) string {
	parts := strings.Split(rawID, "-")
	if len(parts) > 1 {
		return parts[len(parts)-1] // pega só o ID final
	}
	return rawID
}

// 🔧 Reconstrói a aplicação com base no runtime
func RebuildApp(id, username string) error {
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
	}

	// 🧹 Remove container antigo
	if app.ContainerName != "" {
		Log(app.ID, username, app.Plan, "🧹 Removendo aplicação antiga: "+app.ContainerName)
		cmd := exec.Command("docker", "rm", "-f", app.ContainerName)
		if out, err := cmd.CombinedOutput(); err != nil {
			Log(app.ID, username, app.Plan, fmt.Sprintf("⚠️ Erro ao remover aplicação antiga: %v\nSaída: %s", err, string(out)))
		} else {
			Log(app.ID, username, app.Plan, "✅ Aplicação antiga removida com sucesso")
		}
	}

	// 📦 Localiza snapshot
	snapshotPath := filepath.Join("storage", "users", username, app.Plan, "snapshots", app.ID+".zip")
	if _, err := os.Stat(snapshotPath); os.IsNotExist(err) {
		return fmt.Errorf("snapshot não encontrado para: %s", app.ID)
	}

	// 🧹 Remove pasta antiga (se ainda existir)
	_ = os.RemoveAll(app.Path)

	// 🔁 Reinstala a aplicação no mesmo ID
	rebuildApp, err := HandleDeploy(snapshotPath, username, app.Plan, app.ID)
	if err != nil {
		return fmt.Errorf("erro ao reconstruir aplicação: %v", err)
	}

	rebuildApp.Status = models.StatusRunning
	rebuildApp.Logs = append(rebuildApp.Logs, "Aplicação reconstruída via snapshot")
	store.SaveApp(rebuildApp)
	Log(app.ID, username, app.Plan, "🔧 Aplicação reconstruída com sucesso!")
	log.Printf("✅ Aplicação %s reconstruída com sucesso", app.ID)
	return nil
}

// 📦 Gera backup da aplicação
func BackupAppFromContainer(id, username string) error {
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
	}

	// 📁 Pasta temporária para backup
	tempDir := filepath.Join("storage", "temp", "backup-"+id)
	_ = os.RemoveAll(tempDir)
	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
		return fmt.Errorf("erro ao criar pasta temporária: %w", err)
	}

	// 🐳 Copia /app do container para pasta temporária
	copyCmd := exec.Command("docker", "cp", app.ContainerName+":/app", tempDir)
	if out, err := copyCmd.CombinedOutput(); err != nil {
		return fmt.Errorf("erro ao copiar arquivos da aplicação: %v\nSaída: %s", err, string(out))
	}

	// Caminho real dos arquivos copiados
	appDir := filepath.Join(tempDir, "app")

	// 🧹 Remove Dockerfile
	_ = os.Remove(filepath.Join(appDir, "Dockerfile"))

	// 🧹 Remove node_modules recursivamente
	_ = os.RemoveAll(filepath.Join(appDir, "node_modules"))

	// 🧹 Remove symlinks (opcional, se ainda quiser)
	filepath.Walk(appDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Mode()&os.ModeSymlink != 0 {
			return os.Remove(path)
		}
		return nil
	})

	// 📦 Compacta para snapshots
	snapshotPath := filepath.Join("storage", "users", username, string(app.Plan), "snapshots", app.ID+".zip")
	if err := os.MkdirAll(filepath.Dir(snapshotPath), os.ModePerm); err != nil {
		return fmt.Errorf("erro ao criar diretório de snapshots: %w", err)
	}
	if err := utils.ZipFolder(appDir, snapshotPath); err != nil {
		return fmt.Errorf("erro ao gerar snapshot: %w", err)
	}

	// 🧹 Limpa pasta temporária
	_ = os.RemoveAll(tempDir)

	app.Logs = append(app.Logs, "📦 Snapshot gerado a partir do container em "+snapshotPath)
	store.SaveApp(app)
	Log(app.ID, username, app.Plan, "📦 Backup gerado com sucesso!")
	return nil
}

// 🗑️ Remove aplicação e container
func DeleteApp(id, username string) error {
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
	}

	// Inspeciona o container antes de removê-lo para obter o ID da imagem
	imageIDBytes, err := exec.Command("docker", "inspect", "--format={{.Image}}", app.ContainerName).Output()
	imageID := ""
	if err == nil {
		imageID = strings.TrimSpace(string(imageIDBytes))
	} else {
		log.Println("⚠️ Não foi possível inspecionar a imagem do container:", err)
	}

	// Remove container
	log.Println("🧹 Removendo aplicação:", app.ContainerName)
	err = exec.Command("docker", "rm", "-f", app.ContainerName).Run()
	if err != nil {
		log.Println("⚠️ Erro ao remover container:", err)
		return fmt.Errorf("erro ao remover container: %w", err)
	}

	// Remove imagem associada ao container (agora que o container foi removido)
	if imageID != "" {
		log.Println("🧹 Removendo imagem associada:", imageID)
		_ = exec.Command("docker", "rmi", "-f", imageID).Run()
	}

	// Remove arquivos
	//log.Println("🧹 Removendo arquivos da aplicação:", app.Path)
	//if err := os.RemoveAll(app.Path); err != nil {
	//	return fmt.Errorf("erro ao remover arquivos da aplicação: %w", err)
	//}

	// Remove do AppStore
	delete(store.AppStore, id)
	Log(app.ID, username, app.Plan, "🗑️ Aplicação removida com sucesso!")

	// Remove pasta de logs da aplicação
	logPath := filepath.Join("storage", "users", username, "logs", app.ID)
	_ = os.RemoveAll(logPath)
	return nil
}

// 🗑️ Remove aplicação e container
//func DeleteApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	// Remove container
//	log.Println("🧹 Removendo aplicação:", app.ContainerName)
//	_ = exec.Command("docker", "rm", "-f", app.ContainerName).Run()
//
//	// Remove imagem associada ao container
//	imageIDBytes, err := exec.Command("docker", "inspect", "--format={{.Image}}", app.ContainerName).Output()
//	if err == nil {
//		imageID := strings.TrimSpace(string(imageIDBytes))
//		log.Println("🧹 Removendo imagem associada:", imageID)
//		_ = exec.Command("docker", "rmi", "-f", imageID).Run()
//	} else {
//		log.Println("⚠️ Não foi possível inspecionar a imagem do container:", err)
//	}
//
//	// Remove arquivos
//	//log.Println("🧹 Removendo arquivos da aplicação:", app.Path)
//	//if err := os.RemoveAll(app.Path); err != nil {
//	//	return fmt.Errorf("erro ao remover arquivos da aplicação: %w", err)
//	//}
//
//	// Remove do AppStore
//	delete(store.AppStore, id)
//	Log(app.ID, username, app.Plan, "🗑️ Aplicação removida com sucesso!")
//
//	// Remove pasta de logs da aplicação
//	logPath := filepath.Join("storage", "users", username, "logs", app.ID)
//	_ = os.RemoveAll(logPath)
//	return nil
//}

// 🗑️ Remove aplicação e container
//func DeleteApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	// Remove container
//	log.Println("🧹 Removendo aplicação:", app.ContainerName)
//	_ = exec.Command("docker", "rm", "-f", app.ContainerName).Run()
//
//	// Remove arquivos
//	//log.Println("🧹 Removendo arquivos da aplicação:", app.Path)
//	//if err := os.RemoveAll(app.Path); err != nil {
//	//	return fmt.Errorf("erro ao remover arquivos da aplicação: %w", err)
//	//}
//
//	// Remove do AppStore
//	delete(store.AppStore, id)
//	Log(app.ID, username, app.Plan, "🗑️ Aplicação removida com sucesso!")
//
//	// Remove pasta de logs da aplicação
//	logPath := filepath.Join("storage", "users", username, "logs", app.ID)
//	_ = os.RemoveAll(logPath)
//	return nil
//}

// 🗜️ Comprime pasta em .zip
func compressFolder(sourceDir, zipPath string) error {
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	archive := zip.NewWriter(zipFile)
	defer archive.Close()

	filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		relPath := strings.TrimPrefix(path, filepath.Dir(sourceDir))
		header.Name = strings.TrimPrefix(relPath, string(filepath.Separator))
		if info.IsDir() {
			header.Name += "/"
		} else {
			header.Method = zip.Deflate
		}
		writer, err := archive.CreateHeader(header)
		if err != nil {
			return err
		}
		if !info.IsDir() {
			file, err := os.Open(path)
			if err != nil {
				return err
			}
			defer file.Close()
			_, err = io.Copy(writer, file)
			if err != nil {
				return err
			}
		}
		return nil
	})

	return nil
}

// 📋 Lista todas as aplicações de um usuário
func ListAppsByUsername(username string) []*models.App {
	var apps []*models.App
	for _, app := range store.AppStore {
		if strings.EqualFold(app.Username, username) {
			apps = append(apps, app)
		}
	}
	return apps
}

// 📦 Gera backup da aplicação
func BackupApp(id, username string) error {
	app := store.AppStore[id]
	if app == nil || app.Username != username {
		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
	}

	backupDir := filepath.Join("storage", "users", username, string(app.Plan), "snapshots")
	if err := os.MkdirAll(backupDir, os.ModePerm); err != nil {
		return fmt.Errorf("erro ao criar pasta de backup: %w", err)
	}

	backupPath := filepath.Join(backupDir, fmt.Sprintf("%s.zip", id))
	if err := compressFolder(app.Path, backupPath); err != nil {
		return fmt.Errorf("erro ao gerar backup: %w", err)
	}

	app.Logs = append(app.Logs, "Backup gerado em "+backupPath)
	store.SaveApp(app) // ✅ persistência
	return nil
}

//func BackupAppFromContainer(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// 📁 Pasta temporária
//	tempDir := filepath.Join("storage", "temp", "backup-"+id)
//	_ = os.RemoveAll(tempDir)
//	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
//		return fmt.Errorf("erro ao criar pasta temporária: %w", err)
//	}
//
//	// 🐳 Copia /app do container para pasta temporária
//	copyCmd := exec.Command("docker", "cp", app.ContainerName+":/app", tempDir)
//	if out, err := copyCmd.CombinedOutput(); err != nil {
//		return fmt.Errorf("erro ao copiar arquivos do container: %v\nSaída: %s", err, string(out))
//	}
//
//	// 🧹 Remove Dockerfile e symlinks
//	appDir := filepath.Join(tempDir, "app")
//	_ = os.Remove(filepath.Join(appDir, "Dockerfile"))
//
//	err := filepath.Walk(appDir, func(path string, info os.FileInfo, err error) error {
//		if err != nil {
//			return err
//		}
//		if info.Mode()&os.ModeSymlink != 0 {
//			return os.Remove(path)
//		}
//		return nil
//	})
//	if err != nil {
//		return fmt.Errorf("erro ao limpar symlinks: %w", err)
//	}
//
//	// 📦 Compacta
//	backupPath := filepath.Join("storage", "users", username, string(app.Plan), "backups", id+"-container.zip")
//	if err := os.MkdirAll(filepath.Dir(backupPath), os.ModePerm); err != nil {
//		return fmt.Errorf("erro ao criar pasta de destino: %w", err)
//	}
//	if err := utils.ZipFolder(appDir, backupPath); err != nil {
//		return fmt.Errorf("erro ao gerar backup: %w", err)
//	}
//
//	// 🧹 Limpa pasta temporária
//	_ = os.RemoveAll(tempDir)
//
//	app.Logs = append(app.Logs, "📦 Backup gerado a partir do container em "+backupPath)
//	store.SaveApp(app)
//	return nil
//}

//func RebuildApp(id, username string) error {
//	oldApp := store.AppStore[id]
//	if oldApp == nil || oldApp.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// 🧹 Remove container antigo com log e verificação
//	if oldApp.ContainerName != "" {
//		Log(oldApp.ID, username, oldApp.Plan, "🧹 Removendo container antigo: "+oldApp.ContainerName)
//		cmd := exec.Command("docker", "rm", "-f", oldApp.ContainerName)
//		if out, err := cmd.CombinedOutput(); err != nil {
//			Log(oldApp.ID, username, oldApp.Plan, fmt.Sprintf("⚠️ Erro ao remover container antigo: %v\nSaída: %s", err, string(out)))
//		} else {
//			Log(oldApp.ID, username, oldApp.Plan, "✅ Container antigo removido com sucesso")
//		}
//	}
//
//	// 📦 Localiza snapshot
//	snapshotPath := filepath.Join("storage", "users", username, oldApp.Plan, "snapshots", oldApp.ID+".zip")
//	if _, err := os.Stat(snapshotPath); os.IsNotExist(err) {
//		return fmt.Errorf("snapshot não encontrado para: %s", oldApp.ID)
//	}
//
//	// 🔁 Realiza novo deploy a partir do snapshot
//	newApp, err := HandleDeploy(snapshotPath, username, oldApp.Plan, "")
//	if err != nil {
//		return fmt.Errorf("erro ao reconstruir aplicação: %v", err)
//	}
//
//	newApp.Status = models.StatusRunning
//	newApp.Logs = append(newApp.Logs, "Aplicação reconstruída via snapshot")
//	store.SaveApp(newApp)
//
//	log.Printf("✅ Aplicação %s reconstruída como %s", oldApp.ID, newApp.ID)
//	return nil
//}

//func RebuildApp(id, username string) error {
//	oldApp := store.AppStore[id]
//	if oldApp == nil || oldApp.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// 🧹 Remove container antigo
//	_ = exec.Command("docker", "rm", "-f", oldApp.ContainerName).Run()
//
//	// 📦 Localiza snapshot
//	snapshotPath := filepath.Join("storage", "users", username, oldApp.Plan, "snapshots", oldApp.ID+".zip")
//	if _, err := os.Stat(snapshotPath); os.IsNotExist(err) {
//		return fmt.Errorf("snapshot não encontrado para: %s", oldApp.ID)
//	}
//
//	// 🆕 Gera novo appID simples (sem prefixo de plano)
//	//newAppID := fmt.Sprintf("%d", time.Now().UnixNano())
//
//	// 🔁 Realiza novo deploy a partir do snapshot
//	newApp, err := HandleDeploy(snapshotPath, username, oldApp.Plan, "")
//	if err != nil {
//		return fmt.Errorf("erro ao reconstruir aplicação: %v", err)
//	}
//
//	newApp.Status = models.StatusRunning
//	newApp.Logs = append(newApp.Logs, "Aplicação reconstruída via snapshot")
//	store.SaveApp(newApp)
//
//	log.Printf("✅ Aplicação %s reconstruída como %s", oldApp.ID, newApp.ID)
//	return nil
//}

//func RebuildApp(id, username string) error {
//	oldApp := store.AppStore[id]
//	if oldApp == nil || oldApp.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// 🧹 Remove container antigo
//	_ = exec.Command("docker", "rm", "-f", oldApp.ContainerName).Run()
//
//	// 📦 Localiza snapshot
//	snapshotPath := filepath.Join("storage", "users", username, oldApp.Plan, "snapshots", oldApp.ID+".zip")
//	if _, err := os.Stat(snapshotPath); os.IsNotExist(err) {
//		return fmt.Errorf("snapshot não encontrado para: %s", oldApp.ID)
//	}
//
//	// 🆕 Gera novo appID
//	newAppID := fmt.Sprintf("%d", time.Now().UnixNano())
//
//	// 🔁 Realiza novo deploy a partir do snapshot
//	newApp, err := HandleDeploy(snapshotPath, username, oldApp.Plan, newAppID)
//	if err != nil {
//		return fmt.Errorf("erro ao reconstruir aplicação: %v", err)
//	}
//
//	newApp.Status = models.StatusRunning
//	newApp.Logs = append(newApp.Logs, "Aplicação reconstruída via snapshot")
//	store.SaveApp(newApp)
//
//	log.Printf("✅ Aplicação %s reconstruída como %s", oldApp.ID, newApp.ID)
//	return nil
//}

//func RebuildApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// Remove container antigo
//	_ = exec.Command("docker", "rm", "-f", app.ContainerName).Run()
//
//	// Sincroniza dependências
//	SyncDependencies(app.Runtime, app.Path, username, string(app.Plan))
//
//	// Define imagem base por runtime
//	var image string
//	switch app.Runtime {
//	case "node":
//		image = "node:latest"
//	case "python", "django":
//		image = "python:3.11"
//	case "golang", "go":
//		image = "golang:latest"
//	case "php", "laravel":
//		image = "php:8.2-cli"
//	case "rust":
//		image = "rust:latest"
//	case "csharp", "dotnet", "dotnetcore":
//		image = "mcr.microsoft.com/dotnet/sdk:7.0"
//	case "elixir":
//		image = "elixir:latest"
//	case "java", "springboot":
//		image = "maven:3.9-eclipse-temurin-17"
//	case "springboot-gradle", "kotlin":
//		image = "gradle:latest"
//	case "lua":
//		image = "lua:latest"
//	default:
//		image = "node:latest"
//	}
//
//	// Comando de inicialização
//	cmdParts := GetRuntimeCommand(app.Runtime, app.Entry)
//	startCmd := strings.Join(cmdParts, " ")
//
//	// Converte caminho para absoluto
//	absPath, err := filepath.Abs(app.Path)
//	if err != nil {
//		return fmt.Errorf("caminho inválido: %v", err)
//	}
//	if _, err := os.Stat(absPath); os.IsNotExist(err) {
//		return fmt.Errorf("caminho da aplicação não existe: %s", absPath)
//	}
//
//	// Log do comando
//	log.Printf("🐳 docker run -d --name %s -v %s:/app -w /app %s sh -c \"%s\"",
//		app.ContainerName, absPath, image, startCmd)
//
//	// Cria novo container
//	cmd := exec.Command("docker", "run", "-d", "--name", app.ContainerName, "-v", absPath+":/app", "-w", "/app", image, "sh", "-c", startCmd)
//	output, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Printf("❌ Erro ao iniciar container: %v", err)
//		log.Printf("🪵 Saída do comando: %s", string(output))
//		return fmt.Errorf("erro ao iniciar container rebuildado: %v", err)
//	}
//	//cmd := exec.Command("docker", "run", "-d", "--name", app.ContainerName, "-v", app.Path+":/app", "-w", "/app", image, "sh", "-c", startCmd)
//	//if err := cmd.Run(); err != nil {
//	//	return fmt.Errorf("erro ao iniciar container rebuildado: %w", err)
//	//}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container rebuildado e iniciado via RebuildApp")
//	store.SaveApp(app) // ✅ persistência
//	return nil
//}

// 🔧 Reconstrói a aplicação com base no runtime
//func RebuildApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// Remove container antigo
//	_ = exec.Command("docker", "rm", "-f", app.ContainerName).Run()
//
//	// Sincroniza dependências
//	SyncDependencies(app.Runtime, app.Path, username, string(app.Plan))
//
//	// Define imagem base por runtime
//	var image string
//	switch app.Runtime {
//	case "node":
//		image = "node:latest"
//	case "python", "django":
//		image = "python:3.11"
//	case "golang", "go":
//		image = "golang:latest"
//	case "php", "laravel":
//		image = "php:8.2-cli"
//	case "rust":
//		image = "rust:latest"
//	case "csharp", "dotnet", "dotnetcore":
//		image = "mcr.microsoft.com/dotnet/sdk:7.0"
//	case "elixir":
//		image = "elixir:latest"
//	case "java", "springboot":
//		image = "maven:3.9-eclipse-temurin-17"
//	case "springboot-gradle", "kotlin":
//		image = "gradle:latest"
//	case "lua":
//		image = "lua:latest"
//	default:
//		image = "node:latest"
//	}
//
//	// Comando de inicialização
//	cmdParts := GetRuntimeCommand(app.Runtime, app.Entry)
//	startCmd := strings.Join(cmdParts, " ")
//
//	// Cria novo container
//	cmd := exec.Command("docker", "run", "-d", "--name", app.ContainerName, "-v", app.Path+":/app", "-w", "/app", image, "sh", "-c", startCmd)
//	output, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Printf("❌ Erro ao iniciar container: %v", err)
//		log.Printf("🪵 Saída do comando: %s", string(output))
//		return fmt.Errorf("erro ao iniciar container rebuildado: %v", err)
//	}
//	//cmd := exec.Command("docker", "run", "-d", "--name", app.ContainerName, "-v", app.Path+":/app", "-w", "/app", image, "sh", "-c", startCmd)
//	//if err := cmd.Run(); err != nil {
//	//	return fmt.Errorf("erro ao iniciar container rebuildado: %w", err)
//	//}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container rebuildado e iniciado via RebuildApp")
//	store.SaveApp(app) // ✅ persistência
//	return nil
//}

//func StopApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	log.Println("📡 StopApp chamado para ID:", id)
//	log.Println("⏸️ Parando container:", app.ContainerName)
//
//	cmd := exec.Command("docker", "stop", app.ContainerName)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Println("❌ Erro ao parar container:", err)
//		log.Println("🪵 Saída do comando:", string(out))
//		return fmt.Errorf("erro ao parar container: %w", err)
//	}
//
//	app.Status = models.StatusStopped
//	app.Logs = append(app.Logs, "Container parado via StopApp")
//	store.SaveApp(app)
//	return nil
//}

// 📄 Retorna os logs do container
//func GetContainerLogsHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	containerName := r.URL.Query().Get("container_name") // ✅ corrigido
//
//	app := GetAppByContainerName(containerName)
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	cmd := exec.Command("docker", "logs", "--tail", "100", containerName)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		http.Error(w, "Erro ao obter logs: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{"logs": string(out)})
//}

//func StartApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if app.Status == models.StatusRunning {
//		app.Logs = append(app.Logs, "Tentativa de iniciar app que já está rodando")
//		return fmt.Errorf("a aplicação %s já está em execução", id)
//	}
//
//	cmd := exec.Command("docker", "start", app.ContainerName) // ✅ uso direto
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao iniciar container: %w", err)
//	}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container iniciado via StartApp")
//	store.SaveApp(app) // ✅ persistência
//	return nil
//}

//func StopApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	log.Println("📡 StopApp chamado para ID:", id)
//	log.Println("⏸️ Parando container:", app.ContainerName)
//
//	log.Println("⏸️ Parando container:", app.ContainerName)
//	cmd := exec.Command("docker", "stop", app.ContainerName)
//	if err := cmd.Run(); err != nil {
//		log.Println("❌ Erro ao parar container:", err)
//		return fmt.Errorf("erro ao parar container: %w", err)
//	}
//
//	app.Status = models.StatusStopped
//	app.Logs = append(app.Logs, "Container parado via StopApp")
//	store.SaveApp(app)
//	return nil
//}

//func StopApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	cmd := exec.Command("docker", "stop", app.ContainerName) // ✅ uso direto
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao parar container: %w", err)
//	}
//
//	app.Status = models.StatusStopped
//	app.Logs = append(app.Logs, "Container parado via StopApp")
//	store.SaveApp(app) // ✅ persistência
//	return nil
//}

//func RestartApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	cmd := exec.Command("docker", "restart", app.ContainerName) // ✅ uso direto
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao reiniciar container: %w", err)
//	}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container reiniciado via RestartApp")
//	store.SaveApp(app) // ✅ persistência
//	return nil
//}

//func DeleteApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// Remove container
//	_ = exec.Command("docker", "rm", "-f", app.ContainerName).Run()
//
//	// Remove arquivos
//	if err := os.RemoveAll(app.Path); err != nil {
//		return fmt.Errorf("erro ao remover arquivos da aplicação: %w", err)
//	}
//
//	// Remove do AppStore
//	delete(store.AppStore, id)
//	return nil
//}

// 🔍 Busca aplicação pelo nome real do container
//func GetAppByContainerName(name string) *models.App {
//	log.Println("🔍 Buscando container:", name)
//	for _, app := range store.AppStore {
//		log.Println("🔍 Comparando com:", app.ContainerName)
//		if app.ContainerName == name {
//			log.Println("✅ Container localizado:", app.ID)
//			return app
//		}
//	}
//	log.Println("❌ Container não encontrado")
//	return nil
//}

//func RebuildApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	// Remove container antigo
//	_ = exec.Command("docker", "rm", "-f", app.ContainerName).Run()
//
//	// Sincroniza dependências
//	SyncDependencies(app.Runtime, app.Path, username, string(app.Plan))
//
//	// Define imagem e comando de inicialização
//	var image, startCmd string
//	switch app.Runtime {
//	case "node":
//		image = "node:latest"
//		startCmd = "npm start"
//	case "python":
//		image = "python:3.11"
//		startCmd = "python " + app.Entry
//	case "go":
//		image = "golang:latest"
//		startCmd = "go run " + app.Entry
//	default:
//		image = "node:latest"
//		startCmd = "npm start"
//	}
//
//	// Cria novo container
//	cmd := exec.Command("docker", "run", "-d", "--name", app.ContainerName, "-v", app.Path+":/app", image, "sh", "-c", startCmd)
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao iniciar container rebuildado: %w", err)
//	}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container rebuildado e iniciado via RebuildApp")
//	store.SaveApp(app) // ✅ persistência
//	return nil
//}

//package services
//
//import (
//	"archive/zip"
//	"fmt"
//	"io"
//	"log"
//	"net/http"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//func GetAppByContainerName(name string) *models.App {
//	log.Println("🔍 Buscando container:", name)
//	for _, app := range store.AppStore {
//		log.Println("🔍 Comparando com:", app.ContainerName)
//		if app.ContainerName == name {
//			log.Println("✅ Container localizado:", app.ID)
//			return app
//		}
//	}
//	log.Println("❌ Container não encontrado")
//	return nil
//}
//
//func GetContainerLogsHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//	container := r.URL.Query().Get("id")
//
//	app := GetAppByContainerName(container)
//	if app == nil || app.Username != username {
//		http.Error(w, "Aplicação não encontrada ou não pertence ao usuário", http.StatusForbidden)
//		return
//	}
//
//	cmd := exec.Command("docker", "logs", "--tail", "100", container)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		http.Error(w, "Erro ao obter logs: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{"logs": string(out)})
//}
//func StartApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if app.Status == models.StatusRunning {
//		app.Logs = append(app.Logs, "Tentativa de iniciar app que já está rodando")
//		return fmt.Errorf("a aplicação %s já está em execução", id)
//	}
//
//	containerName := utils.GetContainerNameFromApp(app)
//	cmd := exec.Command("docker", "start", containerName)
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao iniciar container: %w", err)
//	}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container iniciado via StartApp")
//	return nil
//}
//func StopApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	containerName := utils.GetContainerNameFromApp(app)
//	cmd := exec.Command("docker", "stop", containerName)
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao parar container: %w", err)
//	}
//
//	app.Status = models.StatusStopped
//
//	app.Logs = append(app.Logs, "Container parado via StopApp")
//	// ✅ Salva a mudança no disco
//	store.SaveApp(app)
//
//	return nil
//}
//
//func RestartApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	containerName := utils.GetContainerNameFromApp(app)
//	cmd := exec.Command("docker", "restart", containerName)
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao reiniciar container: %w", err)
//	}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container reiniciado via RestartApp")
//	return nil
//}
//func RebuildApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	containerName := utils.GetContainerNameFromApp(app)
//
//	// Remove container antigo
//	_ = exec.Command("docker", "rm", "-f", containerName).Run()
//
//	// Sincroniza dependências
//	SyncDependencies(app.Runtime, app.Path, username, string(app.Plan))
//
//	// Recria container
//	cmd := exec.Command("docker", "run", "-d", "--name", containerName, "-v", app.Path+":/app", "node:latest", "npm", "start")
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao iniciar container rebuildado: %w", err)
//	}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container rebuildado e iniciado via RebuildApp")
//	return nil
//}
//func BackupApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	backupDir := filepath.Join("storage", "users", username, string(app.Plan), "snapshots")
//	if err := os.MkdirAll(backupDir, os.ModePerm); err != nil {
//		return fmt.Errorf("erro ao criar pasta de backup: %w", err)
//	}
//
//	backupPath := filepath.Join(backupDir, fmt.Sprintf("%s.zip", id))
//	if err := compressFolder(app.Path, backupPath); err != nil {
//		return fmt.Errorf("erro ao gerar backup: %w", err)
//	}
//
//	app.Logs = append(app.Logs, "Backup gerado em "+backupPath)
//	return nil
//}
//func DeleteApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	containerName := utils.GetContainerNameFromApp(app)
//
//	// Remove container
//	_ = exec.Command("docker", "rm", "-f", containerName).Run()
//
//	// Remove arquivos
//	if err := os.RemoveAll(app.Path); err != nil {
//		return fmt.Errorf("erro ao remover arquivos da aplicação: %w", err)
//	}
//
//	// Remove do AppStore
//	delete(store.AppStore, id)
//	return nil
//}
//
//func compressFolder(sourceDir, zipPath string) error {
//	zipFile, err := os.Create(zipPath)
//	if err != nil {
//		return err
//	}
//	defer zipFile.Close()
//
//	archive := zip.NewWriter(zipFile)
//	defer archive.Close()
//
//	filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
//		if err != nil {
//			return err
//		}
//		header, err := zip.FileInfoHeader(info)
//		if err != nil {
//			return err
//		}
//		relPath := strings.TrimPrefix(path, filepath.Dir(sourceDir))
//		header.Name = strings.TrimPrefix(relPath, string(filepath.Separator))
//		if info.IsDir() {
//			header.Name += "/"
//		} else {
//			header.Method = zip.Deflate
//		}
//		writer, err := archive.CreateHeader(header)
//		if err != nil {
//			return err
//		}
//		if !info.IsDir() {
//			file, err := os.Open(path)
//			if err != nil {
//				return err
//			}
//			defer file.Close()
//			_, err = io.Copy(writer, file)
//			if err != nil {
//				return err
//			}
//		}
//		return nil
//	})
//
//	return nil
//}
//
//// 🧠 Nova função para listar apps por usuário
//func ListAppsByUsername(username string) []*models.App {
//	var apps []*models.App
//	for _, app := range store.AppStore {
//		if strings.EqualFold(app.Username, username) {
//			apps = append(apps, app)
//		}
//	}
//	return apps
//}

// 🐳 Gera nome padronizado do container
//
//	func GetContainerName(app *models.App) string {
//		return fmt.Sprintf("%s-%s", app.Username, app.ID)
//	}

//	func GetAppByContainerName(containerName string) *models.App {
//		for _, app := range store.AppStore {
//			if app.ContainerName == containerName {
//				return app
//			}
//		}
//		return nil
//	}
//
//	func StopApp(id, username string) error {
//		app := store.AppStore[id]
//		if app == nil || app.Username != username {
//			return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//		}
//
//		containerName := utils.GetContainerNameFromApp(app)
//		cmd := exec.Command("docker", "stop", containerName)
//		if err := cmd.Run(); err != nil {
//			return fmt.Errorf("erro ao parar container: %w", err)
//		}
//
//		app.Status = models.StatusStopped
//
//		app.Logs = append(app.Logs, "Container parado via StopApp")
//		// ✅ Salva a mudança no disco
//		store.SaveApp(app)
//
//		return nil
//	}

//	func StartApp(id, username string) error {
//		app := store.AppStore[id]
//		if app == nil || app.Username != username {
//			return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//		}
//		if app.Status == models.StatusRunning {
//			app.Logs = append(app.Logs, "Tentativa de iniciar app que já está rodando")
//			return fmt.Errorf("a aplicação %s já está em execução", id)
//		}
//
//		cmd := exec.Command("npm", "start")
//		cmd.Dir = app.Path
//		if err := cmd.Start(); err != nil {
//			return err
//		}
//
//		app.PID = cmd.Process.Pid
//		app.Status = models.StatusRunning
//		app.ContainerName = utils.GetContainerNameFromApp(app)
//		app.Logs = append(app.Logs, "Aplicação iniciada manualmente")
//		return nil
//	}

//	func StopApp(id, username string) error {
//		app := store.AppStore[id]
//		if app == nil || app.Username != username {
//			return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//		}
//		process, err := os.FindProcess(app.PID)
//		if err != nil {
//			return err
//		}
//		if err := process.Kill(); err != nil {
//			return err
//		}
//		app.Status = models.StatusStopped
//		app.Logs = append(app.Logs, "Aplicação parada manualmente")
//		return nil
//	}

//	func RestartApp(id, username string) error {
//		app := store.AppStore[id]
//		if app == nil || app.Username != username {
//			return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//		}
//		if err := StopApp(id, username); err != nil {
//			return err
//		}
//
//		cmd := exec.Command("npm", "start")
//		cmd.Dir = app.Path
//		if err := cmd.Start(); err != nil {
//			return err
//		}
//
//		app.PID = cmd.Process.Pid
//		app.Status = models.StatusRunning
//		app.ContainerName = utils.GetContainerNameFromApp(app)
//		app.Logs = append(app.Logs, "Aplicação reiniciada")
//		return nil
//	}

//func RebuildApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//
//	containerName := utils.GetContainerNameFromApp(app)
//
//	// Remove container antigo
//	_ = exec.Command("docker", "rm", "-f", containerName).Run()
//
//	// Reinstala dependências
//	os.RemoveAll(filepath.Join(app.Path, "node_modules"))
//	os.RemoveAll(filepath.Join(app.Path, "dist"))
//
//	cmdInstall := exec.Command("npm", "install")
//	cmdInstall.Dir = app.Path
//	if err := cmdInstall.Run(); err != nil {
//		return fmt.Errorf("erro ao instalar dependências: %w", err)
//	}
//
//	// Recria container (simples)
//	cmd := exec.Command("docker", "run", "-d", "--name", containerName, "-v", app.Path+":/app", "node:latest", "npm", "start")
//	if err := cmd.Run(); err != nil {
//		return fmt.Errorf("erro ao iniciar container rebuildado: %w", err)
//	}
//
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Container rebuildado e iniciado via RebuildApp")
//	return nil
//}

//	func RebuildApp(id, username string) error {
//		app := store.AppStore[id]
//		if app == nil || app.Username != username {
//			return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//		}
//		if app.Status == models.StatusRunning {
//			if err := StopApp(id, username); err != nil {
//				return err
//			}
//		}
//
//		os.RemoveAll(filepath.Join(app.Path, "node_modules"))
//		os.RemoveAll(filepath.Join(app.Path, "dist"))
//
//		cmdInstall := exec.Command("npm", "install")
//		cmdInstall.Dir = app.Path
//		if err := cmdInstall.Run(); err != nil {
//			return fmt.Errorf("erro ao instalar dependências: %w", err)
//		}
//
//		cmdStart := exec.Command("npm", "start")
//		cmdStart.Dir = app.Path
//		if err := cmdStart.Start(); err != nil {
//			return fmt.Errorf("erro ao iniciar app: %w", err)
//		}
//
//		app.PID = cmdStart.Process.Pid
//		app.Status = models.StatusRunning
//		app.ContainerName = utils.GetContainerNameFromApp(app)
//		app.Logs = append(app.Logs, "Aplicação reconstruída e iniciada")
//		return nil
//	}

//	func BackupApp(id, username string) error {
//		app := store.AppStore[id]
//		if app == nil || app.Username != username {
//			return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//		}
//
//		// ✅ Corrige caminho do diretório de backup
//		backupDir := fmt.Sprintf("storage/users/%s/%s/snapshots", username, string(app.Plan))
//		if err := os.MkdirAll(backupDir, os.ModePerm); err != nil {
//			return fmt.Errorf("erro ao criar pasta de backup: %w", err)
//		}
//
//		backupPath := filepath.Join(backupDir, fmt.Sprintf("%s.zip", id))
//		err := compressFolder(app.Path, backupPath)
//		if err != nil {
//			return fmt.Errorf("erro ao gerar backup: %w", err)
//		}
//
//		app.Logs = append(app.Logs, "Backup gerado em "+backupPath)
//		return nil
//	}

//func DeleteApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if app.Status == models.StatusRunning {
//		if err := StopApp(id, username); err != nil {
//			return err
//		}
//	}
//
//	// 🗑️ Remove o container Docker
//	containerName := utils.GetContainerNameFromApp(app)
//	_ = exec.Command("docker", "rm", "-f", containerName).Run()
//
//	// 🧹 Remove os arquivos da aplicação
//	err := os.RemoveAll(app.Path)
//	if err != nil {
//		return err
//	}
//
//	// 🧼 Remove do AppStore
//	delete(store.AppStore, id)
//	return nil
//}

//func BackupApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	backupDir := "./backups"
//	os.MkdirAll(backupDir, os.ModePerm)
//	backupPath := filepath.Join(backupDir, fmt.Sprintf("%s.zip", id))
//	err := compressFolder(app.Path, backupPath)
//	if err != nil {
//		return fmt.Errorf("erro ao gerar backup: %w", err)
//	}
//	app.Logs = append(app.Logs, "Backup gerado em "+backupPath)
//	return nil
//}

//package services
//
//import (
//	"archive/zip"
//	"fmt"
//	"io"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//func StartApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if app.Status == models.StatusRunning {
//		app.Logs = append(app.Logs, "Tentativa de iniciar app que já está rodando")
//		return fmt.Errorf("a aplicação %s já está em execução", id)
//	}
//	cmd := exec.Command("npm", "start")
//	cmd.Dir = app.Path
//	if err := cmd.Start(); err != nil {
//		return err
//	}
//	app.PID = cmd.Process.Pid
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Aplicação iniciada manualmente")
//	return nil
//}
//
//func StopApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	process, err := os.FindProcess(app.PID)
//	if err != nil {
//		return err
//	}
//	if err := process.Kill(); err != nil {
//		return err
//	}
//	app.Status = models.StatusStopped
//	app.Logs = append(app.Logs, "Aplicação parada manualmente")
//	return nil
//}
//
//func RestartApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if err := StopApp(id, username); err != nil {
//		return err
//	}
//	cmd := exec.Command("npm", "start")
//	cmd.Dir = app.Path
//	if err := cmd.Start(); err != nil {
//		return err
//	}
//	app.PID = cmd.Process.Pid
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Aplicação reiniciada")
//	return nil
//}
//
//func RebuildApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if app.Status == models.StatusRunning {
//		if err := StopApp(id, username); err != nil {
//			return err
//		}
//	}
//	os.RemoveAll(filepath.Join(app.Path, "node_modules"))
//	os.RemoveAll(filepath.Join(app.Path, "dist"))
//
//	cmdInstall := exec.Command("npm", "install")
//	cmdInstall.Dir = app.Path
//	if err := cmdInstall.Run(); err != nil {
//		return fmt.Errorf("erro ao instalar dependências: %w", err)
//	}
//
//	cmdStart := exec.Command("npm", "start")
//	cmdStart.Dir = app.Path
//	if err := cmdStart.Start(); err != nil {
//		return fmt.Errorf("erro ao iniciar app: %w", err)
//	}
//
//	app.PID = cmdStart.Process.Pid
//	app.Status = models.StatusRunning
//	app.Logs = append(app.Logs, "Aplicação reconstruída e iniciada")
//	return nil
//}
//
//func BackupApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	backupDir := "./backups"
//	os.MkdirAll(backupDir, os.ModePerm)
//	backupPath := filepath.Join(backupDir, fmt.Sprintf("%s.zip", id))
//	err := compressFolder(app.Path, backupPath)
//	if err != nil {
//		return fmt.Errorf("erro ao gerar backup: %w", err)
//	}
//	app.Logs = append(app.Logs, "Backup gerado em "+backupPath)
//	return nil
//}
//func DeleteApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if app.Status == models.StatusRunning {
//		if err := StopApp(id, username); err != nil {
//			return err
//		}
//	}
//
//	// 🗑️ Remove o container Docker
//	containerName := fmt.Sprintf("%s-%s", username, id)
//	_ = exec.Command("docker", "rm", "-f", containerName).Run()
//
//	// 🧹 Remove os arquivos da aplicação
//	err := os.RemoveAll(app.Path)
//	if err != nil {
//		return err
//	}
//
//	// 🧼 Remove do AppStore
//	delete(store.AppStore, id)
//	return nil
//}
//
//func compressFolder(sourceDir, zipPath string) error {
//	zipFile, err := os.Create(zipPath)
//	if err != nil {
//		return err
//	}
//	defer zipFile.Close()
//
//	archive := zip.NewWriter(zipFile)
//	defer archive.Close()
//
//	filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
//		if err != nil {
//			return err
//		}
//		header, err := zip.FileInfoHeader(info)
//		if err != nil {
//			return err
//		}
//		relPath := strings.TrimPrefix(path, filepath.Dir(sourceDir))
//		header.Name = strings.TrimPrefix(relPath, string(filepath.Separator))
//		if info.IsDir() {
//			header.Name += "/"
//		} else {
//			header.Method = zip.Deflate
//		}
//		writer, err := archive.CreateHeader(header)
//		if err != nil {
//			return err
//		}
//		if !info.IsDir() {
//			file, err := os.Open(path)
//			if err != nil {
//				return err
//			}
//			defer file.Close()
//			_, err = io.Copy(writer, file)
//			if err != nil {
//				return err
//			}
//		}
//		return nil
//	})
//
//	return nil
//}
//
//// 🧠 Nova função para listar apps por usuário
//func ListAppsByUsername(username string) []*models.App {
//	var apps []*models.App
//	for _, app := range store.AppStore {
//		if strings.EqualFold(app.Username, username) {
//			apps = append(apps, app)
//		}
//	}
//	return apps
//}

//func DeleteApp(id, username string) error {
//	app := store.AppStore[id]
//	if app == nil || app.Username != username {
//		return fmt.Errorf("aplicação não encontrada ou não pertence ao usuário")
//	}
//	if app.Status == models.StatusRunning {
//		if err := StopApp(id, username); err != nil {
//			return err
//		}
//	}
//	err := os.RemoveAll(app.Path)
//	if err != nil {
//		return err
//	}
//	delete(store.AppStore, id)
//	return nil
//}

//	func StartApp(id string) error {
//		app := store.AppStore[id]
//		if app == nil {
//			return fmt.Errorf("app %s não encontrada", id)
//		}
//		if app.Status == models.StatusRunning {
//			app.Logs = append(app.Logs, "Tentativa de iniciar app que já está rodando")
//			return fmt.Errorf("a aplicação %s já está em execução", id)
//		}
//		cmd := exec.Command("npm", "start")
//		cmd.Dir = app.Path
//		if err := cmd.Start(); err != nil {
//			return err
//		}
//		app.PID = cmd.Process.Pid
//		app.Status = models.StatusRunning
//		app.Logs = append(app.Logs, "Aplicação iniciada manualmente")
//		return nil
//	}
//
//	func StopApp(id string) error {
//		app := store.AppStore[id]
//		if app == nil {
//			return fmt.Errorf("app %s não encontrada", id)
//		}
//		process, err := os.FindProcess(app.PID)
//		if err != nil {
//			return err
//		}
//		if err := process.Kill(); err != nil {
//			return err
//		}
//		app.Status = models.StatusStopped
//		app.Logs = append(app.Logs, "Aplicação parada manualmente")
//		return nil
//	}
//
//	func RestartApp(id string) error {
//		app := store.AppStore[id]
//		if app == nil {
//			return fmt.Errorf("app %s não encontrada", id)
//		}
//		if err := StopApp(id); err != nil {
//			return err
//		}
//		cmd := exec.Command("npm", "start")
//		cmd.Dir = app.Path
//		if err := cmd.Start(); err != nil {
//			return err
//		}
//		app.PID = cmd.Process.Pid
//		app.Status = models.StatusRunning
//		app.Logs = append(app.Logs, "Aplicação reiniciada")
//		return nil
//	}
//
//	func RebuildApp(id string) error {
//		app := store.AppStore[id]
//		if app == nil {
//			return fmt.Errorf("app %s não encontrada", id)
//		}
//		if app.Status == models.StatusRunning {
//			if err := StopApp(id); err != nil {
//				return err
//			}
//		}
//		os.RemoveAll(filepath.Join(app.Path, "node_modules"))
//		os.RemoveAll(filepath.Join(app.Path, "dist"))
//
//		cmdInstall := exec.Command("npm", "install")
//		cmdInstall.Dir = app.Path
//		if err := cmdInstall.Run(); err != nil {
//			return fmt.Errorf("erro ao instalar dependências: %w", err)
//		}
//
//		cmdStart := exec.Command("npm", "start")
//		cmdStart.Dir = app.Path
//		if err := cmdStart.Start(); err != nil {
//			return fmt.Errorf("erro ao iniciar app: %w", err)
//		}
//
//		app.PID = cmdStart.Process.Pid
//		app.Status = models.StatusRunning
//		app.Logs = append(app.Logs, "Aplicação reconstruída e iniciada")
//		return nil
//	}
//
//	func BackupApp(id string) error {
//		app := store.AppStore[id]
//		if app == nil {
//			return fmt.Errorf("app %s não encontrada", id)
//		}
//		backupDir := "./backups"
//		os.MkdirAll(backupDir, os.ModePerm)
//		backupPath := filepath.Join(backupDir, fmt.Sprintf("%s.zip", id))
//		err := compressFolder(app.Path, backupPath)
//		if err != nil {
//			return fmt.Errorf("erro ao gerar backup: %w", err)
//		}
//		app.Logs = append(app.Logs, "Backup gerado em "+backupPath)
//		return nil
//	}
//
//	func DeleteApp(id string) error {
//		app := store.AppStore[id]
//		if app == nil {
//			return fmt.Errorf("app %s não encontrada", id)
//		}
//		if app.Status == models.StatusRunning {
//			if err := StopApp(id); err != nil {
//				return err
//			}
//		}
//		err := os.RemoveAll(app.Path)
//		if err != nil {
//			return err
//		}
//		delete(store.AppStore, id)
//		return nil
//	}

//func ListAppsByUserID(userID string) []*models.App {
//	var apps []*models.App
//	for _, app := range store.AppStore {
//		if strings.EqualFold(app.UserID, userID) {
//			apps = append(apps, app)
//		}
//	}
//	return apps
//}
