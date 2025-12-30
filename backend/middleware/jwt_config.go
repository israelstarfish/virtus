//backend/middleware/jwt_config.go

package middleware

import (
	"os"
	"path/filepath"
)

var JwtSecret = []byte(os.Getenv("JWT_TOKEN"))

var ClientsFilePath = func() string {
	dir, _ := os.Getwd()
	return filepath.Join(dir, "database", "users.json")
}()

//var JwtSecret = []byte("sua_chave_secreta")
