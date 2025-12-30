//backend/services/usermetrics.go

package services

import (
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

type UserMetrics struct {
	Username     string  `json:"username"`      // Nome de usuário
	Email        string  `json:"email"`         // Email do usuário
	Plan         string  `json:"plan"`          // Plano atual
	Containers   int     `json:"containers"`    // Número de containers/apps
	RAMTotalMB   float32 `json:"ram_total"`     // RAM total usada em MB
	Status       string  `json:"status"`        // Status de uso
	LastActivity string  `json:"last_activity"` // Última atividade
}

// 🔍 Gera métricas reais com base no UserStore e AppStore
func GetAllUserMetrics() []UserMetrics {
	var metrics []UserMetrics

	for _, user := range store.UserStore {
		var ramTotal float32
		var containers int

		for _, app := range store.AppStore {
			if app.Username == user.Username { // ✅ Comparação por username
				ramTotal += app.RAMUsage
				containers++
			}
		}

		status := "✅ Dentro do limite"
		if ramTotal > float32(models.Plans[user.Plan].MemoryMB) {
			status = "⚠️ RAM acima do limite"
		}

		metrics = append(metrics, UserMetrics{
			Username:     user.Username,
			Email:        user.Email,
			Plan:         string(user.Plan),
			Containers:   containers,
			RAMTotalMB:   ramTotal,
			Status:       status,
			LastActivity: user.LastActivity,
		})
	}

	return metrics
}

//package services
//
//import (
//	"strconv"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//type UserMetrics struct {
//	UserID       string  `json:"user_id"`       // ID do usuário
//	Username     string  `json:"username"`      // Nome de usuário
//	Email        string  `json:"email"`         // Email do usuário
//	Plan         string  `json:"plan"`          // Plano atual
//	Containers   int     `json:"containers"`    // Número de containers/apps
//	RAMTotalMB   float32 `json:"ram_total"`     // RAM total usada em MB
//	Status       string  `json:"status"`        // Status de uso
//	LastActivity string  `json:"last_activity"` // Última atividade
//}
//
//// 🔍 Gera métricas reais com base no UserStore e AppStore
//func GetAllUserMetrics() []UserMetrics {
//	var metrics []UserMetrics
//
//	for _, user := range store.UserStore {
//		var ramTotal float32
//		var containers int
//
//		for _, app := range store.AppStore {
//			if app.UserID == strconv.Itoa(user.ID) {
//				ramTotal += app.RAMUsage
//				containers++
//			}
//		}
//
//		status := "✅ Dentro do limite"
//		if ramTotal > float32(models.Plans[user.Plan].MemoryMB) {
//			status = "⚠️ RAM acima do limite"
//		}
//
//		metrics = append(metrics, UserMetrics{
//			UserID:       strconv.Itoa(user.ID),
//			Username:     user.Username,
//			Email:        user.Email,
//			Plan:         string(user.Plan),
//			Containers:   containers,
//			RAMTotalMB:   ramTotal,
//			Status:       status,
//			LastActivity: user.LastActivity,
//		})
//	}
//
//	return metrics
//}

//package services
//
//import (
//	"strconv"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//type UserMetrics struct {
//	UserID       string  `json:"user_id"`       // ID do usuário
//	Username     string  `json:"username"`      // Nome de usuário
//	Email        string  `json:"email"`         // Email do usuário
//	Plan         string  `json:"plan"`          // Plano atual
//	Containers   int     `json:"containers"`    // Número de containers/apps
//	RAMTotalGB   float32 `json:"ram_total"`     // RAM total usada
//	Status       string  `json:"status"`        // Status de uso
//	LastActivity string  `json:"last_activity"` // Última atividade
//}
//
//// 🔍 Gera métricas reais com base no UserStore e AppStore
//func GetAllUserMetrics() []UserMetrics {
//	var metrics []UserMetrics
//
//	for _, user := range store.UserStore {
//		var ramTotal float32
//		var containers int
//
//		for _, app := range store.AppStore {
//			if app.UserID == strconv.Itoa(user.ID) {
//				ramTotal += app.RAMUsage
//				containers++
//			}
//		}
//
//		status := "✅ Dentro do limite"
//		if ramTotal > models.Plans[user.Plan].MemoryGB {
//			status = "⚠️ RAM acima do limite"
//		}
//
//		metrics = append(metrics, UserMetrics{
//			UserID:       strconv.Itoa(user.ID),
//			Username:     user.Username,
//			Email:        user.Email,
//			Plan:         string(user.Plan),
//			Containers:   containers,
//			RAMTotalGB:   ramTotal,
//			Status:       status,
//			LastActivity: user.LastActivity,
//		})
//	}
//
//	return metrics
//}
