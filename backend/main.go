//virtuscloud/backend/main.go

package main

import (
	"log"
	"net/http"
	"time"
	"virtuscloud/backend/handlers"   // ✅ novo import para debug
	"virtuscloud/backend/middleware" // 🔐 autenticação e controle de acesso
	"virtuscloud/backend/routes"     // 🚦 definição das rotas da API
	"virtuscloud/backend/services"   // 🧠 lógica de negócio e integração
	"virtuscloud/backend/store"      // 🗃️ persistência de usuários e sessões
	"virtuscloud/backend/tools"      // 🐳 watchdog e monitoramento de containers
)

func main() {
	// 🛡️ Captura panics inesperados durante execução principal
	defer func() {
		if r := recover(); r != nil {
			log.Println("🚨 Panic recuperado:", r)
		}
	}()

	// 🗃️ Carrega clientes salvos do arquivo JSON
	if err := store.LoadUsersFromFile(middleware.ClientsFilePath); err != nil {
		log.Println("⚠️ Erro ao carregar clientes:", err)
	}
	services.LoadUsersFromFile()

	// 👤 Garante que o usuário admin esteja presente
	store.InitAdminUser()

	// 🚀 Inicia o servidor
	log.Println("Servidor iniciado em http://localhost:8080")
	log.Println("🔐 Rotas de autenticação carregadas")
	log.Println("📦 Rotas de containers carregadas")
	log.Println("📊 Rotas de métricas carregadas")

	// 🧹 Sincroniza sessões com usuários válidos
	if err := store.SyncSessionsWithUserStore(); err != nil {
		log.Println("⚠️ Erro ao sincronizar sessões:", err)
	} else {
		log.Println("✅ Sessões sincronizadas com sucesso!")
	}

	// 🧠 Carrega aplicações salvas do disco
	if err := store.LoadAppStoreFromDisk("./database/appstore.json"); err != nil {
		log.Println("⚠️ Erro ao carregar AppStore:", err)
	} else {
		log.Println("✅ AppStore restaurado com sucesso!")
		services.SyncAppStoreWithDocker()             // 🔄 sincroniza containers Docker reais com AppStore
		services.CleanAppStoreFromMissingContainers() // 🧹 remove apps cujo container foi apagado
	}

	// 🔄 Inicia sincronização automática de planos entre users.json e sessions.json
	routes.StartSessionSync()

	// 🚀 Inicializa métricas em cache (RAM, planos etc.)
	routes.InitMetricsRoutes()

	// 📡 Escuta eventos Docker em tempo real
	services.StartEventListener()

	// 🔍 Verificação de saúde da API
	PublicRoute("/api/health", routes.HealthCheck)

	// 📩 Envio e verificação de código
	PublicRoute("/send-code", routes.SendCodeHandler)
	PublicRoute("/resend-code", routes.SendCodeHandler)
	PublicRoute("/api/verify", routes.VerifyCodeHandler)

	// 🔎 Verificação de disponibilidade de usuário (signup)
	PublicRoute("/api/check-user", routes.CheckUserAvailabilityHandler) // ✅ nova rota para verificação de duplicação
	ProtectedRoute("/api/session/ping", routes.PingSessionHandler)
	// 🔐 Login direto com username + email (sem código)
	PublicRoute("/api/signin", routes.SendCodeHandler) // ✅ nova rota de login direto

	// 🔓 Logout manual
	PublicRoute("/api/logout", routes.LogoutHandler) // ✅ nova rota de logout

	// ✅ Verificação de sessão persistente (token + sessão)
	ProtectedRoute("/api/verify-token", routes.VerifyTokenHandler) // ✅ essencial para login persistente

	// 🔐 ROTAS PROTEGIDAS POR JWT
	ProtectedRoute("/api/containers/create", routes.CreateContainerHandler)
	ProtectedRoute("/api/containers/dev-create", routes.CreateContainerHandler)
	ProtectedRoute("/api/containers/list", routes.ListContainersHandler)
	ProtectedRoute("/api/containers/delete", routes.DeleteContainerHandler)
	ProtectedRoute("/api/profile/update", routes.UpdateProfileHandler)

	// 📊 Métricas e eventos técnicos
	ProtectedRoute("/api/metrics", routes.MetricsHandler)
	ProtectedRoute("/api/events", routes.EventsHandler)

	// 🧠 Administração e monitoramento — com verificação de acesso
	ProtectedRoute("/api/plans/details", routes.PlansDetailsHandler)
	ProtectedWithAccess("/api/admin/clients", "admin", routes.AdminUsersHandler)
	ProtectedWithAccess("/api/admin/export-apps", "dev", routes.AdminExportAppsHandler)

	// 📱 Aplicações do usuário
	ProtectedRoute("/api/app/start", routes.StartAppHandler)
	ProtectedRoute("/api/app/stop", routes.StopAppHandler)
	ProtectedRoute("/api/app/restart", routes.RestartAppHandler)
	ProtectedRoute("/api/app/rebuild", routes.RebuildAppHandler)
	ProtectedRoute("/api/app/backup", routes.BackupAppHandler)
	ProtectedRoute("/api/app/delete", routes.DeleteAppHandler)
	ProtectedRoute("/api/app/update-name", routes.UpdateAppNameHandler)
	ProtectedRoute("/api/app/list", routes.ListUserAppsHandler)
	ProtectedRoute("/api/app/status", routes.ListAppsByStatusHandler) // ✅ nova rota para dashboard
	ProtectedRoute("/api/app/metrics", routes.AppMetricsHandler)

	// ✨ NOVOS ENDPOINTS
	ProtectedRoute("/api/app/history", routes.AppHistoryHandler)
	ProtectedRoute("/api/app/export", routes.ExportAppMetadataHandler)
	ProtectedRoute("/api/app/classify", routes.ClassifyAppUsageHandler)
	ProtectedRoute("/api/app/overview", routes.AppOverviewHandler)

	// 📦 Validação de elegibilidade para novo deploy
	ProtectedRoute("/api/deploy/validate", routes.ValidateDeployHandler)
	http.Handle("/api/deploy/entrypoints/", routes.DeployEntryRouter())
	//ProtectedRoute("/api/deploy/entrypoints/", routes.EntryPointListHandler)
	//ProtectedRoute("/api/deploy/entrypoints/{appID}", routes.EntryPointListHandler)

	// 📤 Teste de upload — agora protegido para testes autenticados
	ProtectedRoute("/api/upload", routes.UploadHandler)
	ProtectedRoute("/api/test/upload", routes.UploadHandler)

	// 🐳 Teste de criação de container local via CLI — agora protegido
	ProtectedRoute("/api/docker", routes.DockerHandler)

	// 🔐 Versão protegida futura — comentada por enquanto
	// http.HandleFunc("/api/docker", middleware.AuthMiddleware(routes.DockerHandler))

	// 🧩 Adição: rotas de cliente disponíveis, como /api/client/plan
	http.Handle("/api/client/", routes.UserRoutes())
	ProtectedWithAccess("/api/client/list", "admin", routes.ListUsersHandler)

	// 🐞 Rota de debug para visualizar clientes carregados
	// PublicRoute("/api/debug/users", handlers.DebugUsersHandler) // ✅ nova rota de debug
	// Acesse em http://localhost:8080/api/debug/clients

	// 🔒 Rota protegida para visualizar todos os usuários (admin)
	ProtectedWithAccess("/api/debug/users", "admin", handlers.DebugUsersHandler) // 🔒 rota protegida para admin

	// 🔐 Rota protegida para visualizar contexto do usuário logado
	ProtectedRoute("/api/debug/context", handlers.DebugUserContextHandler) // 🔐 rota protegida para qualquer usuário

	// 📋 Rota protegida para status dinâmico do usuário
	ProtectedRoute("/api/user/status", handlers.GetUserStatusHandler) // ✅ nova rota para status do plano

	// 🐳 Lista containers reais do Docker por usuário autenticado
	ProtectedRoute("/api/user/containers", routes.ListUserContainersHandler) // ✅ nova rota para containers reais

	// 🐶 Inicia o watchdog para monitorar e reiniciar containers automaticamente
	go tools.StartWatchdog()

	// 🔄 Inicia sincronização periódica do AppStore com Docker

	go func() {
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			services.SyncAppStoreWithDocker()
		}
	}()

	// limpa a cada 1 minuto (com grace period dentro da função)
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			services.CleanAppStoreFromMissingContainers()
		}
	}()

	// sincroniza a cada 2s
	//go func() {
	//	ticker := time.NewTicker(2 * time.Second)
	//	defer ticker.Stop()
	//	for range ticker.C {
	//		services.SyncAppStoreWithDocker()
	//	}
	//}()
	//
	//// limpa a cada 1 minuto
	//go func() {
	//	ticker := time.NewTicker(5 * time.Second)
	//	defer ticker.Stop()
	//	for range ticker.C {
	//		services.CleanAppStoreFromMissingContainers()
	//	}
	//}()

	//go func() {
	//	ticker := time.NewTicker(2 * time.Second) // atualiza a cada 2s
	//	defer ticker.Stop()
	//	for range ticker.C {
	//		services.SyncAppStoreWithDocker()
	//		//services.CleanAppStoreFromMissingContainers() // ⚠️ não limpar aqui, para não apagar apps recém-criados
	//	}
	//}()
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Erro ao iniciar servidor:", err)
	}
}

