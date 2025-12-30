// services/docker_template.go

package services

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func LoadDockerTemplate(runtime, entry string) (string, error) {
	if runtime == "" || entry == "" {
		return "", fmt.Errorf("runtime e entry são obrigatórios")
	}

	filename := fmt.Sprintf("Dockerfile-%s", runtime)
	path := filepath.Join("templates", filename)

	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("template '%s' não encontrado: %w", filename, err)
	}

	content := strings.ReplaceAll(string(data), "{{ENTRY}}", entry)

	return content, nil
}
