//backend/limits/ram.go

package limits

import "virtuscloud/backend/store"

// 💾 Soma a RAM utilizada por todas as aplicações do usuário (em MB)
func SumUserRAM(username string) float32 {
	var total float32
	for _, app := range store.AppStore {
		if app.Username == username {
			total += app.RAMUsage // ✅ já está em MB
		}
	}
	return total
}

// 💾 Soma a RAM utilizada por todas as aplicações do usuário (em MB)
//func SumUserRAM(username string) float32 {
//	var total float32
//	for _, app := range store.AppStore {
//		if app.Username == username { // ✅ corrigido para usar username
//			total += app.RAMUsage * 1024 // ✅ converte GB → MB
//		}
//	}
//	return total
//}
