// utils/exec.go

package utils

import (
	"fmt"
	"os/exec"
)

// 🧠 Executa o comando de inicialização conforme o runtime
func RunCommand(runtime, path string) (*exec.Cmd, error) {
	var cmd *exec.Cmd

	switch runtime {
	case "node":
		cmd = exec.Command("npm", "start")

	case "python", "django":
		cmd = exec.Command("python", "main.py")

	case "golang", "go":
		cmd = exec.Command("go", "run", "main.go")

	case "php", "laravel":
		cmd = exec.Command("php", "artisan", "serve")

	case "rust":
		cmd = exec.Command("cargo", "run")

	case "csharp", "dotnet", "dotnetcore":
		cmd = exec.Command("dotnet", "run")

	case "elixir":
		cmd = exec.Command("mix", "phx.server")

	case "java", "springboot":
		cmd = exec.Command("mvn", "spring-boot:run")

	case "springboot-gradle", "kotlin":
		cmd = exec.Command("gradle", "bootRun")

	case "lua":
		cmd = exec.Command("lua", "main.lua")

	default:
		return nil, fmt.Errorf("runtime não suportado: %s", runtime)
	}

	cmd.Dir = path
	fmt.Printf("🚀 Executando comando para %s em %s\n", runtime, path)
	err := cmd.Start()
	if err != nil {
		fmt.Printf("❌ Falha ao iniciar %s: %v\n", runtime, err)
		return nil, err
	}

	return cmd, nil
}

//func IsRuntimeSupported(runtime string) bool {
//	supported := map[string]bool{
//		"node": true, "python": true, "django": true,
//		"golang": true, "go": true, "php": true,
//		"laravel": true, "rust": true, "csharp": true,
//		"dotnet": true, "dotnetcore": true, "elixir": true,
//		"java": true, "springboot": true, "springboot-gradle": true,
//		"kotlin": true, "lua": true,
//	}
//	return supported[runtime]
//}

//package utils
//
//import (
//	"fmt"
//	"os/exec"
//)
//
//// 🧠 Executa comando padrão de inicialização na pasta do app
//func RunCommand(path string) (*exec.Cmd, error) {
//	cmd := exec.Command("npm", "start") // padrão para apps Node.js
//	cmd.Dir = path
//
//	// 🔍 Loga o comando que será executado
//	fmt.Printf("🚀 Executando comando: npm start em %s\n", path)
//
//	// 🔐 Inicia o processo
//	err := cmd.Start()
//	if err != nil {
//		fmt.Printf("❌ Falha ao iniciar comando: %v\n", err)
//		return nil, err
//	}
//
//	return cmd, nil
//}

//package utils
//
//import (
//	"os/exec"
//)
//
//func RunCommand(path string) (*exec.Cmd, error) {
//	cmd := exec.Command("npm", "start")
//	cmd.Dir = path
//	return cmd, cmd.Start()
//}
