//backend/limits/apps.go

package limits

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

// 📦 Conta quantos containers ativos pertencem ao usuário
func CountUserContainers(username string) int {
	cmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}")
	output, err := cmd.Output()
	if err != nil {
		log.Printf("⚠️ Erro ao listar aplicações: %v", err)
		return 0
	}

	lines := strings.Split(string(output), "\n")
	count := 0
	for _, name := range lines {
		if strings.HasPrefix(name, username+"-") {
			count++
		}
	}
	return count
}

// 📦 Conta quantas aplicações o usuário possui com base nas pastas reais e válidas
func CountUserApps(username string, plan string) int {
	appsPath := filepath.Join("storage", "users", username, plan, "apps")
	//log.Printf("[CountUserApps] Verificando pasta: %s\n", appsPath)

	entries, err := os.ReadDir(appsPath)
	if err != nil {
		//log.Printf("[CountUserApps] Erro ao ler diretório: %v\n", err)
		return 0
	}

	count := 0
	for _, entry := range entries {
		if entry.IsDir() {
			flagPath := filepath.Join(appsPath, entry.Name(), "incomplete.flag")
			if _, err := os.Stat(flagPath); os.IsNotExist(err) {
				//log.Printf(" - Pasta válida encontrada: %s\n", entry.Name())
				count++
			} else {
				//log.Printf(" - Ignorada (deploy incompleto): %s\n", entry.Name())
			}
		} else {
			//log.Printf(" - Ignorada (não é pasta): %s\n", entry.Name())
		}
	}
	//log.Printf("[CountUserApps] Total de aplicações válidas: %d\n", count)
	return count
}

// 🚦 Verifica se o usuário pode fazer novo deploy
func IsUserEligibleForDeploy(username string, planName string) error {
	user := store.UserStore[username]
	if user == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	plan := models.Plans[user.Plan]
	appCount := CountUserContainers(username)
	ramUsed := SumUserRAM(username) // já em MB

	log.Printf("[Deploy Check] Usuário: %s | Plano: %s | Apps: %d | RAM: %.2fMB\n",
		username, plan.Name, appCount, ramUsed)

	// 🚫 Limite de aplicações
	if appCount >= plan.MaxProjects {
		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
	}

	// 🔧 Corrige cálculo de RAM disponível
	totalMB := float32(plan.MemoryMB) // MemoryMB já está em MB

	if totalMB-ramUsed < float32(plan.PerAppMB) {
		return fmt.Errorf("RAM insuficiente (mínimo %dMB por aplicação)", plan.PerAppMB)
	}

	return nil
}

// 🚦 Verifica se o usuário pode fazer novo deploy
//func IsUserEligibleForDeploy(username string, planName string) error {
//	user := store.UserStore[username]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//	appCount := CountUserContainers(username)
//	ramUsed := SumUserRAM(username) // já em MB
//
//	log.Printf("[Deploy Check] Usuário: %s | Plano: %s | Apps: %d | RAM: %.2fMB\n",
//		username, plan.Name, appCount, ramUsed)
//
//	// 🚫 Limite de aplicações
//	if appCount >= plan.MaxProjects {
//		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
//	}
//
//	// 🔧 Corrige cálculo de RAM disponível
//	totalMB := float32(plan.MemoryMB) // se MemoryMB já está em MB
//	// totalMB := float32(plan.MemoryMB * 1024) // se MemoryMB está em GB
//
//	if totalMB-ramUsed < 256 {
//		return fmt.Errorf("RAM insuficiente (mínimo 256MB por aplicação)")
//	}
//
//	return nil
//}

// 🚦 Verifica se o usuário pode fazer novo deploy
//func IsUserEligibleForDeploy(username string, planName string) error {
//	user := store.UserStore[username]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//	appCount := CountUserContainers(username)
//	//appCount := CountUserApps(username, planName)
//	ramUsed := SumUserRAM(username)
//
//	log.Printf("[Deploy Check] Usuário: %s | Plano: %s | Apps: %d | RAM: %.2fMB\n",
//		username, plan.Name, appCount, ramUsed)
//
//	if appCount >= plan.MaxProjects {
//		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
//	}
//	if float32(plan.MemoryMB)-ramUsed < 256 {
//		return fmt.Errorf("RAM insuficiente (mínimo 256MB por aplicação)")
//	}
//
//	return nil
//}

