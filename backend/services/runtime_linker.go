// services/runtime_linker.go

package services

import (
	"fmt"
	"os"
	"path/filepath"
)

func LinkRuntime(runtime, appPath string) error {
	backendRoot, _ := os.Getwd()
	runtimePaths := map[string]string{
		"node":       "javascript/node_modules",
		"python":     "python/site-packages",
		"golang":     "go/mod",
		"php":        "php/vendor",
		"rust":       "rust/cargo",
		"csharp":     "csharp/nuget-packages",
		"elixir":     "elixir/deps",
		"java":       "java/maven",
		"kotlin":     "kotlin/gradle",
		"dotnet":     "dotnet/packages",
		"dotnetcore": "dotnetcore/packages",
		"lua":        "lua/modules",
	}

	subPath, ok := runtimePaths[runtime]
	if !ok {
		return fmt.Errorf("runtime não reconhecido: %s", runtime)
	}

	source := filepath.Join(backendRoot, "storage", "runtimes", subPath)
	target := filepath.Join(appPath, filepath.Base(subPath))

	_ = os.Remove(target)
	return os.Symlink(source, target)
}

// services/runtime_linker.go

//package services
//
//import (
//	"fmt"
//	"os"
//	"path/filepath"
//)
//
//func LinkRuntime(runtime, appPath string) error {
//	backendRoot, _ := os.Getwd()
//	runtimePaths := map[string]string{
//		"node":       "javascript/node_modules",
//		"python":     "python/site-packages",
//		"golang":     "go/mod",
//		"php":        "php/vendor",
//		"rust":       "rust/cargo",
//		"csharp":     "csharp/nuget-packages",
//		"elixir":     "elixir/deps",
//		"java":       "java/maven",
//		"kotlin":     "kotlin/gradle",
//		"dotnet":     "dotnet/packages",
//		"dotnetcore": "dotnetcore/packages",
//		"lua":        "lua/modules",
//	}
//
//	subPath, ok := runtimePaths[runtime]
//	if !ok {
//		return fmt.Errorf("runtime não reconhecido: %s", runtime)
//	}
//
//	source := filepath.Join(backendRoot, "storage", "runtimes", subPath)
//	target := filepath.Join(appPath, filepath.Base(subPath))
//
//	_ = os.Remove(target)
//	return os.Symlink(source, target)
//}
