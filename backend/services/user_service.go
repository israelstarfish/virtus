//backend/services/user_service.go

package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"virtuscloud/backend/models"
	"virtuscloud/backend/store"
)

//var nextUserID = 1

// 👤 Cria novo usuário
func CreateUser(username, email string, plan models.PlanType) (*models.User, error) {
	// Verifica se o usuário já existe
	for _, u := range store.UserStore {
		if u.Email == email {
			return nil, errors.New("usuário já existe")
		}
	}

	// Cria struct do usuário
	user := &models.User{
		Username:  username,
		Email:     email,
		CreatedAt: time.Now(),
		Plan:      plan,
	}

	// Armazena no mapa com chave por username
	store.UserStore[username] = user

	// Sincroniza com armazenamento secundário
	store.SyncUserToStore(user.Username, user.Email, user.Plan, "") // 🔁 ID removido

	// Cria diretórios base do usuário
	_ = createUserBaseDirs(username, plan)

	return user, nil
}

// 🔐 Autentica usuário com código temporário
func AuthenticateUserByCode(email, code string) (*models.User, error) {
	data, ok := tokenMap[email]
	if !ok || data.Code != code {
		return nil, errors.New("código inválido ou não encontrado")
	}
	if time.Now().After(data.ExpiresAt) {
		delete(tokenMap, email)
		//		delete(LastSentMap, email) // ✅ limpa tempo após expiração
		return nil, errors.New("código expirado")
	}
	delete(tokenMap, email)
	//	delete(LastSentMap, email) // ✅ limpa tempo após login

	// Busca usuário pelo email
	for _, u := range store.UserStore {
		if u.Email == email {
			if err := createUserBaseDirs(u.Username, u.Plan); err != nil {
				log.Printf("❌ Erro ao criar pastas base para %s: %v", u.Username, err)
			}
			return u, nil
		}
	}
	return nil, errors.New("usuário não encontrado")
}

//func AuthenticateUserByCode(email, code string) (*models.User, error) {
//	data, ok := tokenMap[email]
//	if !ok || data.Code != code {
//		return nil, errors.New("código inválido ou não encontrado")
//	}
//	if time.Now().After(data.ExpiresAt) {
//		delete(tokenMap, email)
//		return nil, errors.New("código expirado")
//	}
//	delete(tokenMap, email)
//
//	// Busca usuário pelo email
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			// ✅ Garante que as pastas base existem após login
//			if err := createUserBaseDirs(u.Username, u.Plan); err != nil {
//				log.Printf("❌ Erro ao criar pastas base para %s: %v", u.Username, err)
//			}
//			return u, nil
//		}
//	}
//	return nil, errors.New("usuário não encontrado")
//}

// ✏️ Atualiza nome do usuário
func UpdateUserName(email, newName string) error {
	for _, u := range store.UserStore {
		if u.Email == email {
			u.Name = newName
			return nil
		}
	}
	return errors.New("usuário não encontrado")
}

// 📦 Migra todas as aplicações de qualquer plano antigo para o diretório do plano atual.
// Ideal para corrigir inconsistências causadas por bugs ou uploads em pastas erradas.
func MigrateAllUserAppsToNewPlan(username string, newPlan models.PlanType) error {
	userDir := fmt.Sprintf("storage/users/%s", username)
	newPlanPath := filepath.Join(userDir, string(newPlan))

	// Cria estrutura base do novo plano
	if err := createUserBaseDirs(username, newPlan); err != nil {
		return fmt.Errorf("erro ao criar estrutura do novo plano: %w", err)
	}

	entries, err := os.ReadDir(userDir)
	if err != nil {
		return fmt.Errorf("erro ao ler diretório do usuário: %w", err)
	}

	// Pastas que devem ser migradas (exclui logs e databases)
	foldersToMigrate := []string{"apps", "snapshots"}

	for _, entry := range entries {
		planFolder := entry.Name()

		// Ignora o plano atual
		if planFolder == string(newPlan) {
			continue
		}

		// Verifica se a pasta tem estrutura de plano (apps ou snapshots)
		hasPlanStructure := false
		for _, folder := range foldersToMigrate {
			testPath := filepath.Join(userDir, planFolder, folder)
			if info, err := os.Stat(testPath); err == nil && info.IsDir() {
				hasPlanStructure = true
				break
			}
		}
		if !hasPlanStructure {
			log.Printf("⚠️ Ignorando pasta %s — não parece ser um plano válido", planFolder)
			continue
		}

		for _, folder := range foldersToMigrate {
			oldFolderPath := filepath.Join(userDir, planFolder, folder)
			newFolderPath := filepath.Join(newPlanPath, folder)

			if _, err := os.Stat(oldFolderPath); os.IsNotExist(err) {
				continue
			}

			items, err := os.ReadDir(oldFolderPath)
			if err != nil {
				continue
			}

			for _, item := range items {

				oldItemPath := filepath.Join(oldFolderPath, item.Name())
				newItemPath := filepath.Join(newFolderPath, item.Name())

				if _, err := os.Stat(newItemPath); err == nil {
					log.Printf("⚠️ %s já existe em %s, ignorando", item.Name(), folder)
					continue
				}
				if _, err := os.Stat(newFolderPath); os.IsNotExist(err) {
					if err := os.MkdirAll(newFolderPath, 0755); err != nil {
						log.Printf("❌ Erro ao criar pasta destino %s: %v", newFolderPath, err)
						continue
					}
				} else {
					log.Printf("📁 Pasta destino %s já existe", newFolderPath)
				}

				if err := os.Rename(oldItemPath, newItemPath); err != nil {
					log.Printf("⚠️ Falha ao mover %s de %s/%s: %v", item.Name(), planFolder, folder, err)
				} else {
					log.Printf("✅ %s migrado de %s/%s → %s/%s", item.Name(), planFolder, folder, string(newPlan), folder)
					//log.Printf("✅ %s migrado de %s/%s → %s", item.Name(), planFolder, folder, newPlan)
				}
			}
		}

		// 🔤 Corrige prefixos após migração
		_ = NormalizeAppPrefixes(username, newPlan)

		// 🧹 Tenta remover a pasta antiga se estiver vazia
		if err := RemoveOldPlanDir(username, models.PlanType(planFolder)); err != nil {
			log.Printf("⚠️ Não foi possível remover %s: %v", planFolder, err)
		}
	}

	return nil
}

