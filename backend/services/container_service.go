//backend/services/container_service.go

package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

// 📦 Estrutura de retorno para ações locais com Docker
type ContainerResult struct {
	ID        string    `json:"id"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

// 🧠 Helper para executar comandos Docker
func RunDocker(args ...string) ([]byte, error) {
	cmd := exec.Command("docker", args...)
	return cmd.CombinedOutput()
}

// 🔍 Verifica se o container já existe
func ContainerExists(ctx context.Context, name string) (bool, error) {
	out, err := RunDocker("ps", "-a", "--filter", fmt.Sprintf("name=%s", name), "--format", "{{.Names}}")
	if err != nil {
		log.Printf("Erro ao verificar container '%s': %v\n%s", name, err, string(out))
		return false, err
	}
	return strings.Contains(string(out), name), nil
}

// 🧼 Remove o container se já existir
func EnsureCleanContainer(name string) error {
	// 🔍 Verifica se o container existe
	exists, err := ContainerExists(context.Background(), name)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência do container: %w", err)
	}

	// ❌ Remove se existir
	if exists {
		out, err := RunDocker("rm", "-f", name)
		if err != nil {
			return fmt.Errorf("erro ao remover container existente: %s", string(out))
		}
	}

	// ✅ Tudo limpo
	return nil
}

// 🐳 Criação de container via CLI com suporte a volume, workdir, comando, reinício automático e label de usuário
func CreateContainer(appID, image string, volumePath string, workdir string, command []string, username string) (*ContainerResult, error) {
	containerName := utils.GetContainerName(username, appID)
	imageName := fmt.Sprintf("%s-%s", username, appID) // 📦 imagem personalizada

	// 🧪 Log defensivo
	log.Printf("🧪 CreateContainer: username='%s'", username)

	if err := EnsureCleanContainer(containerName); err != nil {
		return nil, err
	}

	// 🔍 Recupera plano do usuário
	user := store.UserStore[username]
	if user == nil {
		return nil, fmt.Errorf("usuário não encontrado")
	}
	plan := models.Plans[user.Plan]

	args := []string{
		"run", "-d",
		"--restart=no", // 🛡️ reinício automático
		"--name", containerName,
		"--label", "username=" + username,
		"--memory", fmt.Sprintf("%dM", plan.MemoryMB),
		"--memory-swap", fmt.Sprintf("%dM", plan.MemoryMB),
	}

	if volumePath != "" {
		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
	}

	if workdir != "" {
		args = append(args, "-w", workdir)
	}

	args = append(args, imageName) // usa imagem personalizada
	args = append(args, command...)

	out, err := RunDocker(args...)
	if err != nil {
		return nil, fmt.Errorf("falha no docker run: %s", string(out))
	}

	return &ContainerResult{
		ID:        containerName,
		Message:   "Container criado com política de reinício automático 🛡️ e limite de memória aplicado",
		Timestamp: time.Now(),
	}, nil
}

// 📡 Criação de container via API interna (modo seguro)
func CallContainerCreation(payload map[string]string, token string) error {
	containerName := utils.GetContainerName(payload["username"], payload["name"])

	if err := EnsureCleanContainer(containerName); err != nil {
		return err
	}

	// 🏷️ Adiciona labels ao payload
	payload["label_name"] = containerName
	payload["label_user"] = payload["username"]

	// 🔍 Recupera plano do usuário e adiciona limite de memória
	user := store.UserStore[payload["username"]]
	if user != nil {
		plan := models.Plans[user.Plan]
		payload["memory"] = fmt.Sprintf("%dM", plan.MemoryMB)
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao enviar requisição: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("falha na criação do container: %s", resp.Status)
	}
	return nil
}

// 🔀 Criação híbrida — escolhe entre CLI ou API interna, com suporte a username
func CreateContainerHybrid(appID, image string, useAPI bool, token string, username string) (*ContainerResult, error) {
	imageName := fmt.Sprintf("%s-%s", username, appID) // 📦 imagem personalizada
	containerName := utils.GetContainerName(username, appID)

	if useAPI {
		payload := map[string]string{
			"name":     appID,
			"image":    imageName,
			"username": username,
		}
		err := CallContainerCreation(payload, token)
		if err != nil {
			return nil, err
		}
		return &ContainerResult{
			ID:        containerName,
			Message:   "Container criado via API interna",
			Timestamp: time.Now(),
		}, nil
	}

	return CreateContainer(appID, imageName, "", "/app", nil, username)
}

// 🧼 Remoção de container via CLI local (manual)
func DeleteContainer(appID, username string) (*ContainerResult, error) {
	containerName := utils.GetContainerName(username, appID)
	out, err := RunDocker("rm", "-f", containerName)
	if err != nil {
		return nil, fmt.Errorf("erro ao executar docker rm: %s", string(out))
	}
	return &ContainerResult{
		ID:        containerName,
		Message:   "Container removido com sucesso",
		Timestamp: time.Now(),
	}, nil
}

// 📄 Logs do container
func GetContainerLogs(name string) (string, error) {
	out, err := RunDocker("logs", name)
	if err != nil {
		return "", fmt.Errorf("erro ao obter logs: %s", string(out))
	}
	return string(out), nil
}

// 🧠 Verifica se imagem existe localmente
func ImageExists(image string) bool {
	out, err := RunDocker("images", "--format", "{{.Repository}}:{{.Tag}}")
	if err != nil {
		return false
	}
	return strings.Contains(string(out), image)
}

// ▶️ Lista containers em execução
func ListRunningContainers() ([]string, error) {
	out, err := RunDocker("ps", "--format", "{{.Names}}")
	if err != nil {
		return nil, err
	}
	return strings.Split(strings.TrimSpace(string(out)), "\n"), nil
}

// 📋 Lista containers de um usuário via prefixo
func ListUserContainers(username string) ([]string, error) {
	pattern := fmt.Sprintf("^%s-", username)
	cmd := exec.Command("sh", "-c", fmt.Sprintf(`docker ps -a --format "{{.Names}}" | grep "%s"`, pattern))
	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("erro ao listar containers: %v", err)
	}
	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	return lines, nil
}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU)
func ListAllContainersWithStatusFast() ([]*models.App, error) {
	// 📋 Lista containers com nome e status
	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
	if err != nil {
		return nil, err
	}

	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
	if len(lines) == 0 {
		return []*models.App{}, nil
	}

	var containerNames []string
	statusMap := map[string]string{}

	for _, line := range lines {
		parts := strings.Split(line, "|")
		if len(parts) != 2 {
			continue
		}
		name := parts[0]
		status := strings.ToLower(parts[1])
		containerNames = append(containerNames, name)
		statusMap[name] = status
	}

	// 🔍 Inspeciona containers em lote para pegar username e start time
	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
	inspectOut, err := RunDocker(inspectArgs...)
	if err != nil {
		return nil, err
	}

	var apps []*models.App
	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")

	for _, line := range inspectLines {
		parts := strings.Split(line, "|")
		if len(parts) != 3 {
			continue
		}

		name := strings.TrimPrefix(parts[0], "/")
		username := parts[1]
		startTimeRaw := parts[2]

		if username == "" {
			continue
		}

		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
		if err != nil {
			parsedTime = time.Time{}
		}

		rawStatus := statusMap[name]
		var appStatus models.AppStatus
		switch {
		case strings.Contains(rawStatus, "up"):
			appStatus = models.StatusRunning
		case strings.Contains(rawStatus, "exited"):
			appStatus = models.StatusStopped
		default:
			appStatus = models.StatusBackups
		}

		// ✅ Busca app real pelo ContainerName
		var matchedApp *models.App
		for _, app := range store.AppStore {
			if app.ContainerName == name {
				matchedApp = app
				break
			}
		}

		if matchedApp != nil {
			matchedApp.Status = appStatus
			matchedApp.StartTime = parsedTime
			apps = append(apps, matchedApp)
		} else {
			log.Println("⚠️ Ignorando container não registrado:", name)
		}
	}

	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
	if err == nil {
		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
		for _, line := range statsLines {
			parts := strings.Split(line, "|")
			if len(parts) != 3 {
				continue
			}
			name := parts[0]
			cpuStr := strings.TrimSuffix(parts[1], "%")
			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"

			// 🔧 Normaliza memória usada e limite para MB
			memFields := strings.Fields(memStr)
			if len(memFields) >= 3 {
				usedStr := memFields[0]  // "85.3MiB"
				limitStr := memFields[2] // "256MiB"

				usedMB := normalizeMemToMB(usedStr)
				limitMB := normalizeMemToMB(limitStr)

				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)

				// ✅ Atualiza AppStore com métricas normalizadas
				for _, app := range store.AppStore {
					if app.ContainerName == name {
						// CPU
						app.CPUUsage = float32(cpuVal)

						// pega o plano do usuário dono da app
						plan := models.Plans[models.PlanType(app.Plan)]
						cpuLimit := float32(plan.CPUvCores)

						// 🚀 RAM: usa limite do plano (MemoryMB)
						ramLimit := float32(plan.MemoryMB)

						// regra: se plano tiver menos que 256 MB, não sobe aplicação
						if ramLimit < 256 {
							log.Printf("❌ Plano %s possui apenas %.2f MB. Aplicação %s não pode ser iniciada.", plan.Name, ramLimit, app.ContainerName)
							continue
						}

						app.CPULimit = cpuLimit
						app.RAMLimit = ramLimit

						// cálculo relativo ao plano (CPU)
						if cpuLimit > 0 {
							hostCPUs := runtime.NumCPU()
							usedCores := (app.CPUUsage / 100.0) * float32(hostCPUs)
							app.CPUPercent = (usedCores / cpuLimit) * 100
						}

						// cálculo relativo ao plano (RAM)
						app.RAMUsage = float32(usedMB)
						if ramLimit > 0 {
							app.RAMPercent = (app.RAMUsage / ramLimit) * 100
						}

						// alerta de limite (RAM do Docker vs plano)
						app.Alert = fmt.Sprintf("Limite Docker: %.2f MB | Plano: %.2f MB", limitMB, ramLimit)
					}
				}
			}
		}
	} else {
		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
	}

	return apps, nil
}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU)
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						// CPU
//						app.CPUUsage = float32(cpuVal)
//
//						// pega o plano do usuário dono da app
//						plan := models.Plans[models.PlanType(app.Plan)]
//						cpuLimit := float32(plan.CPUvCores)
//
//						// 🚀 RAM: usa limite do plano (MemoryMB), mas garante mínimo PerAppMB
//						ramLimit := float32(plan.MemoryMB)
//						if ramLimit < float32(plan.PerAppMB) {
//							ramLimit = float32(plan.PerAppMB)
//						}
//
//						app.CPULimit = cpuLimit
//						app.RAMLimit = ramLimit
//
//						// cálculo relativo ao plano (CPU)
//						if cpuLimit > 0 {
//							hostCPUs := runtime.NumCPU()
//							usedCores := (app.CPUUsage / 100.0) * float32(hostCPUs)
//							app.CPUPercent = (usedCores / cpuLimit) * 100
//						}
//
//						// cálculo relativo ao plano (RAM)
//						app.RAMUsage = float32(usedMB)
//						if ramLimit > 0 {
//							app.RAMPercent = (app.RAMUsage / ramLimit) * 100
//						}
//
//						// alerta de limite (RAM do Docker vs plano)
//						app.Alert = fmt.Sprintf("Limite Docker: %.2f MB | Plano: %.2f MB", limitMB, ramLimit)
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU)
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						// CPU
//						app.CPUUsage = float32(cpuVal)
//
//						// pega o plano do usuário dono da app
//						plan := models.Plans[models.PlanType(app.Plan)]
//						cpuLimit := float32(plan.CPUvCores)
//						ramLimit := float32(plan.PerAppMB) // limite de RAM por aplicação
//
//						app.CPULimit = cpuLimit
//						app.RAMLimit = ramLimit
//
//						// cálculo relativo ao plano (CPU)
//						if cpuLimit > 0 {
//							hostCPUs := runtime.NumCPU()
//							usedCores := (app.CPUUsage / 100.0) * float32(hostCPUs)
//							app.CPUPercent = (usedCores / cpuLimit) * 100
//						}
//
//						// cálculo relativo ao plano (RAM)
//						app.RAMUsage = float32(usedMB)
//						if ramLimit > 0 {
//							app.RAMPercent = (app.RAMUsage / ramLimit) * 100
//						}
//
//						// alerta de limite (RAM do Docker, opcional)
//						app.Alert = fmt.Sprintf("Limite Docker: %.2f MB | Plano: %.2f MB", limitMB, ramLimit)
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU)
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						// uso bruto (% do host)
//						app.CPUUsage = float32(cpuVal)
//
//						// RAM
//						app.RAMUsage = float32(usedMB)
//						app.Alert = fmt.Sprintf("Limite: %.2f MB", limitMB)
//
//						// 🔧 pega o plano do usuário dono da app
//						plan := models.Plans[models.PlanType(app.Plan)]
//						cpuLimit := float32(plan.CPUvCores)
//
//						app.CPULimit = cpuLimit
//
//						// cálculo relativo ao plano (sem depender da CPU total do host)
//						if cpuLimit > 0 {
//							// converte % do host em núcleos consumidos
//							hostCPUs := runtime.NumCPU()
//							usedCores := (app.CPUUsage / 100.0) * float32(hostCPUs)
//
//							// percentual relativo ao plano
//							app.CPUPercent = (usedCores / cpuLimit) * 100
//						}
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}

// 🔧 Função auxiliar para normalizar valores de memória para MB
func normalizeMemToMB(valStr string) float64 {
	if strings.HasSuffix(valStr, "KiB") {
		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "KiB"), 64)
		return num / 1024.0
	} else if strings.HasSuffix(valStr, "MiB") {
		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "MiB"), 64)
		return num
	} else if strings.HasSuffix(valStr, "GiB") {
		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "GiB"), 64)
		return num * 1024.0
	}
	num, _ := strconv.ParseFloat(valStr, 64)
	return num
}

// 🧠 Extrai label username do container
func GetContainerUsername(name string) string {
	cmd := exec.Command("docker", "inspect", "--format", "{{ index .Config.Labels \"username\" }}", name)
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

// 🕒 Extrai StartTime real do container
func GetContainerStartTime(name string) time.Time {
	cmd := exec.Command("docker", "inspect", "--format", "{{ .State.StartedAt }}", name)
	out, err := cmd.Output()
	if err != nil {
		return time.Now()
	}
	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(string(out)))
	if err != nil {
		return time.Now()
	}
	return parsed
}

// 🔄 Sincroniza AppStore com containers Docker
func SyncAppStoreWithDocker() {
	// 🔐 Recupera sessão atual via token
	token := store.GetSessionToken("current") // ou use o nome do usuário ativo
	session, ok := models.GetSessionByToken(token)
	if !ok || session.Username == "" {
		//log.Println("ℹ️ Nenhum usuário logado — sincronização ignorada")
		return
	}

	// 🐳 Lista containers ativos
	allContainers, err := ListAllContainersWithStatusFast()
	if err != nil {
		log.Println("❌ Erro ao sincronizar containers:", err)
		return
	}

	if len(allContainers) == 0 {
		log.Println("ℹ️ Nenhum container encontrado — usuário sem aplicações ativas")
		return
	}

	// 🔁 Atualiza AppStore com base nos containers
	for _, app := range allContainers {
		var foundID string
		for id, existing := range store.AppStore {
			if existing.ContainerName == app.ContainerName {
				foundID = id
				break
			}
		}

		if foundID != "" {
			existing := store.AppStore[foundID]
			existing.Status = app.Status
			existing.Logs = app.Logs
			existing.RAMUsage = app.RAMUsage
			existing.CPUUsage = app.CPUUsage     // ✅ novo
			existing.CPULimit = app.CPULimit     // ✅ novo
			existing.CPUPercent = app.CPUPercent // ✅ novo
			existing.Port = app.Port
			existing.Alert = app.Alert
		} else {
			store.AppStore[app.ID] = app
		}
	}

	// 💾 Salva AppStore atualizada
	err = store.SaveAppStoreToDisk("./database/appstore.json")
	if err != nil {
		log.Println("❌ Erro ao salvar AppStore sincronizado:", err)
	}
}

// 🧹 Remove entradas do AppStore cujos containers não existem mais (com grace period)
func CleanAppStoreFromMissingContainers() {
	for id, app := range store.AppStore {
		exists, err := ContainerExists(context.Background(), app.ContainerName)
		if err != nil {
			log.Printf("⚠️ Erro ao verificar container '%s': %v", app.ContainerName, err)
			continue
		}

		if !exists {
			app.MissingCount++
			log.Printf("⚠️ Container '%s' não encontrado (tentativa %d)", app.ContainerName, app.MissingCount)

			// só remove se ficar ausente por 3 ciclos consecutivos
			if app.MissingCount >= 3 {
				log.Printf("🧹 Removendo app '%s' — ausente por 3 ciclos", id)
				delete(store.AppStore, id)
			}
		} else {
			// reset se voltou a aparecer
			app.MissingCount = 0
		}
	}

	if err := store.SaveAppStoreToDisk("./database/appstore.json"); err != nil {
		log.Println("❌ Erro ao salvar AppStore após limpeza:", err)
	}
}

// 📋 Lista containers com status por prefixo de usuário
func ListContainersWithStatusByPrefix(username string) ([]string, error) {
	// 🔍 Executa docker ps -a e filtra containers que começam com o prefixo do usuário
	out, err := RunDocker("ps", "-a", "--format", "{{.Names}}|{{.Status}}")
	if err != nil {
		return nil, fmt.Errorf("erro ao listar containers: %v", err)
	}

	var filtered []string
	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	prefix := fmt.Sprintf("%s-", username)

	for _, line := range lines {
		if strings.HasPrefix(line, prefix) {
			filtered = append(filtered, line)
		}
	}
	return filtered, nil
}

// 📊 Lista containers reais do Docker como modelos App
func ListRealAppsByUser(username string) ([]*models.App, error) {
	all, err := ListAllContainersWithStatusFast()
	if err != nil {
		return nil, err
	}
	var filtered []*models.App
	for _, app := range all {
		if app.Username == username {
			filtered = append(filtered, app)
		}
	}
	return filtered, nil
}

func CreateContainerFromApp(app *models.App, token string) error {
	// 🔐 Valida token
	if token == "" {
		return fmt.Errorf("token ausente — requisição não autorizada")
	}

	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)

	// 🔍 Recupera plano do usuário
	user := store.UserStore[app.Username]
	if user == nil {
		return fmt.Errorf("usuário não encontrado")
	}
	plan := models.Plans[user.Plan]

	// 📦 Payload para criação
	payload := map[string]string{
		"name":     containerName,
		"image":    imageName,
		"username": app.Username,
		"memory":   fmt.Sprintf("%dM", plan.MemoryMB),
	}

	// 🚀 Chama função que executa criação real
	return CallContainerCreation(payload, token)
}

//func CreateContainer(appID, image string, volumePath string, workdir string, command []string, username string) (*ContainerResult, error) {
//	containerName := utils.GetContainerName(username, appID)
//	imageName := fmt.Sprintf("%s-%s", username, appID) // 📦 imagem personalizada
//
//	// 🧪 Log defensivo
//	log.Printf("🧪 CreateContainer: username='%s'", username)
//
//	if err := EnsureCleanContainer(containerName); err != nil {
//		return nil, err
//	}
//
//	args := []string{
//		"run", "-d",
//		"--restart=no", // 🛡️ reinício automático
//		"--name", containerName,
//		"--label", "username=" + username,
//	}
//
//	if volumePath != "" {
//		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
//	}
//
//	if workdir != "" {
//		args = append(args, "-w", workdir)
//	}
//
//	args = append(args, imageName) // usa imagem personalizada
//	args = append(args, command...)
//
//	out, err := RunDocker(args...)
//	if err != nil {
//		return nil, fmt.Errorf("falha no docker run: %s", string(out))
//	}
//
//	return &ContainerResult{
//		ID:        containerName,
//		Message:   "Container criado com política de reinício automático 🛡️",
//		Timestamp: time.Now(),
//	}, nil
//}

// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	containerName := utils.GetContainerName(payload["username"], payload["name"])
//
//	if err := EnsureCleanContainer(containerName); err != nil {
//		return err
//	}
//
//	// 🏷️ Adiciona labels ao payload
//	payload["label_name"] = containerName
//	payload["label_user"] = payload["username"]
//
//	body, _ := json.Marshal(payload)
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token)
//
//	client := &http.Client{Timeout: 10 * time.Second}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}

// 🔄 Sincroniza AppStore com containers Docker
//func SyncAppStoreWithDocker() {
//	// 🔐 Recupera sessão atual via token
//	token := store.GetSessionToken("current") // ou use o nome do usuário ativo
//	session, ok := models.GetSessionByToken(token)
//	if !ok || session.Username == "" {
//		log.Println("ℹ️ Nenhum usuário logado — sincronização ignorada")
//		return
//	}
//
//	// 🐳 Lista containers ativos
//	allContainers, err := ListAllContainersWithStatusFast()
//	if err != nil {
//		log.Println("❌ Erro ao sincronizar containers:", err)
//		return
//	}
//
//	if len(allContainers) == 0 {
//		log.Println("ℹ️ Nenhum container encontrado — usuário sem aplicações ativas")
//		return
//	}
//
//	// 🔁 Atualiza AppStore com base nos containers
//	for _, app := range allContainers {
//		var foundID string
//		for id, existing := range store.AppStore {
//			if existing.ContainerName == app.ContainerName {
//				foundID = id
//				break
//			}
//		}
//
//		if foundID != "" {
//			existing := store.AppStore[foundID]
//			existing.Status = app.Status
//			existing.Logs = app.Logs
//			existing.RAMUsage = app.RAMUsage
//			existing.CPUUsage = app.CPUUsage // ✅ novo
//			existing.Port = app.Port
//			existing.Alert = app.Alert
//		} else {
//			store.AppStore[app.ID] = app
//		}
//	}
//
//	// 💾 Salva AppStore atualizada
//	err = store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("❌ Erro ao salvar AppStore sincronizado:", err)
//	}
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU) usando docker inspect + docker stats em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						// uso bruto (% do host)
//						app.CPUUsage = float32(cpuVal)
//
//						// RAM
//						app.RAMUsage = float32(usedMB)
//						app.Alert = fmt.Sprintf("Limite: %.2f MB", limitMB)
//
//						// 🔧 pega o plano do usuário dono da app
//						plan := models.Plans[models.PlanType(app.Plan)]
//						cpuLimit := float32(plan.CPUvCores)
//
//						// cálculo relativo ao plano
//						hostCPUs := runtime.NumCPU()
//						cpuUsageCores := (app.CPUUsage / 100.0) * float32(hostCPUs)
//
//						app.CPULimit = cpuLimit
//						if cpuLimit > 0 {
//							app.CPUPercent = (cpuUsageCores / cpuLimit) * 100
//						}
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU) usando docker inspect + docker stats em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						app.CPUUsage = float32(cpuVal)
//						app.RAMUsage = float32(usedMB) // sempre em MB
//						// opcional: salvar limite como alerta ou campo extra
//						app.Alert = fmt.Sprintf("Limite: %.2f MB", limitMB)
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}
//
//// 🔧 Função auxiliar para normalizar valores de memória para MB
//func normalizeMemToMB(valStr string) float64 {
//	if strings.HasSuffix(valStr, "KiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "KiB"), 64)
//		return num / 1024.0
//	} else if strings.HasSuffix(valStr, "MiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "MiB"), 64)
//		return num
//	} else if strings.HasSuffix(valStr, "GiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "GiB"), 64)
//		return num * 1024.0
//	}
//	num, _ := strconv.ParseFloat(valStr, 64)
//	return num
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU) usando docker inspect + docker stats em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						app.RAMUsage = float32(usedMB) // sempre em MB
//						app.Alert = fmt.Sprintf("Limite: %.2f MB", limitMB)
//
//						// 🔧 pega o plano do usuário dono da app
//						plan := models.Plans[models.PlanType(app.Plan)]
//						cpuLimit := float32(plan.CPUvCores)
//
//						// 🔙 volta ao comportamento antigo: uso bruto (% do host)
//						app.CPUUsage = float32(cpuVal) // exibe direto como {app.cpu}%
//
//						// ➕ mantém cálculo relativo ao plano (se quiser usar depois)
//						app.CPULimit = cpuLimit
//						if cpuLimit > 0 {
//							app.CPUPercent = (app.CPUUsage / cpuLimit) * 100
//						}
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}
//
//// 🔧 Função auxiliar para normalizar valores de memória para MB
//func normalizeMemToMB(valStr string) float64 {
//	if strings.HasSuffix(valStr, "KiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "KiB"), 64)
//		return num / 1024.0
//	} else if strings.HasSuffix(valStr, "MiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "MiB"), 64)
//		return num
//	} else if strings.HasSuffix(valStr, "GiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "GiB"), 64)
//		return num * 1024.0
//	}
//	num, _ := strconv.ParseFloat(valStr, 64)
//	return num
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU) usando docker inspect + docker stats em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						app.RAMUsage = float32(usedMB) // sempre em MB
//						app.Alert = fmt.Sprintf("Limite: %.2f MB", limitMB)
//
//						// 🔧 pega o plano do usuário dono da app
//						plan := models.Plans[models.PlanType(app.Plan)]
//						cpuLimit := float32(plan.CPUvCores)
//
//						// uso bruto (percentual do host)
//						app.CPUUsage = float32(cpuVal)
//
//						// percentual relativo ao plano
//						if cpuLimit > 0 {
//							app.CPULimit = cpuLimit
//							app.CPUPercent = (app.CPUUsage / cpuLimit) * 100
//						}
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}
//
//// 🔧 Função auxiliar para normalizar valores de memória para MB
//func normalizeMemToMB(valStr string) float64 {
//	if strings.HasSuffix(valStr, "KiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "KiB"), 64)
//		return num / 1024.0
//	} else if strings.HasSuffix(valStr, "MiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "MiB"), 64)
//		return num
//	} else if strings.HasSuffix(valStr, "GiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "GiB"), 64)
//		return num * 1024.0
//	}
//	num, _ := strconv.ParseFloat(valStr, 64)
//	return num
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU) usando docker inspect + docker stats em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 256MiB"
//
//			// 🔧 Normaliza memória usada e limite para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) >= 3 {
//				usedStr := memFields[0]  // "85.3MiB"
//				limitStr := memFields[2] // "256MiB"
//
//				usedMB := normalizeMemToMB(usedStr)
//				limitMB := normalizeMemToMB(limitStr)
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						app.CPUUsage = float32(cpuVal)
//						app.RAMUsage = float32(usedMB) // sempre em MB
//						// opcional: salvar limite como alerta ou campo extra
//						app.Alert = fmt.Sprintf("Limite: %.2f MB", limitMB)
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}
//
//// 🔧 Função auxiliar para normalizar valores de memória para MB
//func normalizeMemToMB(valStr string) float64 {
//	if strings.HasSuffix(valStr, "KiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "KiB"), 64)
//		return num / 1024.0
//	} else if strings.HasSuffix(valStr, "MiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "MiB"), 64)
//		return num
//	} else if strings.HasSuffix(valStr, "GiB") {
//		num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "GiB"), 64)
//		return num * 1024.0
//	}
//	num, _ := strconv.ParseFloat(valStr, 64)
//	return num
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU) usando docker inspect + docker stats em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := parts[2] // exemplo: "85.3MiB / 1GiB"
//
//			// 🔧 Normaliza memória para MB
//			memFields := strings.Fields(memStr)
//			if len(memFields) > 0 {
//				valStr := memFields[0] // "85.3MiB"
//				var memVal float64
//
//				if strings.HasSuffix(valStr, "KiB") {
//					num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "KiB"), 64)
//					memVal = num / 1024.0
//				} else if strings.HasSuffix(valStr, "MiB") {
//					num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "MiB"), 64)
//					memVal = num
//				} else if strings.HasSuffix(valStr, "GiB") {
//					num, _ := strconv.ParseFloat(strings.TrimSuffix(valStr, "GiB"), 64)
//					memVal = num * 1024.0
//				} else {
//					// fallback: tenta converter direto
//					memVal, _ = strconv.ParseFloat(valStr, 64)
//				}
//
//				cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//
//				// ✅ Atualiza AppStore com métricas normalizadas
//				for _, app := range store.AppStore {
//					if app.ContainerName == name {
//						app.CPUUsage = float32(cpuVal)
//						app.RAMUsage = float32(memVal) // sempre em MB
//					}
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}

// ⚡ Lista todos os containers com status, username, start time e métricas (RAM/CPU) usando docker inspect + docker stats em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 📋 Lista containers com nome e status
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🔍 Inspeciona containers em lote para pegar username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	// 📊 Coleta métricas de RAM e CPU em lote via docker stats
//	statsOut, err := RunDocker("stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}")
//	if err == nil {
//		statsLines := strings.Split(strings.TrimSpace(string(statsOut)), "\n")
//		for _, line := range statsLines {
//			parts := strings.Split(line, "|")
//			if len(parts) != 3 {
//				continue
//			}
//			name := parts[0]
//			cpuStr := strings.TrimSuffix(parts[1], "%")
//			memStr := strings.Fields(parts[2])[0] // pega só o valor numérico (ex: "85.3MiB")
//
//			cpuVal, _ := strconv.ParseFloat(cpuStr, 32)
//			memVal, _ := strconv.ParseFloat(memStr, 32)
//
//			// ✅ Atualiza AppStore com métricas
//			for _, app := range store.AppStore {
//				if app.ContainerName == name {
//					app.CPUUsage = float32(cpuVal)
//					app.RAMUsage = float32(memVal)
//				}
//			}
//		}
//	} else {
//		log.Println("⚠️ Erro ao coletar métricas de CPU/RAM:", err)
//	}
//
//	return apps, nil
//}

// ⚡ Lista todos os containers com status, username e start time usando docker inspect em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	return apps, nil
//}

//// 🔄 Sincroniza AppStore com containers Docker
//func SyncAppStoreWithDocker() {
//	// 🐳 Lista containers ativos
//	allContainers, err := ListAllContainersWithStatusFast()
//	if err != nil {
//		log.Println("❌ Erro ao sincronizar containers:", err)
//		return
//	}
//
//	if len(allContainers) == 0 {
//		log.Println("ℹ️ Nenhum container encontrado — sem aplicações ativas")
//		return
//	}
//
//	// 🔁 Atualiza AppStore com base nos containers
//	for _, app := range allContainers {
//		var foundID string
//		for id, existing := range store.AppStore {
//			if existing.ContainerName == app.ContainerName {
//				foundID = id
//				break
//			}
//		}
//
//		if foundID != "" {
//			existing := store.AppStore[foundID]
//			existing.Status = app.Status
//			existing.Logs = app.Logs
//			existing.RAMUsage = app.RAMUsage
//			existing.Port = app.Port
//			existing.Alert = app.Alert
//		} else {
//			store.AppStore[app.ID] = app
//		}
//	}
//
//	// 💾 Salva AppStore atualizada
//	if err := store.SaveAppStoreToDisk("./database/appstore.json"); err != nil {
//		log.Println("❌ Erro ao salvar AppStore sincronizado:", err)
//	}
//}

// 🧹 Remove entradas do AppStore cujos containers não existem mais
//func CleanAppStoreFromMissingContainers() {
//	for id, app := range store.AppStore {
//		exists, err := ContainerExists(context.Background(), app.ContainerName)
//		if err != nil {
//			log.Printf("⚠️ Erro ao verificar container '%s': %v", app.ContainerName, err)
//			continue
//		}
//		if !exists {
//			log.Printf("🧹 Removendo app '%s' — aplicação não encontrada", id)
//			delete(store.AppStore, id)
//		}
//	}
//	err := store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("❌ Erro ao salvar AppStore após limpeza:", err)
//	}
//}

//func CreateContainerFromApp(app *models.App, token string) error {
//	// 🔐 Valida token
//	if token == "" {
//		return fmt.Errorf("token ausente — requisição não autorizada")
//	}
//
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	// 📦 Payload para criação
//	payload := map[string]string{
//		"name":     containerName,
//		"image":    imageName,
//		"username": app.Username,
//	}
//
//	// 🚀 Chama função que executa criação real
//	return CallContainerCreation(payload, token)
//}

//backend/services/container_service.go

//package services
//
//import (
//	"bytes"
//	"context"
//	"encoding/json"
//	"fmt"
//	"log"
//	"net/http"
//	"os/exec"
//	"strings"
//	"time"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//// 📦 Estrutura de retorno para ações locais com Docker
//type ContainerResult struct {
//	ID        string    `json:"id"`
//	Message   string    `json:"message"`
//	Timestamp time.Time `json:"timestamp"`
//}
//
//// 🧠 Helper para executar comandos Docker
//func RunDocker(args ...string) ([]byte, error) {
//	cmd := exec.Command("docker", args...)
//	return cmd.CombinedOutput()
//}
//
//// 🔍 Verifica se o container já existe
//func ContainerExists(ctx context.Context, name string) (bool, error) {
//	out, err := RunDocker("ps", "-a", "--filter", fmt.Sprintf("name=%s", name), "--format", "{{.Names}}")
//	if err != nil {
//		log.Printf("Erro ao verificar container '%s': %v\n%s", name, err, string(out))
//		return false, err
//	}
//	return strings.Contains(string(out), name), nil
//}
//
//// 🧼 Remove o container se já existir
//func EnsureCleanContainer(name string) error {
//	// 🔍 Verifica se o container existe
//	exists, err := ContainerExists(context.Background(), name)
//	if err != nil {
//		return fmt.Errorf("erro ao verificar existência do container: %w", err)
//	}
//
//	// ❌ Remove se existir
//	if exists {
//		out, err := RunDocker("rm", "-f", name)
//		if err != nil {
//			return fmt.Errorf("erro ao remover container existente: %s", string(out))
//		}
//	}
//
//	// ✅ Tudo limpo
//	return nil
//}
//
//// 🐳 Criação de container via CLI com suporte a volume, workdir, comando, reinício automático e label de usuário
//func CreateContainer(appID, image string, volumePath string, workdir string, command []string, username string) (*ContainerResult, error) {
//	containerName := utils.GetContainerName(username, appID)
//	imageName := fmt.Sprintf("%s-%s", username, appID) // 📦 imagem personalizada
//
//	// 🧪 Log defensivo
//	log.Printf("🧪 CreateContainer: username='%s'", username)
//
//	if err := EnsureCleanContainer(containerName); err != nil {
//		return nil, err
//	}
//
//	args := []string{
//		"run", "-d",
//		"--restart=no", // 🛡️ reinício automático
//		"--name", containerName,
//		"--label", "username=" + username,
//	}
//
//	if volumePath != "" {
//		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
//	}
//
//	if workdir != "" {
//		args = append(args, "-w", workdir)
//	}
//
//	args = append(args, imageName) // usa imagem personalizada
//	args = append(args, command...)
//
//	out, err := RunDocker(args...)
//	if err != nil {
//		return nil, fmt.Errorf("falha no docker run: %s", string(out))
//	}
//
//	return &ContainerResult{
//		ID:        containerName,
//		Message:   "Container criado com política de reinício automático 🛡️",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	containerName := utils.GetContainerName(payload["username"], payload["name"])
//
//	if err := EnsureCleanContainer(containerName); err != nil {
//		return err
//	}
//
//	// 🏷️ Adiciona labels ao payload
//	payload["label_name"] = containerName
//	payload["label_user"] = payload["username"]
//
//	body, _ := json.Marshal(payload)
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token)
//
//	client := &http.Client{Timeout: 10 * time.Second}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//
//// 🔀 Criação híbrida — escolhe entre CLI ou API interna, com suporte a username
//func CreateContainerHybrid(appID, image string, useAPI bool, token string, username string) (*ContainerResult, error) {
//	imageName := fmt.Sprintf("%s-%s", username, appID) // 📦 imagem personalizada
//	containerName := utils.GetContainerName(username, appID)
//
//	if useAPI {
//		payload := map[string]string{
//			"name":     appID,
//			"image":    imageName,
//			"username": username,
//		}
//		err := CallContainerCreation(payload, token)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        containerName,
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//
//	return CreateContainer(appID, imageName, "", "/app", nil, username)
//}
//
//// 🧼 Remoção de container via CLI local (manual)
//func DeleteContainer(appID, username string) (*ContainerResult, error) {
//	containerName := utils.GetContainerName(username, appID)
//	out, err := RunDocker("rm", "-f", containerName)
//	if err != nil {
//		return nil, fmt.Errorf("erro ao executar docker rm: %s", string(out))
//	}
//	return &ContainerResult{
//		ID:        containerName,
//		Message:   "Container removido com sucesso",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📄 Logs do container
//func GetContainerLogs(name string) (string, error) {
//	out, err := RunDocker("logs", name)
//	if err != nil {
//		return "", fmt.Errorf("erro ao obter logs: %s", string(out))
//	}
//	return string(out), nil
//}
//
//// 🧠 Verifica se imagem existe localmente
//func ImageExists(image string) bool {
//	out, err := RunDocker("images", "--format", "{{.Repository}}:{{.Tag}}")
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), image)
//}
//
//// ▶️ Lista containers em execução
//func ListRunningContainers() ([]string, error) {
//	out, err := RunDocker("ps", "--format", "{{.Names}}")
//	if err != nil {
//		return nil, err
//	}
//	return strings.Split(strings.TrimSpace(string(out)), "\n"), nil
//}
//
//// 📋 Lista containers de um usuário via prefixo
//func ListUserContainers(username string) ([]string, error) {
//	pattern := fmt.Sprintf("^%s-", username)
//	cmd := exec.Command("sh", "-c", fmt.Sprintf(`docker ps -a --format "{{.Names}}" | grep "%s"`, pattern))
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("erro ao listar containers: %v", err)
//	}
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	return lines, nil
//}
//
//// ⚡ Lista todos os containers com status, username e start time usando docker inspect em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/")
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{}
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		// ✅ Busca app real pelo ContainerName
//		var matchedApp *models.App
//		for _, app := range store.AppStore {
//			if app.ContainerName == name {
//				matchedApp = app
//				break
//			}
//		}
//
//		if matchedApp != nil {
//			matchedApp.Status = appStatus
//			matchedApp.StartTime = parsedTime
//			apps = append(apps, matchedApp)
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", name)
//		}
//	}
//
//	return apps, nil
//}
//
//// 🧠 Extrai label username do container
//func GetContainerUsername(name string) string {
//	cmd := exec.Command("docker", "inspect", "--format", "{{ index .Config.Labels \"username\" }}", name)
//	out, err := cmd.Output()
//	if err != nil {
//		return ""
//	}
//	return strings.TrimSpace(string(out))
//}
//
//// 🕒 Extrai StartTime real do container
//func GetContainerStartTime(name string) time.Time {
//	cmd := exec.Command("docker", "inspect", "--format", "{{ .State.StartedAt }}", name)
//	out, err := cmd.Output()
//	if err != nil {
//		return time.Now()
//	}
//	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(string(out)))
//	if err != nil {
//		return time.Now()
//	}
//	return parsed
//}
//
//// 🔄 Sincroniza AppStore com containers Docker
//func SyncAppStoreWithDocker() {
//	// 🔐 Recupera sessão atual via token
//	token := store.GetSessionToken("current") // ou use o nome do usuário ativo
//	session, ok := models.GetSessionByToken(token)
//	if !ok || session.Username == "" {
//		log.Println("ℹ️ Nenhum usuário logado — sincronização ignorada")
//		return
//	}
//
//	// 🐳 Lista containers ativos
//	allContainers, err := ListAllContainersWithStatusFast()
//	if err != nil {
//		log.Println("❌ Erro ao sincronizar containers:", err)
//		return
//	}
//
//	if len(allContainers) == 0 {
//		log.Println("ℹ️ Nenhum container encontrado — usuário sem aplicações ativas")
//		return
//	}
//
//	// 🔁 Atualiza AppStore com base nos containers
//	for _, app := range allContainers {
//		var foundID string
//		for id, existing := range store.AppStore {
//			if existing.ContainerName == app.ContainerName {
//				foundID = id
//				break
//			}
//		}
//
//		if foundID != "" {
//			existing := store.AppStore[foundID]
//			existing.Status = app.Status
//			existing.Logs = app.Logs
//			existing.RAMUsage = app.RAMUsage
//			existing.Port = app.Port
//			existing.Alert = app.Alert
//		} else {
//			store.AppStore[app.ID] = app
//		}
//	}
//
//	// 💾 Salva AppStore atualizada
//	err = store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("❌ Erro ao salvar AppStore sincronizado:", err)
//	}
//}
//
//// 🧹 Remove entradas do AppStore cujos containers não existem mais
//func CleanAppStoreFromMissingContainers() {
//	for id, app := range store.AppStore {
//		exists, err := ContainerExists(context.Background(), app.ContainerName)
//		if err != nil {
//			log.Printf("⚠️ Erro ao verificar container '%s': %v", app.ContainerName, err)
//			continue
//		}
//		if !exists {
//			log.Printf("🧹 Removendo app '%s' — aplicação não encontrada", id)
//			delete(store.AppStore, id)
//		}
//	}
//	err := store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("❌ Erro ao salvar AppStore após limpeza:", err)
//	}
//}
//
//// 📋 Lista containers com status por prefixo de usuário
//func ListContainersWithStatusByPrefix(username string) ([]string, error) {
//	// 🔍 Executa docker ps -a e filtra containers que começam com o prefixo do usuário
//	out, err := RunDocker("ps", "-a", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, fmt.Errorf("erro ao listar containers: %v", err)
//	}
//
//	var filtered []string
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	prefix := fmt.Sprintf("%s-", username)
//
//	for _, line := range lines {
//		if strings.HasPrefix(line, prefix) {
//			filtered = append(filtered, line)
//		}
//	}
//	return filtered, nil
//}
//
//// 📊 Lista containers reais do Docker como modelos App
//func ListRealAppsByUser(username string) ([]*models.App, error) {
//	all, err := ListAllContainersWithStatusFast()
//	if err != nil {
//		return nil, err
//	}
//	var filtered []*models.App
//	for _, app := range all {
//		if app.Username == username {
//			filtered = append(filtered, app)
//		}
//	}
//	return filtered, nil
//}
//
//func CreateContainerFromApp(app *models.App, token string) error {
//	// 🔐 Valida token
//	if token == "" {
//		return fmt.Errorf("token ausente — requisição não autorizada")
//	}
//
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	// 📦 Payload para criação
//	payload := map[string]string{
//		"name":     containerName,
//		"image":    imageName,
//		"username": app.Username,
//	}
//
//	// 🚀 Chama função que executa criação real
//	return CallContainerCreation(payload, token)
//}

// 🔄 Sincroniza AppStore com containers Docker
//func SyncAppStoreWithDocker() {
//	allContainers, err := ListAllContainersWithStatusFast()
//	if err != nil {
//		log.Println("Erro ao sincronizar containers:", err)
//		return
//	}
//
//	for _, app := range allContainers {
//		// Verifica se já existe um app com esse ContainerName
//		var foundID string
//		for id, existing := range store.AppStore {
//			if existing.ContainerName == app.ContainerName {
//				foundID = id
//				break
//			}
//		}
//
//		if foundID != "" {
//			// Atualiza o app existente
//			existing := store.AppStore[foundID]
//			existing.Status = app.Status
//			existing.Logs = app.Logs
//			existing.RAMUsage = app.RAMUsage
//			existing.Port = app.Port
//			existing.Alert = app.Alert
//			// Não sobrescreve ID nem ContainerName
//		} else {
//			// Só adiciona se for realmente novo e válido
//			store.AppStore[app.ID] = app
//		}
//	}
//
//	err = store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("Erro ao salvar AppStore sincronizado:", err)
//	}
//}

// 🧼 Remove o container se já existir
//func EnsureCleanContainer(name string) error {
//	exists, err := ContainerExists(context.Background(), name)
//	if err != nil {
//		return fmt.Errorf("erro ao verificar existência do container: %w", err)
//	}
//	if exists {
//		out, err := RunDocker("rm", "-f", name)
//		if err != nil {
//			return fmt.Errorf("erro ao remover container existente: %s", string(out))
//		}
//	}
//	return nil
//}

// 📋 Lista todos os containers com status e username associado
//func ListAllContainersWithStatus() ([]*models.App, error) {
//	out, err := RunDocker("ps", "-a", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	var apps []*models.App
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(status, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(status, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		username := GetContainerUsername(name)
//		if username == "" {
//			continue
//		}
//
//		startTime := GetContainerStartTime(name)
//
//		apps = append(apps, &models.App{
//			ID:        name,
//			Name:      name,
//			Status:    appStatus,
//			Username:  username,
//			StartTime: startTime,
//		})
//	}
//
//	return apps, nil
//}
//

// ⚡ Lista todos os containers com status, username e start time usando docker inspect em lote
//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 🔍 Filtra containers que têm o label 'username'
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🐳 Usa docker inspect em lote para extrair username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/") // docker .Name vem com "/"
//		username := parts[1]
//		startTimeRaw := parts[2]
//
//		if username == "" {
//			continue // 🧼 ignora containers sem label
//		}
//
//		parsedTime, err := time.Parse(time.RFC3339Nano, startTimeRaw)
//		if err != nil {
//			parsedTime = time.Time{} // ou trate como preferir
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		apps = append(apps, &models.App{
//			ID:        name,
//			Name:      name,
//			Status:    appStatus,
//			Username:  username,
//			StartTime: parsedTime,
//		})
//	}
//
//	return apps, nil
//}

//	func CreateContainer(appID, image string, volumePath string, workdir string, command []string, username string) (*ContainerResult, error) {
//		containerName := utils.GetContainerName(username, appID)
//
//		if err := EnsureCleanContainer(containerName); err != nil {
//			return nil, err
//		}
//
//		args := []string{"run", "-d", "--restart=always", "--name", containerName, "--label", "username=" + username}
//		if volumePath != "" {
//			args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath), "-w", "/app")
//		}
//		args = append(args, image)
//		args = append(args, command...)
//
//		out, err := RunDocker(args...)
//		if err != nil {
//			return nil, fmt.Errorf("falha no docker run: %s", string(out))
//		}
//
//		return &ContainerResult{
//			ID:        containerName,
//			Message:   "Container criado com política de reinício automático 🛡️",
//			Timestamp: time.Now(),
//		}, nil
//	}
//
// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	containerName := utils.GetContainerName(payload["username"], payload["name"])
//
//	if err := EnsureCleanContainer(containerName); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token)
//
//	client := &http.Client{Timeout: 10 * time.Second}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}

//	func CallContainerCreation(payload map[string]string, token string) error {
//		if token == "" {
//			return fmt.Errorf("token ausente — requisição não autorizada")
//		}
//
//		username := payload["username"]
//		appID := payload["name"]
//		image := getSafeImageName(username, appID) // image := fmt.Sprintf("%s-%s", username, appID) // 📦 imagem personalizada
//		containerName := utils.GetContainerName(username, appID)
//
//		if err := EnsureCleanContainer(containerName); err != nil {
//			return err
//		}
//
//		body, _ := json.Marshal(map[string]string{
//			"name":     containerName,
//			"image":    image,
//			"username": username,
//		})
//
//		req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//		if err != nil {
//			return fmt.Errorf("erro ao criar requisição: %w", err)
//		}
//		req.Header.Set("Content-Type", "application/json")
//		req.Header.Set("Authorization", "Bearer "+token)
//
//		client := &http.Client{Timeout: 10 * time.Second}
//		resp, err := client.Do(req)
//		if err != nil {
//			return fmt.Errorf("erro ao enviar requisição: %w", err)
//		}
//		defer resp.Body.Close()
//
//		if resp.StatusCode >= 300 {
//			return fmt.Errorf("falha na criação do container: %s", resp.Status)
//		}
//		return nil
//	}
//func getSafeImageName(username, appID string) string {
//	if strings.HasPrefix(appID, username+"-") {
//		return appID
//	}
//	return fmt.Sprintf("%s-%s", username, appID)
//}

//func CreateContainerHybrid(appID, image string, useAPI bool, token string, username string) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":     appID,
//			"image":    image,
//			"username": username,
//		}
//		err := CallContainerCreation(payload, token)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        utils.GetContainerName(username, appID),
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(appID, image, "", "", nil, username)
//}

//func ListAllContainersWithStatusFast() ([]*models.App, error) {
//	// 🔍 Filtra containers que têm o label 'username'
//	psOut, err := RunDocker("ps", "-a", "--filter", "label=username", "--format", "{{.Names}}|{{.Status}}")
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(psOut)), "\n")
//	if len(lines) == 0 {
//		return []*models.App{}, nil
//	}
//
//	var containerNames []string
//	statusMap := map[string]string{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := strings.ToLower(parts[1])
//		containerNames = append(containerNames, name)
//		statusMap[name] = status
//	}
//
//	// 🐳 Usa docker inspect em lote para extrair username e start time
//	inspectArgs := append([]string{"inspect", "--format", "{{.Name}}|{{index .Config.Labels \"username\"}}|{{.State.StartedAt}}"}, containerNames...)
//	inspectOut, err := RunDocker(inspectArgs...)
//	if err != nil {
//		return nil, err
//	}
//
//	var apps []*models.App
//	inspectLines := strings.Split(strings.TrimSpace(string(inspectOut)), "\n")
//
//	for _, line := range inspectLines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 3 {
//			continue
//		}
//
//		name := strings.TrimPrefix(parts[0], "/") // docker .Name vem com "/"
//		username := parts[1]
//		startTime := parts[2]
//
//		if username == "" {
//			continue // 🧼 ignora containers sem label
//		}
//
//		rawStatus := statusMap[name]
//		var appStatus models.AppStatus
//		switch {
//		case strings.Contains(rawStatus, "up"):
//			appStatus = models.StatusRunning
//		case strings.Contains(rawStatus, "exited"):
//			appStatus = models.StatusStopped
//		default:
//			appStatus = models.StatusBackups
//		}
//
//		apps = append(apps, &models.App{
//			ID:        name,
//			Name:      name,
//			Status:    appStatus,
//			Username:  username,
//			StartTime: startTime,
//		})
//	}
//
//	return apps, nil
//}

// 🔄 Sincroniza AppStore com containers Docker
//func SyncAppStoreWithDocker() {
//	allContainers, err := ListAllContainersWithStatusFast()
//	if err != nil {
//		log.Println("Erro ao sincronizar containers:", err)
//		return
//	}
//
//	for _, app := range allContainers {
//		// Verifica se já existe um app com esse ContainerName
//		var foundID string
//		for id, existing := range store.AppStore {
//			if existing.ContainerName == app.ContainerName {
//				foundID = id
//				break
//			}
//		}
//
//		if foundID != "" {
//			// Atualiza o app existente
//			existing := store.AppStore[foundID]
//			existing.Status = app.Status
//			existing.Logs = app.Logs
//			existing.RAMUsage = app.RAMUsage
//			existing.Port = app.Port
//			existing.Alert = app.Alert
//		} else {
//			log.Println("⚠️ Ignorando container não registrado:", app.ContainerName)
//		}
//	}
//
//	err = store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("Erro ao salvar AppStore sincronizado:", err)
//	}
//}

// 🔄 Sincroniza AppStore com containers Docker
//func SyncAppStoreWithDocker() {
//	allContainers, err := ListAllContainersWithStatusFast()
//	if err != nil {
//		log.Println("Erro ao sincronizar containers:", err)
//		return
//	}
//
//	for _, app := range allContainers {
//		// 🔁 Se já existe no AppStore, preserva dados antigos
//		existing := store.AppStore[app.ID]
//		if existing != nil {
//			app.Logs = existing.Logs
//			app.RAMUsage = existing.RAMUsage
//			app.Port = existing.Port
//			app.Alert = existing.Alert
//			app.Entry = existing.Entry
//			app.Runtime = existing.Runtime
//			app.Path = existing.Path
//			app.Plan = existing.Plan
//			app.ContainerName = existing.ContainerName
//		}
//		store.AppStore[app.ID] = app
//	}
//
//	err = store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("Erro ao salvar AppStore sincronizado:", err)
//	}
//}

//func CreateContainerFromApp(r *http.Request, app *models.App) error {
//	// 🔐 Autenticação via contexto HTTP
//	username, _ := middleware.GetUserFromContext(r)
//	if username == "" {
//		return fmt.Errorf("usuário não autenticado — requisição não autorizada")
//	}
//
//	// 🔍 Verifica se o app pertence ao usuário
//	if app.Username != username {
//		return fmt.Errorf("aplicação não pertence ao usuário autenticado")
//	}
//
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	// 📦 Payload para criação
//	payload := map[string]string{
//		"name":     containerName,
//		"image":    imageName,
//		"username": app.Username,
//	}
//
//	// 🔑 Token de sessão (opcional, se necessário internamente)
//	token := store.GetSessionToken(username)
//
//	return CallContainerCreation(payload, token)
//}

//func CreateContainerFromApp(r *http.Request, app *models.App) error {
//	// 🔐 Autenticação via contexto HTTP
//	username, _ := middleware.GetUserFromContext(r)
//	if username == "" {
//		return fmt.Errorf("usuário não autenticado — requisição não autorizada")
//	}
//
//	// 🔍 Verifica se o app pertence ao usuário
//	if app.Username != username {
//		return fmt.Errorf("aplicação não pertence ao usuário autenticado")
//	}
//
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	// 📦 Payload para criação
//	payload := map[string]string{
//		"name":     containerName,
//		"image":    imageName,
//		"username": app.Username,
//	}
//
//	// 🔑 Token de sessão (opcional, se necessário internamente)
//	token := store.GetSessionToken(username)
//
//	return CallContainerCreation(payload, token)
//}

//func CreateContainerFromApp(app *models.App, token string) error {
//	if token == "" {
//		return fmt.Errorf("token ausente — requisição não autorizada")
//	}
//
//	imageName := fmt.Sprintf("%s-%s", app.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", app.Username, app.ID)
//
//	payload := map[string]string{
//		"name":     containerName,
//		"image":    imageName,
//		"username": app.Username,
//	}
//
//	return CallContainerCreation(payload, token)
//}

//func ListRealAppsByUser(username string) ([]*models.App, error) {
//	all, err := ListAllContainersWithStatus()
//	if err != nil {
//		return nil, err
//	}
//	var filtered []*models.App
//	for _, app := range all {
//		if app.Username == username {
//			filtered = append(filtered, app)
//		}
//	}
//	return filtered, nil
//}

//func CreateContainerFromApp(app *models.App, token string) error {
//	return CallContainerCreation(map[string]string{
//		"name":     app.ContainerName,
//		"image":    app.ID,
//		"username": app.Username,
//	}, token)
//}

// 🔍 Obtém o username associado ao container via label Docker
//func GetContainerUsername(containerName string) string {
//	cmd := exec.Command("docker", "inspect", containerName, "--format", "{{ index .Config.Labels \"username\" }}")
//	out, err := cmd.Output()
//	if err != nil {
//		return ""
//	}
//	return strings.TrimSpace(string(out))
//}

//package services
//
//import (
//	"bytes"
//	"context"
//	"encoding/json"
//	"fmt"
//	"log"
//	"net/http"
//	"os/exec"
//	"strings"
//	"time"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//// 📦 Estrutura de retorno para ações locais com Docker
//type ContainerResult struct {
//	ID        string    `json:"id"`
//	Message   string    `json:"message"`
//	Timestamp time.Time `json:"timestamp"`
//}
//
//// 🔍 Verifica se o container já existe
//func ContainerExists(ctx context.Context, name string) (bool, error) {
//	cmd := exec.CommandContext(ctx, "docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", name), "--format", "{{.Names}}")
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Printf("Erro ao verificar container '%s': %v\n%s", name, err, string(out))
//		return false, err
//	}
//	return strings.Contains(string(out), name), nil
//}
//
//// 🧼 Remove o container se já existir
//func EnsureCleanContainer(name string) error {
//	ctx := context.Background()
//	exists, err := ContainerExists(ctx, name)
//	if err != nil {
//		return fmt.Errorf("erro ao verificar existência do container: %w", err)
//	}
//	if exists {
//		cmd := exec.Command("docker", "rm", "-f", name)
//		if out, err := cmd.CombinedOutput(); err != nil {
//			return fmt.Errorf("erro ao remover container existente: %s", string(out))
//		}
//	}
//	return nil
//}
//
//// 🐳 Criação de container via CLI com suporte a volume, workdir, comando, reinício automático e label de usuário
//func CreateContainer(appID, image string, volumePath string, workdir string, command []string, username string) (*ContainerResult, error) {
//	containerName := utils.GetContainerName(username, appID)
//
//	// 🔁 Garante que não haja container duplicado
//	if err := EnsureCleanContainer(containerName); err != nil {
//		return nil, err
//	}
//
//	args := []string{"run", "-d", "--restart=always", "--name", containerName, "--label", "username=" + username}
//
//	if volumePath != "" {
//		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
//		args = append(args, "-w", "/app")
//	}
//
//	args = append(args, image)
//	if len(command) > 0 {
//		args = append(args, command...)
//	}
//
//	cmd := exec.Command("docker", args...)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("falha no docker run: %s", string(out))
//	}
//
//	return &ContainerResult{
//		ID:        containerName,
//		Message:   "Container criado com política de reinício automático 🛡️",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	containerName := utils.GetContainerName(payload["username"], payload["name"])
//
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(containerName); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token)
//
//	client := &http.Client{}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//
//// 🔀 Criação híbrida — escolhe entre CLI ou API interna, com suporte a username
//func CreateContainerHybrid(appID, image string, useAPI bool, token string, username string) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":     appID,
//			"image":    image,
//			"username": username,
//		}
//		err := CallContainerCreation(payload, token)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        utils.GetContainerName(username, appID),
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(appID, image, "", "", nil, username)
//}
//
//// 🧼 Remoção de container via CLI local (manual)
//func DeleteContainer(appID, username string) (*ContainerResult, error) {
//	containerName := utils.GetContainerName(username, appID)
//	cmd := exec.Command("docker", "rm", "-f", containerName)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("erro ao executar docker rm: %s", string(out))
//	}
//	return &ContainerResult{
//		ID:        containerName,
//		Message:   "Container removido com sucesso",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//func GetContainerLogs(name string) (string, error) {
//	cmd := exec.Command("docker", "logs", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return "", fmt.Errorf("erro ao obter logs: %s", string(out))
//	}
//	return string(out), nil
//}
//
//func ImageExists(image string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}:{{.Tag}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), image)
//}
//
//func ListRunningContainers() ([]string, error) {
//	cmd := exec.Command("docker", "ps", "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//	return strings.Split(strings.TrimSpace(string(out)), "\n"), nil
//}
//
//func ListUserContainers(username string) ([]string, error) {
//	pattern := fmt.Sprintf("^%s-", username)
//	cmd := exec.Command("sh", "-c", fmt.Sprintf(`docker ps -a --format "{{.Names}}" | grep "%s"`, pattern))
//
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("erro ao listar containers: %v", err)
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	return lines, nil
//}
//
//// // 📋 Lista todos os containers com status e username associado
//func ListAllContainersWithStatus() ([]*models.App, error) {
//	cmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}|{{.Status}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	var apps []*models.App
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := parts[1]
//
//		appStatus := models.StatusBackups
//		if strings.Contains(status, "Up") {
//			appStatus = models.StatusRunning
//		} else if strings.Contains(status, "Exited") {
//			appStatus = models.StatusStopped
//		}
//
//		username := GetContainerUsername(name)
//		if username == "" {
//			continue
//		}
//
//		apps = append(apps, &models.App{
//			ID:        name,
//			Name:      name,
//			Status:    appStatus,
//			Username:  username,
//			StartTime: time.Now(),
//		})
//	}
//
//	return apps, nil
//}
//func SyncAppStoreWithDocker() {
//	allContainers, err := ListAllContainersWithStatus()
//	if err != nil {
//		log.Println("Erro ao sincronizar containers:", err)
//		return
//	}
//
//	for _, app := range allContainers {
//		store.AppStore[app.ID] = app
//	}
//	err = store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("Erro ao salvar AppStore sincronizado:", err)
//	}
//}
//func CleanAppStoreFromMissingContainers() {
//	for id, app := range store.AppStore {
//		exists, err := ContainerExists(context.Background(), app.ContainerName)
//		if err != nil {
//			log.Printf("⚠️ Erro ao verificar container '%s': %v", app.ContainerName, err)
//			continue
//		}
//		if !exists {
//			log.Printf("🧹 Removendo app '%s' — container não encontrado", id)
//			delete(store.AppStore, id)
//		}
//	}
//	err := store.SaveAppStoreToDisk("./database/appstore.json")
//	if err != nil {
//		log.Println("❌ Erro ao salvar AppStore após limpeza:", err)
//	}
//}

//func ListUserContainers(username string) ([]*models.App, error) {
//	allContainers, err := ListAllContainersWithStatus()
//	if err != nil {
//		return nil, err
//	}
//
//	var userApps []*models.App
//	for _, app := range allContainers {
//		if strings.EqualFold(app.Username, username) {
//			userApps = append(userApps, app)
//		}
//	}
//	return userApps, nil
//}

//func ListAllContainersWithStatus() ([]*models.App, error) {
//	cmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}|{{.Status}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	var apps []*models.App
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := parts[1]
//
//		appStatus := models.StatusBackups
//		if strings.Contains(status, "Up") {
//			appStatus = models.StatusRunning
//		} else if strings.Contains(status, "Exited") {
//			appStatus = models.StatusStopped
//		}
//
//		username := GetContainerUsername(name)
//		if username == "" {
//			continue
//		}
//		if _, exists := store.AppStore[name]; exists {
//			continue
//		}
//
//		apps = append(apps, &models.App{
//			ID:        name,
//			Name:      name,
//			Status:    appStatus,
//			Username:  username,
//			StartTime: time.Now(),
//		})
//	}
//
//	return apps, nil
//}

//func ContainerExists(name string) bool {
//	cmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", name), "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), name)
//}

//func EnsureCleanContainer(name string) error {
//	if ContainerExists(name) {
//		cmd := exec.Command("docker", "rm", "-f", name)
//		if out, err := cmd.CombinedOutput(); err != nil {
//			return fmt.Errorf("erro ao remover container existente: %s", string(out))
//		}
//	}
//	return nil
//}

//// 🐳 Criação de container via CLI com suporte a volume, workdir, comando, reinício automático e label de usuário
//func CreateContainer(name, image string, volumePath string, workdir string, command []string, username string) (*ContainerResult, error) {
//	// 🔁 Garante que não haja container duplicado
//	if err := EnsureCleanContainer(name); err != nil {
//		return nil, err
//	}
//
//	args := []string{"run", "-d", "--restart=always", "--name", name, "--label", "username=" + username}
//
//	if volumePath != "" {
//		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
//		args = append(args, "-w", "/app")
//	}
//
//	args = append(args, image)
//	if len(command) > 0 {
//		args = append(args, command...)
//	}
//
//	cmd := exec.Command("docker", args...)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("falha no docker run: %s", string(out))
//	}
//
//	return &ContainerResult{
//		ID:        strings.TrimSpace(string(out)),
//		Message:   "Container criado com política de reinício automático 🛡️",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//
//	// 🔐 Cria requisição com headers
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token)
//
//	client := &http.Client{}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//
//// 🔀 Criação híbrida — escolhe entre CLI ou API interna, com suporte a username
//func CreateContainerHybrid(name, image string, useAPI bool, token string, username string) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":     name,
//			"image":    image,
//			"username": username,
//		}
//		err := CallContainerCreation(payload, token)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        name,
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(name, image, "", "", nil, username)
//}
//
//// 🧼 Remoção de container via CLI local (manual)
//func DeleteContainer(name string) (*ContainerResult, error) {
//	cmd := exec.Command("docker", "rm", "-f", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("erro ao executar docker rm: %s", string(out))
//	}
//	return &ContainerResult{
//		ID:        name,
//		Message:   "Container removido com sucesso",
//		Timestamp: time.Now(),
//	}, nil
//}

//func ListAllContainersWithStatus() ([]*models.App, error) {
//	cmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}|{{.Status}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	var apps []*models.App
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := parts[1]
//
//		// 🔎 Determina status da aplicação com base no estado do container
//		appStatus := models.StatusBackups
//		if strings.Contains(status, "Up") {
//			appStatus = models.StatusRunning
//		} else if strings.Contains(status, "Exited") {
//			appStatus = models.StatusStopped
//		}
//
//		// 👤 Obtém username via label do Docker
//		username := GetContainerUsername(name)
//
//		// 🧠 Monta estrutura da aplicação
//		apps = append(apps, &models.App{
//			ID:        name,
//			Name:      name,
//			Status:    appStatus,
//			Username:  username,
//			StartTime: time.Now(), // opcional: pode ser ajustado se tiver timestamp real
//		})
//	}
//
//	return apps, nil
//}

//package services
//
//import (
//	"bytes"
//	"encoding/json"
//	"fmt"
//	"net/http"
//	"os/exec"
//	"strings"
//	"time"
//)
//
//// 📦 Estrutura de retorno para ações locais com Docker
//type ContainerResult struct {
//	ID        string    `json:"id"`
//	Message   string    `json:"message"`
//	Timestamp time.Time `json:"timestamp"`
//}
//
//// 🔍 Verifica se o container já existe
//func ContainerExists(name string) bool {
//	cmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", name), "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), name)
//}
//
//// 🧼 Remove o container se já existir
//func EnsureCleanContainer(name string) error {
//	if ContainerExists(name) {
//		cmd := exec.Command("docker", "rm", "-f", name)
//		if out, err := cmd.CombinedOutput(); err != nil {
//			return fmt.Errorf("erro ao remover container existente: %s", string(out))
//		}
//	}
//	return nil
//}
//
//// 🐳 Criação de container via CLI com suporte a volume, workdir, comando e reinício automático
//func CreateContainer(name, image string, volumePath string, workdir string, command []string) (*ContainerResult, error) {
//	// 🔁 Garante que não haja container duplicado
//	if err := EnsureCleanContainer(name); err != nil {
//		return nil, err
//	}
//
//	args := []string{"run", "-d", "--restart=always", "--name", name}
//
//	if volumePath != "" {
//		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
//		args = append(args, "-w", "/app")
//	}
//
//	args = append(args, image)
//	if len(command) > 0 {
//		args = append(args, command...)
//	}
//
//	cmd := exec.Command("docker", args...)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("falha no docker run: %s", string(out))
//	}
//
//	return &ContainerResult{
//		ID:        strings.TrimSpace(string(out)),
//		Message:   "Container criado com política de reinício automático 🛡️",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//
//	// 🔐 Cria requisição com headers
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token) // <- token dinâmico passado como argumento
//
//	client := &http.Client{}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//
//// 🔀 Criação híbrida — escolhe entre CLI ou API interna
//func CreateContainerHybrid(name, image string, useAPI bool, token string) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":  name,
//			"image": image,
//		}
//		err := CallContainerCreation(payload, token)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        name,
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(name, image, "", "", nil)
//}
//
//// 🧼 Remoção de container via CLI local (manual)
//func DeleteContainer(name string) (*ContainerResult, error) {
//	cmd := exec.Command("docker", "rm", "-f", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("erro ao executar docker rm: %s", string(out))
//	}
//	return &ContainerResult{
//		ID:        name,
//		Message:   "Container removido com sucesso",
//		Timestamp: time.Now(),
//	}, nil
//}
//func GetContainerLogs(name string) (string, error) {
//	cmd := exec.Command("docker", "logs", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return "", fmt.Errorf("erro ao obter logs: %s", string(out))
//	}
//	return string(out), nil
//}
//func ImageExists(image string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}:{{.Tag}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), image)
//}
//func ListRunningContainers() ([]string, error) {
//	cmd := exec.Command("docker", "ps", "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//	return strings.Split(strings.TrimSpace(string(out)), "\n"), nil
//}

//func CallContainerCreation(payload map[string]string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//
//	// 🔐 Cria requisição com headers
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer SEU_TOKEN_AQUI") // <- substitua pelo token real
//
//	client := &http.Client{}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//func CallContainerCreation(payload map[string]string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//	resp, err := http.Post("http://localhost:8080/api/containers/dev-create", "application/json", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}

// 🔀 Criação híbrida — escolhe entre CLI ou API interna
//func CreateContainerHybrid(name, image string, useAPI bool) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":  name,
//			"image": image,
//		}
//		err := CallContainerCreation(payload)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        name,
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(name, image, "", "", nil)
//}

//package services
//
//import (
//	"bytes"
//	"encoding/json"
//	"fmt"
//	"net/http"
//	"os/exec"
//	"strings"
//	"time"
//	"virtuscloud/backend/models" // ✅ para usar models.App e Status
//)
//
//// 📦 Estrutura de retorno para ações locais com Docker
//type ContainerResult struct {
//	ID        string    `json:"id"`
//	Message   string    `json:"message"`
//	Timestamp time.Time `json:"timestamp"`
//}
//
//// 🔍 Verifica se o container já existe
//func ContainerExists(name string) bool {
//	cmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", name), "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), name)
//}
//
//// 🧼 Remove o container se já existir
//func EnsureCleanContainer(name string) error {
//	if ContainerExists(name) {
//		cmd := exec.Command("docker", "rm", "-f", name)
//		if out, err := cmd.CombinedOutput(); err != nil {
//			return fmt.Errorf("erro ao remover container existente: %s", string(out))
//		}
//	}
//	return nil
//}
//
//// 🐳 Criação de container via CLI com suporte a volume, workdir, comando e reinício automático
//func CreateContainer(name, image string, volumePath string, workdir string, command []string, username string) (*ContainerResult, error) {
//	// 🔁 Garante que não haja container duplicado
//	if err := EnsureCleanContainer(name); err != nil {
//		return nil, err
//	}
//
//	// 🧩 Monta argumentos do docker run
//	args := []string{"run", "-d", "--restart=always", "--name", name}
//	if username != "" {
//		args = append(args, "--label", fmt.Sprintf("username=%s", username)) // ✅ Aplica label de usuário
//	}
//	if volumePath != "" {
//		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
//	}
//	if workdir != "" {
//		args = append(args, "-w", workdir)
//	}
//	args = append(args, image)
//	if len(command) > 0 {
//		args = append(args, command...)
//	}
//
//	// 🚀 Executa comando docker
//	cmd := exec.Command("docker", args...)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("falha no docker run: %s", string(out))
//	}
//
//	return &ContainerResult{
//		ID:        strings.TrimSpace(string(out)),
//		Message:   "Container criado com política de reinício automático 🛡️",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//
//	// 🔐 Cria requisição com headers
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token)
//
//	client := &http.Client{}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//
//// 🔀 Criação híbrida — escolhe entre CLI ou API interna
//func CreateContainerHybrid(name, image string, useAPI bool, token string, username string) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":     name,
//			"image":    image,
//			"username": username, // ✅ Envia username para API
//		}
//		err := CallContainerCreation(payload, token)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        name,
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(name, image, "", "/app", nil, username)
//}
//
//// 🧼 Remoção de container via CLI local (manual)
//func DeleteContainer(name string) (*ContainerResult, error) {
//	cmd := exec.Command("docker", "rm", "-f", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("erro ao executar docker rm: %s", string(out))
//	}
//	return &ContainerResult{
//		ID:        name,
//		Message:   "Container removido com sucesso",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📜 Obtém logs do container
//func GetContainerLogs(name string) (string, error) {
//	cmd := exec.Command("docker", "logs", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return "", fmt.Errorf("erro ao obter logs: %s", string(out))
//	}
//	return string(out), nil
//}
//
//// 🖼️ Verifica se imagem existe localmente
//func ImageExists(image string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}:{{.Tag}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), image)
//}
//
//// 📋 Lista nomes de containers em execução
//func ListRunningContainers() ([]string, error) {
//	cmd := exec.Command("docker", "ps", "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//	return strings.Split(strings.TrimSpace(string(out)), "\n"), nil
//}
//
//// 🔍 Obtém o username associado ao container via label Docker
//func GetContainerUsername(containerName string) string {
//	cmd := exec.Command("docker", "inspect", containerName, "--format", "{{ index .Config.Labels \"username\" }}")
//	out, err := cmd.Output()
//	if err != nil {
//		return ""
//	}
//	return strings.TrimSpace(string(out))
//}
//
//// 📋 Lista todos os containers com status e username associado
//func ListAllContainersWithStatus() ([]*models.App, error) {
//	cmd := exec.Command("docker", "ps", "-a", "--format", "{{.Names}}|{{.Status}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	var apps []*models.App
//
//	for _, line := range lines {
//		parts := strings.Split(line, "|")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		status := parts[1]
//
//		// 🔎 Determina status da aplicação com base no estado do container
//		appStatus := models.StatusUnavailable
//		if strings.Contains(status, "Up") {
//			appStatus = models.StatusRunning
//		} else if strings.Contains(status, "Exited") {
//			appStatus = models.StatusStopped
//		}
//
//		// 👤 Obtém username via label do Docker
//		username := GetContainerUsername(name)
//
//		// 🧠 Monta estrutura da aplicação
//		apps = append(apps, &models.App{
//			ID:        name,
//			Name:      name,
//			Status:    appStatus,
//			Username:  username,
//			StartTime: time.Now(), // opcional: pode ser ajustado se tiver timestamp real
//		})
//	}
//
//	return apps, nil
//}

//package services
//
//import (
//	"bytes"
//	"encoding/json"
//	"fmt"
//	"net/http"
//	"os/exec"
//	"strings"
//	"time"
//)
//
//// 📦 Estrutura de retorno para ações locais com Docker
//type ContainerResult struct {
//	ID        string    `json:"id"`
//	Message   string    `json:"message"`
//	Timestamp time.Time `json:"timestamp"`
//}
//
//// 🔍 Verifica se o container já existe
//func ContainerExists(name string) bool {
//	cmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", name), "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), name)
//}
//
//// 🧼 Remove o container se já existir
//func EnsureCleanContainer(name string) error {
//	if ContainerExists(name) {
//		cmd := exec.Command("docker", "rm", "-f", name)
//		if out, err := cmd.CombinedOutput(); err != nil {
//			return fmt.Errorf("erro ao remover container existente: %s", string(out))
//		}
//	}
//	return nil
//}
//
//// 🐳 Criação de container via CLI com suporte a volume, workdir, comando e reinício automático
//func CreateContainer(name, image string, volumePath string, workdir string, command []string) (*ContainerResult, error) {
//	// 🔁 Garante que não haja container duplicado
//	if err := EnsureCleanContainer(name); err != nil {
//		return nil, err
//	}
//
//	args := []string{"run", "-d", "--restart=always", "--name", name}
//
//	if volumePath != "" {
//		args = append(args, "-v", fmt.Sprintf("%s:/app", volumePath))
//		args = append(args, "-w", "/app")
//	}
//
//	args = append(args, image)
//	if len(command) > 0 {
//		args = append(args, command...)
//	}
//
//	cmd := exec.Command("docker", args...)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("falha no docker run: %s", string(out))
//	}
//
//	return &ContainerResult{
//		ID:        strings.TrimSpace(string(out)),
//		Message:   "Container criado com política de reinício automático 🛡️",
//		Timestamp: time.Now(),
//	}, nil
//}
//
//// 📡 Criação de container via API interna (modo seguro)
//
//// 📡 Criação de container via API interna (modo seguro)
//func CallContainerCreation(payload map[string]string, token string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//
//	// 🔐 Cria requisição com headers
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer "+token) // <- token dinâmico passado como argumento
//
//	client := &http.Client{}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//
//// 🔀 Criação híbrida — escolhe entre CLI ou API interna
//func CreateContainerHybrid(name, image string, useAPI bool, token string) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":  name,
//			"image": image,
//		}
//		err := CallContainerCreation(payload, token)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        name,
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(name, image, "", "", nil)
//}
//
//// 🧼 Remoção de container via CLI local (manual)
//func DeleteContainer(name string) (*ContainerResult, error) {
//	cmd := exec.Command("docker", "rm", "-f", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return nil, fmt.Errorf("erro ao executar docker rm: %s", string(out))
//	}
//	return &ContainerResult{
//		ID:        name,
//		Message:   "Container removido com sucesso",
//		Timestamp: time.Now(),
//	}, nil
//}
//func GetContainerLogs(name string) (string, error) {
//	cmd := exec.Command("docker", "logs", name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return "", fmt.Errorf("erro ao obter logs: %s", string(out))
//	}
//	return string(out), nil
//}
//func ImageExists(image string) bool {
//	cmd := exec.Command("docker", "images", "--format", "{{.Repository}}:{{.Tag}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return false
//	}
//	return strings.Contains(string(out), image)
//}
//func ListRunningContainers() ([]string, error) {
//	cmd := exec.Command("docker", "ps", "--format", "{{.Names}}")
//	out, err := cmd.Output()
//	if err != nil {
//		return nil, err
//	}
//	return strings.Split(strings.TrimSpace(string(out)), "\n"), nil
//}

//func CallContainerCreation(payload map[string]string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//
//	// 🔐 Cria requisição com headers
//	req, err := http.NewRequest("POST", "http://localhost:8080/api/containers/dev-create", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao criar requisição: %w", err)
//	}
//	req.Header.Set("Content-Type", "application/json")
//	req.Header.Set("Authorization", "Bearer SEU_TOKEN_AQUI") // <- substitua pelo token real
//
//	client := &http.Client{}
//	resp, err := client.Do(req)
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
//func CallContainerCreation(payload map[string]string) error {
//	// 🔁 Remove container existente se necessário
//	if err := EnsureCleanContainer(payload["name"]); err != nil {
//		return err
//	}
//
//	body, _ := json.Marshal(payload)
//	resp, err := http.Post("http://localhost:8080/api/containers/dev-create", "application/json", bytes.NewBuffer(body))
//	if err != nil {
//		return fmt.Errorf("erro ao enviar requisição: %w", err)
//	}
//	defer resp.Body.Close()
//
//	if resp.StatusCode >= 300 {
//		return fmt.Errorf("falha na criação do container: %s", resp.Status)
//	}
//	return nil
//}
// 🔀 Criação híbrida — escolhe entre CLI ou API interna
//func CreateContainerHybrid(name, image string, useAPI bool) (*ContainerResult, error) {
//	if useAPI {
//		payload := map[string]string{
//			"name":  name,
//			"image": image,
//		}
//		err := CallContainerCreation(payload)
//		if err != nil {
//			return nil, err
//		}
//		return &ContainerResult{
//			ID:        name,
//			Message:   "Container criado via API interna",
//			Timestamp: time.Now(),
//		}, nil
//	}
//	return CreateContainer(name, image, "", "", nil)
//}
