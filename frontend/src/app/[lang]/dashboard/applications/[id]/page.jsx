//frontend/src/app/[lang]/dashboard/application/[id]/page.jsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import AppActions from '../../../../../components/AppActions';
import '../../../../styles/virtus.css';

function getLang(pathname) {
  const segment = pathname.split('/')[1];
  const supported = ['pt-br', 'en', 'es', 'zh'];
  return supported.includes(segment) ? segment : 'en';
}

export default function AppDashboardPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLang(pathname);

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 🔄 Carregamento inicial
  useEffect(() => {
    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 404) {
            setStatusMsg('Aplicação não encontrada ou não pertence a você.');
          } else {
            setStatusMsg(`Erro ao carregar dados: ${res.status}`);
          }
          return;
        }
        const data = await res.json();
        setApp(data);
      })
      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
  }, [id]);

  // 🔁 Verificação contínua da aplicação
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
        .then(async res => {
          if (!res.ok) {
            if (res.status === 404) {
              setStatusMsg('Aplicação removida. Redirecionando...');
              setTimeout(() => router.push(`/${lang}/dashboard`), 2000);
            }
            return;
          }
          const data = await res.json();
          setApp(data);
        })
        .catch(() => {
          setStatusMsg('Erro ao verificar aplicação. Tentando novamente...');
        });
    }, 6000);

    return () => clearInterval(interval);
  }, [id, lang, router]);

  const handleAction = async (action) => {
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch(`/api/app/${action}?id=${app.name}`, {
        method: action === 'delete' ? 'DELETE' : 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Ação concluída');

      if (action === 'delete') {
        router.push(`/${lang}/dashboard`);
      } else {
        const updated = await fetch(`/api/app/overview?id=${id}`, { credentials: 'include' });
        const updatedData = await updated.json();
        setApp(updatedData);
      }
    } catch (err) {
      setStatusMsg(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!app) {
    return (
      <p style={{ color: "var(--foreground)", padding: "1.5rem" }}>
        Carregando aplicação...
      </p>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      padding: "1.5rem"
    }}>
      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "1rem" }}>
        Aplicação: {app.ID}
      </h1>
      <p>Status: <strong>{app.status}</strong></p>
      <p>RAM: {app.ramUsage}</p>
      <p>Uptime: {app.uptime}</p>
      <p style={{ marginTop: "1rem", color: "var(--yellow-400)" }}>{statusMsg}</p>

      <div style={{ marginTop: "1.5rem" }}>
        <AppActions app={app} onAction={handleAction} lang={lang} />
      </div>

      <div style={{
        marginTop: "1.5rem",
        backgroundColor: "var(--card)",
        padding: "1rem",
        borderRadius: "0.5rem"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
          Logs
        </h2>
        <pre style={{
          fontSize: "0.875rem",
          color: "var(--text-color-muted)",
          whiteSpace: "pre-wrap"
        }}>
          {Array.isArray(app.logs) && app.logs.length > 0
            ? app.logs.join('\n')
            : 'Nenhum log disponível para esta aplicação.'}
        </pre>
      </div>
    </main>
  );
}

//frontend/src/app/[lang]/dashboard/application/[id]/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useParams, useRouter, usePathname } from 'next/navigation';
//import AppActions from '../../../../../components/AppActions';
//import '../../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function AppDashboardPage() {
//  const { id } = useParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [app, setApp] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [statusMsg, setStatusMsg] = useState('');
//
//  // 🔄 Carregamento inicial
//  useEffect(() => {
//    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//      .then(res => res.json())
//      .then(data => setApp(data))
//      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
//  }, [id]);
//
//  // 🔁 Verificação contínua da aplicação
//  useEffect(() => {
//    if (!app) return;
//
//    const interval = setInterval(() => {
//      fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//        .then(res => res.json())
//        .then(data => {
//          const isValidApp = data && 'ID' in data;
//
//          if (!isValidApp) {
//            setStatusMsg('Aplicação não encontrada. Redirecionando...');
//            setTimeout(() => router.push(`/${lang}/dashboard`), 2000);
//          } else {
//            setApp(data);
//          }
//        })
//        .catch(() => {
//          setStatusMsg('Erro ao verificar aplicação. Tentando novamente...');
//        });
//    }, 6000);
//
//    return () => clearInterval(interval);
//  }, [app, id, lang, router]);
//  //useEffect(() => {
//  //  const interval = setInterval(() => {
//  //    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//  //      .then(res => res.json())
//  //      .then(data => {
//  //        if (!data || !data.ID) {
//  //          router.push(`/${lang}/dashboard`);
//  //        } else {
//  //          setApp(data);
//  //        }
//  //      })
//  //      .catch(() => {
//  //        router.push(`/${lang}/dashboard`);
//  //      });
//  //  }, 6000);
//  //
//  //  return () => clearInterval(interval);
//  //}, [id, lang, router]);
//
//  const handleAction = async (action) => {
//    setLoading(true);
//    setStatusMsg('');
//    try {
//      const res = await fetch(`/api/app/${action}?id=${app.name}`, {
//        method: action === 'delete' ? 'DELETE' : 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//
//      if (action === 'delete') {
//        router.push(`/${lang}/dashboard`);
//      } else {
//        const updated = await fetch(`/api/app/overview?id=${id}`, { credentials: 'include' });
//        const updatedData = await updated.json();
//        setApp(updatedData);
//      }
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  if (!app) {
//    return (
//      <p style={{ color: "var(--foreground)", padding: "1.5rem" }}>
//        Carregando aplicação...
//      </p>
//    );
//  }
//
//  return (
//    <main style={{
//      minHeight: "100vh",
//      backgroundColor: "var(--background)",
//      color: "var(--foreground)",
//      padding: "1.5rem"
//    }}>
//      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "1rem" }}>
//        Aplicação: {app.ID}
//      </h1>
//      <p>Status: <strong>{app.status}</strong></p>
//      <p>RAM: {app.ramUsage}</p>
//      <p>Uptime: {app.uptime}</p>
//      <p style={{ marginTop: "1rem", color: "var(--yellow-400)" }}>{statusMsg}</p>
//
//      {/* ✅ Botões com estilo do dashboard */}
//      <div style={{ marginTop: "1.5rem" }}>
//        <AppActions app={app} onAction={handleAction} lang={lang} />
//      </div>
//
//      <div style={{
//        marginTop: "1.5rem",
//        backgroundColor: "var(--card)",
//        padding: "1rem",
//        borderRadius: "0.5rem"
//      }}>
//        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
//          Logs
//        </h2>
//        <pre style={{
//          fontSize: "0.875rem",
//          color: "var(--text-color-muted)",
//          whiteSpace: "pre-wrap"
//        }}>
//          {Array.isArray(app.logs) && app.logs.length > 0
//            ? app.logs.join('\n')
//            : 'Nenhum log disponível para esta aplicação.'}
//        </pre>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/dashboard/application/[id]/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useParams, useRouter, usePathname } from 'next/navigation';
//import AppActions from '../../../../../components/AppActions';
//import '../../../../styles/globais.css';
//import '../../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function AppDashboardPage() {
//  const { id } = useParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [app, setApp] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [statusMsg, setStatusMsg] = useState('');
//
//  // 🔄 Carregamento inicial
//  useEffect(() => {
//    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//      .then(res => res.json())
//      .then(data => setApp(data))
//      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
//  }, [id]);
//
//  // 🔁 Verificação contínua da aplicação
//  useEffect(() => {
//    const interval = setInterval(() => {
//      fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//        .then(res => res.json())
//        .then(data => {
//          if (!data || !data.ID) {
//            router.push(`/${lang}/dashboard`);
//          } else {
//            setApp(data);
//          }
//        })
//        .catch(() => {
//          router.push(`/${lang}/dashboard`);
//        });
//    }, 6000);
//
//    return () => clearInterval(interval);
//  }, [id, lang, router]);
//
//  const handleAction = async (action) => {
//    setLoading(true);
//    setStatusMsg('');
//    try {
//      const res = await fetch(`/api/app/${action}?id=${app.name}`, {
//        method: action === 'delete' ? 'DELETE' : 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//
//      if (action === 'delete') {
//        router.push(`/${lang}/dashboard`);
//      } else {
//        const updated = await fetch(`/api/app/overview?id=${id}`, { credentials: 'include' });
//        const updatedData = await updated.json();
//        setApp(updatedData);
//      }
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  if (!app) {
//    return (
//      <p style={{ color: "var(--foreground)", padding: "1.5rem" }}>
//        Carregando aplicação...
//      </p>
//    );
//  }
//
//  return (
//    <main style={{
//      minHeight: "100vh",
//      backgroundColor: "var(--background)",
//      color: "var(--foreground)",
//      padding: "1.5rem"
//    }}>
//      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "1rem" }}>
//        Aplicação: {app.ID}
//      </h1>
//      <p>Status: <strong>{app.status}</strong></p>
//      <p>RAM: {app.ramUsage}</p>
//      <p>Uptime: {app.uptime}</p>
//      <p style={{ marginTop: "1rem", color: "var(--yellow-400)" }}>{statusMsg}</p>
//
//      {/* ✅ Botões com estilo do dashboard */}
//      <div style={{ marginTop: "1.5rem" }}>
//        <AppActions app={app} onAction={handleAction} lang={lang} />
//      </div>
//
//      <div style={{
//        marginTop: "1.5rem",
//        backgroundColor: "var(--card)",
//        padding: "1rem",
//        borderRadius: "0.5rem"
//      }}>
//        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
//          Logs
//        </h2>
//        <pre style={{
//          fontSize: "0.875rem",
//          color: "var(--text-color-muted)",
//          whiteSpace: "pre-wrap"
//        }}>
//          {app.logs.join('\n')}
//        </pre>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useParams, useRouter, usePathname } from 'next/navigation';
//import AppActions from '../../../../../components/AppActions';
//import '../../../../styles/globais.css';
//import '../../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function AppDashboardPage() {
//  const { id } = useParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [app, setApp] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [statusMsg, setStatusMsg] = useState('');
//
//  useEffect(() => {
//    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//      .then(res => res.json())
//      .then(data => setApp(data))
//      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
//  }, [id]);
//
//  const handleAction = async (action) => {
//    setLoading(true);
//    setStatusMsg('');
//    try {
//      const res = await fetch(`/api/app/${action}?id=${app.name}`, {
//        method: action === 'delete' ? 'DELETE' : 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//
//      if (action === 'delete') {
//        router.push(`/${lang}/dashboard`);
//      } else {
//        const updated = await fetch(`/api/app/overview?id=${id}`, { credentials: 'include' });
//        const updatedData = await updated.json();
//        setApp(updatedData);
//      }
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  if (!app) {
//    return (
//      <p style={{ color: "var(--foreground)", padding: "1.5rem" }}>
//        Carregando aplicação...
//      </p>
//    );
//  }
//
//  return (
//    <main style={{
//      minHeight: "100vh",
//      backgroundColor: "var(--background)",
//      color: "var(--foreground)",
//      padding: "1.5rem"
//    }}>
//      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "1rem" }}>
//        Aplicação: {app.ID}
//      </h1>
//      <p>Status: <strong>{app.status}</strong></p>
//      <p>RAM: {app.ramUsage}</p>
//      <p>Uptime: {app.uptime}</p>
//      <p style={{ marginTop: "1rem", color: "var(--yellow-400)" }}>{statusMsg}</p>
//
//      {/* ✅ Botões com estilo do dashboard */}
//      <div style={{ marginTop: "1.5rem" }}>
//        <AppActions app={app} onAction={handleAction} lang={lang} />
//      </div>
//
//      <div style={{
//        marginTop: "1.5rem",
//        backgroundColor: "var(--card)",
//        padding: "1rem",
//        borderRadius: "0.5rem"
//      }}>
//        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
//          Logs
//        </h2>
//        <pre style={{
//          fontSize: "0.875rem",
//          color: "var(--text-color-muted)",
//          whiteSpace: "pre-wrap"
//        }}>
//          {app.logs.join('\n')}
//        </pre>
//      </div>
//    </main>
//  );
//}

//frontend/src/app/[lang]/dashboard/app/[id]/page.jsx

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useParams, useRouter, usePathname } from 'next/navigation';
//import AppActions from '../../../../../components/AppActions';
//import '../../../../styles/globais.css';
//import '../../../../styles/virtus.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function AppDashboardPage() {
//  const { id } = useParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [app, setApp] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [statusMsg, setStatusMsg] = useState('');
//
//  useEffect(() => {
//    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//      .then(res => res.json())
//      .then(data => setApp(data))
//      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
//  }, [id]);
//
//  const handleAction = async (action) => {
//    setLoading(true);
//    setStatusMsg('');
//    try {
//      const res = await fetch(`/api/app/${action}?id=${app.name}`, {
//        method: action === 'delete' ? 'DELETE' : 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//
//      if (action === 'delete') {
//        router.push(`/${lang}/dashboard`);
//      } else {
//        const updated = await fetch(`/api/app/overview?id=${id}`, { credentials: 'include' });
//        const updatedData = await updated.json();
//        setApp(updatedData);
//      }
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  if (!app) {
//    return (
//      <p style={{ color: "var(--foreground)", padding: "1.5rem" }}>
//        Carregando aplicação...
//      </p>
//    );
//  }
//
//  return (
//    <main style={{
//      minHeight: "100vh",
//      backgroundColor: "var(--background)",
//      color: "var(--foreground)",
//      padding: "1.5rem"
//    }}>
//      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "1rem" }}>
//        Aplicação: {app.ID}
//      </h1>
//      <p>Status: <strong>{app.status}</strong></p>
//      <p>RAM: {app.ramUsage}</p>
//      <p>Uptime: {app.uptime}</p>
//      <p style={{ marginTop: "1rem", color: "var(--yellow-400)" }}>{statusMsg}</p>
//
//      {/* ✅ Botões com estilo do dashboard */}
//      <div style={{ marginTop: "1.5rem" }}>
//        <AppActions app={app} onAction={handleAction} lang={lang} />
//      </div>
//
//      <div style={{
//        marginTop: "1.5rem",
//        backgroundColor: "var(--card)",
//        padding: "1rem",
//        borderRadius: "0.5rem"
//      }}>
//        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
//          Logs
//        </h2>
//        <pre style={{
//          fontSize: "0.875rem",
//          color: "var(--text-color-muted)",
//          whiteSpace: "pre-wrap"
//        }}>
//          {app.logs.join('\n')}
//        </pre>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useParams, useRouter, usePathname } from 'next/navigation';
//import '../../../../styles/globais.css';
//import '../../../../styles/virtus.css'; // ✅ incluído para garantir acesso às variáveis
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function AppDashboardPage() {
//  const { id } = useParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [app, setApp] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [statusMsg, setStatusMsg] = useState('');
//
//  useEffect(() => {
//    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//      .then(res => res.json())
//      .then(data => setApp(data))
//      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
//  }, [id]);
//
//  const handleAction = async (action) => {
//    setLoading(true);
//    setStatusMsg('');
//    try {
//      const res = await fetch(`/api/app/${action}?id=${app.name}`, {
//        method: action === 'delete' ? 'DELETE' : 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//
//      if (action === 'delete') {
//        router.push(`/${lang}/dashboard`);
//      } else {
//        const updated = await fetch(`/api/app/overview?id=${id}`, { credentials: 'include' });
//        const updatedData = await updated.json();
//        setApp(updatedData);
//      }
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  if (!app) {
//    return (
//      <p style={{ color: "var(--foreground)", padding: "1.5rem" }}>
//        Carregando aplicação...
//      </p>
//    );
//  }
//
//  return (
//    <main style={{
//      minHeight: "100vh",
//      backgroundColor: "var(--background)",
//      color: "var(--foreground)",
//      padding: "1.5rem"
//    }}>
//      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", marginBottom: "1rem" }}>
//        Aplicação: {app.ID}
//      </h1>
//      <p>Status: <strong>{app.status}</strong></p>
//      <p>RAM: {app.ramUsage}</p>
//      <p>Uptime: {app.uptime}</p>
//      <p style={{ marginTop: "1rem", color: "var(--yellow-400)" }}>{statusMsg}</p>
//
//      <div style={{
//        marginTop: "1.5rem",
//        display: "flex",
//        flexWrap: "wrap",
//        gap: "0.75rem"
//      }}>
//        <button
//          onClick={() => handleAction('start')}
//          disabled={app.status === 'running' || loading}
//          style={{
//            backgroundColor: "var(--success)",
//            padding: "0.5rem 1rem",
//            borderRadius: "0.5rem",
//            color: "white",
//            cursor: "pointer"
//          }}
//        >
//          Iniciar
//        </button>
//        <button
//          onClick={() => handleAction('restart')}
//          disabled={app.status === 'stopped' || loading}
//          style={{
//            backgroundColor: "var(--blue-600)",
//            padding: "0.5rem 1rem",
//            borderRadius: "0.5rem",
//            color: "white",
//            cursor: "pointer"
//          }}
//        >
//          Reiniciar
//        </button>
//        <button
//          onClick={() => handleAction('stop')}
//          disabled={app.status === 'stopped' || loading}
//          style={{
//            backgroundColor: "var(--destructive)",
//            padding: "0.5rem 1rem",
//            borderRadius: "0.5rem",
//            color: "white",
//            cursor: "pointer"
//          }}
//        >
//          Desligar
//        </button>
//        <button
//          onClick={() => handleAction('rebuild')}
//          disabled={loading}
//          style={{
//            backgroundColor: "var(--yellow-600)",
//            padding: "0.5rem 1rem",
//            borderRadius: "0.5rem",
//            color: "black",
//            cursor: "pointer"
//          }}
//        >
//          Rebuildar
//        </button>
//        <button
//          onClick={() => handleAction('backup')}
//          disabled={loading}
//          style={{
//            backgroundColor: "var(--purple-600)",
//            padding: "0.5rem 1rem",
//            borderRadius: "0.5rem",
//            color: "white",
//            cursor: "pointer"
//          }}
//        >
//          Backup
//        </button>
//        <button
//          onClick={() => {
//            const confirmed = confirm("Tem certeza que deseja excluir esta aplicação?");
//            if (confirmed) handleAction('delete');
//          }}
//          disabled={loading}
//          style={{
//            backgroundColor: "var(--red-700)",
//            padding: "0.5rem 1rem",
//            borderRadius: "0.5rem",
//            color: "white",
//            cursor: "pointer"
//          }}
//        >
//          🗑️ Excluir
//        </button>
//      </div>
//
//      <div style={{
//        marginTop: "1.5rem",
//        backgroundColor: "var(--card)",
//        padding: "1rem",
//        borderRadius: "0.5rem"
//      }}>
//        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
//          Logs
//        </h2>
//        <pre style={{
//          fontSize: "0.875rem",
//          color: "var(--text-color-muted)",
//          whiteSpace: "pre-wrap"
//        }}>
//          {app.logs.join('\n')}
//        </pre>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useParams, useRouter, usePathname } from 'next/navigation';
//import '../../../../styles/globais.css';
//
//function getLang(pathname) {
//  const segment = pathname.split('/')[1];
//  const supported = ['pt-br', 'en', 'es', 'zh'];
//  return supported.includes(segment) ? segment : 'en';
//}
//
//export default function AppDashboardPage() {
//  const { id } = useParams();
//  const router = useRouter();
//  const pathname = usePathname();
//  const lang = getLang(pathname);
//
//  const [app, setApp] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [statusMsg, setStatusMsg] = useState('');
//
//  useEffect(() => {
//    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//      .then(res => res.json())
//      .then(data => setApp(data))
//      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
//  }, [id]);
//
//  const handleAction = async (action) => {
//    setLoading(true);
//    setStatusMsg('');
//    try {
//      const res = await fetch(`/api/app/${action}?id=${app.name}`, {
//        method: action === 'delete' ? 'DELETE' : 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//
//      if (action === 'delete') {
//        router.push(`/${lang}/dashboard`);
//      } else {
//        // Atualiza dados após ação
//        const updated = await fetch(`/api/app/overview?id=${id}`, { credentials: 'include' });
//        const updatedData = await updated.json();
//        setApp(updatedData);
//      }
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  if (!app) return <p className="text-white p-6">Carregando aplicação...</p>;
//
//  return (
//    <main className="min-h-screen bg-black text-white p-6">
//      <h1 className="text-3xl font-bold mb-4">Aplicação: {app.ID}</h1>
//      <p>Status: <strong>{app.status}</strong></p>
//      <p>RAM: {app.ramUsage}</p>
//      <p>Uptime: {app.uptime}</p>
//      <p className="mt-4 text-yellow-400">{statusMsg}</p>
//
//      <div className="mt-6 flex flex-wrap gap-3">
//        <button
//          onClick={() => handleAction('start')}
//          disabled={app.status === 'running' || loading}
//          className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
//        >
//          Iniciar
//        </button>
//        <button
//          onClick={() => handleAction('restart')}
//          disabled={app.status === 'stopped' || loading}
//          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
//        >
//          Reiniciar
//        </button>
//        <button
//          onClick={() => handleAction('stop')}
//          disabled={app.status === 'stopped' || loading}
//          className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
//        >
//          Desligar
//        </button>
//        <button
//          onClick={() => handleAction('rebuild')}
//          disabled={loading}
//          className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-500"
//        >
//          Rebuildar
//        </button>
//        <button
//          onClick={() => handleAction('backup')}
//          disabled={loading}
//          className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500"
//        >
//          Backup
//        </button>
//        <button
//          onClick={() => {
//            const confirmed = confirm("Tem certeza que deseja excluir esta aplicação?");
//            if (confirmed) handleAction('delete');
//          }}
//          disabled={loading}
//          className="bg-red-700 px-4 py-2 rounded hover:bg-red-600"
//        >
//          🗑️ Excluir
//        </button>
//      </div>
//
//      <div className="mt-6 bg-gray-900 p-4 rounded">
//        <h2 className="text-xl font-semibold mb-2">Logs</h2>
//        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{app.logs.join('\n')}</pre>
//      </div>
//    </main>
//  );
//}

//'use client';
//
//import { useEffect, useState } from 'react';
//import { useParams, useRouter } from 'next/navigation';
//
//export default function AppDashboardPage() {
//  const { id } = useParams();
//  const router = useRouter();
//  const [app, setApp] = useState(null);
//  const [loading, setLoading] = useState(false);
//  const [statusMsg, setStatusMsg] = useState('');
//
//  useEffect(() => {
//    fetch(`/api/app/overview?id=${id}`, { credentials: 'include' })
//      .then(res => res.json())
//      .then(data => setApp(data))
//      .catch(err => setStatusMsg(`Erro ao carregar dados: ${err.message}`));
//  }, [id]);
//
//  const handleAction = async (action) => {
//    setLoading(true);
//    setStatusMsg('');
//    try {
//      const res = await fetch(`/api/app/${action}?id=${id}`, {
//        method: 'POST',
//        credentials: 'include',
//      });
//      const data = await res.json();
//      setStatusMsg(data.message || 'Ação concluída');
//    } catch (err) {
//      setStatusMsg(`Erro: ${err.message}`);
//    } finally {
//      setLoading(false);
//    }
//  };
//
//  if (!app) return <p className="text-white p-6">Carregando aplicação...</p>;
//
//  return (
//    <main className="min-h-screen bg-black text-white p-6">
//      <h1 className="text-3xl font-bold mb-4">Aplicação: {app.name}</h1>
//      <p>Status: <strong>{app.status}</strong></p>
//      <p>RAM: {app.ramUsage}</p>
//      <p>Uptime: {app.uptime}</p>
//      <p className="mt-4 text-yellow-400">{statusMsg}</p>
//
//      <div className="mt-6 space-x-3">
//        <button onClick={() => handleAction('start')} disabled={app.status === 'running'} className="bg-green-600 px-4 py-2 rounded">Iniciar</button>
//        <button onClick={() => handleAction('restart')} disabled={app.status === 'stopped'} className="bg-blue-600 px-4 py-2 rounded">Reiniciar</button>
//        <button onClick={() => handleAction('stop')} disabled={app.status === 'stopped'} className="bg-red-600 px-4 py-2 rounded">Desligar</button>
//        <button onClick={() => handleAction('rebuild')} className="bg-yellow-600 px-4 py-2 rounded">Rebuildar</button>
//        <button onClick={() => handleAction('backup')} className="bg-purple-600 px-4 py-2 rounded">Backup</button>
//      </div>
//
//      <div className="mt-6 bg-gray-900 p-4 rounded">
//        <h2 className="text-xl font-semibold mb-2">Logs</h2>
//        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{app.logs.join('\n')}</pre>
//      </div>
//    </main>
//  );
//}