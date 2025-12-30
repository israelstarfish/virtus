//backend/models/apps.go

package models

import "time"

type AppStatus string

const (
	StatusRunning AppStatus = "running"
	StatusStopped AppStatus = "stopped"
	StatusBackups AppStatus = "unavailable" // ✅ adicionado para representar containers com backup
)

// 📦 Representação de uma aplicação vinculada a um usuário
type App struct {
	ID        string    `json:"ID"`
	Username  string    `json:"username"`
	Name      string    `json:"name"`
	Path      string    `json:"path"`
	PID       int       `json:"pid"`
	Status    AppStatus `json:"status"`
	Logs      []string  `json:"logs"`
	Port      int       `json:"port"`
	StartTime time.Time `json:"start_time"`

	// RAM
	RAMUsage   float32 `json:"ram"`        // uso atual em MB
	RAMLimit   float32 `json:"ramLimit"`   // limite do plano em MB
	RAMPercent float32 `json:"ramPercent"` // percentual relativo ao plano

	// CPU
	CPUUsage   float32 `json:"cpu"`        // percentual bruto do host
	CPULimit   float32 `json:"cpuLimit"`   // limite do plano em vCPU
	CPUPercent float32 `json:"cpuPercent"` // percentual relativo ao plano

	Alert string `json:"alert"`

	// Deploy dinâmico
	Runtime string `json:"runtime"`
	Entry   string `json:"entry"`
	Plan    string `json:"plan"`

	ContainerName string `json:"container_name,omitempty"`
	MissingCount  int    `json:"missing_count,omitempty"`
}

//backend/models/apps.go

//package models
//
//import "time"
//
//type AppStatus string
//
//const (
//	StatusRunning AppStatus = "running"
//	StatusStopped AppStatus = "stopped"
//	StatusBackups AppStatus = "unavailable" // ✅ adicionado para representar containers com backup
//)
//
//// 📦 Representação de uma aplicação vinculada a um usuário
//type App struct {
//	ID        string    `json:"ID"`
//	Username  string    `json:"username"`
//	Name      string    `json:"name"`
//	Path      string    `json:"path"`
//	PID       int       `json:"pid"`
//	Status    AppStatus `json:"status"`
//	Logs      []string  `json:"logs"`
//	Port      int       `json:"port"`
//	StartTime time.Time `json:"start_time"`
//	RAMUsage  float32   `json:"ram"`
//
//	// CPU
//	CPUUsage   float32 `json:"cpu"`        // percentual bruto do host
//	CPULimit   float32 `json:"cpuLimit"`   // limite do plano em vCPU
//	CPUPercent float32 `json:"cpuPercent"` // percentual relativo ao plano
//
//	Alert string `json:"alert"`
//
//	// Deploy dinâmico
//	Runtime string `json:"runtime"`
//	Entry   string `json:"entry"`
//	Plan    string `json:"plan"`
//
//	ContainerName string `json:"container_name,omitempty"`
//	MissingCount  int    `json:"missing_count,omitempty"`
//}

//backend/models/apps.go

//package models
//
//import "time"
//
//type AppStatus string
//
//const (
//	StatusRunning AppStatus = "running"
//	StatusStopped AppStatus = "stopped"
//	StatusBackups AppStatus = "unavailable" // ✅ adicionado para representar containers com backup
//)
//
//// 📦 Representação de uma aplicação vinculada a um usuário
//type App struct {
//	ID        string    `json:"ID"`
//	Username  string    `json:"username"`
//	Name      string    `json:"name"`
//	Path      string    `json:"path"`
//	PID       int       `json:"pid"`
//	Status    AppStatus `json:"status"`
//	Logs      []string  `json:"logs"`
//	Port      int       `json:"port"`
//	StartTime time.Time `json:"start_time"`
//	RAMUsage  float32   `json:"ram"`
//
//	// CPU
//	CPUUsage   float32 `json:"cpu"`         // percentual bruto do host
//	CPULimit   float32 `json:"cpu_limit"`   // limite do plano em vCPU
//	CPUPercent float32 `json:"cpu_percent"` // percentual relativo ao plano
//
//	Alert string `json:"alert"`
//
//	// Deploy dinâmico
//	Runtime string `json:"runtime"`
//	Entry   string `json:"entry"`
//	Plan    string `json:"plan"`
//
//	ContainerName string `json:"container_name,omitempty"`
//	MissingCount  int    `json:"missing_count,omitempty"`
//}