// 📦 Migra todas as aplicações de qualquer plano antigo para o diretório do plano atual.
// Ideal para corrigir inconsistências causadas por bugs ou uploads em pastas erradas.
//func MigrateAllUserAppsToNewPlan(username string, newPlan models.PlanType) error {
//	userDir := fmt.Sprintf("storage/users/%s", username)
//	newPlanPath := filepath.Join(userDir, string(newPlan))
//
//	// Cria estrutura base do novo plano
//	if err := createUserBaseDirs(username, newPlan); err != nil {
//		return fmt.Errorf("erro ao criar estrutura do novo plano: %w", err)
//	}
//
//	entries, err := os.ReadDir(userDir)
//	if err != nil {
//		return fmt.Errorf("erro ao ler diretório do usuário: %w", err)
//	}
//
//	// Pastas que devem ser migradas (exclui logs e databases)
//	foldersToMigrate := []string{"apps", "snapshots"}
//
//	for _, entry := range entries {
//		planFolder := entry.Name()
//
//		// Ignora o plano atual
//		if planFolder == string(newPlan) {
//			continue
//		}
//
//		// Verifica se a pasta tem estrutura de plano (apps ou snapshots)
//		hasPlanStructure := false
//		for _, folder := range foldersToMigrate {
//			testPath := filepath.Join(userDir, planFolder, folder)
//			if _, err := os.Stat(testPath); err == nil {
//				hasPlanStructure = true
//				break
//			}
//		}
//		if !hasPlanStructure {
//			log.Printf("⚠️ Ignorando pasta %s — não parece ser um plano válido", planFolder)
//			continue
//		}
//
//		for _, folder := range foldersToMigrate {
//			oldFolderPath := filepath.Join(userDir, planFolder, folder)
//			newFolderPath := filepath.Join(newPlanPath, folder)
//
//			if _, err := os.Stat(oldFolderPath); os.IsNotExist(err) {
//				continue
//			}
//
//			items, err := os.ReadDir(oldFolderPath)
//			if err != nil {
//				continue
//			}
//
//			for _, item := range items {
//				if item.Name() == "current-app" {
//					log.Printf("⚠️ Ignorando arquivo protegido: %s/%s", folder, item.Name())
//					continue
//				}
//
//				oldItemPath := filepath.Join(oldFolderPath, item.Name())
//				newItemPath := filepath.Join(newFolderPath, item.Name())
//
//				if _, err := os.Stat(newItemPath); err == nil {
//					log.Printf("⚠️ %s já existe em %s, ignorando", item.Name(), folder)
//					continue
//				}
//				if _, err := os.Stat(newFolderPath); os.IsNotExist(err) {
//					if err := os.MkdirAll(newFolderPath, 0755); err != nil {
//						log.Printf("❌ Erro ao criar pasta destino %s: %v", newFolderPath, err)
//						continue
//					}
//				} else {
//					log.Printf("📁 Pasta destino %s já existe", newFolderPath)
//				}
//
//				if err := os.Rename(oldItemPath, newItemPath); err != nil {
//					log.Printf("⚠️ Falha ao mover %s de %s/%s: %v", item.Name(), planFolder, folder, err)
//				} else {
//					log.Printf("✅ %s migrado de %s/%s → %s/%s", item.Name(), planFolder, folder, string(newPlan), folder)
//					//log.Printf("✅ %s migrado de %s/%s → %s", item.Name(), planFolder, folder, newPlan)
//				}
//			}
//		}
//
//		// 🔤 Corrige prefixos após migração
//		_ = NormalizeAppPrefixes(username, newPlan)
//
//		// 🧹 Tenta remover a pasta antiga se estiver vazia
//		if err := RemoveOldPlanDir(username, models.PlanType(planFolder)); err != nil {
//			log.Printf("⚠️ Não foi possível remover %s: %v", planFolder, err)
//		}
//	}
//
//	return nil
//}

