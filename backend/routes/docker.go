//backend/routes/docker.go

package routes

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"time"

	"virtuscloud/backend/middleware"
	"virtuscloud/backend/services"
	"virtuscloud/backend/store"
	"virtuscloud/backend/utils"
)

// ⏳ Verifica se Docker está disponível com retries até sucesso ou tempo limite
func waitForDocker(timeout time.Duration, interval time.Duration) bool {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if err := exec.Command("docker", "info").Run(); err == nil {
			log.Println("✅ Docker ativo")
			return true
		}
		log.Println("⏳ Docker não está disponível... nova tentativa em breve")
		time.Sleep(interval)
	}
	log.Println("🛑 Timeout: Docker não iniciou")
	return false
}

// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
func DockerHandler(w http.ResponseWriter, r *http.Request) {
	// 🔓 Libera CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// 🧭 Modo de criação: API ou CLI
	useAPI := r.URL.Query().Get("mode") == "api"

	// 🧪 App de teste
	app := services.AppStore["test-local"]
	if app == nil {
		http.Error(w, "Aplicação 'test-local' não encontrada", http.StatusNotFound)
		return
	}

	// 🔐 Autenticação padronizada via contexto
	username, _ := middleware.GetUserFromContext(r)
	if username == "" {
		http.Error(w, "Usuário não autenticado", http.StatusUnauthorized)
		return
	}

	// 🔍 Busca usuário na store
	user := store.UserStore[username]
	if user == nil {
		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	// 🔑 Token de sessão
	token := store.GetSessionToken(user.Username)

	// 📦 imagem personalizada
	imageName := fmt.Sprintf("%s-%s", user.Username, app.ID)
	containerName := fmt.Sprintf("%s-%s", user.Username, app.ID)
	workdir := "/app"

	// 🔄 Atualiza app
	app.ContainerName = containerName
	services.AppStore[app.ID] = app
	store.SaveApp(app)

	// 🧹 Remove container antigo se existir
	_ = exec.Command("docker", "rm", "-f", containerName).Run()

	// 🧠 Comando por runtime
	command := services.GetRuntimeCommand(app.Runtime, app.Entry)

	// 🧱 Criação do container
	var result *services.ContainerResult
	var err error

	log.Printf("📦 Criando container: %s com imagem: %s", containerName, imageName)

	// ⏳ Execução assíncrona
	done := make(chan struct{})
	go func() {
		if useAPI {
			// 🛠️ API interna
			//app.ID = imageName // garante que imagem personalizada seja usada
			err = services.CreateContainerFromApp(app, token)
			if err == nil {
				result = &services.ContainerResult{
					ID:        containerName,
					Message:   "Container criado via API interna",
					Timestamp: time.Now(),
				}
			}
		} else {
			// 🛠️ CLI local
			cmd := exec.Command("docker", "run",
				"-d",
				"--restart=no", // 🛡️ reinício automático
				"--name", containerName,
				"--label", fmt.Sprintf("username=%s", user.Username),
				"-v", app.Path+":/app",
				"-w", workdir,
				imageName,
			)
			cmd.Args = append(cmd.Args, command...)
			err = cmd.Run()
			if err == nil {
				result = &services.ContainerResult{
					ID:        containerName,
					Message:   "Container criado com sucesso via CLI",
					Timestamp: time.Now(),
				}
			}
		}
		close(done)
	}()

	// ⏳ Timeout e fallback
	select {
	case <-done:
		if err != nil {
			log.Println("❌ Erro ao criar container:", err)
			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
			return
		}
	case <-time.After(10 * time.Second):
		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
			return
		}
		log.Println("🔁 Tentando novamente após Docker iniciar...")

		if useAPI {
			//app.ID = imageName
			err = services.CreateContainerFromApp(app, token)
			if err == nil {
				result = &services.ContainerResult{
					ID:        containerName,
					Message:   "Container criado via API interna",
					Timestamp: time.Now(),
				}
			}
		} else {
			cmd := exec.Command("docker", "run",
				"-d",
				"--restart=no",
				"--name", containerName,
				"--label", fmt.Sprintf("username=%s", user.Username),
				"-v", app.Path+":/app",
				"-w", workdir,
				imageName,
			)
			cmd.Args = append(cmd.Args, command...)
			err = cmd.Run()
			if err == nil {
				result = &services.ContainerResult{
					ID:        containerName,
					Message:   "Container criado com sucesso via CLI",
					Timestamp: time.Now(),
				}
			}
		}
		if err != nil {
			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// ✅ Sucesso
	log.Printf("✅ Container criado via /api/docker [%s]: %s", map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)

	utils.WriteJSON(w, map[string]string{
		"message":  result.Message,
		"id":       result.ID,
		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
		"datetime": result.Timestamp.Format(time.RFC3339),
	})
}

// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api"
//	app := services.AppStore["test-local"]
//	if app == nil {
//		http.Error(w, "Aplicação 'test-local' não encontrada", http.StatusNotFound)
//		return
//	}
//
//	user := store.GetLoggedUser()
//	if user == nil {
//		log.Printf("🧪 DockerHandler: username='%s'", user.Username)
//		http.Error(w, "Usuário não autenticado", http.StatusUnauthorized)
//		return
//	}
//	token := store.GetSessionToken(user.Username)
//
//	imageName := fmt.Sprintf("%s-%s", user.Username, app.ID) // 📦 imagem personalizada
//	containerName := fmt.Sprintf("%s-%s", user.Username, app.ID)
//	workdir := "/app"
//
//	// Atualiza app
//	app.ContainerName = containerName
//	services.AppStore[app.ID] = app
//	store.SaveApp(app)
//
//	// Remove container antigo se existir
//	_ = exec.Command("docker", "rm", "-f", containerName).Run()
//
//	// Comando por runtime
//	command := services.GetRuntimeCommand(app.Runtime, app.Entry)
//
//	// Criação do container
//	var result *services.ContainerResult
//	var err error
//
//	log.Printf("📦 Criando container: %s com imagem: %s", containerName, imageName)
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			app.ID = imageName // garante que imagem personalizada seja usada
//			err = services.CreateContainerFromApp(app, token)
//			if err == nil {
//				result = &services.ContainerResult{
//					ID:        containerName,
//					Message:   "Container criado via API interna",
//					Timestamp: time.Now(),
//				}
//			}
//		} else {
//			cmd := exec.Command("docker", "run",
//				"-d",
//				"--restart=always", // 🛡️ reinício automático
//				"--name", containerName,
//				"--label", fmt.Sprintf("username=%s", user.Username),
//				"-v", app.Path+":/app",
//				"-w", workdir,
//				imageName,
//			)
//			cmd.Args = append(cmd.Args, command...)
//			err = cmd.Run()
//			if err == nil {
//				result = &services.ContainerResult{
//					ID:        containerName,
//					Message:   "Container criado com sucesso via CLI",
//					Timestamp: time.Now(),
//				}
//			}
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		if useAPI {
//			app.ID = imageName
//			err = services.CreateContainerFromApp(app, token)
//			if err == nil {
//				result = &services.ContainerResult{
//					ID:        containerName,
//					Message:   "Container criado via API interna",
//					Timestamp: time.Now(),
//				}
//			}
//		} else {
//			cmd := exec.Command("docker", "run",
//				"-d",
//				"--restart=always",
//				"--name", containerName,
//				"--label", fmt.Sprintf("username=%s", user.Username),
//				"-v", app.Path+":/app",
//				"-w", workdir,
//				imageName,
//			)
//			cmd.Args = append(cmd.Args, command...)
//			err = cmd.Run()
//			if err == nil {
//				result = &services.ContainerResult{
//					ID:        containerName,
//					Message:   "Container criado com sucesso via CLI",
//					Timestamp: time.Now(),
//				}
//			}
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s", map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api"
//	app := services.AppStore["test-local"]
//	if app == nil {
//		http.Error(w, "Aplicação 'test-local' não encontrada", http.StatusNotFound)
//		return
//	}
//
//	user := store.GetLoggedUser()
//	if user == nil {
//		http.Error(w, "Usuário não autenticado", http.StatusUnauthorized)
//		return
//	}
//	token := store.GetSessionToken(user.Username)
//
//	containerName := fmt.Sprintf("%s-%s", user.Username, app.ID)
//	imageName := app.ID
//	workdir := "/app"
//
//	// Atualiza app
//	app.ContainerName = containerName
//	services.AppStore[app.ID] = app
//	store.SaveApp(app)
//
//	// Remove container antigo se existir
//	_ = exec.Command("docker", "rm", "-f", containerName).Run()
//
//	// Comando por runtime
//	command := services.GetRuntimeCommand(app.Runtime, app.Entry)
//
//	// Criação do container
//	var result *services.ContainerResult
//	var err error
//
//	log.Printf("📦 Criando container: %s com imagem: %s", containerName, imageName)
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			cmd := exec.Command("docker", "run",
//				"-d",
//				"--name", containerName,
//				"--label", fmt.Sprintf("username=%s", user.Username),
//				"-v", app.Path+":/app",
//				"-w", workdir,
//				imageName,
//			)
//			cmd.Args = append(cmd.Args, command...)
//			err = cmd.Run()
//			if err == nil {
//				result = &services.ContainerResult{
//					ID:        containerName,
//					Message:   "Container criado com sucesso",
//					Timestamp: time.Now(),
//				}
//			}
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			cmd := exec.Command("docker", "run",
//				"-d",
//				"--name", containerName,
//				"--label", fmt.Sprintf("username=%s", user.Username),
//				"-v", app.Path+":/app",
//				"-w", workdir,
//				imageName,
//			)
//			cmd.Args = append(cmd.Args, command...)
//			err = cmd.Run()
//			if err == nil {
//				result = &services.ContainerResult{
//					ID:        containerName,
//					Message:   "Container criado com sucesso",
//					Timestamp: time.Now(),
//				}
//			}
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s", map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api" // default: CLI
//	app := services.AppStore["test-local"]
//
//	// 🧠 Comando de inicialização por runtime
//	command := []string{}
//	switch app.Runtime {
//	case "node":
//		command = []string{"npm", "start"}
//	case "python", "django":
//		command = []string{"python", "main.py"}
//	case "golang", "go":
//		command = []string{"go", "run", "main.go"}
//	case "php", "laravel":
//		command = []string{"php", "artisan", "serve"}
//	case "rust":
//		command = []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		command = []string{"dotnet", "run"}
//	case "elixir":
//		command = []string{"mix", "phx.server"}
//	case "java", "springboot":
//		command = []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		command = []string{"gradle", "bootRun"}
//	case "lua":
//		command = []string{"lua", "main.lua"}
//	default:
//		command = []string{app.Entry} // fallback genérico
//	}
//
//	var result *services.ContainerResult
//	var err error
//
//	// 🔐 Recupera token da sessão do usuário logado
//	user := store.GetLoggedUser()
//	token := ""
//	if user != nil {
//		token = store.GetSessionToken(user.Username)
//	}
//
//	// ✅ Nome do container: username + appID
//	containerName := fmt.Sprintf("%s-%s", user.Username, app.ID)
//
//	// ✅ Nome da imagem: app.ID (mantido por enquanto)
//	imageName := app.ID
//
//	// ✅ Atualiza o app com o nome do container
//	app.ContainerName = containerName
//	services.AppStore[app.ID] = app
//	store.SaveApp(app)
//
//	log.Printf("📦 Criando container: %s com imagem: %s", containerName, imageName)
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			workdir := "/app" // padrão
//			result, err = services.CreateContainer(containerName, app.Runtime, app.Path, workdir, command, imageName)
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		// Nova tentativa
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			workdir := "/app"
//			result, err = services.CreateContainer(containerName, app.Runtime, app.Path, workdir, command, imageName)
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s",
//		map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api" // default: CLI
//	app := services.AppStore["test-local"]
//
//	// 🧠 Comando de inicialização por runtime
//	command := []string{}
//	switch app.Runtime {
//	case "node":
//		command = []string{"npm", "start"}
//	case "python", "django":
//		command = []string{"python", "main.py"}
//	case "golang", "go":
//		command = []string{"go", "run", "main.go"}
//	case "php", "laravel":
//		command = []string{"php", "artisan", "serve"}
//	case "rust":
//		command = []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		command = []string{"dotnet", "run"}
//	case "elixir":
//		command = []string{"mix", "phx.server"}
//	case "java", "springboot":
//		command = []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		command = []string{"gradle", "bootRun"}
//	case "lua":
//		command = []string{"lua", "main.lua"}
//	default:
//		command = []string{app.Entry} // fallback genérico
//	}
//
//	var result *services.ContainerResult
//	var err error
//
//	// 🔐 Recupera token da sessão do usuário logado
//	user := store.GetLoggedUser()
//	token := ""
//	if user != nil {
//		token = store.GetSessionToken(user.Username)
//	}
//
//	// ✅ Nome do container: username + appID
//	containerName := fmt.Sprintf("%s-%s", user.Username, app.ID)
//
//	// ✅ Nome da imagem: app.ID (mantido por enquanto)
//	imageName := app.ID
//
//	// ✅ Atualiza o app com o nome do container
//	app.ContainerName = containerName
//	services.AppStore[app.ID] = app
//	store.SaveApp(app)
//
//	log.Printf("📦 Criando container: %s com imagem: %s", containerName, imageName)
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			workdir := "/app" // padrão
//			result, err = services.CreateContainer(containerName, app.Runtime, app.Path, workdir, command, imageName)
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		// Nova tentativa
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			workdir := "/app"
//			result, err = services.CreateContainer(containerName, app.Runtime, app.Path, workdir, command, imageName)
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s",
//		map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api" // default: CLI
//	app := services.AppStore["test-local"]
//
//	// 🧠 Comando de inicialização por runtime
//	command := []string{}
//	switch app.Runtime {
//	case "node":
//		command = []string{"npm", "start"}
//	case "python", "django":
//		command = []string{"python", "main.py"}
//	case "golang", "go":
//		command = []string{"go", "run", "main.go"}
//	case "php", "laravel":
//		command = []string{"php", "artisan", "serve"}
//	case "rust":
//		command = []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		command = []string{"dotnet", "run"}
//	case "elixir":
//		command = []string{"mix", "phx.server"}
//	case "java", "springboot":
//		command = []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		command = []string{"gradle", "bootRun"}
//	case "lua":
//		command = []string{"lua", "main.lua"}
//	default:
//		command = []string{app.Entry} // fallback genérico
//	}
//
//	var result *services.ContainerResult
//	var err error
//
//	// 🔐 Recupera token da sessão do usuário logado
//	user := store.GetLoggedUser()
//	token := ""
//	if user != nil {
//		token = store.GetSessionToken(user.Username)
//	}
//
//	// ✅ Nome do container: username + appID
//	containerName := fmt.Sprintf("%s-%s", user.Username, app.ID)
//
//	// ✅ Nome da imagem: app.ID (mantido por enquanto)
//	imageName := app.ID
//
//	log.Printf("📦 Criando container: %s com imagem: %s", containerName, imageName)
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			workdir := "/app" // padrão
//			result, err = services.CreateContainer(containerName, app.Runtime, app.Path, workdir, command, imageName)
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		// Nova tentativa
//		if useAPI {
//			result, err = services.CreateContainerHybrid(containerName, app.Runtime, true, token, imageName)
//		} else {
//			workdir := "/app"
//			result, err = services.CreateContainer(containerName, app.Runtime, app.Path, workdir, command, imageName)
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s",
//		map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api" // default: CLI
//	app := services.AppStore["test-local"]
//
//	// 🧠 Comando de inicialização por runtime
//	command := []string{}
//	switch app.Runtime {
//	case "node":
//		command = []string{"npm", "start"}
//	case "python", "django":
//		command = []string{"python", "main.py"}
//	case "golang", "go":
//		command = []string{"go", "run", "main.go"}
//	case "php", "laravel":
//		command = []string{"php", "artisan", "serve"}
//	case "rust":
//		command = []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		command = []string{"dotnet", "run"}
//	case "elixir":
//		command = []string{"mix", "phx.server"}
//	case "java", "springboot":
//		command = []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		command = []string{"gradle", "bootRun"}
//	case "lua":
//		command = []string{"lua", "main.lua"}
//	default:
//		command = []string{app.Entry} // fallback genérico
//	}
//
//	var result *services.ContainerResult
//	var err error
//
//	// 🔐 Recupera token da sessão do usuário logado
//	user := store.GetLoggedUser()
//	token := ""
//	if user != nil {
//		token = store.GetSessionToken(user.Username)
//	}
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true, token, user.Username)
//		} else {
//			workdir := "/app" // padrão
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command, user.Username)
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		// Nova tentativa
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true, token, user.Username)
//		} else {
//			workdir := "/app"
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command, user.Username)
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s",
//		map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

//package routes
//
//import (
//	"log"
//	"net/http"
//	"os/exec"
//	"time"
//
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/utils"
//)
//
//// ⏳ Verifica se Docker está disponível com retries até sucesso ou tempo limite
//func waitForDocker(timeout time.Duration, interval time.Duration) bool {
//	deadline := time.Now().Add(timeout)
//	for time.Now().Before(deadline) {
//		if err := exec.Command("docker", "info").Run(); err == nil {
//			log.Println("✅ Docker ativo")
//			return true
//		}
//		log.Println("⏳ Docker não está disponível... nova tentativa em breve")
//		time.Sleep(interval)
//	}
//	log.Println("🛑 Timeout: Docker não iniciou")
//	return false
//}
//
//// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api" // default: CLI
//	app := services.AppStore["test-local"]
//
//	// 🧠 Comando de inicialização por runtime
//	command := []string{}
//	switch app.Runtime {
//	case "node":
//		command = []string{"npm", "start"}
//	case "python", "django":
//		command = []string{"python", "main.py"}
//	case "golang", "go":
//		command = []string{"go", "run", "main.go"}
//	case "php", "laravel":
//		command = []string{"php", "artisan", "serve"}
//	case "rust":
//		command = []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		command = []string{"dotnet", "run"}
//	case "elixir":
//		command = []string{"mix", "phx.server"}
//	case "java", "springboot":
//		command = []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		command = []string{"gradle", "bootRun"}
//	case "lua":
//		command = []string{"lua", "main.lua"}
//	default:
//		command = []string{app.Entry} // fallback genérico
//	}
//
//	var result *services.ContainerResult
//	var err error
//
//	// 🔐 Recupera token da sessão do usuário logado
//	user := store.GetLoggedUser()
//	token := ""
//	if user != nil {
//		token = store.GetSessionToken(user.Username)
//	}
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true, token)
//		} else {
//			workdir := "/app" // padrão
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command)
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		// Nova tentativa
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true, token)
//		} else {
//			workdir := "/app"
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command)
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s",
//		map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api" // default: CLI
//	app := services.AppStore["test-local"]
//
//	command := []string{}
//	switch app.Runtime {
//	case "python":
//		command = []string{"python", app.Entry}
//	case "node":
//		command = []string{"node", app.Entry}
//	default:
//		command = []string{app.Entry}
//	}
//
//	var result *services.ContainerResult
//	var err error
//
//	// 🔐 Recupera token da sessão do usuário logado
//	user := store.GetLoggedUser()
//	token := ""
//	if user != nil {
//		token = store.GetSessionToken(user.Username)
//	}
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true, token)
//		} else {
//			workdir := "/app" // padrão
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command)
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		// Nova tentativa
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true, token)
//		} else {
//			workdir := "/app"
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command)
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s",
//		map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}

