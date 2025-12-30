//backend/tools/watchdog.go

package tools

import (
	"context"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"virtuscloud/backend/services"
)

const userBasePath = "storage/users"

var monitoredContainers = make(map[string]bool)

var validPlans = []string{"no-plan", "basic", "pro", "premium", "enterprise"}

func imageExists(imageName string) bool {
	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}")
	output, err := cmd.Output()
	if err != nil {
		log.Printf("⚠️ Erro ao listar imagens Docker: %v", err)
		return false
	}

	repos := strings.Split(strings.TrimSpace(string(output)), "\n")
	for _, repo := range repos {
		if repo == imageName {
			return true
		}
	}
	return false
}

func monitorContainer(containerName string, interval time.Duration) {
	for {
		exists, _ := services.ContainerExists(context.Background(), containerName)
		if !exists {
			log.Printf("📦 Container %s não existe. Criando...", containerName)
			createCmd := exec.Command("docker", "create", "--name", containerName, containerName)
			if out, err := createCmd.CombinedOutput(); err != nil {
				log.Printf("❌ Falha ao criar container %s: %v — %s", containerName, err, string(out))
				time.Sleep(interval)
				continue
			}
			log.Printf("✅ Container %s criado com sucesso.", containerName)
		}

		inspectCmd := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", containerName)
		output, err := inspectCmd.Output()
		if err != nil {
			log.Printf("🚫 %s → erro ao inspecionar: %v", containerName, err)
		} else {
			running := strings.TrimSpace(string(output))
			if running == "true" {
				log.Printf("✅ %s está rodando.", containerName)
			} else {
				log.Printf("🛑 %s está parado. Reiniciando...", containerName)
				restart := exec.Command("docker", "restart", containerName)
				err := restart.Run()
				if err != nil {
					log.Printf("❌ Falha ao reiniciar %s: %v", containerName, err)
				} else {
					log.Printf("🔄 %s reiniciado com sucesso.", containerName)
				}
			}
		}

		time.Sleep(interval)
	}
}

func StartWatchdog() {
	for {
		userDirs, err := os.ReadDir(userBasePath)
		if err != nil {
			log.Printf("❌ Erro ao acessar %s: %v", userBasePath, err)
			time.Sleep(30 * time.Second)
			continue
		}

		for _, userEntry := range userDirs {
			if !userEntry.IsDir() {
				continue
			}
			username := userEntry.Name()

			userPath := filepath.Join(userBasePath, username)
			planDirs, err := os.ReadDir(userPath)
			if err != nil {
				continue
			}

			for _, planEntry := range planDirs {
				if !planEntry.IsDir() {
					continue
				}
				plan := planEntry.Name()

				isValid := false
				for _, vp := range validPlans {
					if plan == vp {
						isValid = true
						break
					}
				}
				if !isValid {
					continue
				}

				appsPath := filepath.Join(userPath, plan, "apps")
				appDirs, err := os.ReadDir(appsPath)
				if err != nil {
					continue
				}

				for _, appEntry := range appDirs {
					if !appEntry.IsDir() {
						continue
					}
					appID := appEntry.Name()
					containerName := username + "-" + appID

					if monitoredContainers[containerName] {
						continue
					}

					if imageExists(appID) {
						log.Printf("📦 Imagem localizada: %s → iniciando monitoramento", containerName)
						monitoredContainers[containerName] = true
						go monitorContainer(containerName, 10*time.Second)
					} else {
						log.Printf("🔍 Imagem não encontrada para: %s → iniciando deploy automático", appID)
						appPath := filepath.Join(appsPath, appID)

						_, err := services.HandleDeployFromFolder(appPath, username, plan, appID)
						if err != nil {
							log.Printf("❌ Deploy automático falhou para %s: %v", appID, err)
							continue
						}
					}
				}
			}
		}

		time.Sleep(30 * time.Second)
	}
}

