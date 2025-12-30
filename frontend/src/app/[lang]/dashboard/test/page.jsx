//frontend/src/app/[lang]/dashboard/page.jsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from "../../../../components/Recycles/Header";
import EntryPointChooser from "../../../../components/EntryPointChooser";
import AppActions from "../../../../components/AppActions";
import { messages } from "../../upload/messages";
import '../../../styles/virtus.css';
//import '../../styles/styles.css';
//import '../../styles/globais.css';
import { hasPermission } from '@/utils/permissions';


function getLang(pathname) {
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'en';
}

function PlanOfferModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
        <p className="mb-4 text-gray-700">
          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
          banco de dados, snapshots e ambientes dedicados.
        </p>
        <div className="flex justify-end space-x-3">
          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLang(pathname);
  const dict = messages[lang];

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [plan, setPlan] = useState("no-plan");
  const [canDeploy, setCanDeploy] = useState(true);
  const [status, setStatus] = useState("");
  const [appID, setAppID] = useState("");
  const [entryPoints, setEntryPoints] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [planLoaded, setPlanLoaded] = useState(false);

//   const statusColor = {
//  online: 'bg-green-500',
//  offline: 'bg-red-500',
//  paused: 'bg-yellow-500',
//  unknown: 'bg-gray-500',
//};
//
//const colorClass = statusColor[statusKey] || 'bg-gray-500';

    useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
        const data = await res.json();

        if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
          router.replace(`/${lang}/signin`);
          return;
        }

        setUsername(data.username);
        setRole(data.role);
        setLoading(false);
      } catch {
        router.replace(`/${lang}/signin`);
      }
    };

    const fetchUserStatus = async () => {
      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setPlan(data.plan || "no-plan");
      setCanDeploy(data.canDeploy);
      setPlanLoaded(true); // ✅ agora sabemos que o plano foi carregado
    };

    //const fetchUserStatus = async () => {
    //  const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
    //  const data = await res.json();
    //  setPlan(data.plan || "no-plan");
    //  setCanDeploy(data.canDeploy);
    //};

    const fetchAppsByStatus = async () => {
      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
      const data = await res.json();

      const removeDuplicates = (apps) => {
        if (!Array.isArray(apps)) return [];
        const seen = new Set();
        return apps.filter(app => {
          const key = app.ID || app.ContainerName;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      setAppsByStatus({
        active: removeDuplicates(data.active),
        stopped: removeDuplicates(data.stopped),
        backups: removeDuplicates(data.backups),
      });
    };

    checkSession().then(() => {
      fetchUserStatus();
      fetchAppsByStatus();
    });

    const interval = setInterval(() => {
      fetchUserStatus();
      fetchAppsByStatus();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

   // ⏳ Enquanto verifica sessão, não renderiza nada
  useEffect(() => {
    if (!loading && canDeploy && showUpgradeModal) {
      setShowUpgradeModal(false);
      setStatus("");
    }
  }, [loading, canDeploy, showUpgradeModal]);

  if (loading) return null;

  //useEffect(() => {
  //  if (!loading && canDeploy && showUpgradeModal) {
  //    setShowUpgradeModal(false);
  //    setStatus("");
  //  }
  //}, [loading, canDeploy, showUpgradeModal]);

  //if (loading) return null;

    const triggerFileInput = async () => {
    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
    const data = await resStatus.json();
    setPlan(data.plan || "no-plan");
    setCanDeploy(data.canDeploy);

    if (!data.canDeploy) {
      setShowUpgradeModal(true);
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
    const data = await resStatus.json();
    setPlan(data.plan || "no-plan");
    setCanDeploy(data.canDeploy);

    if (!data.canDeploy) {
      setShowUpgradeModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);

    try {
      const res = await fetch(`/api/upload?plan=${data.plan}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const contentType = res.headers.get("content-type") || "";
      let result = {};

      if (contentType.includes("application/json")) {
        result = await res.json();
      } else {
        const raw = await res.text();
        throw new Error(raw || "Resposta inválida do servidor.");
      }

      if (res.ok) {
        setStatus(`✅ ${dict.success}`);
        if (result.app?.id) {
          setAppID(result.app.ID);
          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
          const entries = await resEntries.json();
          setEntryPoints(entries);
        }
      } else if (res.status === 403 && result.error) {
        const details = result.details ? `\n${result.details}` : "";
        setStatus(`❌ ${result.error}${details}`);
      } else {
        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
      }
    } catch (err) {
      setStatus(`🚫 Erro: ${err.message}`);
    } finally {
      event.target.value = "";
    }
  };

  const handleAction = async (type, app) => {
    const id = app.name || app.ID || app.ContainerName;
    if (!id) {
      setStatus(`🚫 Erro: aplicação sem identificador válido`);
      return;
    }

    try {
      const res = await fetch(`/api/app/${type}?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok) {
        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
      } else {
        setStatus(`❌ ${result.error || "Falha na ação."}`);
      }
    } catch (err) {
      setStatus(`🚫 Erro: ${err.message}`);
    }
  };

  const statusLabels = {
    active: "🟢 Aplicações online",
    stopped: "⏸️ Aplicações pausadas",
    backups: "📦 Backups disponíveis",
  };

return (
  <div
    style={{
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundImage: "url('/assets/grid-virtus-600.svg')", // ou o grid que você usa
      backgroundSize: "cover",
      backgroundRepeat: "repeat",
    }}
  >
    <Header />

    {/* 🔔 Banner de incentivo ao upgrade */}
    <div
      style={{
        backgroundColor: "var(--yellow-400)",
        color: "var(--color-virtus-900)",
        textAlign: "center",
        padding: "0.75rem",
        fontSize: "0.875rem",
        fontWeight: "500",
      }}
    >
      Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
      <button
        onClick={() => router.push(`/${lang}/upgrade`)}
        style={{
          marginLeft: "1rem",
          backgroundColor: "var(--background)",
          color: "var(--yellow-300)",
          padding: "0.5rem 0.75rem",
          borderRadius: "0.375rem",
        }}
      >
        Ver planos
      </button>
    </div>

    <main style={{ flex: 1, padding: "1.5rem" }}>
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          backgroundColor: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: "0.5rem",
          boxShadow: "0 0 4px rgba(0,0,0,0.05)",
          padding: "2rem",
          transition: "opacity 0.3s ease",
          opacity: 1,
        }}
      >
        {/* 🧠 Cabeçalho do dashboard */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700" }}>Área de trabalho</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-color-secondary)" }}>
              Usuário: <span style={{ fontWeight: "500" }}>{loading ? "..." : username}</span>
              {planLoaded && (
              <> | Plano: <span style={{ fontWeight: "500" }}>{plan}</span></>
              )}
            </p>
          </div>
          <button
            onClick={triggerFileInput}
            style={{
              backgroundColor: "var(--success)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontWeight: "600",
            }}
          >
            + Nova aplicação
          </button>
          <input
            type="file"
            accept=".zip"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        {/* 🔍 Filtro de status + botão de upgrade */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              backgroundColor: "var(--color-virtus-700)",
              color: "white",
              border: "1px solid var(--border-secondary)",
              borderRadius: "0.375rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem"
            }}
          >
            <option value="all">Todas</option>
            <option value="active">Ativas</option>
            <option value="stopped">Pausadas</option>
            <option value="backups">Backups</option>
          </select>
          <button
            onClick={() => router.push(`/${lang}/upgrade`)}
            style={{
              fontSize: "0.875rem",
              color: "var(--ring)",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            Upgrade de plano
          </button>
        </div>

        {/* 📦 Painel de aplicações */}
        <div style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border-secondary)",
          borderRadius: "0.5rem",
          padding: "1.5rem"
        }}>
          {status && (
            <p style={{
              color: "var(--text-color-muted)",
              whiteSpace: "pre-line",
              textAlign: "center"
            }}>
              {status}
            </p>
          )}
          {entryPoints.length > 0 && appID && (
            <EntryPointChooser entries={entryPoints} appID={appID} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {Object.entries(appsByStatus).map(([key, apps]) => {
              if (filter !== "all" && key !== filter) return null;

              return (
                <div key={key}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                    {statusLabels[key]}
                  </h2>
                  {!apps || apps.length === 0 ? (
                    <p style={{ color: "var(--text-color-muted)" }}>Nenhuma aplicação encontrada.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {apps.map((app, index) => {
                        const statusKey = app.status?.toLowerCase?.() || "unknown";
                        const statusClass = `animate-ping status-${statusKey}`;
                        const uniqueKey = `${key}-${app.ID || index}`;

                        return (
                          <div
                            key={uniqueKey}
                            className="app-item"
                            onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
                            style={{
                              backgroundColor: "var(--color-virtus-700)",
                              padding: "1rem",
                              borderRadius: "0.5rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              cursor: "pointer",
                              transition: "background-color 0.2s ease"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-virtus-600)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-virtus-700)"}
                          >
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "1.125rem", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span className="relative block size-2.5 rounded-full bg-green-500">
                                  <span className="absolute size-2.5 rounded-full bg-inherit animate-ping"></span>
                                  </span>
                                  {app.ID}
                                  </span>
                                  <span style={{ color: "var(--success)", fontSize: "0.875rem", fontWeight: "600" }}>
                                    {app.name || app.ID}
                                    </span>
                                    </div>
                            <AppActions app={app} onAction={handleAction} lang={lang} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>

    {showUpgradeModal && (
      <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
    )}
  </div>
);
}

//<div>
//            <h1 style={{ fontSize: "1.875rem", fontWeight: "700" }}>Área de trabalho</h1>
//            <p style={{ fontSize: "0.875rem", color: "var(--text-color-secondary)" }}>
//              Usuário: <span style={{ fontWeight: "500" }}>{loading ? "..." : username}</span> | Plano:{" "}
//              <span style={{ fontWeight: "500" }}>{loading ? "..." : plan}</span>
//            </p>
//          </div>

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "../upload/messages";
//import '../../styles/virtus.css';
////import '../../styles/styles.css';
////import '../../styles/globais.css';
//import { hasPermission } from '@/utils/permissions';
//
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true);
//  const fileInputRef = useRef(null);
////   const statusColor = {
////  online: 'bg-green-500',
////  offline: 'bg-red-500',
////  paused: 'bg-yellow-500',
////  unknown: 'bg-gray-500',
////};
////
////const colorClass = statusColor[statusKey] || 'bg-gray-500';
//
//    useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//          router.replace(`/${lang}/signin`);
//          return;
//        }
//
//        setUsername(data.username);
//        setRole(data.role);
//        setLoading(false);
//      } catch {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return [];
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    }, 6000);
//
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [loading, canDeploy, showUpgradeModal]);
//
//  //if (loading) return null;
//
//    const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//return (
//  <div style={{ backgroundColor: "var(--background)", color: "var(--foreground)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
//    <Header />
//
//    {/* 🔔 Banner de incentivo ao upgrade */}
//    <div style={{
//      backgroundColor: "var(--yellow-400)",
//      color: "var(--color-virtus-900)",
//      textAlign: "center",
//      padding: "0.75rem",
//      fontSize: "0.875rem",
//      fontWeight: "500"
//    }}>
//      Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//      <button
//        onClick={() => router.push(`/${lang}/upgrade`)}
//        style={{
//          marginLeft: "1rem",
//          backgroundColor: "var(--background)",
//          color: "var(--yellow-300)",
//          padding: "0.5rem 0.75rem",
//          borderRadius: "0.375rem"
//        }}
//      >
//        Ver planos
//      </button>
//    </div>
//
//    <main style={{ flex: 1, padding: "1.5rem" }}>
//      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
//        {/* 🧠 Cabeçalho do dashboard */}
//        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//          <div>
//  <h1 style={{ fontSize: "1.875rem", fontWeight: "700" }}>Área de trabalho</h1>
//  <p style={{ fontSize: "0.875rem", color: "var(--text-color-secondary)" }}>
//    Usuário: <span style={{ fontWeight: "500" }}>{loading ? '...' : username}</span> | Plano: <span style={{ fontWeight: "500" }}>{loading ? '...' : plan}</span>
//  </p>
//</div>
//          <button
//            onClick={triggerFileInput}
//            style={{
//              backgroundColor: "var(--success)",
//              color: "white",
//              padding: "0.5rem 1rem",
//              borderRadius: "0.375rem",
//              fontWeight: "600"
//            }}
//          >
//            + Nova aplicação
//          </button>
//          <input
//            type="file"
//            accept=".zip"
//            ref={fileInputRef}
//            onChange={handleFileSelect}
//            style={{ display: "none" }}
//          />
//        </div>
//
//        {/* 🔍 Filtro de status + botão de upgrade */}
//        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//          <select
//            value={filter}
//            onChange={(e) => setFilter(e.target.value)}
//            style={{
//              backgroundColor: "var(--color-virtus-700)",
//              color: "white",
//              border: "1px solid var(--border-secondary)",
//              borderRadius: "0.375rem",
//              padding: "0.5rem 0.75rem",
//              fontSize: "0.875rem"
//            }}
//          >
//            <option value="all">Todas</option>
//            <option value="active">Ativas</option>
//            <option value="stopped">Pausadas</option>
//            <option value="backups">Backups</option>
//          </select>
//          <button
//            onClick={() => router.push(`/${lang}/upgrade`)}
//            style={{
//              fontSize: "0.875rem",
//              color: "var(--ring)",
//              textDecoration: "underline",
//              background: "none",
//              border: "none",
//              cursor: "pointer"
//            }}
//          >
//            Upgrade de plano
//          </button>
//        </div>
//
//        {/* 📦 Painel de aplicações */}
//        <div style={{
//          backgroundColor: "var(--card)",
//          border: "1px solid var(--border-secondary)",
//          borderRadius: "0.5rem",
//          padding: "1.5rem"
//        }}>
//          {status && (
//            <p style={{
//              color: "var(--text-color-muted)",
//              whiteSpace: "pre-line",
//              textAlign: "center"
//            }}>
//              {status}
//            </p>
//          )}
//          {entryPoints.length > 0 && appID && (
//            <EntryPointChooser entries={entryPoints} appID={appID} />
//          )}
//          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
//            {Object.entries(appsByStatus).map(([key, apps]) => {
//              if (filter !== "all" && key !== filter) return null;
//
//              return (
//                <div key={key}>
//                  <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
//                    {statusLabels[key]}
//                  </h2>
//                  {!apps || apps.length === 0 ? (
//                    <p style={{ color: "var(--text-color-muted)" }}>Nenhuma aplicação encontrada.</p>
//                  ) : (
//                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                      {apps.map((app, index) => {
//                        const statusKey = app.status?.toLowerCase?.() || "unknown";
//                        const statusClass = `animate-ping status-${statusKey}`;
//                        const uniqueKey = `${key}-${app.ID || index}`;
//
//                        return (
//                          <div
//                            key={uniqueKey}
//                            className="app-item"
//                            onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            style={{
//                              backgroundColor: "var(--color-virtus-700)",
//                              padding: "1rem",
//                              borderRadius: "0.5rem",
//                              display: "flex",
//                              justifyContent: "space-between",
//                              alignItems: "center",
//                              cursor: "pointer",
//                              transition: "background-color 0.2s ease"
//                            }}
//                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-virtus-600)"}
//                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-virtus-700)"}
//                          >
//                            <div style={{ display: "flex", flexDirection: "column" }}>
//                              <span style={{ fontSize: "1.125rem", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "0.5rem" }}>
//                                <span className="relative block size-2.5 rounded-full bg-green-500">
//                                  <span className="absolute size-2.5 rounded-full bg-inherit animate-ping"></span>
//                                  </span>
//                                  {app.ID}
//                                  </span>
//                                  <span style={{ color: "var(--success)", fontSize: "0.875rem", fontWeight: "600" }}>
//                                    {app.name || app.ID}
//                                    </span>
//                                    </div>
//                            <AppActions app={app} onAction={handleAction} lang={lang} />
//                          </div>
//                        );
//                      })}
//                    </div>
//                  )}
//                </div>
//              );
//            })}
//          </div>
//        </div>
//      </div>
//    </main>
//
//    {showUpgradeModal && (
//      <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//    )}
//  </div>
//);
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import DashboardHeader from "../../../components/DashboardHeader";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "../upload/messages";
//import '../../styles/virtus.css';
////import '../../styles/styles.css';
////import '../../styles/globais.css';
//import { hasPermission } from '@/utils/permissions';
//
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true);
//  const fileInputRef = useRef(null);
//  
//    useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//          router.replace(`/${lang}/signin`);
//          return;
//        }
//
//        setUsername(data.username);
//        setRole(data.role);
//        setLoading(false);
//      } catch {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return [];
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    }, 6000);
//
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [loading, canDeploy, showUpgradeModal]);
//
//  if (loading) return null;
//
//    const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//return (
//  <div>
//    <DashboardHeader />
//    <div className="relative min-h-[calc(100dvh-80px)] w-full bg-background flex-1 bg-grid-virtus-600/[0.375] pt-8 pb-12">
//      <div className="container flex flex-col gap-4">
//        <div className="space-y-2">
//          <div className="flex flex-col flex-wrap justify-between gap-4 lg:flex-row lg:items-center">
//            <div className="flex flex-1 flex-col gap-1">
//              <span className="font-medium text-secondary text-xs">Área de trabalho</span>
//              <button
//                className="group flex w-fit max-w-120 items-center justify-between gap-4 rounded-md text-left outline-hidden hover:cursor-pointer"
//                id="workspace-changer"
//                type="button"
//              >
//                <div className="flex flex-col gap-0 truncate sm:max-w-90">
//                  <div className="flex items-center gap-2">
//                    <span className="flex items-center gap-2 truncate font-semibold text-lg">israelmacyel</span>
//                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:bg-blue-800 focus-visible:ring-blue-700 h-5 rounded-sm px-2 text-[10px]/5 uppercase bg-blue-600">Sua conta</span>
//                  </div>
//                  <span className="truncate text-secondary text-xs">85d2ef4cc323bf5a5947c76f462b074a57d560a0</span>
//                </div>
//                <div className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-primary outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-9 font-normal text-sm px-2.5 py-2">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                  </svg>
//                </div>
//              </button>
//            </div>
//                        <div className="flex flex-1 flex-col justify-end gap-2 md:flex-row md:items-center lg:mt-4">
//              <div className="flex gap-2">
//                <span
//                  className="items-center bg-linear-to-b from-[rgba(var(--bg-color),0.25)] to-[rgba(var(--bg-color),0.075)] font-medium text-nowrap text-primary capitalize select-none hover:bg-virtus-800 h-10 px-3 py-1 text-sm xs:flex hidden rounded-md"
//                  style={{ '--bg-color': '125,125,125' }}
//                >
//                  Hobby (2)
//                </span>
//                <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
//                  <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
//                    <p className="flex justify-between gap-4 text-nowrap leading-none">
//                      <span className="text-muted text-xs">1.280 MB</span>
//                      <span className="text-nowrap text-muted text-xs">768 MB disponível de 2.048 MB</span>
//                    </p>
//                    <div className="relative h-1.5 w-full overflow-hidden rounded-full">
//                      <div className="absolute inset-0 h-full rounded-full" style={{ backgroundColor: 'rgb(227, 190, 32)', width: '62.5%' }} />
//                      <div className="size-full rounded-full bg-virtus-400/30" />
//                    </div>
//                  </div>
//                </div>
//              </div>
//
//              <div className="flex flex-1 items-end gap-2">
//                <button className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-green-600">
//                    <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48Z" />
//                  </svg>
//                  Renovar
//                </button>
//
//                <button className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer border-virtus-500 bg-transparent shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-1">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4 text-blue-600">
//                    <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z" />
//                  </svg>
//                  Upgrade
//                </button>
//              </div>
//            </div>
//          </div>
//        </div>
//                <div className="relative bg-background">
//          <div className="flex flex-col gap-y-1.5 rounded-md p-4 border border-yellow-400 bg-yellow-800/5">
//            <div className="flex items-center gap-2.5 md:gap-3.5">
//              <div className="flex size-5 items-center justify-center text-yellow-400">
//                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z" />
//                </svg>
//              </div>
//              <h2 className="text-sm font-medium text-yellow-400">Seu plano está quase acabando!</h2>
//            </div>
//            <div className="flex flex-col items-end gap-2 md:ml-8.5 md:flex-row md:gap-4">
//              <span className="block h-full w-full self-start text-sm text-secondary">
//                O seu plano termina em <span className="font-bold">30 de outubro de 2025</span>, após a expiração, seus serviços serão interrompidos.
//                Isso significa que suas aplicações não estarão mais disponíveis até que o plano seja renovado.
//                Para garantir o funcionamento contínuo e evitar qualquer interrupção, recomendamos que você renove ou atualize seu plano o mais rápido possível.
//              </span>
//              <button className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all hover:cursor-pointer bg-white/4 text-link hover:bg-white/5 hover:underline focus-visible:ring-ring/50 h-10 px-4 max-md:-ml-10 w-full md:w-fit">
//                Renovar plano
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
//                </svg>
//              </button>
//            </div>
//          </div>
//          <button className="group/button inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary outline-none transition-all hover:cursor-pointer focus-visible:ring-ring/50 h-8 text-sm absolute top-2.5 right-2.5 px-2 hover:bg-white/5">
//            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
//              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
//            </svg>
//          </button>
//        </div>
//                <div className="flex min-h-[512px] flex-col gap-3">
//          <div className="flex flex-col gap-2 md:flex-row">
//            <div className="group relative flex max-h-10 min-h-10 items-center overflow-hidden rounded-md border border-virtus-600 bg-input text-sm transition-colors cursor-text flex-auto shrink-0">
//              <input
//                className="z-5 order-1 flex size-full bg-transparent px-4 outline-hidden transition-all placeholder:text-semi-muted disabled:cursor-not-allowed disabled:opacity-50"
//                placeholder="Pesquisar em aplicações..."
//                value=""
//              />
//              <div className="z-5 order-0 ml-4 flex h-full items-center text-semi-muted">
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
//                </svg>
//              </div>
//            </div>
//
//            <div className="flex flex-wrap gap-2">
//              <button className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4 flex-auto">
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z" />
//                </svg>
//                Organizar
//                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
//                </svg>
//              </button>
//
//              <button className="group/button relative inline-flex min-w-fit items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4 w-52 flex-auto">
//                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
//                  <path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z" />
//                </svg>
//                Nova aplicação
//                <div className="-translate-y-1/2 absolute top-1/2 h-[200%] w-15 rotate-25 animate-[shine_3.5s_ease-in-out_infinite] bg-white/10 blur-[10px]" />
//              </button>
//            </div>
//          </div>
//
//          {/* Aqui você pode mapear suas aplicações dinamicamente */}
//          {/* Exemplo: <ApplicationCard app={app} /> */}
//
//          <div className="space-y-2">
//            <div className="flex w-full grid-cols-3 justify-between gap-4">
//              <div>
//                <button disabled className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4">
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z" />
//                  </svg>
//                  <span className="hidden md:block">Anterior</span>
//                </button>
//              </div>
//
//              <div className="flex flex-col items-center">
//                <div className="flex justify-center gap-x-1.5">
//                  <button className="group/button inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium text-primary text-sm outline-none transition-all bg-virtus-600 focus-visible:ring-blue-700 relative rounded-xl h-10 w-10 p-0 hover:bg-virtus-700">
//                    1
//                  </button>
//                </div>
//              </div>
//
//              <div className="place-items-end">
//                <button disabled className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all bg-background shadow-[0_0_0_1px] shadow-border hover:bg-virtus-600 focus-visible:ring-blue-700 h-10 px-4">
//                  <span className="hidden md:block">Próximo</span>
//                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256">
//                    <path d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z" />
//                  </svg>
//                </button>
//              </div>
//            </div>
//
//            <div className="text-right">
//              <span className="text-muted text-xs">Total de 1 aplicações, 1 estão online e 0 estão offline.</span>
//            </div>
//          </div>
//        </div>
//      </div>
//    </div>
//    </div>
//  );
//}


//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "../upload/messages";
//import '../../styles/virtus.css';
////import '../../styles/styles.css';
////import '../../styles/globais.css';
//import { hasPermission } from '@/utils/permissions';
//
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true);
//  const fileInputRef = useRef(null);
//  
//    useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//          router.replace(`/${lang}/signin`);
//          return;
//        }
//
//        setUsername(data.username);
//        setRole(data.role);
//        setLoading(false);
//      } catch {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return [];
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    }, 6000);
//
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [loading, canDeploy, showUpgradeModal]);
//
//  if (loading) return null;
//
//    const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//return (
//  <div style={{ backgroundColor: "var(--background)", color: "var(--foreground)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
//    <Header />
//
//    {/* 🔔 Banner de incentivo ao upgrade */}
//    <div style={{
//      backgroundColor: "var(--yellow-400)",
//      color: "var(--color-virtus-900)",
//      textAlign: "center",
//      padding: "0.75rem",
//      fontSize: "0.875rem",
//      fontWeight: "500"
//    }}>
//      Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//      <button
//        onClick={() => router.push(`/${lang}/upgrade`)}
//        style={{
//          marginLeft: "1rem",
//          backgroundColor: "var(--background)",
//          color: "var(--yellow-300)",
//          padding: "0.5rem 0.75rem",
//          borderRadius: "0.375rem"
//        }}
//      >
//        Ver planos
//      </button>
//    </div>
//
//    <main style={{ flex: 1, padding: "1.5rem" }}>
//      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
//        {/* 🧠 Cabeçalho do dashboard */}
//        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//          <div>
//            <h1 style={{ fontSize: "1.875rem", fontWeight: "700" }}>Área de trabalho</h1>
//            <p style={{ fontSize: "0.875rem", color: "var(--text-color-secondary)" }}>
//              Usuário: <span style={{ fontWeight: "500" }}>{username}</span> | Plano: <span style={{ fontWeight: "500" }}>{plan}</span>
//            </p>
//          </div>
//          <button
//            onClick={triggerFileInput}
//            style={{
//              backgroundColor: "var(--success)",
//              color: "white",
//              padding: "0.5rem 1rem",
//              borderRadius: "0.375rem",
//              fontWeight: "600"
//            }}
//          >
//            + Nova aplicação
//          </button>
//          <input
//            type="file"
//            accept=".zip"
//            ref={fileInputRef}
//            onChange={handleFileSelect}
//            style={{ display: "none" }}
//          />
//        </div>
//
//        {/* 🔍 Filtro de status + botão de upgrade */}
//        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//          <select
//            value={filter}
//            onChange={(e) => setFilter(e.target.value)}
//            style={{
//              backgroundColor: "var(--color-virtus-700)",
//              color: "white",
//              border: "1px solid var(--border-secondary)",
//              borderRadius: "0.375rem",
//              padding: "0.5rem 0.75rem",
//              fontSize: "0.875rem"
//            }}
//          >
//            <option value="all">Todas</option>
//            <option value="active">Ativas</option>
//            <option value="stopped">Pausadas</option>
//            <option value="backups">Backups</option>
//          </select>
//          <button
//            onClick={() => router.push(`/${lang}/upgrade`)}
//            style={{
//              fontSize: "0.875rem",
//              color: "var(--ring)",
//              textDecoration: "underline",
//              background: "none",
//              border: "none",
//              cursor: "pointer"
//            }}
//          >
//            Upgrade de plano
//          </button>
//        </div>
//
//        {/* 📦 Painel de aplicações */}
//        <div style={{
//          backgroundColor: "var(--card)",
//          border: "1px solid var(--border-secondary)",
//          borderRadius: "0.5rem",
//          padding: "1.5rem"
//        }}>
//          {status && (
//            <p style={{
//              color: "var(--text-color-muted)",
//              whiteSpace: "pre-line",
//              textAlign: "center"
//            }}>
//              {status}
//            </p>
//          )}
//          {entryPoints.length > 0 && appID && (
//            <EntryPointChooser entries={entryPoints} appID={appID} />
//          )}
//          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
//            {Object.entries(appsByStatus).map(([key, apps]) => {
//              if (filter !== "all" && key !== filter) return null;
//
//              return (
//                <div key={key}>
//                  <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
//                    {statusLabels[key]}
//                  </h2>
//                  {!apps || apps.length === 0 ? (
//                    <p style={{ color: "var(--text-color-muted)" }}>Nenhuma aplicação encontrada.</p>
//                  ) : (
//                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                      {apps.map((app, index) => {
//                        const statusKey = app.status?.toLowerCase?.() || "unknown";
//                        const statusClass = `status-dot status-${statusKey}`;
//                        const uniqueKey = `${key}-${app.ID || index}`;
//
//                        return (
//                          <div
//                            key={uniqueKey}
//                            className="app-item"
//                            onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            style={{
//                              backgroundColor: "var(--color-virtus-700)",
//                              padding: "1rem",
//                              borderRadius: "0.5rem",
//                              display: "flex",
//                              justifyContent: "space-between",
//                              alignItems: "center",
//                              cursor: "pointer",
//                              transition: "background-color 0.2s ease"
//                            }}
//                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-virtus-600)"}
//                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-virtus-700)"}
//                          >
//                            <div style={{ display: "flex", flexDirection: "column" }}>
//                              <span style={{ fontSize: "1.125rem", fontFamily: "monospace", display: "flex", alignItems: "center" }}>
//                                <span className={statusClass}></span>
//                                {app.ID}
//                              </span>
//                              <span style={{ color: "var(--success)", fontSize: "0.875rem", fontWeight: "600" }}>
//                                {app.name || app.ID}
//                              </span>
//                            </div>
//
//                            <AppActions app={app} onAction={handleAction} lang={lang} />
//                          </div>
//                        );
//                      })}
//                    </div>
//                  )}
//                </div>
//              );
//            })}
//          </div>
//        </div>
//      </div>
//    </main>
//
//    {showUpgradeModal && (
//      <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//    )}
//  </div>
//);
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "../upload/messages";
//import '../../styles/globais.css';
//import { hasPermission } from '@/utils/permissions'; // ← novo import
//import '../../styles/styles.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true); // ← novo estado
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//  const checkSession = async () => {
//    try {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//
//      if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//        router.replace(`/${lang}/signin`);
//        return;
//      }
//
//      setUsername(data.username);
//      setRole(data.role);
//      setLoading(false);
//    } catch {
//      router.replace(`/${lang}/signin`);
//    }
//  };
//
//  const fetchUserStatus = async () => {
//    const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await res.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//  };
//
//  const fetchAppsByStatus = async () => {
//    const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    const data = await res.json();
//
//    const removeDuplicates = (apps) => {
//      if (!Array.isArray(apps)) return [];
//      const seen = new Set();
//      return apps.filter(app => {
//        const key = app.ID || app.ContainerName;
//        if (seen.has(key)) return false;
//        seen.add(key);
//        return true;
//      });
//    };
//
//    setAppsByStatus({
//      active: removeDuplicates(data.active),
//      stopped: removeDuplicates(data.stopped),
//      backups: removeDuplicates(data.backups),
//    });
//  };
//
//  checkSession().then(() => {
//    fetchUserStatus();
//    fetchAppsByStatus(); // ← já roda ao entrar
//  });
//
//  const interval = setInterval(() => {
//    fetchUserStatus();
//    fetchAppsByStatus(); // ← agora atualiza a lista de apps também
//  }, 6000);
//
//  return () => clearInterval(interval);
//}, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//      }
//    }, [loading, canDeploy, showUpgradeModal]);
//
//    if (loading) return null;
//  //if (loading) return null;
//
//  //useEffect(() => {
//  //  if (canDeploy && showUpgradeModal) {
//  //    setShowUpgradeModal(false);
//  //    setStatus("");
//  //  }
//  //}, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//  
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//  
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`;
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              <AppActions app={app} onAction={handleAction} lang={lang} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//import { hasPermission } from '@/utils/permissions'; // ← novo import
//import '../../styles/styles.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true); // ← novo estado
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//  const checkSession = async () => {
//    try {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//
//      if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//        router.replace(`/${lang}/signin`);
//        return;
//      }
//
//      setUsername(data.username);
//      setRole(data.role);
//      setLoading(false);
//    } catch {
//      router.replace(`/${lang}/signin`);
//    }
//  };
//
//  const fetchUserStatus = async () => {
//    const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await res.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//  };
//
//  const fetchAppsByStatus = async () => {
//    const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    const data = await res.json();
//
//    const removeDuplicates = (apps) => {
//      if (!Array.isArray(apps)) return [];
//      const seen = new Set();
//      return apps.filter(app => {
//        const key = app.ID || app.ContainerName;
//        if (seen.has(key)) return false;
//        seen.add(key);
//        return true;
//      });
//    };
//
//    setAppsByStatus({
//      active: removeDuplicates(data.active),
//      stopped: removeDuplicates(data.stopped),
//      backups: removeDuplicates(data.backups),
//    });
//  };
//
//  checkSession().then(() => {
//    fetchUserStatus();
//    fetchAppsByStatus(); // ← já roda ao entrar
//  });
//
//  const interval = setInterval(() => {
//    fetchUserStatus();
//    fetchAppsByStatus(); // ← agora atualiza a lista de apps também
//  }, 6000);
//
//  return () => clearInterval(interval);
//}, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//      }
//    }, [loading, canDeploy, showUpgradeModal]);
//
//    if (loading) return null;
//  //if (loading) return null;
//
//  //useEffect(() => {
//  //  if (canDeploy && showUpgradeModal) {
//  //    setShowUpgradeModal(false);
//  //    setStatus("");
//  //  }
//  //}, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//  
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//  
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`;
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              <AppActions app={app} onAction={handleAction} lang={lang} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}


  // USER EFFECT ANTERIOR QUE FUNCIONAVA PARA LISTAR AS APLICAÇÕES MAS APENAS POR F5 //

  //useEffect(() => {
  //  const checkSession = async () => {
  //    try {
  //      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
  //      const data = await res.json();
  //
  //      if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
  //        router.replace(`/${lang}/signin`);
  //        return;
  //      }
  //
  //      setUsername(data.username);
  //      setRole(data.role);
  //      setLoading(false); // ← sessão válida
  //    } catch {
  //      router.replace(`/${lang}/signin`);
  //    }
  //  };
  //
  //  const fetchUserStatus = async () => {
  //    const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
  //    const data = await res.json();
  //    setPlan(data.plan || "no-plan");
  //    setCanDeploy(data.canDeploy);
  //  };
  //
  //  const fetchAppsByStatus = async () => {
  //    const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
  //    const data = await res.json();
  //
  //    const removeDuplicates = (apps) => {
  //      if (!Array.isArray(apps)) return [];
  //      const seen = new Set();
  //      return apps.filter(app => {
  //        const key = app.ID || app.ContainerName;
  //        if (seen.has(key)) return false;
  //        seen.add(key);
  //        return true;
  //      });
  //    };
  //
  //    setAppsByStatus({
  //      active: removeDuplicates(data.active),
  //      stopped: removeDuplicates(data.stopped),
  //      backups: removeDuplicates(data.backups),
  //    });
  //  };
  //
  //  checkSession().then(() => {
  //    fetchUserStatus();
  //    fetchAppsByStatus();
  //  });
  //
  //  const interval = setInterval(fetchUserStatus, 6000);
  //  return () => clearInterval(interval);
  //}, []);


