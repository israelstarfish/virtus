//backend/models/plans.go

package models

type PlanType string

const (
	PlanNothing    PlanType = "no-plan"
	PlanTest       PlanType = "test"
	PlanBasic      PlanType = "basic"
	PlanPro        PlanType = "pro"
	PlanPremium    PlanType = "premium"
	PlanEnterprise PlanType = "enterprise"
)

// Este modelo de plano é independente de identificador de usuário.
// A lógica de acesso e limites é aplicada via username no contexto.

type Plan struct {
	Name                PlanType
	MemoryMB            int
	CPUvCores           float32
	MinProjects         int
	MaxProjects         int
	MembersMin          int
	MembersMax          int
	WorkspaceAccess     bool
	BlobFreeGBMin       int
	BlobFreeGBMax       int
	BlobLimitGB         int
	EnterpriseStorageGB int
	DailyAPIRequestsMin int
	DailyAPIRequestsMax int
	AutoRestart         bool
	DailyBackups        bool
	DailySnapshots      bool
	CustomDomain        bool
	EmailNotifs         bool
	MetricsAccess       bool
	ShieldEnabled       bool
	WAFEnabled          bool
	HostingEnabled      bool
	Network10Gbps       bool
	GitHubIntegration   bool
	GitHubActions       bool
	SupportType         string
	ProjectManager      bool
	ExclusiveSupport    bool

	// ✅ Novo campo para limite mínimo por aplicação (em MB)
	PerAppMB int
}