// 📦 Migra todas as aplicações de qualquer plano antigo para o diretório do plano atual.
// Ideal para corrigir inconsistências causadas por bugs ou uploads em pastas erradas.
//func MigrateAllUserAppsToNewPlan(username string, newPlan models.PlanType) error {
//	userDir := fmt.Sprintf("storage/users/%s", username)
//	newPlanPath := filepath.Join(userDir, string(newPlan))
//
//	// Cria estrutura base do novo plano
//	if err := createUserBaseDirs(username, newPlan); err != nil {
//		return fmt.Errorf("erro ao criar estrutura do novo plano: %w", err)
//	}
//
//	entries, err := os.ReadDir(userDir)
//	if err != nil {
//		return fmt.Errorf("erro ao ler diretório do usuário: %w", err)
//	}
//
//	// Pastas que devem ser migradas (exclui logs)
//	foldersToMigrate := []string{"apps", "snapshots"} // ❌ remove "databases"
//
//	for _, entry := range entries {
//		planFolder := entry.Name()
//
//		if planFolder == string(newPlan) || planFolder == "uploads" || planFolder == "logs" {
//			continue
//		}
//
//		for _, folder := range foldersToMigrate {
//			oldFolderPath := filepath.Join(userDir, planFolder, folder)
//			newFolderPath := filepath.Join(newPlanPath, folder)
//
//			if _, err := os.Stat(oldFolderPath); os.IsNotExist(err) {
//				continue
//			}
//
//			items, err := os.ReadDir(oldFolderPath)
//			if err != nil {
//				continue
//			}
//
//			for _, item := range items {
//				if item.Name() == "current-app" {
//					log.Printf("⚠️ Ignorando arquivo protegido: %s/%s", folder, item.Name())
//					continue
//				}
//
//				oldItemPath := filepath.Join(oldFolderPath, item.Name())
//				newItemPath := filepath.Join(newFolderPath, item.Name())
//
//				if _, err := os.Stat(newFolderPath); os.IsNotExist(err) {
//					if err := os.MkdirAll(newFolderPath, 0755); err != nil {
//						log.Printf("❌ Erro ao criar pasta destino %s: %v", newFolderPath, err)
//						continue
//					}
//				} else {
//					log.Printf("📁 Pasta destino %s já existe", newFolderPath)
//				}
//
//				if _, err := os.Stat(newItemPath); err == nil {
//					log.Printf("⚠️ %s já existe em %s, ignorando", item.Name(), folder)
//					continue
//				}
//
//				if err := os.Rename(oldItemPath, newItemPath); err != nil {
//					log.Printf("⚠️ Falha ao mover %s de %s/%s: %v", item.Name(), planFolder, folder, err)
//				} else {
//					log.Printf("✅ %s migrado de %s/%s → %s", item.Name(), planFolder, folder, newPlan)
//				}
//			}
//		}
//
//		// 🔤 Corrige prefixos após migração
//		_ = NormalizeAppPrefixes(username, newPlan)
//
//		// 🧹 Tenta remover a pasta antiga se estiver vazia
//		if err := RemoveOldPlanDir(username, models.PlanType(planFolder)); err != nil {
//			log.Printf("⚠️ Não foi possível remover %s: %v", planFolder, err)
//		}
//	}
//
//	return nil
//}

//func MigrateAllUserAppsToNewPlan(username string, newPlan models.PlanType) error {
//	userDir := fmt.Sprintf("storage/users/%s", username)
//	newAppsPath := filepath.Join(userDir, string(newPlan), "apps")
//
//	// Cria pasta destino se não existir
//	if _, err := os.Stat(newAppsPath); os.IsNotExist(err) {
//		if err := os.MkdirAll(newAppsPath, 0755); err != nil {
//			return fmt.Errorf("erro ao criar pasta destino: %w", err)
//		}
//	}
//
//	entries, err := os.ReadDir(userDir)
//	if err != nil {
//		return fmt.Errorf("erro ao ler diretório do usuário: %w", err)
//	}
//
//	for _, entry := range entries {
//		planFolder := entry.Name()
//
//		// Ignora a pasta do plano atual e a pasta de uploads
//		if planFolder == string(newPlan) || planFolder == "uploads" {
//			continue
//		}
//
//		appsPath := filepath.Join(userDir, planFolder, "apps")
//		if _, err := os.Stat(appsPath); os.IsNotExist(err) {
//			continue
//		}
//
//		appEntries, err := os.ReadDir(appsPath)
//		if err != nil {
//			continue
//		}
//
//		for _, app := range appEntries {
//			oldAppPath := filepath.Join(appsPath, app.Name())
//			newAppPath := filepath.Join(newAppsPath, app.Name())
//
//			// Se já existe na pasta nova, pula pra evitar sobrescrita
//			if _, err := os.Stat(newAppPath); err == nil {
//				log.Printf("⚠️ App %s já existe em %s, ignorando", app.Name(), newPlan)
//				continue
//			}
//
//			if err := os.Rename(oldAppPath, newAppPath); err != nil {
//				log.Printf("⚠️ Falha ao mover %s de %s: %v", app.Name(), planFolder, err)
//			} else {
//				log.Printf("✅ App %s migrado de %s → %s", app.Name(), planFolder, newPlan)
//			}
//		}
//		// 🔤 Corrige prefixos das pastas de aplicação
//		_ = NormalizeAppPrefixes(username, newPlan)
//
//		_ = createUserBaseDirs(username, newPlan)
//
//		// 🧹 Tenta remover a pasta antiga se estiver vazia
//		if err := RemoveOldPlanDir(username, models.PlanType(planFolder)); err != nil {
//			log.Printf("⚠️ Não foi possível remover %s: %v", planFolder, err)
//		}
//	}
//
//	return nil
//}