// ✅ Helpers para rotas

func PublicRoute(path string, handler http.HandlerFunc) {
	http.HandleFunc(path, handler)
}

func ProtectedRoute(path string, handler http.HandlerFunc) {
	http.Handle(path, middleware.AuthMiddleware(handler))
}

func ProtectedWithAccess(path string, required string, handler http.HandlerFunc) {
	http.Handle(path, middleware.AuthMiddleware(middleware.RequireAccess(required, handler)))
}

//virtuscloud/backend/main.go

//package main
//
//import (
//	"log"
//	"net/http"
//
//	"github.com/go-chi/chi/v5"
//	"github.com/go-chi/chi/v5/middleware"
//
//	"virtuscloud/backend/handlers"
//	auth "virtuscloud/backend/middleware" // 🔐 autenticação e controle de acesso
//	"virtuscloud/backend/routes"
//	"virtuscloud/backend/services"
//	"virtuscloud/backend/store"
//	"virtuscloud/backend/tools"
//)
//
//func main() {
//	// 🛡️ Captura panics inesperados
//	defer func() {
//		if r := recover(); r != nil {
//			log.Println("🚨 Panic recuperado:", r)
//		}
//	}()
//
//	// 🗃️ Carrega usuários e sessões
//	if err := store.LoadUsersFromFile(auth.ClientsFilePath); err != nil {
//		log.Println("⚠️ Erro ao carregar clientes:", err)
//	}
//	services.LoadUsersFromFile()
//	store.InitAdminUser()
//
//	if err := store.SyncSessionsWithUserStore(); err != nil {
//		log.Println("⚠️ Erro ao sincronizar sessões:", err)
//	} else {
//		log.Println("✅ Sessões sincronizadas com sucesso!")
//	}
//
//	// 🧠 Carrega AppStore e sincroniza com Docker
//	if err := store.LoadAppStoreFromDisk("./database/appstore.json"); err != nil {
//		log.Println("⚠️ Erro ao carregar AppStore:", err)
//	} else {
//		log.Println("✅ AppStore restaurado com sucesso!")
//		services.SyncAppStoreWithDocker()
//		services.CleanAppStoreFromMissingContainers()
//	}
//
//	// 🔄 Sincronização e métricas
//	routes.StartSessionSync()
//	routes.InitMetricsRoutes()
//	services.StartEventListener()
//	go tools.StartWatchdog()
//
//	// 🚀 Roteador principal
//	r := chi.NewRouter()
//	r.Use(middleware.Logger)
//	r.Use(middleware.Recoverer)
//
//	log.Println("🚀 Servidor iniciado em http://localhost:8080")
//
//	// ✅ ROTAS PÚBLICAS
//	PublicRoute(r, "GET", "/api/health", routes.HealthCheck)
//	PublicRoute(r, "GET", "/send-code", routes.SendCodeHandler)
//	PublicRoute(r, "GET", "/resend-code", routes.SendCodeHandler)
//	PublicRoute(r, "GET", "/api/verify", routes.VerifyCodeHandler)
//	PublicRoute(r, "GET", "/api/check-user", routes.CheckUserAvailabilityHandler)
//	PublicRoute(r, "GET", "/api/signin", routes.SendCodeHandler)
//	PublicRoute(r, "GET", "/api/logout", routes.LogoutHandler)
//
//	// 🔐 ROTAS PROTEGIDAS
//	ProtectedRoute(r, "GET", "/api/verify-token", routes.VerifyTokenHandler)
//	ProtectedRoute(r, "GET", "/api/session/ping", routes.PingSessionHandler)
//	ProtectedRoute(r, "GET", "/api/user/status", handlers.GetUserStatusHandler)
//	ProtectedRoute(r, "GET", "/api/user/containers", routes.ListUserContainersHandler)
//	ProtectedRoute(r, "POST", "/api/upload", routes.UploadHandler)
//	ProtectedRoute(r, "POST", "/api/test/upload", routes.UploadHandler)
//	ProtectedRoute(r, "POST", "/api/docker", routes.DockerHandler)
//
//	// 📦 Deploy
//	ProtectedRoute(r, "GET", "/api/deploy/validate", routes.ValidateDeployHandler)
//	ProtectedRoute(r, "GET", "/api/deploy/entrypoints/{appID}", routes.EntryPointListHandler)
//
//	// 📱 Aplicações
//	ProtectedRoute(r, "POST", "/api/app/start", routes.StartAppHandler)
//	ProtectedRoute(r, "POST", "/api/app/stop", routes.StopAppHandler)
//	ProtectedRoute(r, "POST", "/api/app/restart", routes.RestartAppHandler)
//	ProtectedRoute(r, "POST", "/api/app/rebuild", routes.RebuildAppHandler)
//	ProtectedRoute(r, "POST", "/api/app/backup", routes.BackupAppHandler)
//	ProtectedRoute(r, "POST", "/api/app/delete", routes.DeleteAppHandler)
//	ProtectedRoute(r, "POST", "/api/app/update-name", routes.UpdateAppNameHandler)
//	ProtectedRoute(r, "GET", "/api/app/list", routes.ListUserAppsHandler)
//	ProtectedRoute(r, "GET", "/api/app/status", routes.ListAppsByStatusHandler)
//	ProtectedRoute(r, "GET", "/api/app/metrics", routes.AppMetricsHandler)
//	ProtectedRoute(r, "GET", "/api/app/history", routes.AppHistoryHandler)
//	ProtectedRoute(r, "GET", "/api/app/export", routes.ExportAppMetadataHandler)
//	ProtectedRoute(r, "GET", "/api/app/classify", routes.ClassifyAppUsageHandler)
//	ProtectedRoute(r, "GET", "/api/app/overview", routes.AppOverviewHandler)
//
//	// 🐳 Containers
//	ProtectedRoute(r, "POST", "/api/containers/create", routes.CreateContainerHandler)
//	ProtectedRoute(r, "POST", "/api/containers/dev-create", routes.CreateContainerHandler)
//	ProtectedRoute(r, "GET", "/api/containers/list", routes.ListContainersHandler)
//	ProtectedRoute(r, "POST", "/api/containers/delete", routes.DeleteContainerHandler)
//
//	// 📊 Métricas
//	ProtectedRoute(r, "GET", "/api/metrics", routes.MetricsHandler)
//	ProtectedRoute(r, "GET", "/api/events", routes.EventsHandler)
//
//	// 👤 Perfil
//	ProtectedRoute(r, "POST", "/api/profile/update", routes.UpdateProfileHandler)
//
//	// 🧠 Administração
//	ProtectedWithAccess(r, "GET", "/api/admin/clients", "admin", routes.AdminUsersHandler)
//	ProtectedWithAccess(r, "GET", "/api/admin/export-apps", "dev", routes.AdminExportAppsHandler)
//
//	// 🐞 Debug
//	ProtectedWithAccess(r, "GET", "/api/debug/users", "admin", handlers.DebugUsersHandler)
//	ProtectedRoute(r, "GET", "/api/debug/context", handlers.DebugUserContextHandler)
//
//	// 🧩 Rotas de cliente agrupadas
//	r.Mount("/api/user", routes.UserRoutes()) // ✅ rotas como /plan, /assign-plan
//
//	// 🏁 Inicia servidor
//	if err := http.ListenAndServe(":8080", r); err != nil {
//		log.Fatal("Erro ao iniciar servidor:", err)
//	}
//}
//
//// ✅ Helpers para rotas
//
//func PublicRoute(r chi.Router, method, path string, handler http.HandlerFunc) {
//	r.MethodFunc(method, path, handler)
//}
//
//func ProtectedRoute(r chi.Router, method, path string, handler http.HandlerFunc) {
//	r.With(auth.AuthMiddleware).MethodFunc(method, path, handler)
//}
//
//func ProtectedWithAccess(r chi.Router, method, path, role string, handler http.HandlerFunc) {
//	finalHandler := auth.AuthMiddleware(auth.RequireAccess(role, handler))
//	r.MethodFunc(method, path, finalHandler.(http.HandlerFunc))
//}

