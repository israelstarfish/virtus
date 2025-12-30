// services/runtime_detection.go

package services

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

var frameworkToRuntime = map[string]string{
	"angular":           "node",
	"csharp":            "csharp",
	"django":            "python",
	"dotnet":            "dotnet",
	"dotnetcore":        "dotnetcore",
	"elixir":            "elixir",
	"go":                "golang",
	"java":              "java",
	"javascript":        "node",
	"kotlin":            "kotlin",
	"laravel":           "php",
	"lua":               "lua",
	"nestjs":            "node",
	"nextjs":            "node",
	"node":              "node",
	"nuxtjs":            "node",
	"php":               "php",
	"python":            "python",
	"react":             "node",
	"rust":              "rust",
	"springboot":        "java",
	"springboot-gradle": "java",
	"typescript":        "node",
	"vite":              "node",
	"vuejs":             "node",
}

func DetectEntryPoint(extractPath string) ([]string, error) {
	var candidates []string
	patterns := []string{
		// JavaScript / TypeScript
		"index.js", "main.js", "app.js", "server.js", "start.js", "init.js",
		"index.ts", "main.ts", "app.ts", "server.ts", "start.ts", "init.ts",

		// Python
		"tolya.py", "index.py", "main.py", "app.py", "server.py", "run.py", "start.py", "init.py", "manage.py",

		// Go
		"index.go", "main.go", "app.go", "server.go", "start.go", "init.go",

		// Rust
		"index.rs", "main.rs", "lib.rs", "app.rs", "server.rs",

		// PHP
		"index.php", "main.php", "app.php", "server.php", "start.php", "init.php",

		// C# / .NET
		"index.cs", "main.cs", "program.cs", "app.cs", "startup.cs",

		// Elixir
		"index.ex", "main.ex", "app.ex", "server.ex", "start.ex", "init.ex",

		// Java
		"index.java", "Main.java", "App.java", "Application.java", "Start.java", "Server.java", "JMusicBot.java", "Launcher.java",

		// Kotlin
		"index.kt", "Main.kt", "App.kt", "Application.kt", "Start.kt", "Server.kt",

		// Lua
		"index.lua", "main.lua", "init.lua", "app.lua", "server.lua", "start.lua",

		// HTML / Frontend
		"index.html", "main.html", "app.html", "start.html", "init.html",

		// Ruby
		"main.rb", "app.rb", "server.rb", "start.rb", "init.rb",

		// Swift
		"main.swift", "App.swift", "Start.swift",

		// C / C++
		"main.c", "app.c", "server.c", "main.cpp", "app.cpp", "server.cpp",

		// Shell / Bash
		"start.sh", "run.sh", "deploy.sh", "init.sh",

		// TypeScript config entry (for Vite/Nuxt/Nest)
		"vite.config.ts", "nuxt.config.ts", "nest-cli.json",

		// Misc
		"index.mjs", "main.mjs", "app.mjs", "server.mjs",
	}

	searchDirs := []string{
		extractPath,
		filepath.Join(extractPath, "src"),
		filepath.Join(extractPath, "files"),
		filepath.Join(extractPath, "src", "main", "java"),
	}

	for _, dir := range searchDirs {
		filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return nil
			}
			name := filepath.Base(path)
			for _, pattern := range patterns {
				if strings.EqualFold(name, pattern) {
					rel, _ := filepath.Rel(extractPath, path)
					candidates = append(candidates, rel)
				}
			}
			return nil
		})
	}

	return candidates, nil
}