// 🔤 Renomeia prefixos das pastas de aplicação para refletir o plano atual
func NormalizeAppPrefixes(username string, plan models.PlanType) error {
	appsPath := filepath.Join("storage", "users", username, string(plan), "apps")
	entries, err := os.ReadDir(appsPath)
	if err != nil {
		return fmt.Errorf("erro ao ler pasta de apps: %w", err)
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		oldName := entry.Name()
		parts := strings.SplitN(oldName, "-", 2)
		if len(parts) != 2 || parts[0] == string(plan) {
			continue // já está com prefixo correto ou nome inválido
		}

		newName := string(plan) + "-" + parts[1]
		oldPath := filepath.Join(appsPath, oldName)
		newPath := filepath.Join(appsPath, newName)

		if _, err := os.Stat(newPath); err == nil {
			log.Printf("⚠️ Pasta %s já existe como %s, ignorando", oldName, newName)
			continue
		}

		if err := os.Rename(oldPath, newPath); err != nil {
			log.Printf("⚠️ Falha ao renomear %s → %s: %v", oldName, newName, err)
		} else {
			log.Printf("🔤 Prefixo corrigido: %s → %s", oldName, newName)
		}
	}
	return nil
}

//func RemoveOldPlanDir(username string, oldPlan models.PlanType) error {
//	oldPath := filepath.Join("storage", "users", username, string(oldPlan))
//
//	entries, err := os.ReadDir(oldPath)
//	if err != nil {
//		return fmt.Errorf("erro ao ler pasta antiga: %w", err)
//	}
//
//	remaining := []string{}
//
//	for _, entry := range entries {
//		// ❌ Ignora a pasta "databases" completamente
//		if entry.Name() == "databases" {
//			log.Printf("⚠️ Ignorando exclusão da pasta protegida: %s/databases", oldPath)
//			continue
//		}
//
//		entryPath := filepath.Join(oldPath, entry.Name())
//
//		if entry.IsDir() {
//			subEntries, err := os.ReadDir(entryPath)
//			if err != nil {
//				remaining = append(remaining, fmt.Sprintf("%s/ [erro ao ler]", entry.Name()))
//				continue
//			}
//			if len(subEntries) > 0 {
//				for _, sub := range subEntries {
//					remaining = append(remaining, fmt.Sprintf("%s/%s", entry.Name(), sub.Name()))
//				}
//			} else {
//				// Diretório vazio — não impede exclusão
//				continue
//			}
//		} else {
//			remaining = append(remaining, entry.Name())
//		}
//	}
//
//	if len(remaining) > 0 {
//		log.Printf("⚠️ Pasta antiga %s ainda contém arquivos, não será removida", oldPath)
//		for _, item := range remaining {
//			log.Printf("• %s", item)
//		}
//		return nil
//	}
//
//	if err := os.RemoveAll(oldPath); err != nil {
//		return fmt.Errorf("erro ao remover pasta antiga: %w", err)
//	}
//	log.Printf("🧹 Pasta antiga %s removida com sucesso", oldPath)
//	return nil
//}

func RemoveOldPlanDir(username string, oldPlan models.PlanType) error {
	oldPath := filepath.Join("storage", "users", username, string(oldPlan))

	entries, err := os.ReadDir(oldPath)
	if err != nil {
		return fmt.Errorf("erro ao ler pasta antiga: %w", err)
	}

	remaining := []string{}

	for _, entry := range entries {
		entryPath := filepath.Join(oldPath, entry.Name())

		if entry.IsDir() {
			subEntries, err := os.ReadDir(entryPath)
			if err != nil {
				remaining = append(remaining, fmt.Sprintf("%s/ [erro ao ler]", entry.Name()))
				continue
			}
			if len(subEntries) > 0 {
				for _, sub := range subEntries {
					remaining = append(remaining, fmt.Sprintf("%s/%s", entry.Name(), sub.Name()))
				}
			} else {
				// Diretório vazio — não impede exclusão
				continue
			}
		} else {
			remaining = append(remaining, entry.Name())
		}
	}

	if len(remaining) > 0 {
		log.Printf("⚠️ Pasta antiga %s ainda contém arquivos, não será removida", oldPath)
		for _, item := range remaining {
			log.Printf("• %s", item)
		}
		return nil
	}

	if err := os.RemoveAll(oldPath); err != nil {
		return fmt.Errorf("erro ao remover pasta antiga: %w", err)
	}
	log.Printf("🧹 Pasta antiga %s removida com sucesso", oldPath)
	return nil
}

//func RemoveOldPlanDir(username string, oldPlan models.PlanType) error {
//	oldPath := filepath.Join("storage", "users", username, string(oldPlan))
//
//	entries, err := os.ReadDir(oldPath)
//	if err != nil {
//		return fmt.Errorf("erro ao ler pasta antiga: %w", err)
//	}
//
//	if len(entries) > 0 {
//		log.Printf("⚠️ Pasta antiga %s ainda contém arquivos, não será removida", oldPath)
//
//		// 🔍 Lista arquivos e subpastas visíveis
//		for _, entry := range entries {
//			entryPath := filepath.Join(oldPath, entry.Name())
//
//			if entry.IsDir() {
//				subEntries, err := os.ReadDir(entryPath)
//				if err != nil {
//					log.Printf("• %s/ [erro ao ler]", entry.Name())
//					continue
//				}
//				if len(subEntries) == 0 {
//					log.Printf("• %s/ [vazio]", entry.Name())
//				} else {
//					for _, sub := range subEntries {
//						log.Printf("• %s/%s", entry.Name(), sub.Name())
//					}
//				}
//			} else {
//				log.Printf("• %s", entry.Name())
//			}
//		}
//
//		return nil
//	}
//
//	// 🧹 Tenta remover
//	if err := os.RemoveAll(oldPath); err != nil {
//		return fmt.Errorf("erro ao remover pasta antiga: %w", err)
//	}
//
//	log.Printf("🧹 Pasta antiga %s removida com sucesso", oldPath)
//	return nil
//}

