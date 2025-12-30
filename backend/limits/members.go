//backend/limits/members.go

package limits

import (
	"fmt"
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

// 👥 Verifica se o usuário pode adicionar mais membros ao projeto
func CanAddMember(username string, currentMemberCount int) error {
	user := store.UserStore[username] // ✅ corrigido para usar username
	if user == nil {
		return fmt.Errorf("usuário não encontrado")
	}

	plan := models.Plans[user.Plan]

	if currentMemberCount >= plan.MembersMax {
		return fmt.Errorf("limite de membros atingido para o plano '%s'", plan.Name)
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
//// 👥 Verifica se o usuário pode adicionar mais membros ao projeto
//func CanAddMember(userID string, currentMemberCount int) error {
//	user := store.UserStore[userID]
//	if user == nil {
//		return fmt.Errorf("usuário não encontrado")
//	}
//
//	plan := models.Plans[user.Plan]
//
//	if currentMemberCount >= plan.MembersMax {
//		return fmt.Errorf("limite de membros atingido para o plano '%s'", plan.Name)
//	}
//	return nil
//}
