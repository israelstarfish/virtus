//backend/limits/storage.go

package limits

import (
	"fmt"
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

// 🧮 Verifica se o usuário pode fazer upload de blob
func CanUploadBlob(username string, currentUsageGB int) error {
	user := store.UserStore[username] // ✅ corrigido para usar username
	if user == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	plan := models.Plans[user.Plan]

	if currentUsageGB >= plan.BlobLimitGB {
		return fmt.Errorf("limite de armazenamento excedido para o plano '%s'", plan.Name)
	}
	return nil
}

//package limits
//
//import (
//	"fmt"
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 🧮 Verifica se o usuário pode fazer upload de blob
//func CanUploadBlob(userID string, currentUsageGB int) error {
//	user := store.UserStore[userID]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//
//	if currentUsageGB >= plan.BlobLimitGB {
//		return fmt.Errorf("limite de armazenamento excedido para o plano '%s'", plan.Name)
//	}
//	return nil
//}