//func RemoveOldPlanDir(username string, oldPlan models.PlanType) error {
//	oldPath := filepath.Join("storage", "users", username, string(oldPlan))
//
//	entries, err := os.ReadDir(oldPath)
//	if err != nil {
//		return fmt.Errorf("erro ao ler pasta antiga: %w", err)
//	}
//
//	visibleContent := 0
//
//	for _, entry := range entries {
//		// Ignora arquivos ocultos
//		if strings.HasPrefix(entry.Name(), ".") {
//			continue
//		}
//
//		entryPath := filepath.Join(oldPath, entry.Name())
//
//		// Se for diretório, verifica se está vazio
//		if entry.IsDir() {
//			subEntries, err := os.ReadDir(entryPath)
//			if err != nil {
//				visibleContent++
//				continue
//			}
//			if len(subEntries) > 0 {
//				visibleContent++
//			}
//		} else {
//			visibleContent++
//		}
//	}
//
//	if visibleContent > 0 {
//		log.Printf("⚠️ Pasta antiga %s ainda contém conteúdo visível, não será removida", oldPath)
//		return nil
//	}
//
//	if err := os.RemoveAll(oldPath); err != nil {
//		return fmt.Errorf("erro ao remover pasta antiga: %w", err)
//	}
//	log.Printf("🧹 Pasta antiga %s removida com sucesso", oldPath)
//	return nil
//}

//func RemoveOldPlanDir(username string, oldPlan models.PlanType) error {
//	oldPath := filepath.Join("storage", "users", username, string(oldPlan))
//
//	entries, err := os.ReadDir(oldPath)
//	if err != nil {
//		return fmt.Errorf("erro ao ler pasta antiga: %w", err)
//	}
//	if len(entries) > 0 {
//		log.Printf("⚠️ Pasta antiga %s ainda contém arquivos, não será removida", oldPath)
//		return nil
//	}
//
//	if err := os.RemoveAll(oldPath); err != nil {
//		return fmt.Errorf("erro ao remover pasta antiga: %w", err)
//	}
//	log.Printf("🧹 Pasta antiga %s removida com sucesso", oldPath)
//	return nil
//}

// 🔄 Atualiza plano do usuário
func UpdateUserPlan(email string, newPlan models.PlanType) error {
	for _, u := range store.UserStore {
		if u.Email == email {
			if u.Plan != newPlan {
				// 📦 Migra todas as aplicações do usuário para o diretório correspondente ao novo plano.
				// Essa função escaneia todas as pastas de plano existentes e realoca os apps para
				// storage/users/{username}/{newPlan}/apps/, garantindo consistência com o plano ativo.
				err := MigrateAllUserAppsToNewPlan(u.Username, newPlan)
				if err != nil {
					log.Println("Erro ao migrar aplicações:", err)
				}
			}

			u.Plan = newPlan

			// Cria diretórios para o novo plano
			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
				return fmt.Errorf("erro ao criar diretórios: %w", err)
			}

			// Sincroniza com armazenamento secundário
			store.SyncUserToStore(u.Username, u.Email, newPlan, "") // 🔁 ID removido
			return nil
		}
	}
	return errors.New("usuário não encontrado")
}

