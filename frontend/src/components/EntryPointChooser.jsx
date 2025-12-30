"use client";
import { useState } from "react";

export default function EntryPointChooser({ entries, appID }) {
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");

  const handleStart = async () => {
    if (!selected) {
      setStatus("Escolha um arquivo para iniciar.");
      return;
    }

    try {
      const res = await fetch(`/api/deploy/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appID, entry: selected }),
      });

      const result = await res.json();
      setStatus(res.ok ? `🚀 App iniciado com: ${selected}` : `⚠️ ${result.message}`);
    } catch (err) {
      console.error(err);
      setStatus(`🚫 Erro: ${err.message}`);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Escolha o arquivo inicial:</h2>
      <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full p-2 mb-2">
        <option value="">-- selecione --</option>
        {entries.map(file => (
          <option key={file} value={file}>{file}</option>
        ))}
      </select>
      <button onClick={handleStart} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Iniciar App
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}