// 💾 Soma a RAM utilizada por todas as aplicações do usuário (em MB)
//func SumUserRAM(username string) float32 {
//	var total float32
//	for _, app := range store.AppStore {
//		if app.UserID == username {
//			total += app.RAMUsage * 1024 // ✅ converte GB → MB
//		}
//	}
//	return total
//}

//func CountUserApps(username string, plan string) int {
//	appsPath := filepath.Join("storage", "users", username, plan, "apps")
//	log.Printf("[CountUserApps] Verificando pasta: %s\n", appsPath)
//
//	entries, err := os.ReadDir(appsPath)
//	if err != nil {
//		log.Printf("[CountUserApps] Erro ao ler diretório: %v\n", err)
//		return 0
//	}
//
//	count := 0
//	for _, entry := range entries {
//		if entry.IsDir() && strings.HasPrefix(entry.Name(), plan+"-") {
//			flagPath := filepath.Join(appsPath, entry.Name(), "incomplete.flag")
//			if _, err := os.Stat(flagPath); os.IsNotExist(err) {
//				log.Printf(" - Pasta válida encontrada: %s\n", entry.Name())
//				count++
//			} else {
//				log.Printf(" - Ignorada (deploy incompleto): %s\n", entry.Name())
//			}
//		} else {
//			log.Printf(" - Ignorada: %s\n", entry.Name())
//		}
//	}
//	log.Printf("[CountUserApps] Total de aplicações válidas: %d\n", count)
//	return count
//}

//package limits
//
//import (
//	"fmt"
//	"log"
//	"os"
//	"path/filepath"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 💾 Soma a RAM utilizada por todas as aplicações do usuário (em MB)
//func SumUserRAM(username string) float32 {
//	var total float32
//	for _, app := range store.AppStore {
//		if app.UserID == username {
//			total += app.RAMUsage * 1024 // ✅ converte GB → MB
//		}
//	}
//	return total
//}
//
//// 📦 Conta quantas aplicações o usuário possui com base nas pastas reais
//func CountUserApps(username string, plan string) int {
//	appsPath := filepath.Join("storage", "users", username, plan, "apps")
//	log.Printf("[CountUserApps] Verificando pasta: %s\n", appsPath)
//
//	entries, err := os.ReadDir(appsPath)
//	if err != nil {
//		log.Printf("[CountUserApps] Erro ao ler diretório: %v\n", err)
//		return 0
//	}
//
//	count := 0
//	for _, entry := range entries {
//		if entry.IsDir() {
//			count++
//		}
//	}
//	return count
//}
//
//// 🚦 Verifica se o usuário pode fazer novo deploy
//func IsUserEligibleForDeploy(username string, planName string) error {
//	user := store.UserStore[username]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//	appCount := CountUserApps(username, planName)
//	ramUsed := SumUserRAM(username)
//
//	log.Printf("[Deploy Check] Usuário: %s | Plano: %s | Apps: %d | RAM: %.2fMB\n",
//		username, plan.Name, appCount, ramUsed)
//
//	if appCount >= plan.MaxProjects {
//		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
//	}
//	if float32(plan.MemoryMB)-ramUsed < 256 {
//		return fmt.Errorf("RAM insuficiente (mínimo 256MB por aplicação)")
//	}
//
//	return nil
//}

