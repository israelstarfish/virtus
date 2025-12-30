// services/metrics.go

package services

import (
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"
	"virtuscloud/backend/models"
)

func NowISO() string {
	return time.Now().Format(time.RFC3339)
}

type PlanMetrics struct {
	PlanName     string  `json:"name"`
	AppsActive   int     `json:"apps_active"`
	Containers   int     `json:"containers"`
	RAMAverageMB float32 `json:"ram_average"` // ✅ Agora em MB
	Status       string  `json:"status"`
	CPUvCores    float32 `json:"cpu_vcores"`
	MaxProjects  int     `json:"max_projects"`
	SupportType  string  `json:"support_type"`
	ShieldAlert  string  `json:"shield_alert"`
	WAFAlert     string  `json:"waf_alert"`
}

var (
	cachedMetrics []PlanMetrics
	cacheLock     sync.RWMutex
)

func StartMetricsCache() {
	go func() {
		for {
			updateMetricsCache()
			time.Sleep(30 * time.Second)
		}
	}()
}

// 📐 Converte string como "512MiB", "1.2GiB" para MB
func parseMemoryToMB(raw string) float32 {
	raw = strings.TrimSpace(raw)
	raw = strings.ReplaceAll(raw, " ", "")

	if strings.HasSuffix(raw, "MiB") {
		val := strings.TrimSuffix(raw, "MiB")
		num, _ := strconv.ParseFloat(val, 32)
		return float32(num)
	}

	if strings.HasSuffix(raw, "GiB") {
		val := strings.TrimSuffix(raw, "GiB")
		num, _ := strconv.ParseFloat(val, 32)
		return float32(num * 1024)
	}

	return 0
}

func DetectPlanFromContainer(name string) string {
	name = strings.ToLower(name)
	switch {
	case strings.HasPrefix(name, "test"):
		return string(models.PlanTest)
	case strings.HasPrefix(name, "basic"):
		return string(models.PlanBasic)
	case strings.HasPrefix(name, "pro"):
		return string(models.PlanPro)
	case strings.HasPrefix(name, "premium"):
		return string(models.PlanPremium)
	case strings.HasPrefix(name, "enterprise"):
		return string(models.PlanEnterprise)
	default:
		return "desconhecido"
	}
}

func updateMetricsCache() {
	cmd := exec.Command("docker", "stats", "--no-stream", "--format", "{{.Name}}:{{.MemUsage}}")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	ramTotals := map[string]float32{}
	ramCounts := map[string]int{}

	for _, line := range lines {
		parts := strings.Split(line, ":")
		if len(parts) != 2 {
			continue
		}
		name := parts[0]
		mem := parseMemoryToMB(parts[1]) // ✅ Agora em MB
		plan := DetectPlanFromContainer(name)

		ramTotals[plan] += mem
		ramCounts[plan]++
	}

	var result []PlanMetrics
	for plan, total := range ramTotals {
		count := ramCounts[plan]
		average := float32(0.0)
		if count > 0 {
			average = total / float32(count)
		}

		info, ok := models.Plans[models.PlanType(plan)]
		status := "Estável"
		shield := "Desativado"
		waf := "Desativado"

		if ok {
			if average > float32(info.MemoryMB) {
				status = "⚠️ RAM acima do limite"
			} else if average > float32(info.MemoryMB)*0.9 {
				status = "🔶 RAM próxima do limite"
			}

			if info.ShieldEnabled {
				shield = "✅ Proteção ativada"
			}
			if info.WAFEnabled {
				waf = "✅ Firewall ativado"
			}
		} else {
			status = "Plano desconhecido"
		}

		result = append(result, PlanMetrics{
			PlanName:     plan,
			AppsActive:   count,
			Containers:   count,
			RAMAverageMB: average,
			Status:       status,
			CPUvCores:    info.CPUvCores,
			MaxProjects:  info.MaxProjects,
			SupportType:  info.SupportType,
			ShieldAlert:  shield,
			WAFAlert:     waf,
		})
	}

	cacheLock.Lock()
	cachedMetrics = result
	cacheLock.Unlock()
}

