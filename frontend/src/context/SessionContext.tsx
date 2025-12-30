//frontend/src/context/SessionContext.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/verify-token', { credentials: 'include' });
                const data = await res.json();
                if (data?.username && data?.role) {
                    setSession(data);
                } else {
                    setSession(null);
                }
            } catch {
                setSession(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

//frontend/src/context/SessionContext.tsx

//'use client';
//
//import { createContext, useContext, useEffect, useState } from 'react';
//
//const SessionContext = createContext(null);
//
//export function SessionProvider({ children }) {
//  const [session, setSession] = useState(null);
//  const [loading, setLoading] = useState(true);
//
//  useEffect(() => {
//    const checkSession = async () => {
//      try {
//        const res = await fetch('/api/verify-token', { credentials: 'include' });
//        const data = await res.json();
//        if (data?.username && data?.role) {
//          setSession(data);
//        }
//      } catch {
//        setSession(null);
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    checkSession();
//  }, []);
//
//  return (
//    <SessionContext.Provider value={{ session, loading }}>
//      {children}
//    </SessionContext.Provider>
//  );
//}
//
//export function useSession() {
//  return useContext(SessionContext);
//}