//backend/models/apps.go

//package models
//
//import "time"
//
//type AppStatus string
//
//const (
//	StatusRunning AppStatus = "running"
//	StatusStopped AppStatus = "stopped"
//	StatusBackups AppStatus = "unavailable" // ✅ adicionado para representar containers com backup
//)
//
//// 📦 Representação de uma aplicação vinculada a um usuário
//type App struct {
//	ID        string    `json:"ID"`         // Identificador único da aplicação
//	Username  string    `json:"username"`   // Nome de usuário dono da aplicação
//	Name      string    `json:"name"`       // Nome da aplicação
//	Path      string    `json:"path"`       // Caminho absoluto da aplicação
//	PID       int       `json:"pid"`        // Process ID da aplicação em execução
//	Status    AppStatus `json:"status"`     // Estado atual da aplicação
//	Logs      []string  `json:"logs"`       // Logs recentes da aplicação
//	Port      int       `json:"port"`       // Porta de escuta da aplicação
//	StartTime time.Time `json:"start_time"` // Timestamp de início da aplicação
//	RAMUsage  float32   `json:"ram"`        // RAM utilizada pela aplicação (em MB)
//	CPUUsage  float32   `json:"cpu"`        // percentual de uso de CPU
//	Alert     string    `json:"alert"`      // Mensagem de alerta ou erro
//
//	// 🧩 Campos adicionados para suportar deploy dinâmico
//	Runtime string `json:"runtime"` // ex: "node", "python", etc.
//	Entry   string `json:"entry"`   // Caminho do ponto de entrada detectado
//	Plan    string `json:"plan"`    // Plano da aplicação: ex "free", "pro"
//
//	// 🐳 Nome real do container Docker
//	ContainerName string `json:"container_name,omitempty"` // ex: "snapplle-1758419689967623976"
//
//	// ⏳ Grace Period: contador de ciclos ausentes
//	MissingCount int `json:"missing_count,omitempty"`
//}

//backend/models/apps.go

//package models
//
//import "time"
//
//type AppStatus string
//
//const (
//	StatusRunning AppStatus = "running"
//	StatusStopped AppStatus = "stopped"
//	StatusBackups AppStatus = "unavailable" // ✅ adicionado para representar containers com backup
//)
//
//// 📦 Representação de uma aplicação vinculada a um usuário
//type App struct {
//	ID        string    `json:"ID"`         // Identificador único da aplicação
//	Username  string    `json:"username"`   // Nome de usuário dono da aplicação
//	Name      string    `json:"name"`       // Nome da aplicação
//	Path      string    `json:"path"`       // Caminho absoluto da aplicação
//	PID       int       `json:"pid"`        // Process ID da aplicação em execução
//	Status    AppStatus `json:"status"`     // Estado atual da aplicação
//	Logs      []string  `json:"logs"`       // Logs recentes da aplicação
//	Port      int       `json:"port"`       // Porta de escuta da aplicação
//	StartTime time.Time `json:"start_time"` // Timestamp de início da aplicação
//	RAMUsage  float32   `json:"ram"`        // RAM utilizada pela aplicação (em MB)
//
//	// 🔧 CPU
//	CPUUsage   float32 `json:"cpu"`        // uso atual em vCPU (valor bruto)
//	CPULimit   float32 `json:"cpu_limit"`  // limite de vCPU do plano
//	CPUPercent float32 `json:"cpu_percent"`// percentual relativo ao plano
//
//	Alert string `json:"alert"` // Mensagem de alerta ou erro
//
//	// 🧩 Campos adicionados para suportar deploy dinâmico
//	Runtime string `json:"runtime"` // ex: "node", "python", etc.
//	Entry   string `json:"entry"`   // Caminho do ponto de entrada detectado
//	Plan    string `json:"plan"`    // Plano da aplicação: ex "free", "pro"
//
//	// 🐳 Nome real do container Docker
//	ContainerName string `json:"container_name,omitempty"` // ex: "snapplle-1758419689967623976"
//
//	// ⏳ Grace Period: contador de ciclos ausentes
//	MissingCount int `json:"missing_count,omitempty"`
//}