//virtuscloud/backend/main.go

//package main
//
//import (
//	"log"
//	"net/http"
//
//	"github.com/go-chi/chi/v5"
//
//	"virtuscloud/backend/handlers"   // ✅ novo import para debug
//	"virtuscloud/backend/middleware" // 🔐 autenticação e controle de acesso
//	"virtuscloud/backend/routes"     // 🚦 definição das rotas da API
//	"virtuscloud/backend/services"   // 🧠 lógica de negócio e integração
//	"virtuscloud/backend/store"      // 🗃️ persistência de usuários e sessões
//	"virtuscloud/backend/tools"      // 🐳 watchdog e monitoramento de containers
//)
//
//func main() {
//	// 🛡️ Captura panics inesperados durante execução principal
//	defer func() {
//		if r := recover(); r != nil {
//			log.Println("🚨 Panic recuperado:", r)
//		}
//	}()
//
//	// 🗃️ Carrega clientes salvos do arquivo JSON
//	if err := store.LoadUsersFromFile(middleware.ClientsFilePath); err != nil {
//		log.Println("⚠️ Erro ao carregar clientes:", err)
//	}
//	services.LoadUsersFromFile()
//
//	// 👤 Garante que o usuário admin esteja presente
//	store.InitAdminUser()
//
//	// 🧹 Sincroniza sessões com usuários válidos
//	if err := store.SyncSessionsWithUserStore(); err != nil {
//		log.Println("⚠️ Erro ao sincronizar sessões:", err)
//	} else {
//		log.Println("✅ Sessões sincronizadas com sucesso!")
//	}
//
//	// 🧠 Carrega aplicações salvas do disco
//	if err := store.LoadAppStoreFromDisk("./database/appstore.json"); err != nil {
//		log.Println("⚠️ Erro ao carregar AppStore:", err)
//	} else {
//		log.Println("✅ AppStore restaurado com sucesso!")
//		services.SyncAppStoreWithDocker()             // 🔄 sincroniza containers Docker reais com AppStore
//		services.CleanAppStoreFromMissingContainers() // 🧹 remove apps cujo container foi apagado
//	}
//
//	// 🔄 Inicia sincronização automática de planos entre users.json e sessions.json
//	routes.StartSessionSync()
//
//	// 🚀 Inicializa métricas em cache (RAM, planos etc.)
//	routes.InitMetricsRoutes()
//
//	// 📡 Escuta eventos Docker em tempo real
//	services.StartEventListener()
//
//	// 🐶 Inicia o watchdog para monitorar e reiniciar containers automaticamente
//	go tools.StartWatchdog()
//
//	// 🔧 Roteador principal com chi
//	r := chi.NewRouter()
//
//	log.Println("🚀 Servidor iniciado em http://localhost:8080")
//	log.Println("🔐 Rotas de autenticação carregadas")
//	log.Println("📦 Rotas de containers carregadas")
//	log.Println("📊 Rotas de métricas carregadas")
//
//	// 🔓 Rotas públicas
//	r.Get("/api/health", routes.HealthCheck)
//	r.Get("/send-code", routes.SendCodeHandler)
//	r.Get("/resend-code", routes.SendCodeHandler)
//	r.Get("/api/verify", routes.VerifyCodeHandler)
//	r.Get("/api/check-user", routes.CheckUserAvailabilityHandler)
//	r.Get("/api/signin", routes.SendCodeHandler)
//	r.Get("/api/logout", routes.LogoutHandler)
//
//	// 🔐 Rotas protegidas por JWT
//	r.With(middleware.AuthMiddleware).Get("/api/verify-token", routes.VerifyTokenHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/session/ping", routes.PingSessionHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/user/status", handlers.GetUserStatusHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/user/containers", routes.ListUserContainersHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/upload", routes.UploadHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/test/upload", routes.UploadHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/docker", routes.DockerHandler)
//
//	// 📦 Deploy
//	r.With(middleware.AuthMiddleware).Get("/api/deploy/validate", routes.ValidateDeployHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/deploy/entrypoints/{appID}", routes.EntryPointListHandler)
//
//	// 📱 Aplicações do usuário
//	r.With(middleware.AuthMiddleware).Post("/api/app/start", routes.StartAppHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/app/stop", routes.StopAppHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/app/restart", routes.RestartAppHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/app/rebuild", routes.RebuildAppHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/app/backup", routes.BackupAppHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/app/delete", routes.DeleteAppHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/app/update-name", routes.UpdateAppNameHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/app/list", routes.ListUserAppsHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/app/status", routes.ListAppsByStatusHandler) // ✅ nova rota para dashboard
//	r.With(middleware.AuthMiddleware).Get("/api/app/metrics", routes.AppMetricsHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/app/history", routes.AppHistoryHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/app/export", routes.ExportAppMetadataHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/app/classify", routes.ClassifyAppUsageHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/app/overview", routes.AppOverviewHandler)
//
//	// 🐳 Containers
//	r.With(middleware.AuthMiddleware).Post("/api/containers/create", routes.CreateContainerHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/containers/dev-create", routes.CreateContainerHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/containers/list", routes.ListContainersHandler)
//	r.With(middleware.AuthMiddleware).Post("/api/containers/delete", routes.DeleteContainerHandler)
//
//	// 📊 Métricas e eventos técnicos
//	r.With(middleware.AuthMiddleware).Get("/api/metrics", routes.MetricsHandler)
//	r.With(middleware.AuthMiddleware).Get("/api/events", routes.EventsHandler)
//
//	// 👤 Perfil
//	r.With(middleware.AuthMiddleware).Post("/api/profile/update", routes.UpdateProfileHandler)
//
//	// 🧠 Administração e monitoramento — com verificação de acesso
//	r.HandleFunc("/api/admin/clients", middleware.RequireAccess("admin", routes.AdminUsersHandler))
//	r.HandleFunc("/api/admin/export-apps", middleware.RequireAccess("dev", routes.AdminExportAppsHandler))
//
//	// 🐞 Debug
//	r.HandleFunc("/api/debug/users", middleware.RequireAccess("admin", handlers.DebugUsersHandler))
//	r.With(middleware.AuthMiddleware).Get("/api/debug/context", handlers.DebugUserContextHandler)
//
//	// 🧩 Rotas de cliente
//	r.Mount("/api/client", routes.UserRoutes())
//	r.HandleFunc("/api/client/list", middleware.RequireAccess("admin", routes.ListUsersHandler))
//
//	// 🚀 Inicia o servidor
//	if err := http.ListenAndServe(":8080", r); err != nil {
//		log.Fatal("Erro ao iniciar servidor:", err)
//	}
//}
