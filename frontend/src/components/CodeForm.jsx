'use client';

import { useState, useRef, useEffect } from 'react';

const API_BASE = '/api';

export default function CodeForm({ email, username, onSuccess, register = false }) {
  const [values, setValues] = useState(Array(8).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const code = values.join('');

  useEffect(() => {
    if (code.length === 8 && !values.includes('')) {
      handleSubmit(code);
    }
  }, [code]);

  const handleChange = (index, value) => {
    if (/^[a-zA-Z0-9]?$/.test(value)) {
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);
      if (value && index < 7) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (code) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
        credentials: 'include' // ✅ garante que o cookie JWT seja salvo
      });

      if (!res.ok) throw new Error('Código inválido');

      onSuccess(); // ✅ redireciona após sucesso
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded shadow max-w-sm w-full text-center signin-container">
      <h2 className="text-2xl mb-4">Digite o código enviado ao seu e-mail</h2>

      <div className="flex justify-center flex-wrap gap-2 mb-4">
        {values.map((val, i) => (
          <input
            key={i}
            ref={el => inputsRef.current[i] = el}
            type="text"
            maxLength={1}
            value={val}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(e, i)}
            className="code-input"
          />
        ))}
      </div>

      {loading && <p className="text-blue-400 text-sm">Validando...</p>}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}