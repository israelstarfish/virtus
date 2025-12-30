//backend/limits/features.go

package limits

import (
	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

// 🔐 Verifica se o usuário tem acesso a uma funcionalidade específica
func HasFeature(username string, feature string) bool {
	user := store.UserStore[username] // ✅ corrigido para usar username
	if user == nil {
		return false
	}

	plan := models.Plans[user.Plan]

	switch feature {
	case "custom-domain":
		return plan.CustomDomain
	case "metrics":
		return plan.MetricsAccess
	case "github":
		return plan.GitHubIntegration
	case "workspace":
		return plan.WorkspaceAccess
	case "snapshots":
		return plan.DailySnapshots
	case "shield":
		return plan.ShieldEnabled
	case "waf":
		return plan.WAFEnabled
	case "hosting":
		return plan.HostingEnabled
	case "network-10gbps":
		return plan.Network10Gbps
	default:
		return false
	}
}

//package limits
//
//import (
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
//// 🔐 Verifica se o usuário tem acesso a uma funcionalidade específica
//func HasFeature(userID string, feature string) bool {
//	user := store.UserStore[userID]
//	if user == nil {
//		return false
//	}
//
//	plan := models.Plans[user.Plan]
//
//	switch feature {
//	case "custom-domain":
//		return plan.CustomDomain
//	case "metrics":
//		return plan.MetricsAccess
//	case "github":
//		return plan.GitHubIntegration
//	case "workspace":
//		return plan.WorkspaceAccess
//	case "snapshots":
//		return plan.DailySnapshots
//	case "shield":
//		return plan.ShieldEnabled
//	case "waf":
//		return plan.WAFEnabled
//	case "hosting":
//		return plan.HostingEnabled
//	case "network-10gbps":
//		return plan.Network10Gbps
//	default:
//		return false
//	}
//}
