// services/dependency_sync.go

package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

func runWithTimeout(cmd *exec.Cmd, timeout time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	cmdWithCtx := exec.CommandContext(ctx, cmd.Path, cmd.Args[1:]...)
	cmdWithCtx.Dir = cmd.Dir
	return cmdWithCtx.Run()
}

func SyncDependencies(runtime, appPath, username, plan string) {
	appID := filepath.Base(appPath)
	//logDir := filepath.Join("storage", "users", username, plan, "apps", appID, "logs")
	//logDir := filepath.Join("storage", "users", username, plan, "logs")
	logDir := filepath.Join("storage", "users", username, "logs")
	_ = os.MkdirAll(logDir, os.ModePerm)
	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", appID))
	var logLines []string

	writeLog := func(lines []string) {
		if len(lines) == 0 {
			return
		}
		content := strings.Join(lines, "\n") + "\n"
		_ = os.WriteFile(logFile, []byte(content), 0644)
	}

	switch runtime {
	case "node", "javascript", "react", "nextjs", "nestjs", "vuejs", "nuxtjs", "typescript", "vite", "angular":
		jsRoot := filepath.Join("storage", "runtimes", "node")
		_ = os.MkdirAll(filepath.Join(jsRoot, "node_modules"), os.ModePerm)

		paths := []string{
			filepath.Join(appPath, "package.json"),
			filepath.Join(appPath, "src", "package.json"),
		}
		var data []byte
		for _, p := range paths {
			tmp, err := os.ReadFile(p)
			if err == nil && len(tmp) > 0 {
				data = tmp
				break
			}
		}
		if data == nil {
			return
		}
		var pkg struct {
			Dependencies    map[string]string `json:"dependencies"`
			DevDependencies map[string]string `json:"devDependencies"`
		}
		if err := json.Unmarshal(data, &pkg); err != nil {
			return
		}
		all := make(map[string]string)
		for name := range pkg.Dependencies {
			all[name] = "latest"
		}
		for name := range pkg.DevDependencies {
			all[name] = "latest"
		}

		fmt.Println("📦 Verificando dependências...")
		for name := range all {
			depPath := filepath.Join(jsRoot, "node_modules", name)
			if _, err := os.Stat(depPath); os.IsNotExist(err) {
				fmt.Printf("📦 Instalando %s para Node.js\n", name)
				logLines = append(logLines, fmt.Sprintf("Node.js: %s", name))
				cmd := exec.Command("npm", "install", fmt.Sprintf("%s@latest", name))
				cmd.Dir = jsRoot
				_ = runWithTimeout(cmd, 30*time.Second)
			}
		}
	case "python", "django":
		pyRoot := filepath.Join("storage", "runtimes", "python")
		_ = os.MkdirAll(filepath.Join(pyRoot, "site-packages"), os.ModePerm)

		var venvPath string
		for _, candidate := range []string{
			filepath.Join(appPath, "venv", "bin", "pip"),
			filepath.Join(appPath, ".venv", "bin", "pip"),
			filepath.Join(appPath, "env", "bin", "pip"),
		} {
			if _, err := os.Stat(candidate); err == nil {
				venvPath = candidate
				break
			}
		}

		for _, f := range []string{
			filepath.Join(appPath, "requirements.txt"),
			filepath.Join(appPath, "src", "requirements.txt"),
		} {
			if data, err := os.ReadFile(f); err == nil {
				fmt.Println("📦 Verificando dependências...")
				lines := strings.Split(string(data), "\n")
				for _, line := range lines {
					line = strings.TrimSpace(line)
					if line != "" && !strings.HasPrefix(line, "#") {
						fmt.Printf("📦 Instalando %s para Python\n", line)
						logLines = append(logLines, fmt.Sprintf("Python: %s", line))
					}
				}

				var cmd *exec.Cmd
				if venvPath != "" {
					cmd = exec.Command(venvPath, "install", "-r", f)
				} else {
					cmd = exec.Command("pip", "install", "-r", f, "--target", filepath.Join(pyRoot, "site-packages"))
				}
				_ = runWithTimeout(cmd, 30*time.Second)
				break
			}
		}

	case "golang", "go":
		goRoot := filepath.Join("storage", "runtimes", "go")
		_ = os.MkdirAll(filepath.Join(goRoot, "mod"), os.ModePerm)

		for _, f := range []string{
			filepath.Join(appPath, "go.mod"),
			filepath.Join(appPath, "src", "go.mod"),
		} {
			if data, err := os.ReadFile(f); err == nil {
				fmt.Println("📦 Verificando dependências...")
				lines := strings.Split(string(data), "\n")
				for _, line := range lines {
					if strings.HasPrefix(line, "require") || strings.Contains(line, "github.com") {
						logLines = append(logLines, fmt.Sprintf("Go: %s", strings.TrimSpace(line)))
						fmt.Printf("📦 Instalando %s para Go\n", strings.TrimSpace(line))
					}
				}
				cmd := exec.Command("go", "mod", "download")
				cmd.Dir = filepath.Dir(f)
				_ = runWithTimeout(cmd, 30*time.Second)
				break
			}
		}

	case "php", "laravel":
		phpRoot := filepath.Join("storage", "runtimes", "php")
		_ = os.MkdirAll(filepath.Join(phpRoot, "vendor"), os.ModePerm)

		for _, f := range []string{
			filepath.Join(appPath, "composer.json"),
			filepath.Join(appPath, "src", "composer.json"),
		} {
			if data, err := os.ReadFile(f); err == nil {
				var pkg struct {
					Require map[string]string `json:"require"`
				}
				if err := json.Unmarshal(data, &pkg); err == nil {
					fmt.Println("📦 Verificando dependências...")
					for name := range pkg.Require {
						fmt.Printf("📦 Instalando %s para PHP\n", name)
						logLines = append(logLines, fmt.Sprintf("PHP: %s", name))
					}
				}
				cmd := exec.Command("composer", "install", "--working-dir", filepath.Dir(f))
				_ = runWithTimeout(cmd, 30*time.Second)
				break
			}
		}

	case "rust":
		rustRoot := filepath.Join("storage", "runtimes", "rust")
		_ = os.MkdirAll(filepath.Join(rustRoot, "cargo"), os.ModePerm)

		cargoFile := filepath.Join(appPath, "Cargo.toml")
		if _, err := os.Stat(cargoFile); err == nil {
			if data, err := os.ReadFile(cargoFile); err == nil {
				fmt.Println("📦 Verificando dependências...")
				lines := strings.Split(string(data), "\n")
				for _, line := range lines {
					line = strings.TrimSpace(line)
					if strings.HasPrefix(line, "serde") || strings.Contains(line, "=") {
						fmt.Printf("📦 Instalando %s para Rust\n", line)
						logLines = append(logLines, fmt.Sprintf("Rust: %s", line))
					}
				}
			}
			cmd := exec.Command("cargo", "fetch")
			cmd.Dir = appPath
			_ = runWithTimeout(cmd, 30*time.Second)
		}

	case "csharp", "dotnet", "dotnetcore":
		csRoot := filepath.Join("storage", "runtimes", "csharp")
		_ = os.MkdirAll(filepath.Join(csRoot, "nuget-packages"), os.ModePerm)

		for _, f := range []string{
			filepath.Join(appPath, "project.csproj"),
			filepath.Join(appPath, "src", "project.csproj"),
		} {
			if data, err := os.ReadFile(f); err == nil {
				fmt.Println("📦 Verificando dependências...")
				lines := strings.Split(string(data), "\n")
				for _, line := range lines {
					line = strings.TrimSpace(line)
					if strings.Contains(line, "<PackageReference") {
						fmt.Printf("📦 Instalando %s para C#\n", line)
						logLines = append(logLines, fmt.Sprintf("CSharp: %s", line))
					}
				}
				cmd := exec.Command("dotnet", "restore")
				cmd.Dir = filepath.Dir(f)
				_ = runWithTimeout(cmd, 30*time.Second)
				break
			}
		}
	case "elixir":
		elixirRoot := filepath.Join("storage", "runtimes", "elixir")
		_ = os.MkdirAll(filepath.Join(elixirRoot, "deps"), os.ModePerm)

		mixFile := filepath.Join(appPath, "mix.exs")
		if _, err := os.Stat(mixFile); err == nil {
			if data, err := os.ReadFile(mixFile); err == nil {
				fmt.Println("📦 Verificando dependências...")
				lines := strings.Split(string(data), "\n")
				for _, line := range lines {
					if strings.Contains(line, "hex:") || strings.Contains(line, "deps") {
						fmt.Printf("📦 Instalando %s para Elixir\n", strings.TrimSpace(line))
						logLines = append(logLines, fmt.Sprintf("Elixir: %s", strings.TrimSpace(line)))
					}
				}
			}
			cmd := exec.Command("mix", "deps.get")
			cmd.Dir = appPath
			_ = runWithTimeout(cmd, 30*time.Second)
		}

	case "java", "springboot", "springboot-gradle":
		javaRoot := filepath.Join("storage", "runtimes", "java")
		_ = os.MkdirAll(filepath.Join(javaRoot, "maven"), os.ModePerm)

		pomFile := filepath.Join(appPath, "pom.xml")
		if data, err := os.ReadFile(pomFile); err == nil {
			fmt.Println("📦 Verificando dependências...")
			lines := strings.Split(string(data), "\n")
			for _, line := range lines {
				if strings.Contains(line, "<dependency>") || strings.Contains(line, "<groupId>") {
					fmt.Printf("📦 Instalando %s para Java\n", strings.TrimSpace(line))
					logLines = append(logLines, fmt.Sprintf("Java: %s", strings.TrimSpace(line)))
				}
			}
		}
		cmd := exec.Command("mvn", "install")
		cmd.Dir = appPath
		_ = runWithTimeout(cmd, 30*time.Second)

	case "kotlin":
		kotlinRoot := filepath.Join("storage", "runtimes", "kotlin")
		_ = os.MkdirAll(filepath.Join(kotlinRoot, "gradle"), os.ModePerm)

		buildFile := filepath.Join(appPath, "build.gradle")
		if data, err := os.ReadFile(buildFile); err == nil {
			fmt.Println("📦 Verificando dependências...")
			lines := strings.Split(string(data), "\n")
			for _, line := range lines {
				if strings.Contains(line, "implementation") || strings.Contains(line, "kotlin") {
					fmt.Printf("📦 Instalando %s para Kotlin\n", strings.TrimSpace(line))
					logLines = append(logLines, fmt.Sprintf("Kotlin: %s", strings.TrimSpace(line)))
				}
			}
		}
		cmd := exec.Command("gradle", "build")
		cmd.Dir = appPath
		_ = runWithTimeout(cmd, 30*time.Second)

	case "lua":
		luaRoot := filepath.Join("storage", "runtimes", "lua")
		_ = os.MkdirAll(filepath.Join(luaRoot, "modules"), os.ModePerm)

		rockFile := filepath.Join(appPath, "rockspec")
		if data, err := os.ReadFile(rockFile); err == nil {
			fmt.Println("📦 Verificando dependências...")
			lines := strings.Split(string(data), "\n")
			for _, line := range lines {
				if strings.Contains(line, "dependency") || strings.Contains(line, "lua") {
					fmt.Printf("📦 Instalando %s para Lua\n", strings.TrimSpace(line))
					logLines = append(logLines, fmt.Sprintf("Lua: %s", strings.TrimSpace(line)))
				}
			}
		}
		cmd := exec.Command("luarocks", "install", "--tree", filepath.Join(appPath, "lua_modules"))
		cmd.Dir = appPath
		_ = runWithTimeout(cmd, 30*time.Second)

	default:
		fmt.Println("⚠️ SyncDependencies: runtime não suportado:", runtime)
	}

	writeLog(logLines)
}

