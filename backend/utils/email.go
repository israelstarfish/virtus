//backend/utils/email.go

package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// 📩 Envia e-mail de verificação com código HTML estilizado
func SendVerificationEmail(toEmail, code string) error {
	_ = godotenv.Load() // Carrega variáveis de ambiente do .env

	from := os.Getenv("SMTP_FROM")          // deve ser igual ao SMTP_USER
	fromName := os.Getenv("SMTP_FROM_NAME") // nome amigável do remetente
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")

	// ⚠️ Validação de configuração SMTP
	if from == "" || user == "" || pass == "" || host == "" || port == "" {
		return fmt.Errorf("configuração SMTP incompleta ou inválida")
	}

	// ✉️ Conteúdo do e-mail
	subject := "Seu código de verificação"
	body := fmt.Sprintf(`
		<html>
			<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
				<div style="max-width: 500px; margin: auto; background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
					<h2 style="color: #4CAF50;">Código de Verificação</h2>
					<p>Olá!</p>
					<p>Seu código é: <strong style="font-size: 18px;">%s</strong></p>
					<p>Se você não solicitou este código, ignore este e-mail.</p>
					<hr style="margin: 20px 0;">
					<p style="font-size: 12px; color: #888;">
						Virtus Cloud • Segurança e confiança em cada acesso<br>
						<a href="http://localhost:3000" style="color: #4CAF50; text-decoration: none;">virtuscloud.com</a>
					</p>
				</div>
			</body>
		</html>
	`, code)

	// 🧠 Monta mensagem com cabeçalhos SMTP
	msg := []byte("From: " + fromName + " <" + from + ">\r\n" +
		"To: " + toEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n" +
		body)

	// 🔐 Autenticação SMTP
	auth := smtp.PlainAuth("", user, pass, host)
	addr := host + ":" + port

	// 📤 Envia o e-mail
	err := smtp.SendMail(addr, auth, from, []string{toEmail}, msg)
	if err != nil {
		log.Printf("Erro ao enviar e-mail para %s: %v", toEmail, err)
		return fmt.Errorf("falha ao enviar e-mail: %w", err)
	}

	return nil
}

// 📩 Envia e-mail de confirmação de login
func SendLoginConfirmationEmail(toEmail, username, ip, location string) error {
	_ = godotenv.Load() // Carrega variáveis de ambiente do .env

	from := os.Getenv("SMTP_FROM")
	fromName := os.Getenv("SMTP_FROM_NAME")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")

	// ⚠️ Validação de configuração SMTP
	if from == "" || user == "" || pass == "" || host == "" || port == "" {
		return fmt.Errorf("configuração SMTP incompleta ou inválida")
	}

	// ✉️ Conteúdo do e-mail
	subject := "Confirmação de login na Virtus Cloud"
	data := time.Now().Format("02/01/2006 15:04:05")

	body := fmt.Sprintf(`
		<html>
			<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
				<div style="max-width: 500px; margin: auto; background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
					<h2 style="color: #4CAF50;">Login realizado com sucesso</h2>
					<p>Olá <strong>%s</strong>,</p>
					<p>Detectamos um novo login em sua conta Virtus Cloud.</p>
					<p><strong>Detalhes do acesso:</strong></p>
					<ul style="line-height: 1.6;">
						<li><strong>IP:</strong> %s</li>
						<li><strong>E-mail:</strong> %s</li>
						<li><strong>Data:</strong> %s</li>
						<li><strong>Local:</strong> %s</li>
					</ul>
					<p>Se foi você, não é necessário fazer nada. Caso não reconheça este acesso, recomendamos alterar sua senha imediatamente.</p>
					<hr style="margin: 20px 0;">
					<p style="font-size: 12px; color: #888;">
						Virtus Cloud • Segurança e confiança em cada acesso<br>
						<a href="http://localhost:3000" style="color: #4CAF50; text-decoration: none;">virtuscloud.com</a>
					</p>
				</div>
			</body>
		</html>
	`, username, ip, toEmail, data, location)

	// 🧠 Monta mensagem com cabeçalhos SMTP
	msg := []byte("From: " + fromName + " <" + from + ">\r\n" +
		"To: " + toEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n" +
		body)

	// 🔐 Autenticação SMTP
	auth := smtp.PlainAuth("", user, pass, host)
	addr := host + ":" + port

	// 📤 Envia o e-mail
	err := smtp.SendMail(addr, auth, from, []string{toEmail}, msg)
	if err != nil {
		log.Printf("Erro ao enviar e-mail de login para %s: %v", toEmail, err)
		return fmt.Errorf("falha ao enviar e-mail: %w", err)
	}

	return nil
}