//backend/models/apps.go

//package models
//
//import "time"
//
//type AppStatus string
//
//const (
//	StatusRunning AppStatus = "running"
//	StatusStopped AppStatus = "stopped"
//	StatusBackups AppStatus = "unavailable" // ✅ adicionado para representar containers com backup
//)
//
//// 📦 Representação de uma aplicação vinculada a um usuário
//type App struct {
//	ID        string    `json:"ID"`         // Identificador único da aplicação
//	Username  string    `json:"username"`   // Nome de usuário dono da aplicação
//	Name      string    `json:"name"`       // Nome da aplicação
//	Path      string    `json:"path"`       // Caminho absoluto da aplicação
//	PID       int       `json:"pid"`        // Process ID da aplicação em execução
//	Status    AppStatus `json:"status"`     // Estado atual da aplicação
//	Logs      []string  `json:"logs"`       // Logs recentes da aplicação
//	Port      int       `json:"port"`       // Porta de escuta da aplicação
//	StartTime time.Time `json:"start_time"` // Timestamp de início da aplicação
//	RAMUsage  float32   `json:"ram"`        // RAM utilizada pela aplicação (em MB)
//	CPUUsage  float32   `json:"cpu"`        // percentual de uso de CPU
//	Alert     string    `json:"alert"`      // Mensagem de alerta ou erro
//
//	// 🧩 Campos adicionados para suportar deploy dinâmico
//	Runtime string `json:"runtime"` // ex: "node", "python", etc.
//	Entry   string `json:"entry"`   // Caminho do ponto de entrada detectado
//	Plan    string `json:"plan"`    // Plano da aplicação: ex "free", "pro"
//
//	// 🐳 Nome real do container Docker
//	ContainerName string `json:"container_name,omitempty"` // ex: "snapplle-1758419689967623976"
//
//	// ⏳ Grace Period: contador de ciclos ausentes
//	MissingCount int `json:"missing_count,omitempty"`
//}

//backend/models/apps.go

//package models
//
//import "time"
//
//type AppStatus string
//
//const (
//	StatusRunning AppStatus = "running"
//	StatusStopped AppStatus = "stopped"
//	StatusBackups AppStatus = "unavailable" // ✅ adicionado para representar containers com backup
//)
//
//// 📦 Representação de uma aplicação vinculada a um usuário
//type App struct {
//	ID        string    `json:"ID"`        // Identificador único da aplicação
//	Username  string    `json:"Username"`  // Nome de usuário dono da aplicação
//	Name      string    `json:"Name"`      // Nome da aplicação
//	Path      string    `json:"Path"`      // Caminho absoluto da aplicação
//	PID       int       `json:"PID"`       // Process ID da aplicação em execução
//	Status    AppStatus `json:"Status"`    // Estado atual da aplicação
//	Logs      []string  `json:"Logs"`      // Logs recentes da aplicação
//	Port      int       `json:"Port"`      // Porta de escuta da aplicação
//	StartTime time.Time `json:"StartTime"` // Timestamp de início da aplicação
//	RAMUsage  float32   `json:"RAM"`       // RAM utilizada pela aplicação (em MB)
//	Alert     string    `json:"Alert"`     // Mensagem de alerta ou erro
//
//	// 🧩 Campos adicionados para suportar deploy dinâmico
//	Runtime string `json:"runtime"` // ex: "node", "python", etc.
//	Entry   string `json:"entry"`   // Caminho do ponto de entrada detectado
//	Plan    string `json:"plan"`    // Plano da aplicação: ex "free", "pro"
//
//	// 🐳 Nome real do container Docker
//	ContainerName string `json:"ContainerName,omitempty"` // ex: "username-8545519689967623976"
//}
