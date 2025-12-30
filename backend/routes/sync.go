//backend/routes/sync.go

package routes // 👈 certifique-se de que o package seja "routes"

import (
	"time"
	"virtuscloud/backend/middleware"
	"virtuscloud/backend/store"
)

func StartSessionSync() {
	go func() {
		for {
			syncSessionsWithUsers()
			time.Sleep(1 * time.Second)
			store.LoadUsersFromFile(middleware.ClientsFilePath)
			time.Sleep(1 * time.Second)
		}
	}()
}
