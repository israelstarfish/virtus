//backend/limits/cpu.go

package limits

import "virtuscloud/backend/store"

// SumUserCPU soma o uso de CPU (%) de todas as aplicações de um usuário
func SumUserCPU(username string) float32 {
	var total float32
	for _, app := range store.AppStore {
		if app.Username == username {
			total += app.CPUUsage
		}
	}
	return total
}