//package tools
//
//import (
//	"log"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/services"
//)
//
//const userBasePath = "storage/users"
//
//var monitoredContainers = make(map[string]bool)
//
//var validPlans = []string{"no-plan", "basic", "pro", "premium", "enterprise"}
//
//func imageExists(imageName string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}")
//	output, err := cmd.Output()
//	if err != nil {
//		log.Printf("⚠️ Erro ao listar imagens Docker: %v", err)
//		return false
//	}
//
//	repos := strings.Split(strings.TrimSpace(string(output)), "\n")
//	for _, repo := range repos {
//		if repo == imageName {
//			return true
//		}
//	}
//	return false
//}
//
//func monitorContainer(containerName string, interval time.Duration) {
//	for {
//		checkCmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}")
//		out, err := checkCmd.Output()
//		if err != nil {
//			log.Printf("❌ Erro ao listar containers: %v", err)
//			time.Sleep(interval)
//			continue
//		}
//
//		exists := false
//		for _, name := range strings.Split(strings.TrimSpace(string(out)), "\n") {
//			if name == containerName {
//				exists = true
//				break
//			}
//		}
//
//		if !exists {
//			log.Printf("📦 Container %s não existe. Criando...", containerName)
//			createCmd := exec.Command("docker", "create", "--name", containerName, containerName)
//			if out, err := createCmd.CombinedOutput(); err != nil {
//				log.Printf("❌ Falha ao criar container %s: %v — %s", containerName, err, string(out))
//				time.Sleep(interval)
//				continue
//			}
//			log.Printf("✅ Container %s criado com sucesso.", containerName)
//		}
//
//		inspectCmd := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", containerName)
//		output, err := inspectCmd.Output()
//		if err != nil {
//			log.Printf("🚫 %s → erro ao inspecionar: %v", containerName, err)
//		} else {
//			running := strings.TrimSpace(string(output))
//			if running == "true" {
//				log.Printf("✅ %s está rodando.", containerName)
//			} else {
//				log.Printf("🛑 %s está parado. Reiniciando...", containerName)
//				restart := exec.Command("docker", "restart", containerName)
//				err := restart.Run()
//				if err != nil {
//					log.Printf("❌ Falha ao reiniciar %s: %v", containerName, err)
//				} else {
//					log.Printf("🔄 %s reiniciado com sucesso.", containerName)
//				}
//			}
//		}
//
//		time.Sleep(interval)
//	}
//}
//
//func StartWatchdog() {
//	for {
//		userDirs, err := os.ReadDir(userBasePath)
//		if err != nil {
//			log.Printf("❌ Erro ao acessar %s: %v", userBasePath, err)
//			time.Sleep(30 * time.Second)
//			continue
//		}
//
//		for _, userEntry := range userDirs {
//			if !userEntry.IsDir() {
//				continue
//			}
//			username := userEntry.Name()
//
//			userPath := filepath.Join(userBasePath, username)
//			planDirs, err := os.ReadDir(userPath)
//			if err != nil {
//				continue // Silencioso
//			}
//
//			for _, planEntry := range planDirs {
//				if !planEntry.IsDir() {
//					continue
//				}
//				plan := planEntry.Name()
//
//				// ✅ Ignora pastas que não são planos válidos
//				isValid := false
//				for _, vp := range validPlans {
//					if plan == vp {
//						isValid = true
//						break
//					}
//				}
//				if !isValid {
//					continue
//				}
//
//				appsPath := filepath.Join(userPath, plan, "apps")
//				appDirs, err := os.ReadDir(appsPath)
//				if err != nil {
//					continue // Silencioso
//				}
//
//				for _, appEntry := range appDirs {
//					if !appEntry.IsDir() {
//						continue
//					}
//					appID := appEntry.Name()
//
//					if monitoredContainers[appID] {
//						continue
//					}
//
//					if imageExists(appID) {
//						log.Printf("📦 Imagem localizada: %s → iniciando monitoramento", appID)
//						monitoredContainers[appID] = true
//						go monitorContainer(appID, 10*time.Second)
//					} else {
//						log.Printf("🔍 Imagem não encontrada para: %s → iniciando deploy automático", appID)
//						appPath := filepath.Join(appsPath, appID)
//
//						_, err := services.HandleDeployFromFolder(appPath, username, plan, appID)
//						if err != nil {
//							log.Printf("❌ Deploy automático falhou para %s: %v", appID, err)
//							continue
//						}
//					}
//				}
//			}
//		}
//
//		time.Sleep(30 * time.Second)
//	}
//}

