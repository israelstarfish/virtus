import { useEffect, useState } from 'react';
import './IPCaptchaWidget.css';
//import '../../app/styles/virtus.css';

const IPCaptchaWidget = () => {
  const [status, setStatus] = useState('verificando'); // 'verificando', 'sucesso', 'erro'

  useEffect(() => {
    const verificarIP = async () => {
      try {
        // Simula tempo de verificação
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Simula obtenção de IP
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        console.log('IP do visitante:', data.ip);

        // Simula envio ao backend
        await fetch('/api/verificar-ip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: data.ip })
        });

        setStatus('sucesso');
      } catch (err) {
        console.error('Erro ao verificar IP:', err);
        setStatus('erro');
      }
    };

    verificarIP();
  }, []);

  return (
    <div
      id="ip-captcha-widget"
      style={{ display: 'none' }}
      data-status={status}
    >
      {status === 'verificando' && (
        <span className="loading-dots">● ● ●</span>
      )}
      {status === 'sucesso' && (
        <span className="success-icon">✔️</span>
      )}
      {status === 'erro' && (
        <span className="error-icon">⚠️</span>
      )}
    </div>
  );
};

export default IPCaptchaWidget;