func DetectRuntime(entry string) string {
	base := strings.ToLower(strings.TrimSuffix(filepath.Base(entry), filepath.Ext(entry)))
	if runtime, ok := frameworkToRuntime[base]; ok {
		return runtime
	}

	ext := strings.ToLower(filepath.Ext(entry))
	dir := filepath.Dir(entry) // ✅ declare aqui antes de usar

	switch ext {
	case ".js", ".ts":
		return "node"
	case ".py":
		return "python"
	case ".go":
		return "golang"
	case ".rs":
		return "rust"
	case ".php":
		return "php"
	case ".cs":
		return "csharp"
	case ".ex":
		return "elixir"
	case ".java":
		if _, err := os.Stat(filepath.Join(dir, "pom.xml")); err == nil {
			return "java-maven"
		}
		if _, err := os.Stat(filepath.Join(dir, "build.gradle")); err == nil {
			return "java-gradle"
		}
		return "java"
	case ".kt":
		return "kotlin"
	case ".lua":
		return "lua"
	}

	if configRuntime := DetectRuntimeByConfig(dir); configRuntime != "" {
		return configRuntime
	}

	files, _ := os.ReadDir(dir)
	var names []string
	for _, f := range files {
		names = append(names, f.Name())
	}
	Log("runtime-detection", "unknown", "default", fmt.Sprintf("⚠️ Runtime não detectado para '%s'. Arquivos encontrados: %v", entry, names))

	return "unknown"
}

func DetectRuntimeByConfig(path string) string {
	configFiles := map[string]string{
		"package.json":     "node",
		"tsconfig.json":    "node",
		"vite.config.js":   "node",
		"vite.config.ts":   "node",
		"angular.json":     "node",
		"next.config.js":   "node",
		"nuxt.config.js":   "node",
		"nest-cli.json":    "node",
		"requirements.txt": "python",
		"pyproject.toml":   "python",
		"go.mod":           "golang",
		"Cargo.toml":       "rust",
		"composer.json":    "php",
		"pom.xml":          "java-maven",
		"build.gradle":     "java-gradle",
		"Main.kt":          "kotlin",
		"mix.exs":          "elixir",
		"program.cs":       "csharp",
		"project.csproj":   "csharp",
		"main.lua":         "lua",
		"init.lua":         "lua",
	}

	for file, runtime := range configFiles {
		if _, err := os.Stat(filepath.Join(path, file)); err == nil {
			return runtime
		}
	}
	return ""
}
func DetectRuntimeSmart(entry string) string {
	if runtime := DetectRuntime(entry); runtime != "unknown" {
		return runtime
	}
	return DetectRuntimeByConfig(filepath.Dir(entry))
}

var runtimeCache = map[string]string{}

func DetectRuntimeCached(entry string) string {
	if rt, ok := runtimeCache[entry]; ok {
		return rt
	}
	rt := DetectRuntime(entry)
	runtimeCache[entry] = rt
	return rt
}
func GetRuntimeCommand(runtime, entry string) []string {
	switch runtime {
	case "node":
		return []string{"npm", "start"}
	case "python", "django":
		return []string{"python", entry}
	case "golang", "go":
		return []string{"go", "run", entry}
	case "php", "laravel":
		return []string{"php", "artisan", "serve"}
	case "rust":
		return []string{"cargo", "run"}
	case "csharp", "dotnet", "dotnetcore":
		return []string{"dotnet", "run"}
	case "elixir":
		return []string{"mix", "phx.server"}
	case "java", "springboot":
		return []string{"mvn", "spring-boot:run"}
	case "springboot-gradle", "kotlin":
		return []string{"gradle", "bootRun"}
	case "lua":
		return []string{"lua", entry}
	default:
		return []string{entry}
	}
}
func DetectFrameworkByContent(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	content := string(data)

	if strings.Contains(content, "ReactDOM") || strings.Contains(content, "useState") || strings.Contains(content, "react") {
		return "react"
	}
	if strings.Contains(content, "getServerSideProps") || strings.Contains(content, "next/router") || strings.Contains(content, "next/head") {
		return "nextjs"
	}
	if strings.Contains(content, "Vue.component") || strings.Contains(content, "createApp") || strings.Contains(content, "from 'vue'") {
		return "vuejs"
	}
	if strings.Contains(content, "@angular/core") || strings.Contains(content, "angular.module") {
		return "angular"
	}
	if strings.Contains(content, "@nestjs") || strings.Contains(content, "nestjs/common") {
		return "nestjs"
	}
	if strings.Contains(content, "defineConfig") || strings.Contains(content, "vite.config") {
		return "vite"
	}
	if strings.Contains(content, "nuxt.config") || strings.Contains(content, "from 'nuxt'") {
		return "nuxtjs"
	}

	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".ts":
		return "typescript"
	case ".js":
		return "javascript"
	case ".py":
		return "python"
	case ".go":
		return "golang"
	case ".rs":
		return "rust"
	case ".php":
		return "php"
	case ".cs":
		return "csharp"
	case ".ex":
		return "elixir"
	case ".java":
		return "java"
	case ".kt":
		return "kotlin"
	case ".lua":
		return "lua"
	}

	return ""
}
func DetectVisualRuntime(entry string) string {
	if contentRuntime := DetectFrameworkByContent(entry); contentRuntime != "" {
		return contentRuntime
	}
	return DetectRuntime(entry) // fallback para o técnico
}