//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//import '../../styles/styles.css';
//import { useSessionGuard } from '@/hooks/useSessionGuard';
//import LoadingSpinner from '@/components/LoadingSpinner';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true);
//  const fileInputRef = useRef(null);
//
//  useSessionGuard({
//    lang,
//    permission: 'dashboard',
//    onValidSession: ({ username, role }) => {
//      setUsername(username);
//      setRole(role);
//      setLoading(false);
//    },
//  });
//
//  useEffect(() => {
//    if (loading) return;
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return [];
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    fetchUserStatus();
//    fetchAppsByStatus();
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, [loading]);
//
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [loading, canDeploy, showUpgradeModal]);
//
//  if (loading) {
//  return <LoadingSpinner fullscreen />;
//  }
//  //if (loading) {
//  //  return (
//  //    <div className="min-h-screen bg-black text-white flex items-center justify-center">
//  //      <p className="text-gray-400 text-sm">Verificando sessão...</p>
//  //    </div>
//  //  );
//  //}
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//                    <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`;
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              <AppActions app={app} onAction={handleAction} lang={lang} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//import '../../styles/styles.css';
//import { useSessionGuard } from '@/hooks/useSessionGuard';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true);
//  const fileInputRef = useRef(null);
//
//  useSessionGuard({
//    lang,
//    permission: 'dashboard',
//    onValidSession: ({ username, role }) => {
//      setUsername(username);
//      setRole(role);
//      setLoading(false);
//    },
//  });
//    useEffect(() => {
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return [];
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    if (!loading) {
//      fetchUserStatus();
//      fetchAppsByStatus();
//      const interval = setInterval(fetchUserStatus, 6000);
//      return () => clearInterval(interval);
//    }
//  }, [loading]);
//
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [loading, canDeploy, showUpgradeModal]);
//
//  if (loading) return null;
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//    const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//                    <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`;
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              <AppActions app={app} onAction={handleAction} lang={lang} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//import { hasPermission } from '@/utils/permissions'; // ← novo import
//import '../../styles/styles.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [role, setRole] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(true); // ← novo estado
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//        const data = await res.json();
//
//        if (!data.username || !data.role || !hasPermission(data.role, 'dashboard')) {
//          router.replace(`/${lang}/signin`);
//          return;
//        }
//
//        setUsername(data.username);
//        setRole(data.role);
//        setLoading(false); // ← sessão válida
//      } catch {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return [];
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  // ⏳ Enquanto verifica sessão, não renderiza nada
//  useEffect(() => {
//    if (!loading && canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//      }
//    }, [loading, canDeploy, showUpgradeModal]);
//
//    if (loading) return null;
//  //if (loading) return null;
//
//  //useEffect(() => {
//  //  if (canDeploy && showUpgradeModal) {
//  //    setShowUpgradeModal(false);
//  //    setStatus("");
//  //  }
//  //}, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//  
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//  
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`;
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              <AppActions app={app} onAction={handleAction} lang={lang} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return [];
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//  
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//  
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`;
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              <AppActions app={app} onAction={handleAction} lang={lang} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//frontend/src/app/[lang]/dashboard/page.jsx

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//import { useSession } from '@/hooks/useSettion';
//import { hasPermission, canDeploy } from '@/utils/permissions';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const { session, loading } = useSession();
//
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeployState, setCanDeployState] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    if (!loading) {
//      if (!session?.username) {
//        router.replace(`/${lang}/signin`);
//      } else if (!hasPermission(session.role, 'dashboard')) {
//        router.replace(`/${lang}/404`);
//      } else {
//        setPlan(session.plan || "no-plan");
//        setCanDeployState(canDeploy(session.role, session.plan));
//        fetchAppsByStatus();
//      }
//    }
//  }, [loading, session]);
//
//  useEffect(() => {
//    if (canDeployState && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeployState, showUpgradeModal]);
//
//  const fetchAppsByStatus = async () => {
//    const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    const data = await res.json();
//
//    const removeDuplicates = (apps) => {
//      if (!Array.isArray(apps)) return [];
//      const seen = new Set();
//      return apps.filter(app => {
//        const key = app.ID || app.ContainerName;
//        if (seen.has(key)) return false;
//        seen.add(key);
//        return true;
//      });
//    };
//
//    setAppsByStatus({
//      active: removeDuplicates(data.active),
//      stopped: removeDuplicates(data.stopped),
//      backups: removeDuplicates(data.backups),
//    });
//  };
//
//  const triggerFileInput = () => {
//    if (!canDeployState) {
//      setShowUpgradeModal(true);
//      return;
//    }
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    if (!canDeployState) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", session.username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (type, app) => {
//    const id = app.name || app.ID || app.ContainerName;
//    if (!id) {
//      setStatus(`🚫 Erro: aplicação sem identificador válido`);
//      return;
//    }
//
//    try {
//      const res = await fetch(`/api/app/${type}?id=${id}`, {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        credentials: "include",
//      });
//
//      const result = await res.json();
//      if (res.ok) {
//        setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
//      } else {
//        setStatus(`❌ ${result.error || "Falha na ação."}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{session?.username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`;
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              <AppActions app={app} onAction={handleAction} lang={lang} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

  //const handleAction = async (type, app) => {
  //  const id = app.name || app.ID || app.ContainerName;
  //  if (!id) {
  //    setStatus(`🚫 Erro: aplicação sem identificador válido`);
  //    return;
  //  }
  //
  //  try {
  //    const res = await fetch(`/api/app/${type}?id=${id}`, {
  //      method: "POST",
  //      headers: { "Content-Type": "application/json" },
  //      credentials: "include",
  //    });
  //
  //    const contentType = res.headers.get("content-type") || "";
  //    let result = {};
  //
  //    if (contentType.includes("application/json")) {
  //      result = await res.json();
  //    } else {
  //      const raw = await res.text();
  //      throw new Error(raw || "Resposta inválida do servidor.");
  //    }
  //
  //    if (res.ok) {
  //      setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
  //    } else {
  //      setStatus(`❌ ${result.error || "Falha na ação."}`);
  //    }
  //  } catch (err) {
  //    setStatus(`🚫 Erro: ${err.message}`);
  //  }
  //};
  
  //const handleAction = async (type, app) => {
  //  try {
  //    const res = await fetch(`/api/app/${type}?id=${app.name}`, {
  //      method: "POST",
  //      headers: { "Content-Type": "application/json" },
  //      credentials: "include",
  //    });
  //
  //    const result = await res.json();
  //    if (res.ok) {
  //      setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
  //    } else {
  //      setStatus(`❌ ${result.error || "Falha na ação."}`);
  //    }
  //  } catch (err) {
  //    setStatus(`🚫 Erro: ${err.message}`);
  //  }
  //};
  //const handleAction = async (type, app) => {
  //  try {
  //    const res = await fetch(`/api/app/${type}`, {
  //      method: "POST",
  //      headers: { "Content-Type": "application/json" },
  //      credentials: "include",
  //      body: JSON.stringify({ id: app.ID || app.ContainerName }),
  //    });
  //
  //    const result = await res.json();
  //    if (res.ok) {
  //      setStatus(`✅ ${result.message || "Ação realizada com sucesso."}`);
  //    } else {
  //      setStatus(`❌ ${result.error || "Falha na ação."}`);
  //    }
  //  } catch (err) {
  //    setStatus(`🚫 Erro: ${err.message}`);
  //  }
  //};

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//// 🔤 Detecta o idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// 💬 Modal de upgrade de plano
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  // 📦 Estados principais
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  // 🔐 Verifica sessão e carrega dados iniciais
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return []; // ✅ Garante que seja array
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    //const fetchAppsByStatus = async () => {
//    //  const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //  const data = await res.json();
//    //  setAppsByStatus(data);
//    //};
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🔄 Fecha modal se plano for liberado
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  // 📁 Upload de aplicação
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`; // ✅ Só usa app.ID para evitar duplicação
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`//${lang}/dashboard/app/${app.ID}`)} // ✅ Só mostra app.ID na URL
//                            >
//                              {/* 🧠 Identificação da aplicação */}
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID} {/* ✅ Exibe apenas o ID */}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              {/* ✅ Botões de ação via componente */}
//                              <AppActions app={app} onAction={handleAction} /> {/* Internamente pode usar app.ContainerName */}
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {/* 💬 Modal de upgrade de plano */}
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//// 🔤 Detecta o idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// 💬 Modal de upgrade de plano
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  // 📦 Estados principais
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  // 🔐 Verifica sessão e carrega dados iniciais
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//
//      const removeDuplicates = (apps) => {
//        if (!Array.isArray(apps)) return []; // ✅ Garante que seja array
//        const seen = new Set();
//        return apps.filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//
//      setAppsByStatus({
//        active: removeDuplicates(data.active),
//        stopped: removeDuplicates(data.stopped),
//        backups: removeDuplicates(data.backups),
//      });
//    };
//
//    //const fetchAppsByStatus = async () => {
//    //  const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//    //  const data = await res.json();
//    //  setAppsByStatus(data);
//    //};
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🔄 Fecha modal se plano for liberado
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  // 📁 Upload de aplicação
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || index}`; // ✅ Só usa app.ID para evitar duplicação
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`//${lang}/dashboard/app/${app.ID}`)} // ✅ Só mostra app.ID na URL
//                            >
//                              {/* 🧠 Identificação da aplicação */}
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID} {/* ✅ Exibe apenas o ID */}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID}
//                                </span>
//                              </div>
//
//                              {/* ✅ Botões de ação via componente */}
//                              <AppActions app={app} /> {/* Internamente pode usar app.ContainerName */}
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {/* 💬 Modal de upgrade de plano */}
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import '../../styles/globais.css';
//import { messages } from "./upload/messages";
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [statusMsg, setStatusMsg] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const [loading, setLoading] = useState(false);
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) router.replace(`/${lang}/signin`);
//      else setUsername(data.username);
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { credentials: "include" });
//      const data = await res.json();
//      const dedupe = (apps) => {
//        const seen = new Set();
//        return (apps || []).filter(app => {
//          const key = app.ID || app.ContainerName;
//          if (seen.has(key)) return false;
//          seen.add(key);
//          return true;
//        });
//      };
//      setAppsByStatus({
//        active: dedupe(data.active),
//        stopped: dedupe(data.stopped),
//        backups: dedupe(data.backups),
//      });
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatusMsg("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//    const triggerFileInput = async () => {
//    const res = await fetch('/api/user/status', { credentials: 'include' });
//    const data = await res.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//    if (!data.canDeploy) return setShowUpgradeModal(true);
//    fileInputRef.current?.click();
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { credentials: 'include' });
//    const data = await resStatus.json();
//    if (!data.canDeploy) return setShowUpgradeModal(true);
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const result = res.headers.get("content-type")?.includes("json")
//        ? await res.json()
//        : { error: await res.text() };
//
//      if (res.ok && result.app?.ID) {
//        setStatusMsg(`✅ ${dict.success}`);
//        setAppID(result.app.ID);
//        const entriesRes = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//        setEntryPoints(await entriesRes.json());
//      } else {
//        setStatusMsg(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatusMsg(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleAction = async (action, app) => {
//    setLoading(true);
//    setStatusMsg("");
//    try {
//      const res = await fetch(`/api/app/${action}?id=${app.ContainerName || app.ID}`, {
//        method: action === 'delete' ? 'DELETE' : 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//      const updated = await fetch("/api/app/status", { credentials: "include" });
//      const updatedData = await updated.json();
//      setAppsByStatus({
//        active: updatedData.active || [],
//        stopped: updatedData.stopped || [],
//        backups: updatedData.backups || [],
//      });
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//    const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button onClick={triggerFileInput} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold">
//              + Nova aplicação
//            </button>
//            <input type="file" accept=".zip" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
//          </div>
//
//          {/* 🔍 Filtro de status */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {statusMsg && <p className="text-gray-300 whitespace-pre-line text-center">{statusMsg}</p>}
//          {entryPoints.length > 0 && appID && <EntryPointChooser entries={entryPoints} appID={appID} />}
//
//          <div className="space-y-6">
//            {Object.entries(appsByStatus).map(([key, apps]) => {
//              if (filter !== "all" && key !== filter) return null;
//              return (
//                <div key={key}>
//                  <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                  {!apps || apps.length === 0 ? (
//                    <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                  ) : (
//                    <div className="space-y-2">
//                      {apps.map((app, index) => {
//                        const statusKey = app.status?.toLowerCase?.() || "unknown";
//                        const statusClass = `status-dot status-${statusKey}`;
//                        const uniqueKey = `${key}-${app.ID || index}`;
//                        return (
//                          <div key={uniqueKey} className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer">
//                            <div className="flex flex-col">
//                              <span className="text-lg font-mono flex items-center">
//                                <span className={statusClass}></span>
//                                {app.ID}
//                              </span>
//                              <span className="text-green-400 text-sm font-semibold">{app.name || app.ID}</span>
//                            </div>
//                            <div className="flex gap-2">
//                              <button onClick={() => handleAction('start', app)} disabled={app.status === 'running' || loading} className="bg-green-600 px-3 py-1 rounded text-sm">Iniciar</button>
//                              <button onClick={() => handleAction('stop', app)} disabled={app.status === 'stopped' || loading} className="bg-red-600 px-3 py-1 rounded text-sm">Parar</button>
//                              <button onClick={() => handleAction('restart', app)} disabled={loading} className="bg-blue-600 px-3 py-1 rounded text-sm">Reiniciar</button>
//                              <button onClick={() => handleAction('rebuild', app)} disabled={loading} className="bg-yellow-600 px-3 py-1 rounded text-sm">Rebuildar</button>
//                              <button onClick={() => handleAction('backup', app)} disabled={loading} className="bg-purple-600 px-3 py-1 rounded text-sm">Backup</button>
//                              <button
//                                onClick={() => {
//                                  const confirmed = confirm("Tem certeza que deseja excluir esta aplicação?");
//                                  if (confirmed) handleAction('delete', app);
//                                }}
//                                disabled={loading}
//                                className="bg-red-700 px-3 py-1 rounded text-sm"
//                              >
//                                🗑️ Excluir
//                              </button>
//                            </div>
//                          </div>
//                        );
//                      })}
//                    </div>
//                  )}
//                </div>
//              );
//            })}
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//            <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//            <p className="mb-4 text-gray-700">
//              Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//              Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//              banco de dados, snapshots e ambientes dedicados.
//            </p>
//            <div className="flex justify-end space-x-3">
//              <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//              <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//              <button onClick={() => setShowUpgradeModal(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//            </div>
//          </div>
//        </div>
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//// 🔤 Detecta o idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// 💬 Modal de upgrade de plano
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  // 📦 Estados principais
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  // 🔐 Verifica sessão e carrega dados iniciais
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//      setAppsByStatus(data);
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🔄 Fecha modal se plano for liberado
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  // 📁 Upload de aplicação
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//    const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//                        <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app, index) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          const uniqueKey = `${key}-${app.ID || app.ContainerName || index}`; // ✅ Corrigido para evitar duplicação
//
//                          return (
//                            <div
//                              key={uniqueKey}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID || app.ContainerName}`)}
//                            >
//                              {/* 🧠 Identificação da aplicação */}
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID || app.ContainerName}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">
//                                  {app.name || app.ID || app.ContainerName}
//                                </span>
//                              </div>
//
//                              {/* ✅ Botões de ação via componente */}
//                              <AppActions app={app} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {/* 💬 Modal de upgrade de plano */}
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}
//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//// 🔤 Detecta o idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// 💬 Modal de upgrade de plano
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  // 📦 Estados principais
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  // 🔐 Verifica sessão e carrega dados iniciais
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//      setAppsByStatus(data);
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🔄 Fecha modal se plano for liberado
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  // 📁 Upload de aplicação
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.id) {
//          setAppID(result.app.id);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.id}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//    return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          return (
//                            <div
//                              key={`${key}-${app.id}`}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.id}`)}
//                            >
//                              {/* 🧠 Identificação da aplicação */}
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.id}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">{app.name || app.id}</span>
//                              </div>
//
//                              {/* ✅ Botões de ação via componente */}
//                              <AppActions app={app} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {/* 💬 Modal de upgrade de plano */}
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import AppActions from "../../../components/AppActions"; // ✅ novo componente
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//// 🔤 Detecta o idioma da URL
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//// 💬 Modal de upgrade de plano
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  // 📦 Estados principais
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  // 🔐 Verifica sessão e carrega dados iniciais
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//      setAppsByStatus(data);
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  // 🔄 Fecha modal se plano for liberado
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  // 📁 Upload de aplicação
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//    return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de incentivo ao upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          {/* 🧠 Cabeçalho do dashboard */}
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          {/* 🔍 Filtro de status + botão de upgrade */}
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Painel de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app) => {
//                          const statusKey = app.status?.toLowerCase?.() || "unknown";
//                          const statusClass = `status-dot status-${statusKey}`;
//                          return (
//                            <div
//                              key={`${key}-${app.ID}`}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              {/* 🧠 Identificação da aplicação */}
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">{app.Name || app.ID}</span>
//                              </div>
//
//                              {/* ✅ Botões de ação via componente */}
//                              <AppActions app={app} />
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {/* 💬 Modal de upgrade de plano */}
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//      setAppsByStatus(data);
//      console.log("Apps recebidos:", data);
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleCommand = async (e, containerName, action) => {
//    e.stopPropagation();
//
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      rebuild: "Deseja reconstruir esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação? Esta ação é irreversível!",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    const res = await fetch(`/api/app/${action}?id=${containerName}`, {
//      method: "POST",
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const data = await res.json();
//    alert(data.message || "Ação executada.");
//  };
//
//  const statusIcons = {
//    running: "🟢",
//    stopped: "⏸️",
//    backups: "📦",
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//    return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app) => {
//                          const statusClass = `status-dot status-${app.Status.toLowerCase()}`;
//                          return (
//                            <div
//                              key={`${key}-${app.ID}`}
//                              className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                              onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                            >
//                              <div className="flex flex-col">
//                                <span className="text-lg font-mono flex items-center">
//                                  <span className={statusClass}></span>
//                                  {app.ID}
//                                </span>
//                                <span className="text-green-400 text-sm font-semibold">{app.Name || app.ID}</span>
//                              </div>
//                              <div className="space-x-2 text-xl flex items-center">
//                                {app.Status !== "running" && (
//                                  <button title="Iniciar" onClick={(e) => handleCommand(e, app.ContainerName, "start")}>✅</button>
//                                )}
//                                {app.Status === "running" && (
//                                  <button title="Parar" onClick={(e) => handleCommand(e, app.ContainerName, "stop")}>⏸️</button>
//                                )}
//                                <button title="Reiniciar" onClick={(e) => handleCommand(e, app.ContainerName, "restart")}>🔄</button>
//                                <button title="Rebuildar" onClick={(e) => handleCommand(e, app.ContainerName, "rebuild")}>🧱</button>
//                                <button title="Backup" onClick={(e) => handleCommand(e, app.ContainerName, "backup")}>📦</button>
//                                <button
//                                  title="Excluir"
//                                  onClick={(e) => handleCommand(e, app.ContainerName, "delete")}
//                                  disabled={!app.ContainerName}
//                                  className={!app.ContainerName ? "opacity-50 cursor-not-allowed" : ""}
//                                >
//                                  🗑️
//                                </button>
//                              </div>
//                            </div>
//                          );
//                        })}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//      setAppsByStatus(data);
//      console.log("Apps recebidos:", data);
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  const handleCommand = async (e, appID, action) => {
//    e.stopPropagation();
//
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      rebuild: "Deseja reconstruir esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação? Esta ação é irreversível!",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    const res = await fetch(`/api/app/${action}?id=${appID}`, {
//      method: "POST",
//      headers: {
//        Authorization: `Bearer ${token}`,
//        "Content-Type": "application/json",
//      },
//      credentials: "include",
//    });
//
//    const data = await res.json();
//    alert(data.message || "Ação executada.");
//  };
//    const statusIcons = {
//    running: "🟢",
//    stopped: "⏸️",
//    backups: "📦",
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{statusLabels[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app) => (
//                          <div
//                            key={`${key}-${app.ID}`}
//                            className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer app-item"
//                            onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                          >
//                            <div className="flex flex-col">
//                              <span className="text-lg font-mono flex items-center">
//                                <span className={`status-dot status-${app.Status}`}></span>
//                                {app.ID}
//                              </span>
//                              <span className="text-green-400 text-sm font-semibold">{app.Name || app.ID}</span>
//                            </div>
//                            <div className="space-x-2 text-xl flex items-center">
//                              {app.Status !== "running" && (
//                                <button title="Iniciar" onClick={(e) => handleCommand(e, app.ContainerName, "start")}>✅</button>
//                              )}
//                              {app.Status === "running" && (
//                                <button title="Parar" onClick={(e) => handleCommand(e, app.ContainerName, "stop")}>⏸️</button>
//                              )}
//                              <button title="Reiniciar" onClick={(e) => handleCommand(e, app.ContainerName, "restart")}>🔄</button>
//                              <button title="Rebuildar" onClick={(e) => handleCommand(e, app.ContainerName, "rebuild")}>📦</button>
//                              <button
//                                title="Excluir"
//                                onClick={(e) => handleCommand(e, app.ContainerName, "delete")}
//                                disabled={!app.ContainerName}
//                                className={!app.ContainerName ? "opacity-50 cursor-not-allowed" : ""}
//                              >
//                                🗑️
//                              </button>
//                            </div>
//                          </div>
//                        ))}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const [appsByStatus, setAppsByStatus] = useState({ active: [], stopped: [], backups: [] });
//  const [filter, setFilter] = useState("all");
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    const fetchAppsByStatus = async () => {
//      const res = await fetch("/api/app/status", { method: "GET", credentials: "include" });
//      const data = await res.json();
//      setAppsByStatus(data);
//    };
//
//    checkSession().then(() => {
//      fetchUserStatus();
//      fetchAppsByStatus();
//    });
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', { method: 'GET', credentials: 'include' });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//    formData.append("username", username); // ✅ envia o username para o backend
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//    const handleCommand = async (e, appID, action) => {
//    e.stopPropagation();
//
//    const confirmMessages = {
//      stop: "Deseja realmente parar esta aplicação?",
//      restart: "Deseja reiniciar esta aplicação?",
//      rebuild: "Deseja reconstruir esta aplicação?",
//      delete: "Tem certeza que deseja excluir esta aplicação? Esta ação é irreversível!",
//    };
//
//    if (confirmMessages[action] && !confirm(confirmMessages[action])) return;
//
//    const token = localStorage.getItem("token");
//
//    const res = await fetch(`/api/app/${action}?id=${appID}`, {
//      method: "POST",
//      headers: {
//      Authorization: `Bearer ${token}`,
//      "Content-Type": "application/json",
//    },
//    credentials: "include",
//    });
//    //const res = await fetch(`/api/app/${action}?id=${appID}`, {
//    //  method: "POST",
//    //  credentials: "include",
//    //});
//    const data = await res.json();
//    alert(data.message || "Ação executada.");
//  };
//
//  const statusIcons = {
//    running: "🟢",
//    stopped: "⏸️",
//    backups: "📦",
//  };
//
//  const statusLabels = {
//    active: "🟢 Aplicações online",
//    stopped: "⏸️ Aplicações pausadas",
//    backups: "📦 Backups disponíveis",
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select
//              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm"
//              value={filter}
//              onChange={(e) => setFilter(e.target.value)}
//            >
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="stopped">Pausadas</option>
//              <option value="backups">Backups</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//                    <div className="bg-gray-900 border border-gray-700 rounded p-6 space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line text-center">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            <div className="space-y-6">
//              {Object.entries(appsByStatus).map(([key, apps]) => {
//                const labelMap = {
//                  active: "🟢 Aplicações online",
//                  stopped: "⏸️ Aplicações pausadas",
//                  backups: "📦 Backups disponíveis",
//                };
//                const iconMap = {
//                  running: "🟢",
//                  stopped: "⏸️",
//                  backups: "📦",
//                };
//
//                if (filter !== "all" && key !== filter) return null;
//
//                return (
//                  <div key={key}>
//                    <h2 className="text-xl font-semibold mb-2">{labelMap[key]}</h2>
//                    {!apps || apps.length === 0 ? (
//                      <p className="text-gray-500">Nenhuma aplicação encontrada.</p>
//                    ) : (
//                      <div className="space-y-2">
//                        {apps.map((app) => (
//                          <div
//                            key={`${key}-${app.ID}`}
//                            className="bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition cursor-pointer"
//                            onClick={() => router.push(`/${lang}/dashboard/app/${app.ID}`)}
//                          >
//                            <div className="flex flex-col">
//                              <span className="text-lg font-mono">
//                                {iconMap[app.Status]} {app.ID}
//                              </span>
//                              <span className="text-green-400 text-sm font-semibold">{app.Name || app.ID}</span>
//                            </div>
//                            <div className="space-x-2 text-xl">
//                              <button onClick={(e) => handleCommand(e, app.ID, "start")}>✅</button>
//                              <button onClick={(e) => handleCommand(e, app.ID, "stop")}>⏸️</button>
//                              <button onClick={(e) => handleCommand(e, app.ID, "restart")}>🔄</button>
//                              <button onClick={(e) => handleCommand(e, app.ID, "rebuild")}>📦</button>
//                              <button onClick={(e) => handleCommand(e, app.ID, "delete")}disabled={!app.Name}className={!app.Name ? "opacity-50 cursor-not-allowed" : ""}>🗑️</button>
//                            </div>
//                          </div>
//                        ))}
//                      </div>
//                    )}
//                  </div>
//                );
//              })}
//            </div>
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    checkSession().then(fetchUserStatus);
//
//    const interval = setInterval(fetchUserStatus, 6000);
//    return () => clearInterval(interval);
//  }, []);
//
//  useEffect(() => {
//    if (canDeploy && showUpgradeModal) {
//      setShowUpgradeModal(false);
//      setStatus("");
//    }
//  }, [canDeploy, showUpgradeModal]);
//
//  const triggerFileInput = async () => {
//    const resStatus = await fetch('/api/user/status', {
//      method: 'GET',
//      credentials: 'include',
//    });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    const resStatus = await fetch('/api/user/status', {
//      method: 'GET',
//      credentials: 'include',
//    });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="paused">Pausadas</option>
//              <option value="indisponivel">Indisponíveis</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 text-center space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            {!status && (
//              <p className="text-gray-400">Nenhuma aplicação encontrada.</p>
//            )}
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//        </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    checkSession().then(fetchUserStatus);
//
//    const interval = setInterval(fetchUserStatus, 6000); // 🔁 polling a cada 6 segundos
//    return () => clearInterval(interval);
//  }, []);
//
//  const triggerFileInput = () => {
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    // 🔄 Revalida status antes do deploy
//    const resStatus = await fetch('/api/user/status', {
//      method: 'GET',
//      credentials: 'include',
//    });
//    const data = await resStatus.json();
//    setPlan(data.plan || "no-plan");
//    setCanDeploy(data.canDeploy);
//
//    if (!data.canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${data.plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="paused">Pausadas</option>
//              <option value="indisponivel">Indisponíveis</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 text-center space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            {!status && (
//              <p className="text-gray-400">Nenhuma aplicação encontrada.</p>
//            )}
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [canDeploy, setCanDeploy] = useState(true);
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//      }
//    };
//
//    const fetchUserStatus = async () => {
//      const res = await fetch('/api/user/status', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setPlan(data.plan || "no-plan");
//      setCanDeploy(data.canDeploy);
//    };
//
//    checkSession().then(fetchUserStatus);
//  }, []);
//
//  const triggerFileInput = () => {
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    if (!canDeploy) {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="paused">Pausadas</option>
//              <option value="indisponivel">Indisponíveis</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 text-center space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            {!status && (
//              <p className="text-gray-400">Nenhuma aplicação encontrada.</p>
//            )}
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//        setPlan(data.plan || "no-plan");
//      }
//    };
//    checkSession();
//  }, []);
//
//  const triggerFileInput = () => {
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    if (plan === "no-plan") {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="paused">Pausadas</option>
//              <option value="indisponivel">Indisponíveis</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 text-center space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            {!status && (
//              <p className="text-gray-400">Nenhuma aplicação encontrada.</p>
//            )}
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import UploadForm from "../../../components/UploadForm";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [selectedFile, setSelectedFile] = useState(null);
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//        setPlan(data.plan || "no-plan");
//      }
//    };
//    checkSession();
//  }, []);
//
//  const triggerFileInput = () => {
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = (event) => {
//    const file = event.target.files[0];
//    if (file) {
//      setSelectedFile(file);
//    }
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <UploadForm
//            buttonText={dict.submitLabel}
//            successMessage={dict.success}
//            autoUploadFile={selectedFile}
//          />
//        </div>
//      </main>
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useRef, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import EntryPointChooser from "../../../components/EntryPointChooser";
//import { messages } from "./upload/messages";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//function PlanOfferModal({ onClose }) {
//  return (
//    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full animate-fade-in">
//        <h2 className="text-2xl font-bold mb-3">🚀 Pronto para começar?</h2>
//        <p className="mb-4 text-gray-700">
//          Para realizar deploys na Virtus Cloud, é necessário ter um plano ativo.
//          Com o plano <strong>Pro</strong>, você terá acesso a 4 vCPUs, 4096 MB de memória,
//          banco de dados, snapshots e ambientes dedicados.
//        </p>
//        <div className="flex justify-end space-x-3">
//          <a href="/upgrade" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ver planos</a>
//          <a href="/upgrade?start=pro" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Começar pelo Pro</a>
//          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Cancelar</button>
//        </div>
//      </div>
//    </div>
//  );
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//  const dict = messages[lang];
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [status, setStatus] = useState("");
//  const [appID, setAppID] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//  const fileInputRef = useRef(null);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//        setPlan(data.plan || "no-plan");
//      }
//    };
//    checkSession();
//  }, []);
//
//  const triggerFileInput = () => {
//    if (fileInputRef.current) {
//      fileInputRef.current.click();
//    }
//  };
//
//  const handleFileSelect = async (event) => {
//    const file = event.target.files[0];
//    if (!file) return;
//
//    if (plan === "no-plan") {
//      setShowUpgradeModal(true);
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", file);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const contentType = res.headers.get("content-type") || "";
//      let result = {};
//
//      if (contentType.includes("application/json")) {
//        result = await res.json();
//      } else {
//        const raw = await res.text();
//        throw new Error(raw || "Resposta inválida do servidor.");
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${dict.success}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else if (res.status === 403 && result.error) {
//        const details = result.details ? `\n${result.details}` : "";
//        setStatus(`❌ ${result.error}${details}`);
//      } else {
//        setStatus(`⚠️ ${result.error || result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    } finally {
//      event.target.value = "";
//    }
//  };
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">
//                Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span>
//              </p>
//            </div>
//            <button
//              onClick={triggerFileInput}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//            <input
//              type="file"
//              accept=".zip"
//              ref={fileInputRef}
//              onChange={handleFileSelect}
//              className="hidden"
//            />
//          </div>
//
//          <div className="flex items-center justify-between mb-4">
//            <select className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="paused">Pausadas</option>
//              <option value="indisponivel">Indisponíveis</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 text-center space-y-4">
//            {status && <p className="text-gray-300 whitespace-pre-line">{status}</p>}
//            {entryPoints.length > 0 && appID && (
//              <EntryPointChooser entries={entryPoints} appID={appID} />
//            )}
//            {!status && (
//              <p className="text-gray-400">Nenhuma aplicação encontrada.</p>
//            )}
//          </div>
//        </div>
//      </main>
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [username, setUsername] = useState("");
//  const [plan, setPlan] = useState("");
//
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      } else {
//        setUsername(data.username);
//        setPlan(data.plan || "no-plan");
//      }
//    };
//    checkSession();
//  }, []);
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//
//      {/* 🔔 Banner de upgrade */}
//      <div className="bg-yellow-400 text-black text-center py-3 text-sm font-medium">
//        Aproveite todo o potencial da Virtus Cloud! Escolha um plano e tenha acesso imediato aos nossos serviços de alta performance.
//        <button
//          onClick={() => router.push(`/${lang}/upgrade`)}
//          className="ml-4 bg-black text-yellow-300 px-3 py-1 rounded hover:bg-gray-900"
//        >
//          Ver planos
//        </button>
//      </div>
//
//      {/* 🧑 Área de trabalho */}
//      <main className="flex-1 p-6">
//        <div className="max-w-5xl mx-auto">
//          <div className="flex justify-between items-center mb-6">
//            <div>
//              <h1 className="text-3xl font-bold">Área de trabalho</h1>
//              <p className="text-sm text-gray-400">Usuário: <span className="font-medium">{username}</span> | Plano: <span className="font-medium">{plan}</span></p>
//            </div>
//            <button
//              onClick={() => router.push(`/${lang}/dashboard/upload`)}
//              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold"
//            >
//              + Nova aplicação
//            </button>
//          </div>
//
//          {/* 🔍 Filtros e status */}
//          <div className="flex items-center justify-between mb-4">
//            <select className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 text-sm">
//              <option value="all">Todas</option>
//              <option value="active">Ativas</option>
//              <option value="paused">Pausadas</option>
//              <option value="indisponivel">Indisponíveis</option>
//            </select>
//            <button
//              onClick={() => router.push(`/${lang}/upgrade`)}
//              className="text-sm text-blue-400 hover:underline"
//            >
//              Upgrade de plano
//            </button>
//          </div>
//
//          {/* 📦 Lista de aplicações */}
//          <div className="bg-gray-900 border border-gray-700 rounded p-6 text-center">
//            <p className="text-gray-400">Nenhuma aplicação encontrada.</p>
//          </div>
//        </div>
//      </main>
//    </div>
//  );
//}

//'use client';
//
//import { useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  // ✅ Verifica se o usuário está logado
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//    checkSession();
//  }, []);
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//      <main className="flex-1 flex flex-col justify-center items-center p-4">
//        <h1 className="text-4xl mb-4">Dashboard</h1>
//        <p>Bem-vindo ao seu painel!</p>
//
//        {/* ✅ Botão para redirecionar para a página de upload */}
//        <button
//          onClick={() => router.push(`/${lang}/dashboard/upload`)}
//          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
//        >
//          Ir para Upload
//        </button>
//      </main>
//    </div>
//  );
//}

//'use client';
////
//import { useRouter, usePathname } from 'next/navigation';
//import { useAuthGuard } from '@/hooks/useAuthGuard'; // 🔐 Verificação centralizada
//import Header from '../../../components/Header';
//import '../../styles/globais.css';
////
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
////
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
////
//  const { username, plan, loading } = useAuthGuard(); // ✅ Proteção e dados do usuário
////
//  if (loading) return null; // ⏳ Evita renderizar antes da verificação
////
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//      <main className="flex-1 flex flex-col justify-center items-center p-4">
//        <h1 className="text-4xl mb-4">Dashboard</h1>
//        <p>Bem-vindo ao seu painel, {username}!</p>
//        <p className="text-sm text-gray-400 mt-2">Plano atual: <strong>{plan}</strong></p>
////
//        <button
//          onClick={() => router.push(`/${lang}/dashboard/upload`)}
//          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
//        >
//          Ir para Upload
//        </button>
//      </main>
//    </div>
//  );
//}

//'use client';
//
//import useAuthRedirect from '@/hooks/useAuthRedirect'; // 🔐 Protege a página
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import '../../styles/globais.css';
//
//export default function DashboardPage() {
//  useAuthRedirect(); // 🔐 Verifica sessão e redireciona para login se necessário
//
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = pathname.split('/')[1]; // 🌍 Detecta idioma da URL
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//      <main className="flex-1 flex flex-col justify-center items-center p-4">
//        <h1 className="text-4xl mb-4">Dashboard</h1>
//        <p>Bem-vindo ao seu painel!</p>
//
//        {/* ✅ Botão para redirecionar para a página de upload */}
//        <button
//          onClick={() => router.push(`/${lang}/dashboard/upload`)}
//          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
//        >
//          Ir para Upload
//        </button>
//      </main>
//    </div>
//  );
//}

//'use client';
//
//import { useEffect } from 'react';
//import { useRouter, usePathname } from 'next/navigation';
//import Header from "../../../components/Header";
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  // ✅ Verifica se o usuário está logado
//  useEffect(() => {
//    const checkSession = async () => {
//      const res = await fetch('/api/verify-token', {
//        method: 'GET',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      if (!data.username) {
//        router.replace(`/${lang}/signin`);
//      }
//    };
//    checkSession();
//  }, []);
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//      <main className="flex-1 flex flex-col justify-center items-center p-4">
//        <h1 className="text-4xl mb-4">Dashboard</h1>
//        <p>Bem-vindo ao seu painel!</p>
//
//        {/* ✅ Botão para redirecionar para a página de upload */}
//        <button
//          onClick={() => router.push(`/${lang}/dashboard/upload`)}
//          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
//        >
//          Ir para Upload
//        </button>
//      </main>
//    </div>
//  );
//}

//'use client';
//
//import { useRouter, usePathname } from 'next/navigation';
//import { useAuthGuard } from '@/hooks/useAuthGuard'; // 🔐 Verificação centralizada
//import Header from '../../../components/Header';
//import '../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function DashboardPage() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const { username, plan, loading } = useAuthGuard(); // ✅ Proteção e dados do usuário
//
//  if (loading) return null; // ⏳ Evita renderizar antes da verificação
//
//  return (
//    <div className="bg-black min-h-screen text-white flex flex-col">
//      <Header />
//      <main className="flex-1 flex flex-col justify-center items-center p-4">
//        <h1 className="text-4xl mb-4">Dashboard</h1>
//        <p>Bem-vindo ao seu painel, {username}!</p>
//        <p className="text-sm text-gray-400 mt-2">Plano atual: <strong>{plan}</strong></p>
//
//        <button
//          onClick={() => router.push(`/${lang}/dashboard/upload`)}
//          className="mt-6 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-semibold"
//        >
//          Ir para Upload
//        </button>
//      </main>
//    </div>
//  );
//}