var Plans = map[PlanType]Plan{
	PlanNothing: {
		Name:                PlanNothing,
		MemoryMB:            0,
		CPUvCores:           0,
		MinProjects:         0,
		MaxProjects:         0,
		MembersMin:          0,
		MembersMax:          0,
		WorkspaceAccess:     false,
		BlobFreeGBMin:       0,
		BlobFreeGBMax:       0,
		BlobLimitGB:         0,
		EnterpriseStorageGB: 0,
		DailyAPIRequestsMin: 0,
		DailyAPIRequestsMax: 0,
		AutoRestart:         false,
		DailyBackups:        false,
		DailySnapshots:      false,
		CustomDomain:        false,
		EmailNotifs:         false,
		MetricsAccess:       false,
		ShieldEnabled:       false,
		WAFEnabled:          false,
		HostingEnabled:      false,
		Network10Gbps:       false,
		GitHubIntegration:   false,
		GitHubActions:       false,
		SupportType:         "Nenhum",
		ProjectManager:      false,
		ExclusiveSupport:    false,
		PerAppMB:            256, // apenas adicionado
	},
	PlanTest: {
		Name:                PlanTest,
		MemoryMB:            256,
		CPUvCores:           0.5,
		MinProjects:         1,
		MaxProjects:         1,
		MembersMin:          0,
		MembersMax:          0,
		WorkspaceAccess:     false,
		BlobFreeGBMin:       1,
		BlobFreeGBMax:       1,
		BlobLimitGB:         10,
		EnterpriseStorageGB: 0,
		DailyAPIRequestsMin: 21600,
		DailyAPIRequestsMax: 21600,
		AutoRestart:         false,
		DailyBackups:        false,
		DailySnapshots:      false,
		CustomDomain:        false,
		EmailNotifs:         false,
		MetricsAccess:       false,
		ShieldEnabled:       false,
		WAFEnabled:          false,
		HostingEnabled:      false,
		Network10Gbps:       false,
		GitHubIntegration:   false,
		GitHubActions:       false,
		SupportType:         "Nenhum",
		ProjectManager:      false,
		ExclusiveSupport:    false,
		PerAppMB:            256, // apenas adicionado
	},
	PlanBasic: {
		Name:                PlanBasic,
		MemoryMB:            2048,
		CPUvCores:           2,
		MinProjects:         8,
		MaxProjects:         8,
		MembersMin:          0,
		MembersMax:          0,
		WorkspaceAccess:     true,
		BlobFreeGBMin:       15,
		BlobFreeGBMax:       15,
		BlobLimitGB:         40,
		EnterpriseStorageGB: 50,
		DailyAPIRequestsMin: 86400,
		DailyAPIRequestsMax: 86400,
		AutoRestart:         false,
		DailyBackups:        false,
		DailySnapshots:      false,
		CustomDomain:        false,
		EmailNotifs:         true,
		MetricsAccess:       true,
		ShieldEnabled:       false,
		WAFEnabled:          false,
		HostingEnabled:      true,
		Network10Gbps:       false,
		GitHubIntegration:   true,
		GitHubActions:       true,
		SupportType:         "Sem prioridade",
		ProjectManager:      false,
		ExclusiveSupport:    false,
		PerAppMB:            256, // apenas adicionado
	},
	PlanPro: {
		Name:                PlanPro,
		MemoryMB:            4096,
		CPUvCores:           4,
		MinProjects:         16,
		MaxProjects:         32,
		MembersMin:          3,
		MembersMax:          7,
		WorkspaceAccess:     true,
		BlobFreeGBMin:       30,
		BlobFreeGBMax:       100,
		BlobLimitGB:         1024,
		EnterpriseStorageGB: 100,
		DailyAPIRequestsMin: 172800,
		DailyAPIRequestsMax: 345600,
		AutoRestart:         true,
		DailyBackups:        true,
		DailySnapshots:      false,
		CustomDomain:        true,
		EmailNotifs:         true,
		MetricsAccess:       true,
		ShieldEnabled:       true,
		WAFEnabled:          true,
		HostingEnabled:      true,
		Network10Gbps:       false,
		GitHubIntegration:   true,
		GitHubActions:       true,
		SupportType:         "Sem prioridade",
		ProjectManager:      false,
		ExclusiveSupport:    false,
		PerAppMB:            256, // apenas adicionado
	},
	PlanPremium: {
		Name:                PlanPremium,
		MemoryMB:            6144,
		CPUvCores:           6,
		MinProjects:         48,
		MaxProjects:         64,
		MembersMin:          10,
		MembersMax:          15,
		WorkspaceAccess:     true,
		BlobFreeGBMin:       200,
		BlobFreeGBMax:       250,
		BlobLimitGB:         10240,
		EnterpriseStorageGB: 250,
		DailyAPIRequestsMin: 432000,
		DailyAPIRequestsMax: 432000,
		AutoRestart:         true,
		DailyBackups:        true,
		DailySnapshots:      true,
		CustomDomain:        true,
		EmailNotifs:         true,
		MetricsAccess:       true,
		ShieldEnabled:       true,
		WAFEnabled:          true,
		HostingEnabled:      true,
		Network10Gbps:       true,
		GitHubIntegration:   true,
		GitHubActions:       true,
		SupportType:         "Suporte Premium",
		ProjectManager:      true,
		ExclusiveSupport:    true,
		PerAppMB:            256, // apenas adicionado
	},
	PlanEnterprise: {
		Name:                PlanEnterprise,
		MemoryMB:            10240,
		CPUvCores:           10,
		MinProjects:         128,
		MaxProjects:         4096,
		MembersMin:          15,
		MembersMax:          20,
		WorkspaceAccess:     true,
		BlobFreeGBMin:       250,
		BlobFreeGBMax:       250,
		BlobLimitGB:         1048576,
		EnterpriseStorageGB: 1000,
		DailyAPIRequestsMin: 691200,
		DailyAPIRequestsMax: 18432000,
		AutoRestart:         true,
		DailyBackups:        true,
		DailySnapshots:      true,
		CustomDomain:        true,
		EmailNotifs:         true,
		MetricsAccess:       true,
		ShieldEnabled:       true,
		WAFEnabled:          true,
		HostingEnabled:      true,
		Network10Gbps:       true,
		GitHubIntegration:   true,
		GitHubActions:       true,
		SupportType:         "Suporte Empresarial Exclusivo",
		ProjectManager:      true,
		ExclusiveSupport:    true,
		PerAppMB:            256, // apenas adicionado
	},
}

//backend/models/plans.go