//package tools
//
//import (
//	"log"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/services"
//)
//
//const userBasePath = "storage/users"
//
//var monitoredContainers = make(map[string]bool)
//
//func imageExists(imageName string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}")
//	output, err := cmd.Output()
//	if err != nil {
//		log.Printf("⚠️ Erro ao listar imagens Docker: %v", err)
//		return false
//	}
//
//	repos := strings.Split(strings.TrimSpace(string(output)), "\n")
//	for _, repo := range repos {
//		if repo == imageName {
//			return true
//		}
//	}
//	return false
//}
//
//func monitorContainer(containerName string, interval time.Duration) {
//	for {
//		checkCmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}")
//		out, err := checkCmd.Output()
//		if err != nil {
//			log.Printf("❌ Erro ao listar containers: %v", err)
//			time.Sleep(interval)
//			continue
//		}
//
//		exists := false
//		for _, name := range strings.Split(strings.TrimSpace(string(out)), "\n") {
//			if name == containerName {
//				exists = true
//				break
//			}
//		}
//
//		if !exists {
//			log.Printf("📦 Container %s não existe. Criando...", containerName)
//			createCmd := exec.Command("docker", "create", "--name", containerName, containerName)
//			if out, err := createCmd.CombinedOutput(); err != nil {
//				log.Printf("❌ Falha ao criar container %s: %v — %s", containerName, err, string(out))
//				time.Sleep(interval)
//				continue
//			}
//			log.Printf("✅ Container %s criado com sucesso.", containerName)
//		}
//
//		inspectCmd := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", containerName)
//		output, err := inspectCmd.Output()
//		if err != nil {
//			log.Printf("🚫 %s → erro ao inspecionar: %v", containerName, err)
//		} else {
//			running := strings.TrimSpace(string(output))
//			if running == "true" {
//				log.Printf("✅ %s está rodando.", containerName)
//			} else {
//				log.Printf("🛑 %s está parado. Reiniciando...", containerName)
//				restart := exec.Command("docker", "restart", containerName)
//				err := restart.Run()
//				if err != nil {
//					log.Printf("❌ Falha ao reiniciar %s: %v", containerName, err)
//				} else {
//					log.Printf("🔄 %s reiniciado com sucesso.", containerName)
//				}
//			}
//		}
//
//		time.Sleep(interval)
//	}
//}
//
//func StartWatchdog() {
//	//validPrefixes := []string{"application-", "pro-", "starter-"}
//
//	for {
//		userDirs, err := os.ReadDir(userBasePath)
//		if err != nil {
//			log.Printf("❌ Erro ao acessar %s: %v", userBasePath, err)
//			time.Sleep(30 * time.Second)
//			continue
//		}
//
//		for _, userEntry := range userDirs {
//			if !userEntry.IsDir() {
//				continue
//			}
//			username := userEntry.Name()
//
//			planDirs, err := os.ReadDir(filepath.Join(userBasePath, username))
//			if err != nil {
//				log.Printf("⚠️ Erro ao acessar planos de %s: %v", username, err)
//				continue
//			}
//
//			for _, planEntry := range planDirs {
//				if !planEntry.IsDir() {
//					continue
//				}
//				plan := planEntry.Name()
//				appsPath := filepath.Join(userBasePath, username, plan, "apps")
//
//				appDirs, err := os.ReadDir(appsPath)
//				if err != nil {
//					log.Printf("⚠️ Erro ao acessar apps de %s/%s: %v", username, plan, err)
//					continue
//				}
//
//				for _, appEntry := range appDirs {
//					if !appEntry.IsDir() {
//						continue
//					}
//					appID := appEntry.Name()
//
//					if monitoredContainers[appID] {
//						continue
//					}
//
//					if imageExists(appID) {
//						log.Printf("📦 Imagem localizada: %s → iniciando monitoramento", appID)
//						monitoredContainers[appID] = true
//						go monitorContainer(appID, 10*time.Second)
//					} else {
//						log.Printf("🔍 Imagem não encontrada para: %s → iniciando deploy automático", appID)
//						appPath := filepath.Join(appsPath, appID)
//
//						_, err := services.HandleDeployFromFolder(appPath, username, plan, appID)
//						if err != nil {
//							log.Printf("❌ Deploy automático falhou para %s: %v", appID, err)
//							continue
//						}
//					}
//				}
//			}
//		}
//
//		time.Sleep(30 * time.Second)
//	}
//}

