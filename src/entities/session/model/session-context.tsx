import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '@/shared/lib/supabase';

type SessionContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const processedCodes = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    // 1. Carga inicial de sesión existente
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        setSession(initialSession);
        setIsLoading(false);
      }
    });

    // 2. Suscripción reactiva a cambios de autenticación
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setIsLoading(false);
      }
    });

    // 3. Manejo de Deep Linking y PKCE (intercambio de code por sesión)
    const handleDeepLinkUrl = async (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const errorDescription =
          typeof parsed.queryParams?.error_description === 'string'
            ? parsed.queryParams.error_description
            : typeof parsed.queryParams?.error === 'string'
              ? parsed.queryParams.error
              : undefined;

        if (errorDescription) {
          console.warn('Alerta de enlace de autenticación:', errorDescription);
        }

        const code =
          typeof parsed.queryParams?.code === 'string'
            ? parsed.queryParams.code
            : undefined;

        if (code && !processedCodes.current.has(code)) {
          processedCodes.current.add(code);
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error al intercambiar código por sesión:', error.message);
          } else if (data.session && isMounted) {
            setSession(data.session);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error al procesar enlace profundo:', err);
      }
    };

    // Escuchar enlaces mientras la aplicación está en segundo plano o abierta
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLinkUrl(event.url);
    });

    // Comprobar si la aplicación se abrió desde cero (cold start) mediante un deep link
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl && isMounted) {
        handleDeepLinkUrl(initialUrl);
      }
    });

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signOut,
      }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
