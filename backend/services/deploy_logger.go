// services/deploy_logger.go

package services

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

func Log(appID, username, plan, message string) {
	logDir := filepath.Join("storage", "users", username, "logs", appID)
	_ = os.MkdirAll(logDir, os.ModePerm)

	// Nome do arquivo baseado na data atual (YYYYMMDD)
	date := time.Now().Format("20060102")
	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", date))

	f, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("⚠️ Erro ao escrever log:", err)
		return
	}
	defer f.Close()

	// Timestamp completo no conteúdo
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	line := fmt.Sprintf("[%s] %s\n", timestamp, message)
	_, _ = f.WriteString(line)
	fmt.Print(line)
}

//func Log(appID, username, plan, message string) {
//	//logDir := filepath.Join("storage", "users", username, plan, "apps", appID, "logs")
//	logDir := filepath.Join("storage", "users", username, "logs")
//	_ = os.MkdirAll(logDir, os.ModePerm)
//	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", appID))
//
//	f, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
//	if err != nil {
//		fmt.Println("⚠️ Erro ao escrever log:", err)
//		return
//	}
//	defer f.Close()
//
//	timestamp := time.Now().Format("2006-01-02 15:04:05")
//	line := fmt.Sprintf("[%s] %s\n", timestamp, message)
//	_, _ = f.WriteString(line)
//	fmt.Print(line)
//}

//func Log(appID, username, plan, username, plan, message string) {
//	logDir := filepath.Join("storage", "users", username, plan, "apps", appID, "logs")
//	_ = os.MkdirAll(logDir, os.ModePerm)
//	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", appID))
//
//	f, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
//	if err != nil {
//		fmt.Println("⚠️ Erro ao escrever log:", err)
//		return
//	}
//	defer f.Close()
//
//	timestamp := time.Now().Format("2006-01-02 15:04:05")
//	line := fmt.Sprintf("[%s] %s\n", timestamp, message)
//	_, _ = f.WriteString(line)
//	fmt.Print(line)
//}

//func Log(appID, username, plan, message string) {
//	backendRoot, _ := os.Getwd()
//	logDir := filepath.Join(backendRoot, "storage", "users", "apps", appID, "logs")
//	_ = os.MkdirAll(logDir, os.ModePerm)
//	logFile := filepath.Join(logDir, fmt.Sprintf("%s.log", appID))
//
//	f, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
//	if err != nil {
//		fmt.Println("⚠️ Erro ao escrever log:", err)
//		return
//	}
//	defer f.Close()
//
//	timestamp := time.Now().Format("2006-01-02 15:04:05")
//	line := fmt.Sprintf("[%s] %s\n", timestamp, message)
//	_, _ = f.WriteString(line)
//	fmt.Print(line)
//}