//package routes
//
//import (
//	"log"
//	"net/http"
//	"os/exec"
//	"time"
//
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/utils"
//)
//
//// ⏳ Verifica se Docker está disponível com retries até sucesso ou tempo limite
//func waitForDocker(timeout time.Duration, interval time.Duration) bool {
//	deadline := time.Now().Add(timeout)
//	for time.Now().Before(deadline) {
//		if err := exec.Command("docker", "info").Run(); err == nil {
//			log.Println("✅ Docker ativo")
//			return true
//		}
//		log.Println("⏳ Docker não está disponível... nova tentativa em breve")
//		time.Sleep(interval)
//	}
//	log.Println("🛑 Timeout: Docker não iniciou")
//	return false
//}
//
//// 🐳 Endpoint para criar container Docker local (CLI ou API interna)
//func DockerHandler(w http.ResponseWriter, r *http.Request) {
//	w.Header().Set("Access-Control-Allow-Origin", "*")
//	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
//
//	useAPI := r.URL.Query().Get("mode") == "api" // default: CLI
//	app := services.AppStore["test-local"]
//
//	command := []string{}
//	switch app.Runtime {
//	case "python":
//		command = []string{"python", app.Entry}
//	case "node":
//		command = []string{"node", app.Entry}
//	default:
//		command = []string{app.Entry}
//	}
//
//	var result *services.ContainerResult
//	var err error
//
//	done := make(chan struct{})
//	go func() {
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true)
//		} else {
//			workdir := "/app" // padrão
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command)
//		}
//		close(done)
//	}()
//
//	select {
//	case <-done:
//		if err != nil {
//			log.Println("❌ Erro ao criar container:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	case <-time.After(10 * time.Second):
//		log.Println("⏳ Criação demorou... iniciando verificação de Docker")
//		if ok := waitForDocker(60*time.Second, 10*time.Second); !ok {
//			http.Error(w, "Serviço Docker não iniciou após múltiplas tentativas", http.StatusServiceUnavailable)
//			return
//		}
//		log.Println("🔁 Tentando novamente após Docker iniciar...")
//
//		// Nova tentativa
//		if useAPI {
//			result, err = services.CreateContainerHybrid(app.Name, app.Runtime, true)
//		} else {
//			workdir := "/app"
//			result, err = services.CreateContainer(app.Name, app.Runtime, app.Path, workdir, command)
//		}
//		if err != nil {
//			log.Println("❌ Erro ao criar container após Docker iniciar:", err)
//			http.Error(w, "Erro ao criar container: "+err.Error(), http.StatusInternalServerError)
//			return
//		}
//	}
//
//	log.Printf("✅ Container criado via /api/docker [%s]: %s",
//		map[bool]string{true: "API", false: "CLI"}[useAPI], result.ID)
//
//	utils.WriteJSON(w, map[string]string{
//		"message":  result.Message,
//		"id":       result.ID,
//		"mode":     map[bool]string{true: "api", false: "cli"}[useAPI],
//		"datetime": result.Timestamp.Format(time.RFC3339),
//	})
//}