// 🔍 Busca usuário por email
func GetUserByEmail(email string) (*models.User, error) {
	for _, u := range store.UserStore {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, errors.New("usuário não encontrado")
}

// 🧪 Armazena token temporário para autenticação
//
//	func StoreUserToken(email, token string) {
//		tokenMap[email] = TokenData{
//			Code:      token,
//			ExpiresAt: time.Now().Add(tokenTTL),
//		}
//	}

func LoadAllUsers() map[string]models.User {
	file, err := os.Open("./database/users.json")
	if err != nil {
		// Se não conseguir abrir, retorna mapa vazio
		return map[string]models.User{}
	}
	defer file.Close()

	var users map[string]models.User
	if err := json.NewDecoder(file).Decode(&users); err != nil {
		// Se falhar ao decodificar, retorna mapa vazio
		return map[string]models.User{}
	}

	return users
}

// 🔍 Busca usuário pelo e-mail
func FindUserByEmail(email string) *models.User {
	for _, u := range LoadAllUsers() {
		if u.Email == email {
			return &u
		}
	}
	return nil
}

//backend/services/user_service.go

//package services
//
//import (
//	"encoding/json"
//	"errors"
//	"fmt"
//	"log"
//	"os"
//	"path/filepath"
//	"strings"
//	"time"
//
//	"virtuscloud/backend/models"
//	"virtuscloud/backend/store"
//)
//
////var nextUserID = 1
//
//// 👤 Cria novo usuário
//func CreateUser(username, email string, plan models.PlanType) (*models.User, error) {
//	// Verifica se o usuário já existe
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			return nil, errors.New("usuário já existe")
//		}
//	}
//
//	// Cria struct do usuário
//	user := &models.User{
//		Username:  username,
//		Email:     email,
//		CreatedAt: time.Now(),
//		Plan:      plan,
//	}
//
//	// Armazena no mapa com chave por username
//	store.UserStore[username] = user
//
//	// Sincroniza com armazenamento secundário
//	store.SyncUserToStore(user.Username, user.Email, user.Plan, "") // 🔁 ID removido
//
//	// Cria diretórios base do usuário
//	_ = createUserBaseDirs(username, plan)
//
//	return user, nil
//}
//
//// 🔐 Autentica usuário com código temporário
//func AuthenticateUserByCode(email, code string) (*models.User, error) {
//	data, ok := tokenMap[email]
//	if !ok || data.Code != code {
//		return nil, errors.New("código inválido ou não encontrado")
//	}
//	if time.Now().After(data.ExpiresAt) {
//		delete(tokenMap, email)
//		//		delete(LastSentMap, email) // ✅ limpa tempo após expiração
//		return nil, errors.New("código expirado")
//	}
//	delete(tokenMap, email)
//	//	delete(LastSentMap, email) // ✅ limpa tempo após login
//
//	// Busca usuário pelo email
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			if err := createUserBaseDirs(u.Username, u.Plan); err != nil {
//				log.Printf("❌ Erro ao criar pastas base para %s: %v", u.Username, err)
//			}
//			return u, nil
//		}
//	}
//	return nil, errors.New("usuário não encontrado")
//}
//
////func AuthenticateUserByCode(email, code string) (*models.User, error) {
////	data, ok := tokenMap[email]
////	if !ok || data.Code != code {
////		return nil, errors.New("código inválido ou não encontrado")
////	}
////	if time.Now().After(data.ExpiresAt) {
////		delete(tokenMap, email)
////		return nil, errors.New("código expirado")
////	}
////	delete(tokenMap, email)
////
////	// Busca usuário pelo email
////	for _, u := range store.UserStore {
////		if u.Email == email {
////			// ✅ Garante que as pastas base existem após login
////			if err := createUserBaseDirs(u.Username, u.Plan); err != nil {
////				log.Printf("❌ Erro ao criar pastas base para %s: %v", u.Username, err)
////			}
////			return u, nil
////		}
////	}
////	return nil, errors.New("usuário não encontrado")
////}
//
//// ✏️ Atualiza nome do usuário
//func UpdateUserName(email, newName string) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			u.Name = newName
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}
//
//// 📦 Migra todas as aplicações de qualquer plano antigo para o diretório do plano atual.
//// Ideal para corrigir inconsistências causadas por bugs ou uploads em pastas erradas.
//func MigrateAllUserAppsToNewPlan(username string, newPlan models.PlanType) error {
//	userDir := fmt.Sprintf("storage/users/%s", username)
//	newAppsPath := filepath.Join(userDir, string(newPlan), "apps")
//
//	// Cria pasta destino se não existir
//	if _, err := os.Stat(newAppsPath); os.IsNotExist(err) {
//		if err := os.MkdirAll(newAppsPath, 0755); err != nil {
//			return fmt.Errorf("erro ao criar pasta destino: %w", err)
//		}
//	}
//
//	entries, err := os.ReadDir(userDir)
//	if err != nil {
//		return fmt.Errorf("erro ao ler diretório do usuário: %w", err)
//	}
//
//	for _, entry := range entries {
//		planFolder := entry.Name()
//
//		// Ignora a pasta do plano atual e a pasta de uploads
//		if planFolder == string(newPlan) || planFolder == "uploads" {
//			continue
//		}
//
//		appsPath := filepath.Join(userDir, planFolder, "apps")
//		if _, err := os.Stat(appsPath); os.IsNotExist(err) {
//			continue
//		}
//
//		appEntries, err := os.ReadDir(appsPath)
//		if err != nil {
//			continue
//		}
//
//		for _, app := range appEntries {
//			oldAppPath := filepath.Join(appsPath, app.Name())
//			newAppPath := filepath.Join(newAppsPath, app.Name())
//
//			// Se já existe na pasta nova, pula pra evitar sobrescrita
//			if _, err := os.Stat(newAppPath); err == nil {
//				log.Printf("⚠️ App %s já existe em %s, ignorando", app.Name(), newPlan)
//				continue
//			}
//
//			if err := os.Rename(oldAppPath, newAppPath); err != nil {
//				log.Printf("⚠️ Falha ao mover %s de %s: %v", app.Name(), planFolder, err)
//			} else {
//				log.Printf("✅ App %s migrado de %s → %s", app.Name(), planFolder, newPlan)
//			}
//		}
//	}
//
//	// 🔤 Corrige prefixos das pastas de aplicação
//	_ = NormalizeAppPrefixes(username, newPlan)
//
//	return nil
//}
//
//// 🔤 Renomeia prefixos das pastas de aplicação para refletir o plano atual
//func NormalizeAppPrefixes(username string, plan models.PlanType) error {
//	appsPath := filepath.Join("storage", "users", username, string(plan), "apps")
//	entries, err := os.ReadDir(appsPath)
//	if err != nil {
//		return fmt.Errorf("erro ao ler pasta de apps: %w", err)
//	}
//
//	for _, entry := range entries {
//		if !entry.IsDir() {
//			continue
//		}
//
//		oldName := entry.Name()
//		parts := strings.SplitN(oldName, "-", 2)
//		if len(parts) != 2 || parts[0] == string(plan) {
//			continue // já está com prefixo correto ou nome inválido
//		}
//
//		newName := string(plan) + "-" + parts[1]
//		oldPath := filepath.Join(appsPath, oldName)
//		newPath := filepath.Join(appsPath, newName)
//
//		if _, err := os.Stat(newPath); err == nil {
//			log.Printf("⚠️ Pasta %s já existe como %s, ignorando", oldName, newName)
//			continue
//		}
//
//		if err := os.Rename(oldPath, newPath); err != nil {
//			log.Printf("⚠️ Falha ao renomear %s → %s: %v", oldName, newName, err)
//		} else {
//			log.Printf("🔤 Prefixo corrigido: %s → %s", oldName, newName)
//		}
//	}
//	return nil
//}
//
//// 🔄 Atualiza plano do usuário
//func UpdateUserPlan(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			if u.Plan != newPlan {
//				// 📦 Migra todas as aplicações do usuário para o diretório correspondente ao novo plano.
//				// Essa função escaneia todas as pastas de plano existentes e realoca os apps para
//				// storage/users/{username}/{newPlan}/apps/, garantindo consistência com o plano ativo.
//				err := MigrateAllUserAppsToNewPlan(u.Username, newPlan)
//				if err != nil {
//					log.Println("Erro ao migrar aplicações:", err)
//				}
//			}
//
//			u.Plan = newPlan
//
//			// Cria diretórios para o novo plano
//			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
//				return fmt.Errorf("erro ao criar diretórios: %w", err)
//			}
//
//			// Sincroniza com armazenamento secundário
//			store.SyncUserToStore(u.Username, u.Email, newPlan, "") // 🔁 ID removido
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}
//
//// 🔍 Busca usuário por email
//func GetUserByEmail(email string) (*models.User, error) {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			return u, nil
//		}
//	}
//	return nil, errors.New("usuário não encontrado")
//}
//
//// 🧪 Armazena token temporário para autenticação
////
////	func StoreUserToken(email, token string) {
////		tokenMap[email] = TokenData{
////			Code:      token,
////			ExpiresAt: time.Now().Add(tokenTTL),
////		}
////	}
//
//func LoadAllUsers() map[string]models.User {
//	file, err := os.Open("./database/users.json")
//	if err != nil {
//		// Se não conseguir abrir, retorna mapa vazio
//		return map[string]models.User{}
//	}
//	defer file.Close()
//
//	var users map[string]models.User
//	if err := json.NewDecoder(file).Decode(&users); err != nil {
//		// Se falhar ao decodificar, retorna mapa vazio
//		return map[string]models.User{}
//	}
//
//	return users
//}
//
//// 🔍 Busca usuário pelo e-mail
//func FindUserByEmail(email string) *models.User {
//	for _, u := range LoadAllUsers() {
//		if u.Email == email {
//			return &u
//		}
//	}
//	return nil
//}

