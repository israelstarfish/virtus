//backend/routes/database.go

package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
)

type CreateDatabaseRequest struct {
	Type     string `json:"type"`     // "postgres", "mongo", "redis"
	DBName   string `json:"dbName"`   // nome do banco
	Username string `json:"username"` // nome do usuário
}

func CreateDatabaseHandler(w http.ResponseWriter, r *http.Request) {
	var req CreateDatabaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Erro ao decodificar JSON", http.StatusBadRequest)
		return
	}

	fullName := fmt.Sprintf("%s_%s", req.Username, req.DBName)

	switch req.Type {
	case "postgres":
		cmd := exec.Command("createdb", fullName)
		if err := cmd.Run(); err != nil {
			http.Error(w, "Erro ao criar banco PostgreSQL", http.StatusInternalServerError)
			return
		}
	case "mongo":
		cmd := exec.Command("mongo", fullName, "--eval", "db.createCollection('init')")
		if err := cmd.Run(); err != nil {
			http.Error(w, "Erro ao criar banco MongoDB", http.StatusInternalServerError)
			return
		}
	case "redis":
		// Redis não cria bancos nomeados, apenas prefixos
		fmt.Println("Redis namespace reservado para", fullName)
	default:
		http.Error(w, "Tipo de banco inválido", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Banco criado com sucesso"))
}