func GetCachedMetrics() []PlanMetrics {
	cacheLock.RLock()
	defer cacheLock.RUnlock()
	return cachedMetrics
}

func GetMockedEvents() []map[string]string {
	return []map[string]string{
		{"type": "deploy", "app": "virtus-api", "time": time.Now().Add(-2 * time.Hour).Format(time.RFC3339)},
		{"type": "restart", "app": "dashboard-pro", "time": time.Now().Add(-90 * time.Minute).Format(time.RFC3339)},
		{"type": "backup", "app": "analytics-db", "time": time.Now().Add(-50 * time.Minute).Format(time.RFC3339)},
		{"type": "remove", "app": "temp-builder", "time": time.Now().Add(-30 * time.Minute).Format(time.RFC3339)},
	}
}

//package services
//
//import (
//	"os/exec"
//	"strconv"
//	"strings"
//	"sync"
//	"time"
//	"virtuscloud/backend/models"
//)
//
//func NowISO() string {
//	return time.Now().Format(time.RFC3339)
//}
//
//type PlanMetrics struct {
//	PlanName     string  `json:"name"`
//	AppsActive   int     `json:"apps_active"`
//	Containers   int     `json:"containers"`
//	RAMAverageGB float32 `json:"ram_average"`
//	Status       string  `json:"status"`
//	CPUvCores    float32 `json:"cpu_vcores"`
//	MaxProjects  int     `json:"max_projects"`
//	SupportType  string  `json:"support_type"`
//	ShieldAlert  string  `json:"shield_alert"`
//	WAFAlert     string  `json:"waf_alert"`
//}
//
//var (
//	cachedMetrics []PlanMetrics
//	cacheLock     sync.RWMutex
//)
//
//func StartMetricsCache() {
//	go func() {
//		for {
//			updateMetricsCache()
//			time.Sleep(30 * time.Second)
//		}
//	}()
//}
//
//func parseMemoryToGB(raw string) float32 {
//	raw = strings.TrimSpace(raw)
//	if strings.HasSuffix(raw, "MiB") {
//		val := strings.TrimSuffix(raw, "MiB")
//		num, _ := strconv.ParseFloat(val, 32)
//		return float32(num) / 1024
//	} else if strings.HasSuffix(raw, "GiB") {
//		val := strings.TrimSuffix(raw, "GiB")
//		num, _ := strconv.ParseFloat(val, 32)
//		return float32(num)
//	}
//	return 0.0
//}
//
//func DetectPlanFromContainer(name string) string {
//	name = strings.ToLower(name)
//	switch {
//	case strings.HasPrefix(name, "test"):
//		return string(models.PlanTest)
//	case strings.HasPrefix(name, "basic"):
//		return string(models.PlanBasic)
//	case strings.HasPrefix(name, "pro"):
//		return string(models.PlanPro)
//	case strings.HasPrefix(name, "premium"):
//		return string(models.PlanPremium)
//	case strings.HasPrefix(name, "enterprise"):
//		return string(models.PlanEnterprise)
//	default:
//		return "desconhecido"
//	}
//}
//
//func updateMetricsCache() {
//	cmd := exec.Command("docker", "stats", "--no-stream", "--format", "{{.Name}}:{{.MemUsage}}")
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	ramTotals := map[string]float32{}
//	ramCounts := map[string]int{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, ":")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		mem := parseMemoryToMB(parts[1]) // ✅ Agora em MB
//		plan := DetectPlanFromContainer(name)
//
//		ramTotals[plan] += mem
//		ramCounts[plan]++
//	}
//
//	var result []PlanMetrics
//	for plan, total := range ramTotals {
//		count := ramCounts[plan]
//		average := float32(0.0)
//		if count > 0 {
//			average = total / float32(count)
//		}
//
//		info, ok := models.Plans[models.PlanType(plan)]
//		status := "Estável"
//		shield := "Desativado"
//		waf := "Desativado"
//
//		if ok {
//			if average > float32(info.MemoryMB) {
//				status = "⚠️ RAM acima do limite"
//			} else if average > float32(info.MemoryMB)*0.9 {
//				status = "🔶 RAM próxima do limite"
//			}
//
//			if info.ShieldEnabled {
//				shield = "✅ Proteção ativada"
//			}
//			if info.WAFEnabled {
//				waf = "✅ Firewall ativado"
//			}
//		} else {
//			status = "Plano desconhecido"
//		}
//
//		result = append(result, PlanMetrics{
//			PlanName:     plan,
//			AppsActive:   count,
//			Containers:   count,
//			RAMAverageMB: average, // ✅ Campo agora em MB
//			Status:       status,
//			CPUvCores:    info.CPUvCores,
//			MaxProjects:  info.MaxProjects,
//			SupportType:  info.SupportType,
//			ShieldAlert:  shield,
//			WAFAlert:     waf,
//		})
//	}
//
//	cacheLock.Lock()
//	cachedMetrics = result
//	cacheLock.Unlock()
//}
//
//func GetCachedMetrics() []PlanMetrics {
//	cacheLock.RLock()
//	defer cacheLock.RUnlock()
//	return cachedMetrics
//}
//
//func GetMockedEvents() []map[string]string {
//	return []map[string]string{
//		{"type": "deploy", "app": "virtus-api", "time": time.Now().Add(-2 * time.Hour).Format(time.RFC3339)},
//		{"type": "restart", "app": "dashboard-pro", "time": time.Now().Add(-90 * time.Minute).Format(time.RFC3339)},
//		{"type": "backup", "app": "analytics-db", "time": time.Now().Add(-50 * time.Minute).Format(time.RFC3339)},
//		{"type": "remove", "app": "temp-builder", "time": time.Now().Add(-30 * time.Minute).Format(time.RFC3339)},
//	}
//}