//func StartWatchdog() {
//	validPrefixes := []string{"application-", "pro-", "starter-"}
//
//	for {
//		userDirs, err := os.ReadDir(userBasePath)
//		if err != nil {
//			log.Printf("❌ Erro ao acessar %s: %v", userBasePath, err)
//			time.Sleep(30 * time.Second)
//			continue
//		}
//
//		for _, userEntry := range userDirs {
//			if !userEntry.IsDir() {
//				continue
//			}
//			username := userEntry.Name()
//
//			planDirs, err := os.ReadDir(filepath.Join(userBasePath, username))
//			if err != nil {
//				log.Printf("⚠️ Erro ao acessar planos de %s: %v", username, err)
//				continue
//			}
//
//			for _, planEntry := range planDirs {
//				if !planEntry.IsDir() {
//					continue
//				}
//				plan := planEntry.Name()
//				appsPath := filepath.Join(userBasePath, username, plan, "apps")
//
//				appDirs, err := os.ReadDir(appsPath)
//				if err != nil {
//					log.Printf("⚠️ Erro ao acessar apps de %s/%s: %v", username, plan, err)
//					continue
//				}
//
//				for _, appEntry := range appDirs {
//					if !appEntry.IsDir() {
//						continue
//					}
//					appID := appEntry.Name()
//
//					// ✅ Aplica filtro por prefixo
//					valid := false
//					for _, prefix := range validPrefixes {
//						if strings.HasPrefix(appID, prefix) {
//							valid = true
//							break
//						}
//					}
//					if !valid {
//						continue
//					}
//
//					if monitoredContainers[appID] {
//						continue
//					}
//
//					if imageExists(appID) {
//						log.Printf("📦 Imagem localizada: %s → iniciando monitoramento", appID)
//						monitoredContainers[appID] = true
//						go monitorContainer(appID, 10*time.Second)
//					} else {
//						log.Printf("🔍 Imagem não encontrada para: %s → iniciando deploy automático", appID)
//						appPath := filepath.Join(appsPath, appID)
//
//						_, err := services.HandleDeployFromFolder(appPath, username, plan, appID)
//						if err != nil {
//							log.Printf("❌ Deploy automático falhou para %s: %v", appID, err)
//							continue
//						}
//					}
//				}
//			}
//		}
//
//		time.Sleep(30 * time.Second)
//	}
//}

