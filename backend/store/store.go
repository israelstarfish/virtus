// backend/store/store.go

package store

import (
	"virtuscloud/backend/models"
)

// 🔄 Sincroniza dados do usuário no armazenamento em memória
func SyncUserToStore(username, email string, plan models.PlanType, _ string) {
	// ✅ Agora indexado diretamente por username
	UserStore[username] = &models.User{
		Username: username,
		Email:    email,
		Plan:     plan,
	}
}

//package store
//
//import (
//	"strconv"
//	"virtuscloud/backend/models"
//)
//
//// 🔄 Sincroniza dados do usuário no armazenamento em memória
//func SyncUserToStore(username, email string, plan models.PlanType, id string) {
//	intID, err := strconv.Atoi(id)
//	if err != nil {
//		// Se o ID não for conversível, ignora ou loga erro
//		return
//	}
//
//	UserStore[id] = &models.User{
//		ID:       intID,
//		Username: username,
//		Email:    email,
//		Plan:     plan,
//	}
//}