// services/runtime_detection.go

//package services
//
//import (
//	"fmt"
//	"os"
//	"path/filepath"
//	"strings"
//)
//
//var frameworkToRuntime = map[string]string{
//	"angular":           "node",
//	"csharp":            "csharp",
//	"django":            "python",
//	"dotnet":            "dotnet",
//	"dotnetcore":        "dotnetcore",
//	"elixir":            "elixir",
//	"go":                "golang",
//	"java":              "java",
//	"javascript":        "node",
//	"kotlin":            "kotlin",
//	"laravel":           "php",
//	"lua":               "lua",
//	"nestjs":            "node",
//	"nextjs":            "node",
//	"node":              "node",
//	"nuxtjs":            "node",
//	"php":               "php",
//	"python":            "python",
//	"react":             "node",
//	"rust":              "rust",
//	"springboot":        "java",
//	"springboot-gradle": "java",
//	"typescript":        "node",
//	"vite":              "node",
//	"vuejs":             "node",
//}
//
//func DetectEntryPoint(extractPath string) ([]string, error) {
//	var candidates []string
//	patterns := []string{
//		"index.js", "main.js", "app.js", "server.js",
//		"index.ts", "main.ts",
//		"index.py", "main.py", "app.py", "server.py",
//		"index.go", "main.go", "app.go",
//		"index.rs", "main.rs", "lib.rs",
//		"index.php", "main.php",
//		"index.cs", "main.cs", "program.cs",
//		"index.ex", "main.ex", "app.ex",
//		"Main.java", "App.java", "Application.java",
//		"Main.kt", "App.kt",
//		"main.lua", "init.lua",
//		"index.html", "main.html",
//	}
//
//	searchDirs := []string{
//		extractPath,
//		filepath.Join(extractPath, "src"),
//		filepath.Join(extractPath, "files"),
//	}
//
//	for _, dir := range searchDirs {
//		filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
//			if err != nil || d.IsDir() {
//				return nil
//			}
//			name := strings.ToLower(filepath.Base(path))
//			for _, pattern := range patterns {
//				if name == strings.ToLower(pattern) {
//					rel, _ := filepath.Rel(extractPath, path)
//					candidates = append(candidates, rel)
//				}
//			}
//			return nil
//		})
//	}
//
//	return candidates, nil
//}
//
//func DetectRuntime(entry string) string {
//	base := strings.ToLower(strings.TrimSuffix(filepath.Base(entry), filepath.Ext(entry)))
//	if runtime, ok := frameworkToRuntime[base]; ok {
//		return runtime
//	}
//
//	ext := strings.ToLower(filepath.Ext(entry))
//	switch ext {
//	case ".js", ".ts":
//		return "node"
//	case ".py":
//		return "python"
//	case ".go":
//		return "golang"
//	case ".rs":
//		return "rust"
//	case ".php":
//		return "php"
//	case ".cs":
//		return "csharp"
//	case ".ex":
//		return "elixir"
//	case ".java":
//		return "java"
//	case ".kt":
//		return "kotlin"
//	case ".lua":
//		return "lua"
//	}
//	dir := filepath.Dir(entry)
//	if configRuntime := DetectRuntimeByConfig(dir); configRuntime != "" {
//		return configRuntime
//	}
//
//	files, _ := os.ReadDir(dir)
//	var names []string
//	for _, f := range files {
//		names = append(names, f.Name())
//	}
//	Log("runtime-detection", "unknown", "default", fmt.Sprintf("⚠️ Runtime não detectado para '%s'. Arquivos encontrados: %v", entry, names))
//	//Log("runtime-detection", fmt.Sprintf("⚠️ Runtime não detectado para '%s'. Arquivos encontrados: %v", entry, names))
//
//	return "unknown"
//}
//
//func DetectRuntimeByConfig(path string) string {
//	configFiles := map[string]string{
//		"package.json":     "node",
//		"tsconfig.json":    "node",
//		"vite.config.js":   "node",
//		"vite.config.ts":   "node",
//		"angular.json":     "node",
//		"next.config.js":   "node",
//		"nuxt.config.js":   "node",
//		"nest-cli.json":    "node",
//		"requirements.txt": "python",
//		"pyproject.toml":   "python",
//		"go.mod":           "golang",
//		"Cargo.toml":       "rust",
//		"composer.json":    "php",
//		"pom.xml":          "java",
//		"build.gradle":     "java",
//		"Main.kt":          "kotlin",
//		"mix.exs":          "elixir",
//		"program.cs":       "csharp",
//		"project.csproj":   "csharp",
//		"main.lua":         "lua",
//		"init.lua":         "lua",
//	}
//
//	for file, runtime := range configFiles {
//		if _, err := os.Stat(filepath.Join(path, file)); err == nil {
//			return runtime
//		}
//	}
//	return ""
//}
//func DetectRuntimeSmart(entry string) string {
//	if runtime := DetectRuntime(entry); runtime != "unknown" {
//		return runtime
//	}
//	return DetectRuntimeByConfig(filepath.Dir(entry))
//}
//
//var runtimeCache = map[string]string{}
//
//func DetectRuntimeCached(entry string) string {
//	if rt, ok := runtimeCache[entry]; ok {
//		return rt
//	}
//	rt := DetectRuntime(entry)
//	runtimeCache[entry] = rt
//	return rt
//}
//func GetRuntimeCommand(runtime, entry string) []string {
//	switch runtime {
//	case "node":
//		return []string{"npm", "start"}
//	case "python", "django":
//		return []string{"python", entry}
//	case "golang", "go":
//		return []string{"go", "run", entry}
//	case "php", "laravel":
//		return []string{"php", "artisan", "serve"}
//	case "rust":
//		return []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		return []string{"dotnet", "run"}
//	case "elixir":
//		return []string{"mix", "phx.server"}
//	case "java", "springboot":
//		return []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		return []string{"gradle", "bootRun"}
//	case "lua":
//		return []string{"lua", entry}
//	default:
//		return []string{entry}
//	}
//}
//func DetectFrameworkByContent(path string) string {
//	data, err := os.ReadFile(path)
//	if err != nil {
//		return ""
//	}
//	content := string(data)
//
//	if strings.Contains(content, "ReactDOM") || strings.Contains(content, "useState") || strings.Contains(content, "react") {
//		return "react"
//	}
//	if strings.Contains(content, "getServerSideProps") || strings.Contains(content, "next/router") || strings.Contains(content, "next/head") {
//		return "nextjs"
//	}
//	if strings.Contains(content, "Vue.component") || strings.Contains(content, "createApp") || strings.Contains(content, "from 'vue'") {
//		return "vuejs"
//	}
//	if strings.Contains(content, "@angular/core") || strings.Contains(content, "angular.module") {
//		return "angular"
//	}
//	if strings.Contains(content, "@nestjs") || strings.Contains(content, "nestjs/common") {
//		return "nestjs"
//	}
//	if strings.Contains(content, "defineConfig") || strings.Contains(content, "vite.config") {
//		return "vite"
//	}
//	if strings.Contains(content, "nuxt.config") || strings.Contains(content, "from 'nuxt'") {
//		return "nuxtjs"
//	}
//
//	ext := strings.ToLower(filepath.Ext(path))
//	switch ext {
//	case ".ts":
//		return "typescript"
//	case ".js":
//		return "javascript"
//	case ".py":
//		return "python"
//	case ".go":
//		return "golang"
//	case ".rs":
//		return "rust"
//	case ".php":
//		return "php"
//	case ".cs":
//		return "csharp"
//	case ".ex":
//		return "elixir"
//	case ".java":
//		return "java"
//	case ".kt":
//		return "kotlin"
//	case ".lua":
//		return "lua"
//	}
//
//	return ""
//}
//func DetectVisualRuntime(entry string) string {
//	if contentRuntime := DetectFrameworkByContent(entry); contentRuntime != "" {
//		return contentRuntime
//	}
//	return DetectRuntime(entry) // fallback para o técnico
//}

