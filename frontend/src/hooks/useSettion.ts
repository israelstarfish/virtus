//frontend/src/hooks/useSession.ts

import { useEffect, useState } from 'react';

interface SessionData {
  username: string;
  role: string;
  plan: string;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/verify-token', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          setSession(null);
        } else {
          const data = await res.json();
          setSession(data); // ← precisa conter o campo "plan"
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { session, loading };
}