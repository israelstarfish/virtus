// store/logging.go
package utils

// LogFunc é uma função de log injetável usada por outros utilitários
var LogFunc func(ref, level, message string)

// 🔧 Função de log injetável (evita importação direta de services)
//var LogFunc func(appID, level, message string)