//package limits
//
//import (
//	"fmt"
//	"log"
//	"os"
//	"path/filepath"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 💾 Soma a RAM utilizada por todas as aplicações do usuário (em MB)
//func SumUserRAM(username string) float32 {
//	var total float32
//	for _, app := range store.AppStore {
//		if app.UserID == username {
//			total += app.RAMUsage * 1024 // ✅ converte GB → MB
//		}
//	}
//	return total
//}
//
//// 📦 Conta quantas aplicações o usuário possui
//func CountUserApps(username string) int {
//	appsPath := filepath.Join("storage", "users", username, "apps")
//	entries, err := os.ReadDir(appsPath)
//	if err != nil {
//		return 0 // ou logar erro se quiser
//	}
//
//	count := 0
//	for _, entry := range entries {
//		if entry.IsDir() {
//			count++
//		}
//	}
//	return count
//}
//
//// 🚦 Verifica se o usuário pode fazer novo deploy
//func IsUserEligibleForDeploy(username string) error {
//	user := store.UserStore[username]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//	appCount := CountUserApps(username)
//	ramUsed := SumUserRAM(username)
//	log.Printf("[Deploy Check] Usuário: %s | Plano: %s | Apps: %d | RAM: %.2fMB\n",
//		username, plan.Name, appCount, ramUsed)
//	if appCount >= plan.MaxProjects {
//		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
//	}
//	if float32(plan.MemoryMB)-ramUsed < 256 {
//		return fmt.Errorf("RAM insuficiente (mínimo 256MB por aplicação)")
//	}
//
//	return nil
//}

//func CountUserApps(username string) int {
//	count := 0
//	for _, app := range store.AppStore {
//		if app.UserID == username {
//			count++
//		}
//	}
//	return count
//}

//package limits
//
//import (
//	"fmt"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 💾 Soma a RAM utilizada por todas as aplicações do usuário (em MB)
//func SumUserRAM(userID string) float32 {
//	var total float32
//	for _, app := range store.AppStore {
//		if app.UserID == userID {
//			total += app.RAMUsage * 1024 // ✅ converte GB → MB
//		}
//	}
//	return total
//}
//
//// 📦 Conta quantas aplicações o usuário possui
//func CountUserApps(userID string) int {
//	count := 0
//	for _, app := range store.AppStore {
//		if app.UserID == userID {
//			count++
//		}
//	}
//	return count
//}
//
//// 🚦 Verifica se o usuário pode fazer novo deploy
//func IsUserEligibleForDeploy(userID string) error {
//	user := store.GetUserByID(userID)
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//
//	ramUsed := SumUserRAM(userID)
//	if float32(plan.MemoryMB)-ramUsed < 256 {
//		return fmt.Errorf("RAM insuficiente (mínimo 256MB por aplicação)")
//	}
//
//	appCount := CountUserApps(userID)
//	if appCount >= plan.MaxProjects {
//		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
//	}
//
//	return nil
//}

//func SumUserRAM(userID string) float32 {
//	var total float32
//	for _, app := range store.AppStore {
//		if app.UserID == userID {
//			total += app.RAMUsage
//		}
//	}
//	return total
//}

// 🚦 Verifica se o usuário pode fazer novo deploy
//func IsUserEligibleForDeploy(userID string) error {
//	user := store.UserStore[userID]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//
//	ramUsed := SumUserRAM(userID)
//	if float32(plan.MemoryMB)-ramUsed < 256 {
//		return fmt.Errorf("RAM insuficiente (mínimo 256MB por aplicação)")
//	}
//
//	appCount := CountUserApps(userID)
//	if appCount >= plan.MaxProjects {
//		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
//	}
//
//	return nil
//}

//package limits
//
//import (
//	"fmt"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 💾 Soma a RAM utilizada por todas as aplicações do usuário
//func SumUserRAM(userID string) float32 {
//	var total float32
//	for _, app := range store.AppStore {
//		if app.UserID == userID {
//			total += app.RAMUsage
//		}
//	}
//	return total
//}
//
//// 📦 Conta quantas aplicações o usuário possui
//func CountUserApps(userID string) int {
//	count := 0
//	for _, app := range store.AppStore {
//		if app.UserID == userID {
//			count++
//		}
//	}
//	return count
//}
//
//// 🚦 Verifica se o usuário pode fazer novo deploy
//func IsUserEligibleForDeploy(userID string) error {
//	user := store.UserStore[userID]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//
//	ramUsed := SumUserRAM(userID)
//	if plan.MemoryGB-ramUsed < 0.25 {
//		return fmt.Errorf("RAM insuficiente (mínimo 256MB por aplicação)")
//	}
//
//	appCount := CountUserApps(userID)
//	if appCount >= plan.MaxProjects {
//		return fmt.Errorf("limite de %d aplicações atingido para o plano '%s'", plan.MaxProjects, plan.Name)
//	}
//
//	return nil
//}