//func updateMetricsCache() {
//	cmd := exec.Command("docker", "stats", "--no-stream", "--format", "{{.Name}}:{{.MemUsage}}")
//	out, err := cmd.CombinedOutput()
//	if err != nil {
//		return
//	}
//
//	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
//	ramTotals := map[string]float32{}
//	ramCounts := map[string]int{}
//
//	for _, line := range lines {
//		parts := strings.Split(line, ":")
//		if len(parts) != 2 {
//			continue
//		}
//		name := parts[0]
//		mem := parseMemoryToGB(parts[1])
//		plan := DetectPlanFromContainer(name)
//
//		ramTotals[plan] += mem
//		ramCounts[plan]++
//	}
//
//	var result []PlanMetrics
//	for plan, total := range ramTotals {
//		count := ramCounts[plan]
//		average := float32(0.0)
//		if count > 0 {
//			average = total / float32(count)
//		}
//
//		info, ok := models.Plans[models.PlanType(plan)]
//		status := "Estável"
//		shield := "Desativado"
//		waf := "Desativado"
//
//		if ok {
//			if average > info.MemoryGB {
//				status = "⚠️ RAM acima do limite"
//			} else if average > info.MemoryGB*0.9 {
//				status = "🔶 RAM próxima do limite"
//			}
//
//			if info.ShieldEnabled {
//				shield = "✅ Proteção ativada"
//			}
//			if info.WAFEnabled {
//				waf = "✅ Firewall ativado"
//			}
//		} else {
//			status = "Plano desconhecido"
//		}
//
//		result = append(result, PlanMetrics{
//			PlanName:     plan,
//			AppsActive:   count,
//			Containers:   count,
//			RAMAverageGB: average,
//			Status:       status,
//			CPUvCores:    info.CPUvCores,
//			MaxProjects:  info.MaxProjects,
//			SupportType:  info.SupportType,
//			ShieldAlert:  shield,
//			WAFAlert:     waf,
//		})
//	}
//
//	cacheLock.Lock()
//	cachedMetrics = result
//	cacheLock.Unlock()
//}