// services/dependency_sync.go

//package services
//
//import (
//	"context"
//	"encoding/json"
//	"fmt"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"time"
//)
//
//func runWithTimeout(cmd *exec.Cmd, timeout time.Duration) error {
//	ctx, cancel := context.WithTimeout(context.Background(), timeout)
//	defer cancel()
//	cmdWithCtx := exec.CommandContext(ctx, cmd.Path, cmd.Args[1:]...)
//	cmdWithCtx.Dir = cmd.Dir
//	return cmdWithCtx.Run()
//}
//
//func SyncDependencies(runtime, appPath, username, plan string) {
//	appID := filepath.Base(appPath)
//	//logDir := filepath.Join("storage", "users", username, plan, "apps", appID, "logs")
//	//logDir := filepath.Join("storage", "users", username, plan, "logs")
//	logDir := filepath.Join("storage", "users", username, "logs")
//	_ = os.MkdirAll(logDir, os.ModePerm)
//	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", appID))
//	var logLines []string
//
//	writeLog := func(lines []string) {
//		if len(lines) == 0 {
//			return
//		}
//		content := strings.Join(lines, "\n") + "\n"
//		_ = os.WriteFile(logFile, []byte(content), 0644)
//	}
//
//	switch runtime {
//	case "node":
//		jsRoot := filepath.Join("storage", "runtimes", "javascript")
//		_ = os.MkdirAll(filepath.Join(jsRoot, "node_modules"), os.ModePerm)
//
//		paths := []string{
//			filepath.Join(appPath, "package.json"),
//			filepath.Join(appPath, "src", "package.json"),
//		}
//		var data []byte
//		for _, p := range paths {
//			tmp, err := os.ReadFile(p)
//			if err == nil && len(tmp) > 0 {
//				data = tmp
//				break
//			}
//		}
//		if data == nil {
//			return
//		}
//		var pkg struct {
//			Dependencies    map[string]string `json:"dependencies"`
//			DevDependencies map[string]string `json:"devDependencies"`
//		}
//		if err := json.Unmarshal(data, &pkg); err != nil {
//			return
//		}
//		all := make(map[string]string)
//		for name := range pkg.Dependencies {
//			all[name] = "latest"
//		}
//		for name := range pkg.DevDependencies {
//			all[name] = "latest"
//		}
//
//		fmt.Println("📦 Verificando dependências...")
//		for name := range all {
//			depPath := filepath.Join(jsRoot, "node_modules", name)
//			if _, err := os.Stat(depPath); os.IsNotExist(err) {
//				fmt.Printf("📦 Instalando %s para Node.js\n", name)
//				logLines = append(logLines, fmt.Sprintf("Node.js: %s", name))
//				cmd := exec.Command("npm", "install", fmt.Sprintf("%s@latest", name))
//				cmd.Dir = jsRoot
//				_ = runWithTimeout(cmd, 30*time.Second)
//			}
//		}
//	case "python", "django":
//		pyRoot := filepath.Join("storage", "runtimes", "python")
//		_ = os.MkdirAll(filepath.Join(pyRoot, "site-packages"), os.ModePerm)
//
//		var venvPath string
//		for _, candidate := range []string{
//			filepath.Join(appPath, "venv", "bin", "pip"),
//			filepath.Join(appPath, ".venv", "bin", "pip"),
//			filepath.Join(appPath, "env", "bin", "pip"),
//		} {
//			if _, err := os.Stat(candidate); err == nil {
//				venvPath = candidate
//				break
//			}
//		}
//
//		for _, f := range []string{
//			filepath.Join(appPath, "requirements.txt"),
//			filepath.Join(appPath, "src", "requirements.txt"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if line != "" && !strings.HasPrefix(line, "#") {
//						fmt.Printf("📦 Instalando %s para Python\n", line)
//						logLines = append(logLines, fmt.Sprintf("Python: %s", line))
//					}
//				}
//
//				var cmd *exec.Cmd
//				if venvPath != "" {
//					cmd = exec.Command(venvPath, "install", "-r", f)
//				} else {
//					cmd = exec.Command("pip", "install", "-r", f, "--target", filepath.Join(pyRoot, "site-packages"))
//				}
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "golang", "go":
//		goRoot := filepath.Join("storage", "runtimes", "go")
//		_ = os.MkdirAll(filepath.Join(goRoot, "mod"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "go.mod"),
//			filepath.Join(appPath, "src", "go.mod"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					if strings.HasPrefix(line, "require") || strings.Contains(line, "github.com") {
//						logLines = append(logLines, fmt.Sprintf("Go: %s", strings.TrimSpace(line)))
//						fmt.Printf("📦 Instalando %s para Go\n", strings.TrimSpace(line))
//					}
//				}
//				cmd := exec.Command("go", "mod", "download")
//				cmd.Dir = filepath.Dir(f)
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "php", "laravel":
//		phpRoot := filepath.Join("storage", "runtimes", "php")
//		_ = os.MkdirAll(filepath.Join(phpRoot, "vendor"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "composer.json"),
//			filepath.Join(appPath, "src", "composer.json"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				var pkg struct {
//					Require map[string]string `json:"require"`
//				}
//				if err := json.Unmarshal(data, &pkg); err == nil {
//					fmt.Println("📦 Verificando dependências...")
//					for name := range pkg.Require {
//						fmt.Printf("📦 Instalando %s para PHP\n", name)
//						logLines = append(logLines, fmt.Sprintf("PHP: %s", name))
//					}
//				}
//				cmd := exec.Command("composer", "install", "--working-dir", filepath.Dir(f))
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "rust":
//		rustRoot := filepath.Join("storage", "runtimes", "rust")
//		_ = os.MkdirAll(filepath.Join(rustRoot, "cargo"), os.ModePerm)
//
//		cargoFile := filepath.Join(appPath, "Cargo.toml")
//		if _, err := os.Stat(cargoFile); err == nil {
//			if data, err := os.ReadFile(cargoFile); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if strings.HasPrefix(line, "serde") || strings.Contains(line, "=") {
//						fmt.Printf("📦 Instalando %s para Rust\n", line)
//						logLines = append(logLines, fmt.Sprintf("Rust: %s", line))
//					}
//				}
//			}
//			cmd := exec.Command("cargo", "fetch")
//			cmd.Dir = appPath
//			_ = runWithTimeout(cmd, 30*time.Second)
//		}
//
//	case "csharp", "dotnet", "dotnetcore":
//		csRoot := filepath.Join("storage", "runtimes", "csharp")
//		_ = os.MkdirAll(filepath.Join(csRoot, "nuget-packages"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "project.csproj"),
//			filepath.Join(appPath, "src", "project.csproj"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if strings.Contains(line, "<PackageReference") {
//						fmt.Printf("📦 Instalando %s para C#\n", line)
//						logLines = append(logLines, fmt.Sprintf("CSharp: %s", line))
//					}
//				}
//				cmd := exec.Command("dotnet", "restore")
//				cmd.Dir = filepath.Dir(f)
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//	case "elixir":
//		elixirRoot := filepath.Join("storage", "runtimes", "elixir")
//		_ = os.MkdirAll(filepath.Join(elixirRoot, "deps"), os.ModePerm)
//
//		mixFile := filepath.Join(appPath, "mix.exs")
//		if _, err := os.Stat(mixFile); err == nil {
//			if data, err := os.ReadFile(mixFile); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					if strings.Contains(line, "hex:") || strings.Contains(line, "deps") {
//						fmt.Printf("📦 Instalando %s para Elixir\n", strings.TrimSpace(line))
//						logLines = append(logLines, fmt.Sprintf("Elixir: %s", strings.TrimSpace(line)))
//					}
//				}
//			}
//			cmd := exec.Command("mix", "deps.get")
//			cmd.Dir = appPath
//			_ = runWithTimeout(cmd, 30*time.Second)
//		}
//
//	case "java", "springboot", "springboot-gradle":
//		javaRoot := filepath.Join("storage", "runtimes", "java")
//		_ = os.MkdirAll(filepath.Join(javaRoot, "maven"), os.ModePerm)
//
//		pomFile := filepath.Join(appPath, "pom.xml")
//		if data, err := os.ReadFile(pomFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "<dependency>") || strings.Contains(line, "<groupId>") {
//					fmt.Printf("📦 Instalando %s para Java\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Java: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("mvn", "install")
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	case "kotlin":
//		kotlinRoot := filepath.Join("storage", "runtimes", "kotlin")
//		_ = os.MkdirAll(filepath.Join(kotlinRoot, "gradle"), os.ModePerm)
//
//		buildFile := filepath.Join(appPath, "build.gradle")
//		if data, err := os.ReadFile(buildFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "implementation") || strings.Contains(line, "kotlin") {
//					fmt.Printf("📦 Instalando %s para Kotlin\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Kotlin: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("gradle", "build")
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	case "lua":
//		luaRoot := filepath.Join("storage", "runtimes", "lua")
//		_ = os.MkdirAll(filepath.Join(luaRoot, "modules"), os.ModePerm)
//
//		rockFile := filepath.Join(appPath, "rockspec")
//		if data, err := os.ReadFile(rockFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "dependency") || strings.Contains(line, "lua") {
//					fmt.Printf("📦 Instalando %s para Lua\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Lua: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("luarocks", "install", "--tree", filepath.Join(appPath, "lua_modules"))
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	default:
//		fmt.Println("⚠️ SyncDependencies: runtime não suportado:", runtime)
//	}
//
//	writeLog(logLines)
//}

