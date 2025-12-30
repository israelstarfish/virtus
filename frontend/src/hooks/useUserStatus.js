'use client';
import { useEffect, useState } from 'react';

export function useUserStatus(pollingInterval = 5000) {
  const [plan, setPlan] = useState('no-plan');
  const [usedMB, setUsedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(2048);
  const [canDeploy, setCanDeploy] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/user/status', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Erro ao buscar status');

        const data = await res.json();
        setPlan(data.plan || 'no-plan');
        setUsedMB(data.usedMB || 0);
        setTotalMB(data.totalMB || 2048);
        setCanDeploy(data.canDeploy ?? true);
      } catch (err) {
        console.warn('Erro no useUserStatus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus(); // inicial
    interval = setInterval(fetchStatus, pollingInterval); // atualiza

    return () => clearInterval(interval);
  }, [pollingInterval]);

  return { plan, usedMB, totalMB, canDeploy, loading };
}