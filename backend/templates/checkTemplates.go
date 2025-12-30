//backend/templates/deploy_service.go

package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	fmt.Println("🔍 Verificando templates na pasta 'templates/'...")

	entries, err := os.ReadDir("./templates")
	if err != nil {
		fmt.Println("❌ Erro ao ler a pasta 'templates/':", err)
		return
	}

	missing := false
	found := 0

	for _, entry := range entries {
		name := entry.Name()
		if strings.HasPrefix(name, "Dockerfile-") {
			path := "./templates/" + name
			if _, err := os.Stat(path); os.IsNotExist(err) {
				fmt.Printf("❌ Faltando: %s\n", path)
				missing = true
			} else {
				fmt.Printf("✅ Encontrado: %s\n", path)
				found++
			}
		}
	}

	if found == 0 {
		fmt.Println("\n⚠️ Nenhum template encontrado com prefixo 'Dockerfile-'. Verifique a pasta.")
	} else if missing {
		fmt.Println("\n⚠️ Templates ausentes detectados. Crie os arquivos ou revise os nomes.")
	} else {
		fmt.Println("\n🚀 Tudo certo! Templates prontos para o deploy, sem stress.")
	}
}
