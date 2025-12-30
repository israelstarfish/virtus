'use client';

import { useState } from "react";

// 🔗 Prefixo base para chamadas de API
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";
//const API_BASE = process.env.NODE_ENV === "development"
//  ? "/api" // usa o proxy para o backend Go
//  : "/api/send-code-local"; // fallback para rota interna do Next.js (se existir)

export default function EmailForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugCode, setDebugCode] = useState(""); // 🐞 Código para debug

  // 📩 Envia o e-mail para receber o código
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebugCode("");

    try {
      const res = await fetch(`${API_BASE}/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar código");
        return;
      }

      // 🐞 Exibe código gerado no ambiente de desenvolvimento
      if (data.code) {
        console.log("🔐 Código recebido do backend:", data.code);
        setDebugCode(data.code);
      } else {
        console.log("⚠️ Nenhum código recebido do backend.");
      }

      // ✅ E-mail enviado com sucesso
      if (onSuccess) onSuccess(email);
    } catch (err) {
      console.error("❌ Erro de conexão:", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded shadow max-w-sm w-full"
    >
      <h2 className="text-2xl mb-4 text-center">Bem-vindo de volta!</h2>

      <label className="block text-left mb-2">
        E-mail *
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 rounded mt-1 text-black"
          placeholder="Digite o seu e-mail"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 py-2 rounded mt-4"
      >
        {loading ? "Enviando..." : "Entrar com endereço de e-mail"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* 🐞 Exibe código gerado para testes locais */}
      {debugCode && (
        <p className="text-green-400 text-sm mt-2">
          Código gerado (debug): <strong>{debugCode}</strong>
        </p>
      )}

      <div className="my-4 text-center">OU</div>

      <button
        type="button"
        className="w-full bg-gray-800 py-2 rounded"
      >
        Entrar com chave de acesso
      </button>

      <p className="mt-4 text-center">
        Não possui uma conta?{" "}
        <a href="#" className="text-blue-400 hover:underline">
          Criar uma conta →
        </a>
      </p>
    </form>
  );
}