//package tools
//
//import (
//	"log"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/services"
//)
//
//const userBasePath = "storage/users"
//
//var monitoredContainers = make(map[string]bool)
//
//func listValidFolders(prefixes []string) []string {
//	entries, err := os.ReadDir(userBasePath)
//	if err != nil {
//		log.Printf("❌ Erro ao acessar %s: %v", userBasePath, err)
//		return nil
//	}
//
//	var folders []string
//	for _, entry := range entries {
//		if entry.IsDir() {
//			name := entry.Name()
//			for _, prefix := range prefixes {
//				if strings.HasPrefix(name, prefix) {
//					folders = append(folders, name)
//					break
//				}
//			}
//		}
//	}
//	return folders
//}
//
//func imageExists(imageName string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}")
//	output, err := cmd.Output()
//	if err != nil {
//		log.Printf("⚠️ Erro ao listar imagens Docker: %v", err)
//		return false
//	}
//
//	repos := strings.Split(strings.TrimSpace(string(output)), "\n")
//	for _, repo := range repos {
//		if repo == imageName {
//			return true
//		}
//	}
//	return false
//}
//
//func monitorContainer(containerName string, interval time.Duration) {
//	for {
//		checkCmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}")
//		out, err := checkCmd.Output()
//		if err != nil {
//			log.Printf("❌ Erro ao listar containers: %v", err)
//			time.Sleep(interval)
//			continue
//		}
//
//		exists := false
//		for _, name := range strings.Split(strings.TrimSpace(string(out)), "\n") {
//			if name == containerName {
//				exists = true
//				break
//			}
//		}
//
//		if !exists {
//			log.Printf("📦 Container %s não existe. Criando...", containerName)
//			createCmd := exec.Command("docker", "create", "--name", containerName, containerName)
//			if out, err := createCmd.CombinedOutput(); err != nil {
//				log.Printf("❌ Falha ao criar container %s: %v — %s", containerName, err, string(out))
//				time.Sleep(interval)
//				continue
//			}
//			log.Printf("✅ Container %s criado com sucesso.", containerName)
//		}
//
//		inspectCmd := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", containerName)
//		output, err := inspectCmd.Output()
//		if err != nil {
//			log.Printf("🚫 %s → erro ao inspecionar: %v", containerName, err)
//		} else {
//			running := strings.TrimSpace(string(output))
//			if running == "true" {
//				log.Printf("✅ %s está rodando.", containerName)
//			} else {
//				log.Printf("🛑 %s está parado. Reiniciando...", containerName)
//				restart := exec.Command("docker", "restart", containerName)
//				err := restart.Run()
//				if err != nil {
//					log.Printf("❌ Falha ao reiniciar %s: %v", containerName, err)
//				} else {
//					log.Printf("🔄 %s reiniciado com sucesso.", containerName)
//				}
//			}
//		}
//
//		time.Sleep(interval)
//	}
//}
//
//func StartWatchdog() {
//	validPrefixes := []string{"application-", "pro-", "starter-"}
//
//	for {
//		folders := listValidFolders(validPrefixes)
//		if len(folders) == 0 {
//			log.Printf("⚠️ Nenhuma pasta válida encontrada em %s", userBasePath)
//		}
//
//		for _, name := range folders {
//			if monitoredContainers[name] {
//				continue
//			}
//
//			if imageExists(name) {
//				log.Printf("📦 Imagem localizada: %s → iniciando monitoramento", name)
//				monitoredContainers[name] = true
//				go monitorContainer(name, 10*time.Second)
//			} else {
//				log.Printf("🔍 Imagem não encontrada para: %s → iniciando deploy automático", name)
//				appPath := filepath.Join(userBasePath, name)
//				plan := strings.Split(name, "-")[0]
//				appID := name
//				username := "admin" // ou outro nome fixo para deploy automático
//
//				_, err := services.HandleDeployFromFolder(appPath, username, plan, appID)
//				if err != nil {
//					log.Printf("❌ Deploy automático falhou para %s: %v", name, err)
//					continue
//				}
//			}
//		}
//
//		time.Sleep(30 * time.Second)
//	}
//}

// 🔄 Verifica se o plano do usuário mudou e migra dados automaticamente
//func MonitorUserPlans(interval time.Duration) {
//	ticker := time.NewTicker(interval)
//	for range ticker.C {
//		sessions := models.LoadSessions()
//
//		for username, session := range sessions {
//			user := services.FindUserByEmail(session.Email)
//			if user != nil && string(user.Plan) != session.Plan {
//				log.Printf("🔄 Plano alterado para %s → migrando dados...", user.Plan)
//
//				err := services.RenameUserPlanFolder(user.Email, user.Plan)
//				if err != nil {
//					log.Printf("❌ Falha na migração: %v", err)
//					continue
//				}
//
//				// 🧠 Atualiza plano na sessão
//				session.Plan = string(user.Plan)
//				sessions[username] = session
//			}
//		}
//
//		// 💾 Salva todas as sessões atualizadas
//		if err := models.SaveSessions(sessions); err != nil {
//			log.Printf("❌ Erro ao salvar sessões atualizadas: %v", err)
//		}
//	}
//}