// services/runtime_detection.go

//package services
//
//import (
//	"fmt"
//	"os"
//	"path/filepath"
//	"strings"
//)
//
//var frameworkToRuntime = map[string]string{
//	"angular":           "node",
//	"csharp":            "csharp",
//	"django":            "python",
//	"dotnet":            "dotnet",
//	"dotnetcore":        "dotnetcore",
//	"elixir":            "elixir",
//	"go":                "golang",
//	"java":              "java",
//	"javascript":        "node",
//	"kotlin":            "kotlin",
//	"laravel":           "php",
//	"lua":               "lua",
//	"nestjs":            "node",
//	"nextjs":            "node",
//	"node":              "node",
//	"nuxtjs":            "node",
//	"php":               "php",
//	"python":            "python",
//	"react":             "node",
//	"rust":              "rust",
//	"springboot":        "java",
//	"springboot-gradle": "java",
//	"typescript":        "node",
//	"vite":              "node",
//	"vuejs":             "node",
//}
//
//func DetectEntryPoint(extractPath string) ([]string, error) {
//	var candidates []string
//	patterns := []string{
//		"index.js", "main.js", "app.js", "server.js",
//		"index.ts", "main.ts",
//		"index.py", "main.py", "app.py", "server.py",
//		"index.go", "main.go", "app.go",
//		"index.rs", "main.rs", "lib.rs",
//		"index.php", "main.php",
//		"index.cs", "main.cs", "program.cs",
//		"index.ex", "main.ex", "app.ex",
//		"Main.java", "App.java", "Application.java",
//		"Main.kt", "App.kt",
//		"main.lua", "init.lua",
//		"index.html", "main.html",
//	}
//
//	searchDirs := []string{
//		extractPath,
//		filepath.Join(extractPath, "src"),
//		filepath.Join(extractPath, "files"),
//	}
//
//	for _, dir := range searchDirs {
//		filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
//			if err != nil || d.IsDir() {
//				return nil
//			}
//			name := strings.ToLower(filepath.Base(path))
//			for _, pattern := range patterns {
//				if name == strings.ToLower(pattern) {
//					rel, _ := filepath.Rel(extractPath, path)
//					candidates = append(candidates, rel)
//				}
//			}
//			return nil
//		})
//	}
//
//	return candidates, nil
//}
//
//func DetectRuntime(entry string) string {
//	base := strings.ToLower(strings.TrimSuffix(filepath.Base(entry), filepath.Ext(entry)))
//	if runtime, ok := frameworkToRuntime[base]; ok {
//		return runtime
//	}
//
//	ext := strings.ToLower(filepath.Ext(entry))
//	switch ext {
//	case ".js", ".ts":
//		return "node"
//	case ".py":
//		return "python"
//	case ".go":
//		return "golang"
//	case ".rs":
//		return "rust"
//	case ".php":
//		return "php"
//	case ".cs":
//		return "csharp"
//	case ".ex":
//		return "elixir"
//	case ".java":
//		return "java"
//	case ".kt":
//		return "kotlin"
//	case ".lua":
//		return "lua"
//	}
//	dir := filepath.Dir(entry)
//	if configRuntime := DetectRuntimeByConfig(dir); configRuntime != "" {
//		return configRuntime
//	}
//
//	files, _ := os.ReadDir(dir)
//	var names []string
//	for _, f := range files {
//		names = append(names, f.Name())
//	}
//	Log("runtime-detection", "unknown", "default", fmt.Sprintf("⚠️ Runtime não detectado para '%s'. Arquivos encontrados: %v", entry, names))
//	//Log("runtime-detection", fmt.Sprintf("⚠️ Runtime não detectado para '%s'. Arquivos encontrados: %v", entry, names))
//
//	return "unknown"
//}
//
//func DetectRuntimeByConfig(path string) string {
//	configFiles := map[string]string{
//		"package.json":     "node",
//		"tsconfig.json":    "node",
//		"vite.config.js":   "node",
//		"vite.config.ts":   "node",
//		"angular.json":     "node",
//		"next.config.js":   "node",
//		"nuxt.config.js":   "node",
//		"nest-cli.json":    "node",
//		"requirements.txt": "python",
//		"pyproject.toml":   "python",
//		"go.mod":           "golang",
//		"Cargo.toml":       "rust",
//		"composer.json":    "php",
//		"pom.xml":          "java",
//		"build.gradle":     "java",
//		"Main.kt":          "kotlin",
//		"mix.exs":          "elixir",
//		"program.cs":       "csharp",
//		"project.csproj":   "csharp",
//		"main.lua":         "lua",
//		"init.lua":         "lua",
//	}
//
//	for file, runtime := range configFiles {
//		if _, err := os.Stat(filepath.Join(path, file)); err == nil {
//			return runtime
//		}
//	}
//	return ""
//}
//func DetectRuntimeSmart(entry string) string {
//	if runtime := DetectRuntime(entry); runtime != "unknown" {
//		return runtime
//	}
//	return DetectRuntimeByConfig(filepath.Dir(entry))
//}
//
//var runtimeCache = map[string]string{}
//
//func DetectRuntimeCached(entry string) string {
//	if rt, ok := runtimeCache[entry]; ok {
//		return rt
//	}
//	rt := DetectRuntime(entry)
//	runtimeCache[entry] = rt
//	return rt
//}
//func GetRuntimeCommand(runtime, entry string) []string {
//	switch runtime {
//	case "node":
//		return []string{"npm", "start"}
//	case "python", "django":
//		return []string{"python", entry}
//	case "golang", "go":
//		return []string{"go", "run", entry}
//	case "php", "laravel":
//		return []string{"php", "artisan", "serve"}
//	case "rust":
//		return []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		return []string{"dotnet", "run"}
//	case "elixir":
//		return []string{"mix", "phx.server"}
//	case "java", "springboot":
//		return []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		return []string{"gradle", "bootRun"}
//	case "lua":
//		return []string{"lua", entry}
//	default:
//		return []string{entry}
//	}
//}