// services/dependency_sync.go

//package services
//
//import (
//	"context"
//	"encoding/json"
//	"fmt"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"time"
//)
//
//func runWithTimeout(cmd *exec.Cmd, timeout time.Duration) error {
//	ctx, cancel := context.WithTimeout(context.Background(), timeout)
//	defer cancel()
//	cmdWithCtx := exec.CommandContext(ctx, cmd.Path, cmd.Args[1:]...)
//	cmdWithCtx.Dir = cmd.Dir
//	return cmdWithCtx.Run()
//}
//
//func SyncDependencies(runtime, appPath, username, plan string) {
//	appID := filepath.Base(appPath)
//	//logDir := filepath.Join("storage", "users", username, plan, "apps", appID, "logs")
//	//logDir := filepath.Join("storage", "users", username, plan, "logs")
//	logDir := filepath.Join("storage", "users", username, "logs")
//	_ = os.MkdirAll(logDir, os.ModePerm)
//	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", appID))
//	var logLines []string
//
//	writeLog := func(lines []string) {
//		if len(lines) == 0 {
//			return
//		}
//		content := strings.Join(lines, "\n") + "\n"
//		_ = os.WriteFile(logFile, []byte(content), 0644)
//	}
//
//	switch runtime {
//	case "node":
//		jsRoot := filepath.Join("storage", "runtimes", "javascript")
//		_ = os.MkdirAll(filepath.Join(jsRoot, "node_modules"), os.ModePerm)
//
//		paths := []string{
//			filepath.Join(appPath, "package.json"),
//			filepath.Join(appPath, "src", "package.json"),
//		}
//		var data []byte
//		for _, p := range paths {
//			tmp, err := os.ReadFile(p)
//			if err == nil && len(tmp) > 0 {
//				data = tmp
//				break
//			}
//		}
//		if data == nil {
//			return
//		}
//		var pkg struct {
//			Dependencies    map[string]string `json:"dependencies"`
//			DevDependencies map[string]string `json:"devDependencies"`
//		}
//		if err := json.Unmarshal(data, &pkg); err != nil {
//			return
//		}
//		all := make(map[string]string)
//		for name := range pkg.Dependencies {
//			all[name] = "latest"
//		}
//		for name := range pkg.DevDependencies {
//			all[name] = "latest"
//		}
//
//		fmt.Println("📦 Verificando dependências...")
//		for name := range all {
//			depPath := filepath.Join(jsRoot, "node_modules", name)
//			if _, err := os.Stat(depPath); os.IsNotExist(err) {
//				fmt.Printf("📦 Instalando %s para Node.js\n", name)
//				logLines = append(logLines, fmt.Sprintf("Node.js: %s", name))
//				cmd := exec.Command("npm", "install", fmt.Sprintf("%s@latest", name))
//				cmd.Dir = jsRoot
//				_ = runWithTimeout(cmd, 30*time.Second)
//			}
//		}
//	case "python", "django":
//		pyRoot := filepath.Join("storage", "runtimes", "python")
//		_ = os.MkdirAll(filepath.Join(pyRoot, "site-packages"), os.ModePerm)
//
//		var venvPath string
//		for _, candidate := range []string{
//			filepath.Join(appPath, "venv", "bin", "pip"),
//			filepath.Join(appPath, ".venv", "bin", "pip"),
//			filepath.Join(appPath, "env", "bin", "pip"),
//		} {
//			if _, err := os.Stat(candidate); err == nil {
//				venvPath = candidate
//				break
//			}
//		}
//
//		for _, f := range []string{
//			filepath.Join(appPath, "requirements.txt"),
//			filepath.Join(appPath, "src", "requirements.txt"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if line != "" && !strings.HasPrefix(line, "#") {
//						fmt.Printf("📦 Instalando %s para Python\n", line)
//						logLines = append(logLines, fmt.Sprintf("Python: %s", line))
//					}
//				}
//
//				var cmd *exec.Cmd
//				if venvPath != "" {
//					cmd = exec.Command(venvPath, "install", "-r", f)
//				} else {
//					cmd = exec.Command("pip", "install", "-r", f, "--target", filepath.Join(pyRoot, "site-packages"))
//				}
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "golang", "go":
//		goRoot := filepath.Join("storage", "runtimes", "go")
//		_ = os.MkdirAll(filepath.Join(goRoot, "mod"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "go.mod"),
//			filepath.Join(appPath, "src", "go.mod"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					if strings.HasPrefix(line, "require") || strings.Contains(line, "github.com") {
//						logLines = append(logLines, fmt.Sprintf("Go: %s", strings.TrimSpace(line)))
//						fmt.Printf("📦 Instalando %s para Go\n", strings.TrimSpace(line))
//					}
//				}
//				cmd := exec.Command("go", "mod", "download")
//				cmd.Dir = filepath.Dir(f)
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "php", "laravel":
//		phpRoot := filepath.Join("storage", "runtimes", "php")
//		_ = os.MkdirAll(filepath.Join(phpRoot, "vendor"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "composer.json"),
//			filepath.Join(appPath, "src", "composer.json"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				var pkg struct {
//					Require map[string]string `json:"require"`
//				}
//				if err := json.Unmarshal(data, &pkg); err == nil {
//					fmt.Println("📦 Verificando dependências...")
//					for name := range pkg.Require {
//						fmt.Printf("📦 Instalando %s para PHP\n", name)
//						logLines = append(logLines, fmt.Sprintf("PHP: %s", name))
//					}
//				}
//				cmd := exec.Command("composer", "install", "--working-dir", filepath.Dir(f))
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "rust":
//		rustRoot := filepath.Join("storage", "runtimes", "rust")
//		_ = os.MkdirAll(filepath.Join(rustRoot, "cargo"), os.ModePerm)
//
//		cargoFile := filepath.Join(appPath, "Cargo.toml")
//		if _, err := os.Stat(cargoFile); err == nil {
//			if data, err := os.ReadFile(cargoFile); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if strings.HasPrefix(line, "serde") || strings.Contains(line, "=") {
//						fmt.Printf("📦 Instalando %s para Rust\n", line)
//						logLines = append(logLines, fmt.Sprintf("Rust: %s", line))
//					}
//				}
//			}
//			cmd := exec.Command("cargo", "fetch")
//			cmd.Dir = appPath
//			_ = runWithTimeout(cmd, 30*time.Second)
//		}
//
//	case "csharp", "dotnet", "dotnetcore":
//		csRoot := filepath.Join("storage", "runtimes", "csharp")
//		_ = os.MkdirAll(filepath.Join(csRoot, "nuget-packages"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "project.csproj"),
//			filepath.Join(appPath, "src", "project.csproj"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if strings.Contains(line, "<PackageReference") {
//						fmt.Printf("📦 Instalando %s para C#\n", line)
//						logLines = append(logLines, fmt.Sprintf("CSharp: %s", line))
//					}
//				}
//				cmd := exec.Command("dotnet", "restore")
//				cmd.Dir = filepath.Dir(f)
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//	case "elixir":
//		elixirRoot := filepath.Join("storage", "runtimes", "elixir")
//		_ = os.MkdirAll(filepath.Join(elixirRoot, "deps"), os.ModePerm)
//
//		mixFile := filepath.Join(appPath, "mix.exs")
//		if _, err := os.Stat(mixFile); err == nil {
//			if data, err := os.ReadFile(mixFile); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					if strings.Contains(line, "hex:") || strings.Contains(line, "deps") {
//						fmt.Printf("📦 Instalando %s para Elixir\n", strings.TrimSpace(line))
//						logLines = append(logLines, fmt.Sprintf("Elixir: %s", strings.TrimSpace(line)))
//					}
//				}
//			}
//			cmd := exec.Command("mix", "deps.get")
//			cmd.Dir = appPath
//			_ = runWithTimeout(cmd, 30*time.Second)
//		}
//
//	case "java", "springboot", "springboot-gradle":
//		javaRoot := filepath.Join("storage", "runtimes", "java")
//		_ = os.MkdirAll(filepath.Join(javaRoot, "maven"), os.ModePerm)
//
//		pomFile := filepath.Join(appPath, "pom.xml")
//		if data, err := os.ReadFile(pomFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "<dependency>") || strings.Contains(line, "<groupId>") {
//					fmt.Printf("📦 Instalando %s para Java\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Java: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("mvn", "install")
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	case "kotlin":
//		kotlinRoot := filepath.Join("storage", "runtimes", "kotlin")
//		_ = os.MkdirAll(filepath.Join(kotlinRoot, "gradle"), os.ModePerm)
//
//		buildFile := filepath.Join(appPath, "build.gradle")
//		if data, err := os.ReadFile(buildFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "implementation") || strings.Contains(line, "kotlin") {
//					fmt.Printf("📦 Instalando %s para Kotlin\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Kotlin: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("gradle", "build")
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	case "lua":
//		luaRoot := filepath.Join("storage", "runtimes", "lua")
//		_ = os.MkdirAll(filepath.Join(luaRoot, "modules"), os.ModePerm)
//
//		rockFile := filepath.Join(appPath, "rockspec")
//		if data, err := os.ReadFile(rockFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "dependency") || strings.Contains(line, "lua") {
//					fmt.Printf("📦 Instalando %s para Lua\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Lua: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("luarocks", "install", "--tree", filepath.Join(appPath, "lua_modules"))
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	default:
//		fmt.Println("⚠️ SyncDependencies: runtime não suportado:", runtime)
//	}
//
//	writeLog(logLines)
//}