//package tools
//
//import (
//	"log"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/services"
//)
//
//// 📁 Caminho base onde ficam as pastas de aplicações
//const appBasePath = "storage/users/apps"
//
//// 🧠 Controle de containers já monitorados
//var monitoredContainers = make(map[string]bool)
//
//// 🗂️ Lista todas as pastas válidas (aplicações) com prefixos reconhecidos
//func listValidFolders(prefixes []string) []string {
//	entries, err := os.ReadDir(appBasePath)
//	if err != nil {
//		log.Printf("❌ Erro ao acessar %s: %v", appBasePath, err)
//		return nil
//	}
//
//	var folders []string
//	for _, entry := range entries {
//		if entry.IsDir() {
//			name := entry.Name()
//			for _, prefix := range prefixes {
//				if strings.HasPrefix(name, prefix) {
//					folders = append(folders, name)
//					break
//				}
//			}
//		}
//	}
//
//	return folders
//}
//
//// 🔍 Verifica se uma imagem Docker com o mesmo nome da pasta existe
//func imageExists(imageName string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}")
//	output, err := cmd.Output()
//	if err != nil {
//		log.Printf("⚠️ Erro ao listar imagens Docker: %v", err)
//		return false
//	}
//
//	repos := strings.Split(strings.TrimSpace(string(output)), "\n")
//	for _, repo := range repos {
//		if repo == imageName {
//			return true
//		}
//	}
//
//	return false
//}
//
//// 🔁 Monitora o container e tenta reiniciar se estiver parado
//func monitorContainer(containerName string, interval time.Duration) {
//	for {
//		checkCmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}")
//		out, err := checkCmd.Output()
//		if err != nil {
//			log.Printf("❌ Erro ao listar containers: %v", err)
//			time.Sleep(interval)
//			continue
//		}
//
//		exists := false
//		for _, name := range strings.Split(strings.TrimSpace(string(out)), "\n") {
//			if name == containerName {
//				exists = true
//				break
//			}
//		}
//
//		if !exists {
//			log.Printf("📦 Container %s não existe. Criando...", containerName)
//			createCmd := exec.Command("docker", "create", "--name", containerName, containerName)
//			if out, err := createCmd.CombinedOutput(); err != nil {
//				log.Printf("❌ Falha ao criar container %s: %v — %s", containerName, err, string(out))
//				time.Sleep(interval)
//				continue
//			}
//			log.Printf("✅ Container %s criado com sucesso.", containerName)
//		}
//
//		inspectCmd := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", containerName)
//		output, err := inspectCmd.Output()
//		if err != nil {
//			log.Printf("🚫 %s → erro ao inspecionar: %v", containerName, err)
//		} else {
//			running := strings.TrimSpace(string(output))
//			if running == "true" {
//				log.Printf("✅ %s está rodando.", containerName)
//			} else {
//				log.Printf("🛑 %s está parado. Reiniciando...", containerName)
//				restart := exec.Command("docker", "restart", containerName)
//				err := restart.Run()
//				if err != nil {
//					log.Printf("❌ Falha ao reiniciar %s: %v", containerName, err)
//				} else {
//					log.Printf("🔄 %s reiniciado com sucesso.", containerName)
//				}
//			}
//		}
//
//		time.Sleep(interval)
//	}
//}
//
//// 🚀 Inicia o watchdog com verificação contínua a cada 60 segundos
//func StartWatchdog() {
//	validPrefixes := []string{"application-", "pro-", "starter-"}
//
//	for {
//		folders := listValidFolders(validPrefixes)
//		if len(folders) == 0 {
//			log.Printf("⚠️ Nenhuma pasta válida encontrada em %s", appBasePath)
//		}
//
//		for _, name := range folders {
//			if monitoredContainers[name] {
//				continue // já está sendo monitorado
//			}
//
//			if imageExists(name) {
//				log.Printf("📦 Imagem localizada: %s → iniciando monitoramento", name)
//				monitoredContainers[name] = true
//				go monitorContainer(name, 10*time.Second)
//			} else {
//				log.Printf("🔍 Imagem não encontrada para: %s → iniciando deploy automático", name)
//				appPath := filepath.Join(appBasePath, name)
//				plan := strings.Split(name, "-")[0]
//				appID := name
//
//				_, err := services.HandleDeployFromFolder(appPath, plan, appID)
//				if err != nil {
//					log.Printf("❌ Deploy automático falhou para %s: %v", name, err)
//					continue
//				}
//			}
//		}
//
//		time.Sleep(30 * time.Second) // ⏱️ Revarre a cada minuto
//	}
//}
//