// services/runtime_detection.go

//package services
//
//import (
//	"fmt"
//	"os"
//	"path/filepath"
//	"strings"
//)
//
//var frameworkToRuntime = map[string]string{
//	"angular":           "node",
//	"csharp":            "csharp",
//	"django":            "python",
//	"dotnet":            "dotnet",
//	"dotnetcore":        "dotnetcore",
//	"elixir":            "elixir",
//	"go":                "golang",
//	"java":              "java",
//	"javascript":        "node",
//	"kotlin":            "kotlin",
//	"laravel":           "php",
//	"lua":               "lua",
//	"nestjs":            "node",
//	"nextjs":            "node",
//	"node":              "node",
//	"nuxtjs":            "node",
//	"php":               "php",
//	"python":            "python",
//	"react":             "node",
//	"rust":              "rust",
//	"springboot":        "java",
//	"springboot-gradle": "java",
//	"typescript":        "node",
//	"vite":              "node",
//	"vuejs":             "node",
//}
//
//func DetectEntryPoint(extractPath string) ([]string, error) {
//	var candidates []string
//	patterns := []string{
//		"index.js", "main.js", "app.js", "server.js",
//		"index.ts", "main.ts",
//		"index.py", "main.py", "app.py", "server.py",
//		"index.go", "main.go", "app.go",
//		"index.rs", "main.rs", "lib.rs",
//		"index.php", "main.php",
//		"index.cs", "main.cs", "program.cs",
//		"index.ex", "main.ex", "app.ex",
//		"Main.java", "App.java", "Application.java",
//		"Main.kt", "App.kt",
//		"main.lua", "init.lua",
//		"index.html", "main.html",
//	}
//
//	searchDirs := []string{
//		extractPath,
//		filepath.Join(extractPath, "src"),
//		filepath.Join(extractPath, "files"),
//	}
//
//	for _, dir := range searchDirs {
//		filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
//			if err != nil || d.IsDir() {
//				return nil
//			}
//			name := strings.ToLower(filepath.Base(path))
//			for _, pattern := range patterns {
//				if name == strings.ToLower(pattern) {
//					rel, _ := filepath.Rel(extractPath, path)
//					candidates = append(candidates, rel)
//				}
//			}
//			return nil
//		})
//	}
//
//	return candidates, nil
//}
//
//func DetectRuntime(entry string) string {
//	base := strings.ToLower(strings.TrimSuffix(filepath.Base(entry), filepath.Ext(entry)))
//	if runtime, ok := frameworkToRuntime[base]; ok {
//		return runtime
//	}
//
//	ext := strings.ToLower(filepath.Ext(entry))
//	switch ext {
//	case ".js", ".ts":
//		return "node"
//	case ".py":
//		return "python"
//	case ".go":
//		return "golang"
//	case ".rs":
//		return "rust"
//	case ".php":
//		return "php"
//	case ".cs":
//		return "csharp"
//	case ".ex":
//		return "elixir"
//	case ".java":
//		return "java"
//	case ".kt":
//		return "kotlin"
//	case ".lua":
//		return "lua"
//	}
//	dir := filepath.Dir(entry)
//	if configRuntime := DetectRuntimeByConfig(dir); configRuntime != "" {
//		return configRuntime
//	}
//
//	files, _ := os.ReadDir(dir)
//	var names []string
//	for _, f := range files {
//		names = append(names, f.Name())
//	}
//	Log("runtime-detection", "unknown", "default", fmt.Sprintf("⚠️ Runtime não detectado para '%s'. Arquivos encontrados: %v", entry, names))
//	//Log("runtime-detection", fmt.Sprintf("⚠️ Runtime não detectado para '%s'. Arquivos encontrados: %v", entry, names))
//
//	return "unknown"
//}
//
//func DetectRuntimeByConfig(path string) string {
//	configFiles := map[string]string{
//		"package.json":     "node",
//		"tsconfig.json":    "node",
//		"vite.config.js":   "node",
//		"vite.config.ts":   "node",
//		"angular.json":     "node",
//		"next.config.js":   "node",
//		"nuxt.config.js":   "node",
//		"nest-cli.json":    "node",
//		"requirements.txt": "python",
//		"pyproject.toml":   "python",
//		"go.mod":           "golang",
//		"Cargo.toml":       "rust",
//		"composer.json":    "php",
//		"pom.xml":          "java",
//		"build.gradle":     "java",
//		"Main.kt":          "kotlin",
//		"mix.exs":          "elixir",
//		"program.cs":       "csharp",
//		"project.csproj":   "csharp",
//		"main.lua":         "lua",
//		"init.lua":         "lua",
//	}
//
//	for file, runtime := range configFiles {
//		if _, err := os.Stat(filepath.Join(path, file)); err == nil {
//			return runtime
//		}
//	}
//	return ""
//}
//func DetectRuntimeSmart(entry string) string {
//	if runtime := DetectRuntime(entry); runtime != "unknown" {
//		return runtime
//	}
//	return DetectRuntimeByConfig(filepath.Dir(entry))
//}
//
//var runtimeCache = map[string]string{}
//
//func DetectRuntimeCached(entry string) string {
//	if rt, ok := runtimeCache[entry]; ok {
//		return rt
//	}
//	rt := DetectRuntime(entry)
//	runtimeCache[entry] = rt
//	return rt
//}
//func GetRuntimeCommand(runtime, entry string) []string {
//	switch runtime {
//	case "node":
//		return []string{"npm", "start"}
//	case "python", "django":
//		return []string{"python", entry}
//	case "golang", "go":
//		return []string{"go", "run", entry}
//	case "php", "laravel":
//		return []string{"php", "artisan", "serve"}
//	case "rust":
//		return []string{"cargo", "run"}
//	case "csharp", "dotnet", "dotnetcore":
//		return []string{"dotnet", "run"}
//	case "elixir":
//		return []string{"mix", "phx.server"}
//	case "java", "springboot":
//		return []string{"mvn", "spring-boot:run"}
//	case "springboot-gradle", "kotlin":
//		return []string{"gradle", "bootRun"}
//	case "lua":
//		return []string{"lua", entry}
//	default:
//		return []string{entry}
//	}
//}
