// services/events.go

package services

import (
	"bufio"
	"os/exec"
	"strings"
	"sync"
)

// Estrutura do evento
type DockerEvent struct {
	Time      string `json:"time"`
	App       string `json:"app"`
	Action    string `json:"action"`
	Container string `json:"container"`
}

var (
	eventLog  []DockerEvent
	eventLock sync.RWMutex
)

// Inicia escuta de eventos do Docker
func StartEventListener() {
	go func() {
		cmd := exec.Command("docker", "events", "--format", "{{.Time}}|{{.Action}}|{{.Actor.Attributes.name}}")
		stdout, _ := cmd.StdoutPipe()
		cmd.Start()

		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			parts := strings.Split(scanner.Text(), "|")
			if len(parts) != 3 {
				continue
			}

			e := DockerEvent{
				Time:      parts[0],
				Action:    parts[1],
				App:       parts[2],
				Container: parts[2],
			}

			eventLock.Lock()
			eventLog = append(eventLog, e)
			if len(eventLog) > 50 {
				eventLog = eventLog[len(eventLog)-50:] // Mantém os últimos 50
			}
			eventLock.Unlock()
		}
	}()
}

// Retorna eventos capturados
func GetEvents() []DockerEvent {
	eventLock.RLock()
	defer eventLock.RUnlock()
	return eventLog
}
