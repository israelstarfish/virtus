//backend/models/users.go

package models

import "time"

// 👤 Representação de um usuário no sistema
type User struct {
	//ID           int       `json:"id" gorm:"primaryKey"`   // Identificador único
	Name         string    `json:"name"`                   // Nome do usuário
	Username     string    `json:"username" gorm:"unique"` // Nome de usuário único e imutável
	Email        string    `json:"email" gorm:"unique"`    // Email do usuário
	Plan         PlanType  `json:"plan"`                   // Tipo de plano vinculado
	Role         string    `json:"role"`                   // 🛡️ Nível de acesso (ex: admin, dev, user)
	Containers   []string  `json:"containers" gorm:"-"`    // Lista de containers associados (não persistido por padrão)
	LastActivity string    `json:"last_activity"`          // Última atividade registrada (timestamp ou descrição)
	Status       string    `json:"status"`                 // Estado da conta ("pending", "active", "disabled")
	Active       bool      `json:"active"`                 // Indica se o usuário está ativo
	CanDeploy    bool      `json:"canDeploy"`              // ✅ Permissão para realizar deploys
	CreatedAt    time.Time `json:"created_at"`             // Data de criação do usuário
}

//package models
//
//import "time"
//
//// 👤 Representação de um usuário no sistema
//type User struct {
//	ID                    int        `json:"id" gorm:"primaryKey"`              // Identificador único
//	Name                  string     `json:"name"`                              // Nome do usuário
//	Username              string     `json:"username" gorm:"unique"`            // Nome de usuário único e imutável
//	Email                 string     `json:"email" gorm:"unique"`               // Email do usuário
//	Plan                  PlanType   `json:"plan"`                              // Tipo de plano vinculado
//	Role                  string     `json:"role"`                              // 🛡️ Nível de acesso (ex: admin, dev, user)
//	Containers            []string   `json:"containers" gorm:"-"`               // Lista de containers associados (não persistido por padrão)
//	LastActivity          string     `json:"last_activity"`                     // Última atividade registrada (timestamp ou descrição)
//	Status                string     `json:"status"`                            // Estado da conta ("pending", "active", "disabled")
//	VerificationCode      string     `json:"verification_code"`                 // Código de verificação temporário (para login ou ativação)
//	VerificationExpiresAt *time.Time `json:"verification_expires_at,omitempty"` // Expiração do código de verificação
//	CreatedAt             time.Time  `json:"created_at"`                        // Data de criação do usuário
//}
