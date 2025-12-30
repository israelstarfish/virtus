// store/apps_store.go

package store

import (
	"encoding/json"
	"errors"
	"log"
	"os"
	"virtuscloud/backend/models"
)

// 🔒 Armazena todas as aplicações em memória
var AppStore = map[string]*models.App{}

// 🔒 Armazena todos os clientes/usuários em memória
// Busca aplicação pelo ID
func GetAppByID(appID string) (*models.App, error) {
	app, ok := AppStore[appID]
	if !ok {
		return nil, errors.New("aplicação não encontrada")
	}
	return app, nil
}

// 💾 Adiciona ou atualiza uma aplicação e salva em disco
func SaveApp(app *models.App) {
	AppStore[app.ID] = app
	err := SaveAppStoreToDisk("./database/appstore.json")
	if err != nil {
		log.Println("❌ Erro ao salvar AppStore:", err)
	}
}

// 💾 Salva o AppStore em disco
func SaveAppStoreToDisk(filePath string) error {
	os.MkdirAll("./database", os.ModePerm)
	data, err := json.MarshalIndent(AppStore, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filePath, data, 0644)
}

func LoadAppStoreFromDisk(filePath string) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}

	var temp map[string]*models.App
	if err := json.Unmarshal(data, &temp); err != nil {
		return err
	}

	AppStore = temp
	return nil
}

//// Adiciona ou atualiza uma aplicação
//func SaveApp(app *models.App) {
//	AppStore[app.ID] = app
//	_ = SaveAppStoreToDisk("./database/appstore.json") // salva após cada alteração
//} //

//func CanCreateContainer(email string) bool {
//	client, err := GetClientByEmail(email)
//	if err != nil {
//		return false
//	}
//	return client.Plan == models.PlanPro || client.Plan == models.PlanPremium
//}

//func CanCreateContainer(username string) bool {
//	client, err := GetClientByUsername(username)
//	if err != nil {
//		return false
//	}
//
//	plan, ok := models.Plans[client.Plan]
//	if !ok {
//		return false
//	}
//
//	return plan.HostingEnabled
//}
