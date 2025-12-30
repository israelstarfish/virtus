// 📄 frontend/src/components/UploadForm.jsx

'use client';
import { useEffect, useState } from "react";
import EntryPointChooser from "./EntryPointChooser";

// 📄 Modal de oferta de plano
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

// 📄 Formulário de upload de aplicação ZIP
export default function UploadForm({
  buttonText = "Enviar e Iniciar",
  successMessage = "Upload realizado com sucesso!",
  autoUploadFile = null,
}) {
  const [status, setStatus] = useState("");
  const [entryPoints, setEntryPoints] = useState([]);
  const [appID, setAppID] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const uploadFile = async (file) => {
    // 🔄 Revalida status do usuário antes do upload
    const resStatus = await fetch("/api/user/status", {
      method: "GET",
      credentials: "include",
    });
    const data = await resStatus.json();
    const currentPlan = data.plan || "no-plan";
    const canDeploy = data.canDeploy;

    if (!canDeploy) {
      setShowUpgradeModal(true);
      setStatus("❌ Deploy bloqueado pelo plano atual.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/upload?plan=${currentPlan}`, {
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
        setStatus(`✅ ${successMessage}`);
        if (result.app?.ID) {
          setAppID(result.app.ID);
          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
          const entries = await resEntries.json();
          setEntryPoints(entries);
        }
      } else {
        const msg = result.error || result.message || "Falha no deploy";
        setStatus(`⚠️ ${msg}`);
        if (currentPlan === "no-plan") {
          setShowUpgradeModal(true);
        }
      }
    } catch (err) {
      setStatus(`🚫 Erro: ${err.message}`);
    }
  };

  useEffect(() => {
    if (autoUploadFile) {
      uploadFile(autoUploadFile);
    }
  }, [autoUploadFile]);

  return (
    <div className="p-6 max-w-lg mx-auto border rounded shadow relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fileInput = e.target.elements.appfile;
          if (!fileInput || !fileInput.files[0]) {
            setStatus("Selecione um arquivo .zip primeiro.");
            return;
          }
          uploadFile(fileInput.files[0]);
        }}
        className="space-y-4"
      >
        <input
          type="file"
          name="appfile"
          accept=".zip"
          required
          className="block w-full"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {buttonText}
        </button>
      </form>

      {status && (
        <p className="mt-4 text-gray-700 whitespace-pre-line">{status}</p>
      )}

      {entryPoints.length > 0 && appID && (
        <EntryPointChooser entries={entryPoints} appID={appID} />
      )}

      {showUpgradeModal && (
        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}

//'use client';
//import { useEffect, useState } from "react";
//import EntryPointChooser from "./EntryPointChooser";
//
//// 📄 Modal de oferta de plano
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
//// 📄 Formulário de upload de aplicação ZIP
//export default function UploadForm({
//  buttonText = "Enviar e Iniciar",
//  successMessage = "Upload realizado com sucesso!",
//  autoUploadFile = null,
//}) {
//  const [status, setStatus] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [appID, setAppID] = useState("");
//  const [plan, setPlan] = useState("no-plan");
//  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//
//  useEffect(() => {
//    const fetchUserPlan = async () => {
//      try {
//        const res = await fetch("/api/verify-token", {
//          method: "GET",
//          credentials: "include",
//        });
//        const data = await res.json();
//        if (data.plan) {
//          setPlan(data.plan);
//        }
//      } catch {
//        setPlan("no-plan");
//      }
//    };
//    fetchUserPlan();
//  }, []);
//
//  const uploadFile = async (file) => {
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
//        setStatus(`✅ ${successMessage}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else {
//        const msg = result.error || result.message || "Falha no deploy";
//        setStatus(`⚠️ ${msg}`);
//
//        // 💡 Se plano for "no-plan", mostra modal de upgrade
//        if (plan === "no-plan") {
//          setShowUpgradeModal(true);
//        }
//      }
//    } catch (err) {
//      // 🛑 Erro genérico — mostra mensagem real
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  useEffect(() => {
//    if (autoUploadFile) {
//      uploadFile(autoUploadFile);
//    }
//  }, [autoUploadFile]);
//
//  return (
//    <div className="p-6 max-w-lg mx-auto border rounded shadow relative">
//      <form
//        onSubmit={(e) => {
//          e.preventDefault();
//          const fileInput = e.target.elements.appfile;
//          if (!fileInput || !fileInput.files[0]) {
//            setStatus("Selecione um arquivo .zip primeiro.");
//            return;
//          }
//          uploadFile(fileInput.files[0]);
//        }}
//        className="space-y-4"
//      >
//        <input
//          type="file"
//          name="appfile"
//          accept=".zip"
//          required
//          className="block w-full"
//        />
//        <button
//          type="submit"
//          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//        >
//          {buttonText}
//        </button>
//      </form>
//
//      {status && (
//        <p className="mt-4 text-gray-700 whitespace-pre-line">{status}</p>
//      )}
//
//      {entryPoints.length > 0 && appID && (
//        <EntryPointChooser entries={entryPoints} appID={appID} />
//      )}
//
//      {showUpgradeModal && (
//        <PlanOfferModal onClose={() => setShowUpgradeModal(false)} />
//      )}
//    </div>
//  );
//}

//'use client';
//import { useEffect, useState } from "react";
//import EntryPointChooser from "./EntryPointChooser";
//
//// 📄 Formulário de upload de aplicação ZIP
//export default function UploadForm({
//  buttonText = "Enviar e Iniciar",
//  successMessage = "Upload realizado com sucesso!",
//}) {
//  const [status, setStatus] = useState(""); // 🧾 Status do upload
//  const [entryPoints, setEntryPoints] = useState([]); // 🚪 Entradas detectadas
//  const [appID, setAppID] = useState(""); // 🆔 ID da aplicação
//  const [plan, setPlan] = useState("no-plan"); // 🧠 Plano do usuário
//
//  // 🔍 Busca plano do usuário logado
//  useEffect(() => {
//    const fetchUserPlan = async () => {
//      try {
//        const res = await fetch("/api/verify-token", {
//          method: "GET",
//          credentials: "include",
//        });
//        const data = await res.json();
//        if (data.plan) {
//          setPlan(data.plan); // ex: "basic", "pro", etc.
//        }
//      } catch {
//        setPlan("no-plan");
//      }
//    };
//    fetchUserPlan();
//  }, []);
//
//  // 📤 Envia arquivo ZIP para backend
//  const handleUpload = async (e) => {
//    e.preventDefault();
//    const fileInput = e.target.elements.appfile;
//    if (!fileInput || !fileInput.files[0]) {
//      setStatus("Selecione um arquivo .zip primeiro.");
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", fileInput.files[0]);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const resultText = await res.text();
//      let result;
//
//      if (res.headers.get("content-type")?.includes("application/json")) {
//        try {
//          result = JSON.parse(resultText);
//        } catch {
//          throw new Error("Erro ao interpretar resposta do servidor.");
//        }
//      } else {
//        throw new Error(resultText);
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${successMessage}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else {
//        setStatus(`⚠️ ${result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  return (
//    <div className="p-6 max-w-lg mx-auto border rounded shadow">
//      <form onSubmit={handleUpload} className="space-y-4">
//        <input
//          type="file"
//          name="appfile"
//          accept=".zip"
//          required
//          className="block w-full"
//        />
//        <button
//          type="submit"
//          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//        >
//          {buttonText}
//        </button>
//      </form>
//      {status && (
//        <p className="mt-4 text-gray-700 whitespace-pre-line">{status}</p>
//      )}
//      {entryPoints.length > 0 && appID && (
//        <EntryPointChooser entries={entryPoints} appID={appID} />
//      )}
//    </div>
//  );
//}

//'use client';
//import { useState } from "react";
//import EntryPointChooser from "./EntryPointChooser";
//import { useAuthGuard } from "@/hooks/useAuthGuard"; // ⛑️ Hook de proteção
//
//// 📄 Formulário de upload de aplicação ZIP
//export default function UploadForm({
//  buttonText = "Enviar e Iniciar",
//  successMessage = "Upload realizado com sucesso!",
//}) {
//  const [status, setStatus] = useState(""); // 🧾 Status do upload
//  const [entryPoints, setEntryPoints] = useState([]); // 🚪 Entradas detectadas
//  const [appID, setAppID] = useState(""); // 🆔 ID da aplicação
//
//  // 🔐 Proteção e dados do usuário
//  const { username, plan, loading } = useAuthGuard();
//
//  if (loading) return <p>Carregando informações do usuário...</p>;
//
//  // 📤 Envia arquivo ZIP para backend
//  const handleUpload = async (e) => {
//    e.preventDefault();
//    const fileInput = e.target.elements.appfile;
//    if (!fileInput || !fileInput.files[0]) {
//      setStatus("Selecione um arquivo .zip primeiro.");
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", fileInput.files[0]);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${plan}`, {
//        method: "POST",
//        body: formData,
//        credentials: "include",
//      });
//
//      const resultText = await res.text();
//      let result;
//
//      if (res.headers.get("content-type")?.includes("application/json")) {
//        try {
//          result = JSON.parse(resultText);
//        } catch {
//          throw new Error("Erro ao interpretar resposta do servidor.");
//        }
//      } else {
//        throw new Error(resultText);
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${successMessage}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else {
//        setStatus(`⚠️ ${result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  return (
//    <div className="p-6 max-w-lg mx-auto border rounded shadow">
//      <form onSubmit={handleUpload} className="space-y-4">
//        <input
//          type="file"
//          name="appfile"
//          accept=".zip"
//          required
//          className="block w-full"
//        />
//        <button
//          type="submit"
//          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//        >
//          {buttonText}
//        </button>
//      </form>
//      {status && (
//        <p className="mt-4 text-gray-700 whitespace-pre-line">{status}</p>
//      )}
//      {entryPoints.length > 0 && appID && (
//        <EntryPointChooser entries={entryPoints} appID={appID} />
//      )}
//    </div>
//  );
//}


//'use client';
//import { useState } from "react";
//import EntryPointChooser from "./EntryPointChooser";
//
//export default function UploadForm({
//  buttonText = "Enviar e Iniciar",
//  successMessage = "Upload realizado com sucesso!",
//  clientPlan = "application"
//}) {
//  const [status, setStatus] = useState("");
//  const [entryPoints, setEntryPoints] = useState([]);
//  const [appID, setAppID] = useState("");
//  const [plan] = useState(clientPlan);
//
//  const handleUpload = async (e) => {
//    e.preventDefault();
//    const fileInput = e.target.elements.appfile;
//    if (!fileInput || !fileInput.files[0]) {
//      setStatus("Selecione um arquivo .zip primeiro.");
//      return;
//    }
//
//    const formData = new FormData();
//    formData.append("file", fileInput.files[0]);
//
//    try {
//      const res = await fetch(`/api/upload?plan=${plan}`, {
//        method: "POST",
//        body: formData,
//      });
//
//      const resultText = await res.text();
//      let result;
//
//      if (res.headers.get("content-type")?.includes("application/json")) {
//        try {
//          result = JSON.parse(resultText);
//        } catch {
//          throw new Error("Erro ao interpretar resposta do servidor.");
//        }
//      } else {
//        throw new Error(resultText);
//      }
//
//      if (res.ok) {
//        setStatus(`✅ ${successMessage}`);
//        if (result.app?.ID) {
//          setAppID(result.app.ID);
//          const resEntries = await fetch(`/api/deploy/entrypoints/${result.app.ID}`);
//          const entries = await resEntries.json();
//          setEntryPoints(entries);
//        }
//      } else {
//        setStatus(`⚠️ ${result.message || "Falha no deploy"}`);
//      }
//    } catch (err) {
//      setStatus(`🚫 Erro: ${err.message}`);
//    }
//  };
//
//  return (
//    <div className="p-6 max-w-lg mx-auto border rounded shadow">
//      <form onSubmit={handleUpload} className="space-y-4">
//        <input
//          type="file"
//          name="appfile"
//          accept=".zip"
//          required
//          className="block w-full"
//        />
//        <button
//          type="submit"
//          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//        >
//          {buttonText}
//        </button>
//      </form>
//      {status && (
//        <p className="mt-4 text-gray-700 whitespace-pre-line">{status}</p>
//      )}
//      {entryPoints.length > 0 && appID && (
//        <EntryPointChooser entries={entryPoints} appID={appID} />
//      )}
//    </div>
//  );
//}