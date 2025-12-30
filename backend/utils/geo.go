//backend/utils/geo.go

package utils

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
)

// =======================
// 🌐 IP e Geolocalização
// =======================

type GeoData struct {
	City    string `json:"city"`
	Region  string `json:"region"`
	Country string `json:"country_name"`
}

// 🌍 Retorna localização geográfica com base no IP público
func GetLocationFromIP(ip string) string {
	// Ignora IPs internos ou inválidos
	if ip == "" || strings.HasPrefix(ip, "127.") || strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.") {
		return "Rede local"
	}

	resp, err := http.Get("https://ipapi.co/" + ip + "/json/")
	if err != nil || resp.StatusCode != http.StatusOK {
		return "Localização não identificada"
	}
	defer resp.Body.Close()

	var geo GeoData
	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
		return "Localização não identificada"
	}

	// Verifica se os campos estão preenchidos
	if geo.City == "" && geo.Region == "" && geo.Country == "" {
		return "Localização não identificada"
	}

	return fmt.Sprintf("%s - %s, %s", geo.City, geo.Region, geo.Country)
}

// ✅ Extrai IP real do usuário considerando proxies
func GetRealIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip != "" {
		parts := strings.Split(ip, ",")
		return strings.TrimSpace(parts[0])
	}
	ip, _, _ = net.SplitHostPort(r.RemoteAddr)
	return ip
}

//func GetLocationFromIP(ip string) string {
//	resp, err := http.Get("https://ipapi.co/" + ip + "/json/")
//	if err != nil {
//		return "Localização desconhecida"
//	}
//	defer resp.Body.Close()
//
//	var geo GeoData
//	if err := json.NewDecoder(resp.Body).Decode(&geo); err != nil {
//		return "Localização desconhecida"
//	}
//
//	return fmt.Sprintf("%s - %s, %s", geo.City, geo.Region, geo.Country)
//}
