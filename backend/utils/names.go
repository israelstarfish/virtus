//backend/utils/names.go

package utils

import (
	"fmt"
	"virtuscloud/backend/models"
)

// 🐳 Gera nome único para container baseado em usuário e ID da aplicação
func GenerateContainerName(username, appID string) string {
	return fmt.Sprintf("%s-%s", username, appID)
}

// 📦 (Opcional) Gera nome técnico para imagem Docker
func GenerateImageName(appID string) string {
	return appID // ou fmt.Sprintf("img-%s", appID) se quiser prefixar
}

// 💾 (Opcional) Gera nome de arquivo de backup
func GenerateBackupName(appID string) string {
	return fmt.Sprintf("backup-%s.zip", appID)
}
func GetContainerNameFromApp(app *models.App) string {
	return GetContainerName(app.Username, app.ID)
}

// 🧠 Função utilitária para nome padronizado do container
func GetContainerName(username, appID string) string {
	return fmt.Sprintf("%s-%s", username, appID)
}

//func GetContainerName(app *models.App) string {
//	return fmt.Sprintf("%s-%s", app.Username, app.ID)
//}