//package services
//
//import (
//	"context"
//	"encoding/json"
//	"fmt"
//	"os"
//	"os/exec"
//	"path/filepath"
//	"strings"
//	"time"
//)
//
//func runWithTimeout(cmd *exec.Cmd, timeout time.Duration) error {
//	ctx, cancel := context.WithTimeout(context.Background(), timeout)
//	defer cancel()
//	cmdWithCtx := exec.CommandContext(ctx, cmd.Path, cmd.Args[1:]...)
//	cmdWithCtx.Dir = cmd.Dir
//	return cmdWithCtx.Run()
//}

//func SyncDependencies(runtime, appPath string) {
//	backendRoot, _ := os.Getwd()
//	logDir := filepath.Join(backendRoot, "logs")
//	_ = os.MkdirAll(logDir, os.ModePerm)
//	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", filepath.Base(appPath)))
//	var logLines []string
//
//	writeLog := func(lines []string) {
//		if len(lines) == 0 {
//			return
//		}
//		content := strings.Join(lines, "\n") + "\n"
//		_ = os.WriteFile(logFile, []byte(content), 0644)
//	}
//
//	switch runtime {
//	case "node":
//		jsRoot := filepath.Join(backendRoot, "storage", "runtimes", "javascript")
//		_ = os.MkdirAll(filepath.Join(jsRoot, "node_modules"), os.ModePerm)
//
//		paths := []string{
//			filepath.Join(appPath, "package.json"),
//			filepath.Join(appPath, "src", "package.json"),
//		}
//		var data []byte
//		for _, p := range paths {
//			tmp, err := os.ReadFile(p)
//			if err == nil && len(tmp) > 0 {
//				data = tmp
//				break
//			}
//		}
//		if data == nil {
//			return
//		}
//		var pkg struct {
//			Dependencies    map[string]string `json:"dependencies"`
//			DevDependencies map[string]string `json:"devDependencies"`
//		}
//		if err := json.Unmarshal(data, &pkg); err != nil {
//			return
//		}
//		all := make(map[string]string)
//		for name := range pkg.Dependencies {
//			all[name] = "latest"
//		}
//		for name := range pkg.DevDependencies {
//			all[name] = "latest"
//		}
//
//		fmt.Println("📦 Verificando dependências...")
//		for name := range all {
//			depPath := filepath.Join(jsRoot, "node_modules", name)
//			if _, err := os.Stat(depPath); os.IsNotExist(err) {
//				fmt.Printf("📦 Instalando %s para Node.js\n", name)
//				logLines = append(logLines, fmt.Sprintf("Node.js: %s", name))
//				cmd := exec.Command("npm", "install", fmt.Sprintf("%s@latest", name))
//				cmd.Dir = jsRoot
//				_ = runWithTimeout(cmd, 30*time.Second)
//			}
//		}
//
//	case "python", "django":
//		pyRoot := filepath.Join(backendRoot, "storage", "runtimes", "python")
//		_ = os.MkdirAll(filepath.Join(pyRoot, "site-packages"), os.ModePerm)
//
//		var venvPath string
//		// 🔍 Detecta ambiente virtual
//		for _, candidate := range []string{
//			filepath.Join(appPath, "venv", "bin", "pip"),
//			filepath.Join(appPath, ".venv", "bin", "pip"),
//			filepath.Join(appPath, "env", "bin", "pip"),
//		} {
//			if _, err := os.Stat(candidate); err == nil {
//				venvPath = candidate
//				break
//			}
//		}
//
//		for _, f := range []string{
//			filepath.Join(appPath, "requirements.txt"),
//			filepath.Join(appPath, "src", "requirements.txt"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if line != "" && !strings.HasPrefix(line, "#") {
//						fmt.Printf("📦 Instalando %s para Python\n", line)
//						logLines = append(logLines, fmt.Sprintf("Python: %s", line))
//					}
//				}
//
//				var cmd *exec.Cmd
//				if venvPath != "" {
//					// ✅ Usa pip do ambiente virtual
//					cmd = exec.Command(venvPath, "install", "-r", f)
//				} else {
//					// 🧪 Fallback para pip global com target isolado
//					cmd = exec.Command("pip", "install", "-r", f, "--target", filepath.Join(pyRoot, "site-packages"))
//				}
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "golang", "go":
//		goRoot := filepath.Join(backendRoot, "storage", "runtimes", "go")
//		_ = os.MkdirAll(filepath.Join(goRoot, "mod"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "go.mod"),
//			filepath.Join(appPath, "src", "go.mod"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					if strings.HasPrefix(line, "require") || strings.Contains(line, "github.com") {
//						logLines = append(logLines, fmt.Sprintf("Go: %s", strings.TrimSpace(line)))
//						fmt.Printf("📦 Instalando %s para Go\n", strings.TrimSpace(line))
//					}
//				}
//				cmd := exec.Command("go", "mod", "download")
//				cmd.Dir = filepath.Dir(f)
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "php", "laravel":
//		phpRoot := filepath.Join(backendRoot, "storage", "runtimes", "php")
//		_ = os.MkdirAll(filepath.Join(phpRoot, "vendor"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "composer.json"),
//			filepath.Join(appPath, "src", "composer.json"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				var pkg struct {
//					Require map[string]string `json:"require"`
//				}
//				if err := json.Unmarshal(data, &pkg); err == nil {
//					fmt.Println("📦 Verificando dependências...")
//					for name := range pkg.Require {
//						fmt.Printf("📦 Instalando %s para PHP\n", name)
//						logLines = append(logLines, fmt.Sprintf("PHP: %s", name))
//					}
//				}
//				cmd := exec.Command("composer", "install", "--working-dir", filepath.Dir(f))
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "rust":
//		rustRoot := filepath.Join(backendRoot, "storage", "runtimes", "rust")
//		_ = os.MkdirAll(filepath.Join(rustRoot, "cargo"), os.ModePerm)
//
//		cargoFile := filepath.Join(appPath, "Cargo.toml")
//		if _, err := os.Stat(cargoFile); err == nil {
//			if data, err := os.ReadFile(cargoFile); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if strings.HasPrefix(line, "serde") || strings.Contains(line, "=") {
//						fmt.Printf("📦 Instalando %s para Rust\n", line)
//						logLines = append(logLines, fmt.Sprintf("Rust: %s", line))
//					}
//				}
//			}
//			cmd := exec.Command("cargo", "fetch")
//			cmd.Dir = appPath
//			_ = runWithTimeout(cmd, 30*time.Second)
//		}
//
//	case "csharp", "dotnet", "dotnetcore":
//		csRoot := filepath.Join(backendRoot, "storage", "runtimes", "csharp")
//		_ = os.MkdirAll(filepath.Join(csRoot, "nuget-packages"), os.ModePerm)
//
//		for _, f := range []string{
//			filepath.Join(appPath, "project.csproj"),
//			filepath.Join(appPath, "src", "project.csproj"),
//		} {
//			if data, err := os.ReadFile(f); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					line = strings.TrimSpace(line)
//					if strings.Contains(line, "<PackageReference") {
//						fmt.Printf("📦 Instalando %s para C#\n", line)
//						logLines = append(logLines, fmt.Sprintf("CSharp: %s", line))
//					}
//				}
//				cmd := exec.Command("dotnet", "restore")
//				cmd.Dir = filepath.Dir(f)
//				_ = runWithTimeout(cmd, 30*time.Second)
//				break
//			}
//		}
//
//	case "elixir":
//		elixirRoot := filepath.Join(backendRoot, "storage", "runtimes", "elixir")
//		_ = os.MkdirAll(filepath.Join(elixirRoot, "deps"), os.ModePerm)
//
//		mixFile := filepath.Join(appPath, "mix.exs")
//		if _, err := os.Stat(mixFile); err == nil {
//			if data, err := os.ReadFile(mixFile); err == nil {
//				fmt.Println("📦 Verificando dependências...")
//				lines := strings.Split(string(data), "\n")
//				for _, line := range lines {
//					if strings.Contains(line, "hex:") || strings.Contains(line, "deps") {
//						fmt.Printf("📦 Instalando %s para Elixir\n", strings.TrimSpace(line))
//						logLines = append(logLines, fmt.Sprintf("Elixir: %s", strings.TrimSpace(line)))
//					}
//				}
//			}
//			cmd := exec.Command("mix", "deps.get")
//			cmd.Dir = appPath
//			_ = runWithTimeout(cmd, 30*time.Second)
//		}
//
//	case "java", "springboot", "springboot-gradle":
//		javaRoot := filepath.Join(backendRoot, "storage", "runtimes", "java")
//		_ = os.MkdirAll(filepath.Join(javaRoot, "maven"), os.ModePerm)
//
//		pomFile := filepath.Join(appPath, "pom.xml")
//		if data, err := os.ReadFile(pomFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "<dependency>") || strings.Contains(line, "<groupId>") {
//					fmt.Printf("📦 Instalando %s para Java\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Java: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("mvn", "install")
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	case "kotlin":
//		kotlinRoot := filepath.Join(backendRoot, "storage", "runtimes", "kotlin")
//		_ = os.MkdirAll(filepath.Join(kotlinRoot, "gradle"), os.ModePerm)
//
//		buildFile := filepath.Join(appPath, "build.gradle")
//		if data, err := os.ReadFile(buildFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "implementation") || strings.Contains(line, "kotlin") {
//					fmt.Printf("📦 Instalando %s para Kotlin\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Kotlin: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("gradle", "build")
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	case "lua":
//		luaRoot := filepath.Join(backendRoot, "storage", "runtimes", "lua")
//		_ = os.MkdirAll(filepath.Join(luaRoot, "modules"), os.ModePerm)
//
//		rockFile := filepath.Join(appPath, "rockspec")
//		if data, err := os.ReadFile(rockFile); err == nil {
//			fmt.Println("📦 Verificando dependências...")
//			lines := strings.Split(string(data), "\n")
//			for _, line := range lines {
//				if strings.Contains(line, "dependency") || strings.Contains(line, "lua") {
//					fmt.Printf("📦 Instalando %s para Lua\n", strings.TrimSpace(line))
//					logLines = append(logLines, fmt.Sprintf("Lua: %s", strings.TrimSpace(line)))
//				}
//			}
//		}
//		cmd := exec.Command("luarocks", "install", "--tree", filepath.Join(appPath, "lua_modules"))
//		cmd.Dir = appPath
//		_ = runWithTimeout(cmd, 30*time.Second)
//
//	default:
//		fmt.Println("⚠️ SyncDependencies: runtime não suportado:", runtime)
//	}
//
//	writeLog(logLines)
//}
