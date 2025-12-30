//backend/limits/rate.go

package limits

import (
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

// 📈 Verifica se o usuário excedeu o limite diário de requisições
func IsRateLimitExceeded(username string, currentCount int) bool {
	user := store.UserStore[username] // ✅ corrigido para usar username
	if user == nil {
		return true
	}

	plan := models.Plans[user.Plan]
	return currentCount >= plan.DailyAPIRequestsMax
}

//package limits
//
//import (
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 📈 Verifica se o usuário excedeu o limite diário de requisições
//func IsRateLimitExceeded(userID string, currentCount int) bool {
//	user := store.UserStore[userID]
//	if user == nil {
//		return true
//	}
//
//	plan := models.Plans[user.Plan]
//	return currentCount >= plan.DailyAPIRequestsMax
//}
