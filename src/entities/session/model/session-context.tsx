import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '@/shared/lib/supabase';

export type UserRole = 'requester' | 'support' | 'admin';

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
};

export type SessionContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  pendingWelcome: boolean;
  setPendingWelcome: (val: boolean) => void;
  consumeWelcome: () => boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  pendingWelcome: false,
  setPendingWelcome: () => {},
  consumeWelcome: () => false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingWelcome, setPendingWelcome] = useState(false);

  const consumeWelcome = useCallback(() => {
    setPendingWelcome(false);
    return true;
  }, []);

  const processedCodes = useRef<Set<string>>(new Set());
  const resolvedUserIdRef = useRef<string | null>(null);
  const inFlightQueryRef = useRef<{ userId: string; promise: Promise<Profile | null> } | null>(null);
  const querySeqRef = useRef(0);
  const isMountedRef = useRef(true);

  const syncSessionAndProfile = async (currentSession: Session | null) => {
    // 1. Si no hay sesión ni usuario autenticado, limpiar completamente el estado
    if (!currentSession?.user) {
      inFlightQueryRef.current = null;
      resolvedUserIdRef.current = null;
      querySeqRef.current += 1;
      if (isMountedRef.current) {
        setSession(null);
        setProfile(null);
        setIsLoading(false);
      }
      return;
    }

    const userId = currentSession.user.id;
    if (isMountedRef.current) {
      setSession(currentSession);
    }

    // 2. Si el perfil ya fue consultado y resuelto para este mismo usuario (ej. renovación de token)
    if (resolvedUserIdRef.current === userId) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    // 3. Si ya existe una consulta de perfil en curso para este mismo usuario,
    // esperar a que termine para no duplicar peticiones y NO poner isLoading en false anticipadamente.
    if (inFlightQueryRef.current?.userId === userId) {
      await inFlightQueryRef.current.promise;
      return;
    }

    // 4. Iniciar nueva consulta asegurando que isLoading permanezca en true
    const currentSeq = ++querySeqRef.current;
    if (isMountedRef.current) {
      setIsLoading(true);
    }

    const queryPromise = (async (): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', userId)
          .single();

        // Descartar si el componente se desmontó o si hubo un cambio de sesión posterior (condición de carrera)
        if (!isMountedRef.current || currentSeq !== querySeqRef.current) {
          return null;
        }

        if (error || !data) {
          console.warn('No se pudo cargar el perfil del usuario:', error?.message);
          return null;
        }

        const rawRole = data.role as string;
        if (rawRole !== 'requester' && rawRole !== 'support' && rawRole !== 'admin') {
          console.warn('Rol no válido o desconocido en la tabla profiles:', rawRole);
          return null;
        }

        return {
          id: String(data.id),
          full_name: typeof data.full_name === 'string' ? data.full_name : null,
          email: typeof data.email === 'string' ? data.email : null,
          role: rawRole,
        };
      } catch (err) {
        if (isMountedRef.current && currentSeq === querySeqRef.current) {
          console.error('Error al consultar perfil en Supabase:', err);
        }
        return null;
      }
    })();

    inFlightQueryRef.current = { userId, promise: queryPromise };

    try {
      const fetchedProfile = await queryPromise;

      if (isMountedRef.current && currentSeq === querySeqRef.current) {
        setProfile(fetchedProfile);
        resolvedUserIdRef.current = userId;
      }
    } finally {
      if (inFlightQueryRef.current?.userId === userId) {
        inFlightQueryRef.current = null;
      }
      if (isMountedRef.current && currentSeq === querySeqRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Carga inicial de sesión existente
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      syncSessionAndProfile(initialSession);
    });

    // 2. Suscripción reactiva a cambios de autenticación
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      syncSessionAndProfile(currentSession);
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

        let code =
          typeof parsed.queryParams?.code === 'string'
            ? parsed.queryParams.code
            : undefined;

        if (!code && url.includes('code=')) {
          const match = url.match(/[?&#]code=([^&#]+)/);
          if (match) {
            code = decodeURIComponent(match[1]);
          }
        }

        if (code && !processedCodes.current.has(code)) {
          processedCodes.current.add(code);
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error al intercambiar código por sesión:', error.message);
          } else if (data.session) {
            setPendingWelcome(true);
            syncSessionAndProfile(data.session);
          }
          return;
        }

        // Manejo de tokens devueltos en fragmento hash (#access_token=...&refresh_token=...)
        if (url.includes('access_token') && url.includes('refresh_token')) {
          const hashOrQuery = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
          if (hashOrQuery) {
            const params = new URLSearchParams(hashOrQuery);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (error) {
                console.error('Error al establecer sesión desde hash tokens:', error.message);
              } else if (data.session) {
                setPendingWelcome(true);
                syncSessionAndProfile(data.session);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error al procesar enlace profundo:', err);
      }
    };

    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLinkUrl(event.url);
    });

    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleDeepLinkUrl(initialUrl);
      }
    });

    return () => {
      isMountedRef.current = false;
      authSubscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const signOut = async () => {
    setPendingWelcome(false);
    inFlightQueryRef.current = null;
    resolvedUserIdRef.current = null;
    querySeqRef.current += 1;
    setProfile(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    resolvedUserIdRef.current = null;
    await syncSessionAndProfile(session);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        pendingWelcome,
        setPendingWelcome,
        consumeWelcome,
        signOut,
        refreshProfile,
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