// 👤 Cria novo usuário
//func CreateUser(username, email string, plan models.PlanType) (*models.User, error) {
//	// Verifica se o usuário já existe
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			return nil, errors.New("usuário já existe")
//		}
//	}
//
//	// Cria struct do usuário
//	user := &models.User{
//		ID:        nextUserID,
//		Username:  username,
//		Email:     email,
//		CreatedAt: time.Now(),
//		Plan:      plan,
//	}
//	nextUserID++
//
//	// Armazena no mapa com chave string
//	store.UserStore[strconv.Itoa(user.ID)] = user
//
//	// Sincroniza com armazenamento secundário
//	store.SyncUserToStore(user.Username, user.Email, user.Plan, strconv.Itoa(user.ID))
//
//	// Cria diretórios base do usuário
//	_ = createUserBaseDirs(username, plan)
//
//	return user, nil
//}

// 🔐 Autentica usuário com código temporário
//func AuthenticateUserByCode(email, code string) (*models.User, error) {
//	data, ok := tokenMap[email]
//	if !ok || data.Code != code {
//		return nil, errors.New("código inválido ou não encontrado")
//	}
//	if time.Now().After(data.ExpiresAt) {
//		delete(tokenMap, email)
//		return nil, errors.New("código expirado")
//	}
//	delete(tokenMap, email)
//
//	// Busca usuário pelo email
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			// ✅ Garante que as pastas base existem
//			_ = createUserBaseDirs(u.Username, u.Plan)
//			return u, nil
//		}
//	}
//	return nil, errors.New("usuário não encontrado")
//}

//func AuthenticateUserByCode(email, code string) (*models.User, error) {
//	data, ok := tokenMap[email]
//	if !ok || data.Code != code {
//		return nil, errors.New("código inválido ou não encontrado")
//	}
//	if time.Now().After(data.ExpiresAt) {
//		delete(tokenMap, email)
//		return nil, errors.New("código expirado")
//	}
//	delete(tokenMap, email)
//
//	// Busca usuário pelo email
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			return u, nil
//		}
//	}
//	return nil, errors.New("usuário não encontrado")
//}

// 🔄 Atualiza plano do usuário
//func UpdateUserPlan(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			if u.Plan != newPlan {
//				// 📦 Migra todas as aplicações do usuário para o diretório correspondente ao novo plano.
//				// Essa função escaneia todas as pastas de plano existentes e realoca os apps para
//				// storage/users/{username}/{newPlan}/apps/, garantindo consistência com o plano ativo.
//				err := MigrateAllUserAppsToNewPlan(u.Username, newPlan)
//				if err != nil {
//					log.Println("Erro ao migrar aplicações:", err)
//				}
//			}
//
//			u.Plan = newPlan
//
//			// Cria diretórios para o novo plano
//			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
//				return fmt.Errorf("erro ao criar diretórios: %w", err)
//			}
//
//			// Sincroniza com armazenamento secundário
//			store.SyncUserToStore(u.Username, u.Email, newPlan, strconv.Itoa(u.ID))
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}