//package models
//
//type PlanType string
//
//const (
//	PlanNothing    PlanType = "no-plan"
//	PlanTest       PlanType = "test"
//	PlanBasic      PlanType = "basic"
//	PlanPro        PlanType = "pro"
//	PlanPremium    PlanType = "premium"
//	PlanEnterprise PlanType = "enterprise"
//)
//
//// Este modelo de plano é independente de identificador de usuário.
//// A lógica de acesso e limites é aplicada via username no contexto.
//type Plan struct {
//	Name                PlanType
//	MemoryMB            int
//	CPUvCores           float32
//	MinProjects         int
//	MaxProjects         int
//	MembersMin          int
//	MembersMax          int
//	WorkspaceAccess     bool
//	BlobFreeGBMin       int
//	BlobFreeGBMax       int
//	BlobLimitGB         int
//	EnterpriseStorageGB int
//	DailyAPIRequestsMin int
//	DailyAPIRequestsMax int
//	AutoRestart         bool
//	DailyBackups        bool
//	DailySnapshots      bool
//	CustomDomain        bool
//	EmailNotifs         bool
//	MetricsAccess       bool
//	ShieldEnabled       bool
//	WAFEnabled          bool
//	HostingEnabled      bool
//	Network10Gbps       bool
//	GitHubIntegration   bool
//	GitHubActions       bool
//	SupportType         string
//	ProjectManager      bool
//	ExclusiveSupport    bool
//}
//
//var Plans = map[PlanType]Plan{
//	PlanNothing: {
//		Name:                PlanNothing,
//		MemoryMB:            0,
//		CPUvCores:           0,
//		MinProjects:         0,
//		MaxProjects:         0,
//		MembersMin:          0,
//		MembersMax:          0,
//		WorkspaceAccess:     false,
//		BlobFreeGBMin:       0,
//		BlobFreeGBMax:       0,
//		BlobLimitGB:         0,
//		EnterpriseStorageGB: 0,
//		DailyAPIRequestsMin: 0,
//		DailyAPIRequestsMax: 0,
//		AutoRestart:         false,
//		DailyBackups:        false,
//		DailySnapshots:      false,
//		CustomDomain:        false,
//		EmailNotifs:         false,
//		MetricsAccess:       false,
//		ShieldEnabled:       false,
//		WAFEnabled:          false,
//		HostingEnabled:      false,
//		Network10Gbps:       false,
//		GitHubIntegration:   false,
//		GitHubActions:       false,
//		SupportType:         "Nenhum",
//		ProjectManager:      false,
//		ExclusiveSupport:    false,
//	},
//	PlanTest: {
//		Name:                PlanTest,
//		MemoryMB:            512,
//		CPUvCores:           0.5,
//		MinProjects:         2,
//		MaxProjects:         2,
//		MembersMin:          0,
//		MembersMax:          0,
//		WorkspaceAccess:     false,
//		BlobFreeGBMin:       1,
//		BlobFreeGBMax:       1,
//		BlobLimitGB:         10,
//		EnterpriseStorageGB: 0,
//		DailyAPIRequestsMin: 21600,
//		DailyAPIRequestsMax: 21600,
//		AutoRestart:         false,
//		DailyBackups:        false,
//		DailySnapshots:      false,
//		CustomDomain:        false,
//		EmailNotifs:         false,
//		MetricsAccess:       false,
//		ShieldEnabled:       false,
//		WAFEnabled:          false,
//		HostingEnabled:      false,
//		Network10Gbps:       false,
//		GitHubIntegration:   false,
//		GitHubActions:       false,
//		SupportType:         "Nenhum",
//		ProjectManager:      false,
//		ExclusiveSupport:    false,
//	},
//	PlanBasic: {
//		Name:                PlanBasic,
//		MemoryMB:            2048,
//		CPUvCores:           2,
//		MinProjects:         8,
//		MaxProjects:         8,
//		MembersMin:          0,
//		MembersMax:          0,
//		WorkspaceAccess:     true,
//		BlobFreeGBMin:       15,
//		BlobFreeGBMax:       15,
//		BlobLimitGB:         40,
//		EnterpriseStorageGB: 50,
//		DailyAPIRequestsMin: 86400,
//		DailyAPIRequestsMax: 86400,
//		AutoRestart:         false,
//		DailyBackups:        false,
//		DailySnapshots:      false,
//		CustomDomain:        false,
//		EmailNotifs:         true,
//		MetricsAccess:       true,
//		ShieldEnabled:       false,
//		WAFEnabled:          false,
//		HostingEnabled:      true,
//		Network10Gbps:       false,
//		GitHubIntegration:   true,
//		GitHubActions:       true,
//		SupportType:         "Sem prioridade",
//		ProjectManager:      false,
//		ExclusiveSupport:    false,
//	},
//	PlanPro: {
//		Name:                PlanPro,
//		MemoryMB:            4096,
//		CPUvCores:           4,
//		MinProjects:         16,
//		MaxProjects:         32,
//		MembersMin:          3,
//		MembersMax:          7,
//		WorkspaceAccess:     true,
//		BlobFreeGBMin:       30,
//		BlobFreeGBMax:       100,
//		BlobLimitGB:         1024,
//		EnterpriseStorageGB: 100,
//		DailyAPIRequestsMin: 172800,
//		DailyAPIRequestsMax: 345600,
//		AutoRestart:         true,
//		DailyBackups:        true,
//		DailySnapshots:      false,
//		CustomDomain:        true,
//		EmailNotifs:         true,
//		MetricsAccess:       true,
//		ShieldEnabled:       true,
//		WAFEnabled:          true,
//		HostingEnabled:      true,
//		Network10Gbps:       false,
//		GitHubIntegration:   true,
//		GitHubActions:       true,
//		SupportType:         "Sem prioridade",
//		ProjectManager:      false,
//		ExclusiveSupport:    false,
//	},
//	PlanPremium: {
//		Name:                PlanPremium,
//		MemoryMB:            6144,
//		CPUvCores:           6,
//		MinProjects:         48,
//		MaxProjects:         64,
//		MembersMin:          10,
//		MembersMax:          15,
//		WorkspaceAccess:     true,
//		BlobFreeGBMin:       200,
//		BlobFreeGBMax:       250,
//		BlobLimitGB:         10240,
//		EnterpriseStorageGB: 250,
//		DailyAPIRequestsMin: 432000,
//		DailyAPIRequestsMax: 432000,
//		AutoRestart:         true,
//		DailyBackups:        true,
//		DailySnapshots:      true,
//		CustomDomain:        true,
//		EmailNotifs:         true,
//		MetricsAccess:       true,
//		ShieldEnabled:       true,
//		WAFEnabled:          true,
//		HostingEnabled:      true,
//		Network10Gbps:       true,
//		GitHubIntegration:   true,
//		GitHubActions:       true,
//		SupportType:         "Suporte Premium",
//		ProjectManager:      true,
//		ExclusiveSupport:    true,
//	},
//	PlanEnterprise: {
//		Name:                PlanEnterprise,
//		MemoryMB:            10240,
//		CPUvCores:           10,
//		MinProjects:         128,
//		MaxProjects:         4096,
//		MembersMin:          15,
//		MembersMax:          20,
//		WorkspaceAccess:     true,
//		BlobFreeGBMin:       250,
//		BlobFreeGBMax:       250,
//		BlobLimitGB:         1048576,
//		EnterpriseStorageGB: 1000,
//		DailyAPIRequestsMin: 691200,
//		DailyAPIRequestsMax: 18432000,
//		AutoRestart:         true,
//		DailyBackups:        true,
//		DailySnapshots:      true,
//		CustomDomain:        true,
//		EmailNotifs:         true,
//		MetricsAccess:       true,
//		ShieldEnabled:       true,
//		WAFEnabled:          true,
//		HostingEnabled:      true,
//		Network10Gbps:       true,
//		GitHubIntegration:   true,
//		GitHubActions:       true,
//		SupportType:         "Suporte Empresarial Exclusivo",
//		ProjectManager:      true,
//		ExclusiveSupport:    true,
//	},
//}
