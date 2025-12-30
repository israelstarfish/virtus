//backend/routes/containers.go

package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"regexp"
	"strings"
	"time"

	"virtuscloud/backend/middleware"
	"virtuscloud/backend/models"
	"virtuscloud/backend/services"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

type ContainerRequest struct {
	Name     string `json:"name"`
	Image    string `json:"image"`
	Username string `json:"username"`
	Memory   string `json:"memory"` // novo campo
}

type DeleteRequest struct {
	Name string `json:"name"`
}

type ContainerInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// 🔐 Valida nome de container
func isValidContainerName(name string) bool {
	if name == "" {
		return false
	}
	valid := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	return valid.MatchString(name)
}

// 🔍 Verifica se Docker está disponível
func isDockerAvailable(ctx context.Context) error {
	cmd := exec.CommandContext(ctx, "docker", "version")
	if out, err := cmd.CombinedOutput(); err != nil {
		log.Println("Docker indisponível:", err, string(out))
		return err
	}
	return nil
}

// 🚀 Cria um novo container com limite de memória aplicado
func CreateContainerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req ContainerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println("Erro ao decodificar JSON:", err)
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if !isValidContainerName(req.Name) || req.Image == "" {
		http.Error(w, "Campos inválidos", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := isDockerAvailable(ctx); err != nil {
		http.Error(w, "Docker não está disponível ou não está em execução", http.StatusServiceUnavailable)
		return
	}

	exists, err := services.ContainerExists(ctx, req.Name)
	if err != nil {
		http.Error(w, "Falha ao verificar containers existentes", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "Já existe um container com esse nome", http.StatusConflict)
		return
	}

	// 🔍 Recupera plano do usuário para aplicar limite de memória
	user := store.UserStore[req.Username]
	if user == nil {
		http.Error(w, "Usuário não encontrado", http.StatusUnauthorized)
		return
	}
	plan := models.Plans[user.Plan]

	log.Printf("Criando container: %s com imagem: %s | Limite de memória: %dMB", req.Name, req.Image, plan.MemoryMB)

	// 🐳 Criação do container com múltiplos labels e limite de memória
	cmd := exec.CommandContext(ctx, "docker", "run",
		"-d",
		"--name", req.Name,
		"--label", "username="+req.Username,
		"--label", "user="+req.Username,
		"--label", "name="+req.Name,
		"--memory", fmt.Sprintf("%dM", plan.MemoryMB),
		"--memory-swap", fmt.Sprintf("%dM", plan.MemoryMB),
		req.Image,
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Println("Erro ao criar aplicação:", err, string(out))
		http.Error(w, "Erro ao criar aplicação: "+string(out), http.StatusInternalServerError)
		return
	}

	containerID := strings.TrimSpace(string(out))
	log.Println("Aplicação criada com sucesso. ID:", containerID)

	utils.WriteJSON(w, map[string]string{
		"message":      "Aplicação criada com sucesso!",
		"container_id": containerID,
		"timestamp":    time.Now().Format(time.RFC3339),
	})
}

//backend/routes/containers.go

//package routes
//
//import (
//	"context"
//	"encoding/json"
//	"log"
//	"net/http"
//	"os/exec"
//	"regexp"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/middleware"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//)
//
//type ContainerRequest struct {
//	Name     string `json:"name"`
//	Image    string `json:"image"`
//	Username string `json:"username"`
//}
//
//type DeleteRequest struct {
//	Name string `json:"name"`
//}
//
//type ContainerInfo struct {
//	ID   string `json:"id"`
//	Name string `json:"name"`
//}
//
//// 🔐 Valida nome de container
//func isValidContainerName(name string) bool {
//	if name == "" {
//		return false
//	}
//	valid := regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
//	return valid.MatchString(name)
//}
//
//// 🔍 Verifica se Docker está disponível
//func isDockerAvailable(ctx context.Context) error {
//	cmd := exec.CommandContext(ctx, "docker", "version")
//	if out, err := cmd.CombinedOutput(); err != nil {
//		log.Println("Docker indisponível:", err, string(out))
//		return err
//	}
//	return nil
//}
//
//// 🚀 Cria um novo container
//func CreateContainerHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	var req ContainerRequest
//	log.Printf("🧪 CreateContainerHandler: username='%s'", req.Username)
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		log.Println("Erro ao decodificar JSON:", err)
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	if !isValidContainerName(req.Name) || req.Image == "" {
//		http.Error(w, "Campos inválidos", http.StatusBadRequest)
//		return
//	}
//
//	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//	defer cancel()
//
//	if err := isDockerAvailable(ctx); err != nil {
//		http.Error(w, "Docker não está disponível ou não está em execução", http.StatusServiceUnavailable)
//		return
//	}
//
//	exists, err := services.ContainerExists(ctx, req.Name)
//	if err != nil {
//		http.Error(w, "Falha ao verificar containers existentes", http.StatusInternalServerError)
//		return
//	}
//	if exists {
//		http.Error(w, "Já existe um container com esse nome", http.StatusConflict)
//		return
//	}
//
//	log.Printf("Criando container: %s com imagem: %s", req.Name, req.Image)
//
//	// 🐳 Criação do container com múltiplos labels
//	cmd := exec.CommandContext(ctx, "docker", "run",
//		"-d",
//		"--name", req.Name,
//		"--label", "username="+req.Username, // 🔖 identifica o usuário
//		"--label", "user="+req.Username, // 🔖 redundância útil para filtros
//		"--label", "name="+req.Name, // 🔖 identifica o container
//		req.Image,
//	)
//
//	// cmd := exec.CommandContext(ctx, "docker", "run", "-d", "--name", req.Name, "--label", "username="+req.Username, req.Image)
//
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Println("Erro ao criar aplicação:", err, string(out))
//		http.Error(w, "Erro ao criar aplicação: "+string(out), http.StatusInternalServerError)
//		return
//	}
//
//	containerID := strings.TrimSpace(string(out))
//	log.Println("Aplicação criada com sucesso. ID:", containerID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":      "Aplicação criada com sucesso!",
//		"container_id": containerID,
//		"timestamp":    time.Now().Format(time.RFC3339),
//	})
//}
//
//// 📋 Lista containers ativos
//func ListContainersHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodGet {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//	defer cancel()
//
//	cmd := exec.CommandContext(ctx, "docker", "ps", "--format", "{{.ID}}:{{.Names}}")
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		http.Error(w, "Erro ao listar aplicações: "+string(out), http.StatusInternalServerError)
//		return
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	containers := []ContainerInfo{}
//	for _, line := range lines {
//		parts := strings.Split(line, ":")
//		if len(parts) == 2 {
//			containers = append(containers, ContainerInfo{
//				ID:   parts[0],
//				Name: parts[1],
//			})
//		}
//	}
//
//	utils.WriteJSON(w, map[string]interface{}{
//		"aplicações": containers,
//	})
//}
//
//// ❌ Remove um container
//func DeleteContainerHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodDelete {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	var req DeleteRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	if !isValidContainerName(req.Name) {
//		http.Error(w, "Nome inválido", http.StatusBadRequest)
//		return
//	}
//
//	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//	defer cancel()
//
//	cmd := exec.CommandContext(ctx, "docker", "rm", "-f", req.Name)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		http.Error(w, "Erro ao remover aplicação: "+string(out), http.StatusInternalServerError)
//		return
//	}
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  "Aplicação removida com sucesso!",
//		"output":   strings.TrimSpace(string(out)),
//		"deleted":  req.Name,
//		"datetime": time.Now().Format(time.RFC3339),
//	})
//}
//
//// 📊 Lista containers reais do Docker por usuário autenticado
//func ListUserContainersHandler(w http.ResponseWriter, r *http.Request) {
//	username, _ := middleware.GetUserFromContext(r)
//
//	// 🐳 Busca containers reais do Docker
//	apps, err := services.ListRealAppsByUser(username)
//	if err != nil {
//		http.Error(w, "Erro ao listar aplicações: "+err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	// 📤 Envia lista formatada como JSON
//	utils.WriteJSON(w, map[string]interface{}{"aplicações": apps})
//}

// 🚀 Cria um novo container
//func CreateContainerHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	var req ContainerRequest
//	log.Printf("🧪 CreateContainerHandler: username='%s'", req.Username)
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		log.Println("Erro ao decodificar JSON:", err)
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	if !isValidContainerName(req.Name) || req.Image == "" {
//		http.Error(w, "Campos inválidos", http.StatusBadRequest)
//		return
//	}
//
//	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//	defer cancel()
//
//	if err := isDockerAvailable(ctx); err != nil {
//		http.Error(w, "Docker não está disponível ou não está em execução", http.StatusServiceUnavailable)
//		return
//	}
//
//	exists, err := services.ContainerExists(ctx, req.Name)
//	if err != nil {
//		http.Error(w, "Falha ao verificar containers existentes", http.StatusInternalServerError)
//		return
//	}
//	if exists {
//		http.Error(w, "Já existe um container com esse nome", http.StatusConflict)
//		return
//	}
//
//	log.Printf("Criando container: %s com imagem: %s", req.Name, req.Image)
//
//	// 🐳 Criação do container com múltiplos labels
//	cmd := exec.CommandContext(ctx, "docker", "run",
//		"-d",
//		"--name", req.Name,
//		"--label", "username="+req.Username, // 🔖 identifica o usuário
//		"--label", "user="+req.Username, // 🔖 redundância útil para filtros
//		"--label", "name="+req.Name, // 🔖 identifica o container
//		req.Image,
//	)
//
//	// cmd := exec.CommandContext(ctx, "docker", "run", "-d", "--name", req.Name, "--label", "username="+req.Username, req.Image)
//
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Println("Erro ao criar aplicação:", err, string(out))
//		http.Error(w, "Erro ao criar aplicação: "+string(out), http.StatusInternalServerError)
//		return
//	}
//
//	containerID := strings.TrimSpace(string(out))
//	log.Println("Aplicação criada com sucesso. ID:", containerID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":      "Aplicação criada com sucesso!",
//		"container_id": containerID,
//		"timestamp":    time.Now().Format(time.RFC3339),
//	})
//}

// 📋 Lista containers ativos
func ListContainersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", "ps", "--format", "{{.ID}}:{{.Names}}")
	out, err := cmd.CombinedOutput()
	if err != nil {
		http.Error(w, "Erro ao listar aplicações: "+string(out), http.StatusInternalServerError)
		return
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	containers := []ContainerInfo{}
	for _, line := range lines {
		parts := strings.Split(line, ":")
		if len(parts) == 2 {
			containers = append(containers, ContainerInfo{
				ID:   parts[0],
				Name: parts[1],
			})
		}
	}

	utils.WriteJSON(w, map[string]interface{}{
		"aplicações": containers,
	})
}

// ❌ Remove um container
func DeleteContainerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req DeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if !isValidContainerName(req.Name) {
		http.Error(w, "Nome inválido", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "docker", "rm", "-f", req.Name)
	out, err := cmd.CombinedOutput()
	if err != nil {
		http.Error(w, "Erro ao remover aplicação: "+string(out), http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, map[string]string{
		"message":  "Aplicação removida com sucesso!",
		"output":   strings.TrimSpace(string(out)),
		"deleted":  req.Name,
		"datetime": time.Now().Format(time.RFC3339),
	})
}

// 📊 Lista containers reais do Docker por usuário autenticado
func ListUserContainersHandler(w http.ResponseWriter, r *http.Request) {
	username, _ := middleware.GetUserFromContext(r)

	// 🐳 Busca containers reais do Docker
	apps, err := services.ListRealAppsByUser(username)
	if err != nil {
		http.Error(w, "Erro ao listar aplicações: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 📤 Envia lista formatada como JSON
	utils.WriteJSON(w, map[string]interface{}{"aplicações": apps})
}

// 🚀 Cria um novo container
//func CreateContainerHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	var req ContainerRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		log.Println("Erro ao decodificar JSON:", err)
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	if !isValidContainerName(req.Name) || req.Image == "" {
//		http.Error(w, "Campos inválidos", http.StatusBadRequest)
//		return
//	}
//
//	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//	defer cancel()
//
//	if err := isDockerAvailable(ctx); err != nil {
//		http.Error(w, "Docker não está disponível ou não está em execução", http.StatusServiceUnavailable)
//		return
//	}
//
//	exists, err := services.ContainerExists(ctx, req.Name)
//	if err != nil {
//		http.Error(w, "Falha ao verificar containers existentes", http.StatusInternalServerError)
//		return
//	}
//	if exists {
//		http.Error(w, "Já existe um container com esse nome", http.StatusConflict)
//		return
//	}
//
//	log.Printf("Criando container: %s com imagem: %s", req.Name, req.Image)
//
//	// 🐳 Criação do container com múltiplos labels
//	cmd := exec.CommandContext(ctx, "docker", "run",
//		"-d",
//		"--name", req.Name,
//		"--label", "username="+req.Username, // 🔖 identifica o usuário
//		"--label", "user="+req.Username, // 🔖 redundância útil para filtros
//		"--label", "name="+req.Name, // 🔖 identifica o container
//		req.Image,
//	)
//
//	// cmd := exec.CommandContext(ctx, "docker", "run", "-d", "--name", req.Name, "--label", "username="+req.Username, req.Image)
//
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Println("Erro ao criar container:", err, string(out))
//		http.Error(w, "Erro ao criar container: "+string(out), http.StatusInternalServerError)
//		return
//	}
//
//	containerID := strings.TrimSpace(string(out))
//	log.Println("Container criado com sucesso. ID:", containerID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":      "Container criado com sucesso!",
//		"container_id": containerID,
//		"timestamp":    time.Now().Format(time.RFC3339),
//	})
//}

// 🚀 Cria um novo container
//func CreateContainerHandler(w http.ResponseWriter, r *http.Request) {
//	if r.Method != http.MethodPost {
//		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
//		return
//	}
//
//	var req ContainerRequest
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		log.Println("Erro ao decodificar JSON:", err)
//		http.Error(w, "JSON inválido", http.StatusBadRequest)
//		return
//	}
//
//	if !isValidContainerName(req.Name) || req.Image == "" {
//		http.Error(w, "Campos inválidos", http.StatusBadRequest)
//		return
//	}
//
//	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
//	defer cancel()
//
//	if err := isDockerAvailable(ctx); err != nil {
//		http.Error(w, "Docker não está disponível ou não está em execução", http.StatusServiceUnavailable)
//		return
//	}
//
//	exists, err := services.ContainerExists(ctx, req.Name)
//	if err != nil {
//		http.Error(w, "Falha ao verificar containers existentes", http.StatusInternalServerError)
//		return
//	}
//	if exists {
//		http.Error(w, "Já existe um container com esse nome", http.StatusConflict)
//		return
//	}
//
//	log.Printf("Criando container: %s com imagem: %s", req.Name, req.Image)
//	cmd := exec.CommandContext(ctx, "docker", "run", "-d", "--name", req.Name, "--label", "username="+req.Username, req.Image)
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Println("Erro ao criar container:", err, string(out))
//		http.Error(w, "Erro ao criar container: "+string(out), http.StatusInternalServerError)
//		return
//	}
//
//	containerID := strings.TrimSpace(string(out))
//	log.Println("Container criado com sucesso. ID:", containerID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":      "Container criado com sucesso!",
//		"container_id": containerID,
//		"timestamp":    time.Now().Format(time.RFC3339),
//	})
//}

// 🔁 Verifica se já existe um container com o nome
//func containerExists(ctx context.Context, name string) (bool, error) {
//	cmd := exec.CommandContext(ctx, "docker", "ps", "-a", "--format", "{{.Names}}")
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		log.Println("Erro ao verificar containers existentes:", err, string(out))
//		return false, err
//	}
//	for _, existing := range strings.Split(strings.TrimSpace(string(out)), "\n") {
//		if existing == name {
//			return true, nil
//		}
//	}
//	return false, nil
//}