// 📦 Migra todas as aplicações de qualquer plano antigo para o diretório do plano atual.
// Ideal para corrigir inconsistências causadas por bugs ou uploads em pastas erradas.
//func MigrateAllUserAppsToNewPlan(username string, newPlan models.PlanType) error {
//	userDir := fmt.Sprintf("storage/users/%s", username)
//	newAppsPath := filepath.Join(userDir, string(newPlan), "apps")
//
//	// Cria pasta destino se não existir
//	if _, err := os.Stat(newAppsPath); os.IsNotExist(err) {
//		if err := os.MkdirAll(newAppsPath, 0755); err != nil {
//			return fmt.Errorf("erro ao criar pasta destino: %w", err)
//		}
//	}
//
//	entries, err := os.ReadDir(userDir)
//	if err != nil {
//		return fmt.Errorf("erro ao ler diretório do usuário: %w", err)
//	}
//
//	for _, entry := range entries {
//		planFolder := entry.Name()
//
//		// Ignora a pasta do plano atual e a pasta de uploads
//		if planFolder == string(newPlan) || planFolder == "uploads" {
//			continue
//		}
//
//		appsPath := filepath.Join(userDir, planFolder, "apps")
//		if _, err := os.Stat(appsPath); os.IsNotExist(err) {
//			continue
//		}
//
//		appEntries, err := os.ReadDir(appsPath)
//		if err != nil {
//			continue
//		}
//
//		for _, app := range appEntries {
//			oldAppPath := filepath.Join(appsPath, app.Name())
//			newAppPath := filepath.Join(newAppsPath, app.Name())
//
//			// Se já existe na pasta nova, pula pra evitar sobrescrita
//			if _, err := os.Stat(newAppPath); err == nil {
//				log.Printf("⚠️ App %s já existe em %s, ignorando", app.Name(), newPlan)
//				continue
//			}
//
//			if err := os.Rename(oldAppPath, newAppPath); err != nil {
//				log.Printf("⚠️ Falha ao mover %s de %s: %v", app.Name(), planFolder, err)
//			} else {
//				log.Printf("✅ App %s migrado de %s → %s", app.Name(), planFolder, newPlan)
//			}
//		}
//	}
//	return nil
//}

// 📦 Migra todas as aplicações do usuário para o diretório correspondente ao novo plano.
// Essa função é chamada quando o plano do usuário é alterado, garantindo que os arquivos
// sejam realocados corretamente entre storage/users/{username}/{plan}/apps.
// Evita inconsistência entre plano ativo e estrutura de armazenamento.
//func MigrateUserApps(username string, oldPlan, newPlan models.PlanType) error {
//	oldPath := fmt.Sprintf("storage/users/%s/%s/apps", username, string(oldPlan))
//	newPath := fmt.Sprintf("storage/users/%s/%s/apps", username, string(newPlan))
//
//	// Cria pasta destino se não existir
//	if _, err := os.Stat(newPath); os.IsNotExist(err) {
//		if err := os.MkdirAll(newPath, 0755); err != nil {
//			return fmt.Errorf("erro ao criar pasta destino: %w", err)
//		}
//	}
//
//	entries, err := os.ReadDir(oldPath)
//	if err != nil {
//		return fmt.Errorf("erro ao ler pasta antiga: %w", err)
//	}
//
//	for _, entry := range entries {
//		oldAppPath := filepath.Join(oldPath, entry.Name())
//		newAppPath := filepath.Join(newPath, entry.Name())
//
//		if err := os.Rename(oldAppPath, newAppPath); err != nil {
//			log.Printf("⚠️ Falha ao mover %s: %v", entry.Name(), err)
//		} else {
//			log.Printf("✅ Aplicação %s migrada para %s", entry.Name(), newPlan)
//		}
//	}
//
//	return nil
//}

//func UpdateUserPlan(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			if u.Plan != newPlan {
//				// 🧠 Migra aplicações do plano antigo para o novo
//				err := MigrateUserApps(u.Username, u.Plan, newPlan)
//				if err != nil {
//					log.Println("Erro ao migrar aplicações:", err)
//				}
//			}
//
//			u.Plan = newPlan
//
//			// Cria diretórios para o novo plano
//			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
//				return fmt.Errorf("erro ao criar diretórios: %w", err)
//			}
//
//			// Sincroniza com armazenamento secundário
//			store.SyncUserToStore(u.Username, u.Email, newPlan, strconv.Itoa(u.ID))
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}

//func UpdateUserPlan(email string, newPlan models.PlanType) error {
//	for _, u := range store.UserStore {
//		if u.Email == email {
//			u.Plan = newPlan
//
//			// Cria diretórios para o novo plano
//			if err := createUserBaseDirs(u.Username, newPlan); err != nil {
//				return fmt.Errorf("erro ao criar diretórios: %w", err)
//			}
//
//			// Sincroniza com armazenamento secundário
//			store.SyncUserToStore(u.Username, u.Email, newPlan, strconv.Itoa(u.ID))
//			return nil
//		}
//	}
//	return errors.New("usuário não encontrado")
//}
