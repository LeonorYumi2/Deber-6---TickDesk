import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  User,
} from 'lucide-react-native';

import { useSession } from '@/entities/session';
import type { Ticket, TicketObservation } from '@/entities/ticket';
import emptyBoxAnimation from '@/shared/assets/animations/empty-box.json';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';
import { LottieState } from '@/shared/ui/lottie-state';

type TicketObservationsListProps = {
  ticketId?: string;
  ticket?: Ticket;
};

function formatObservationDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function TicketObservationsList({
  ticketId: propTicketId,
  ticket,
}: TicketObservationsListProps) {
  const currentTicketId = ticket?.id || propTicketId || '';
  const { user, profile } = useSession();
  const [observations, setObservations] = useState<TicketObservation[]>([]);
  const [loading, setLoading] = useState(Boolean(currentTicketId));
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determinación estricta de permisos según reglas de negocio y RLS:
  // - Solicitante: solo en sus propios tickets en estado pending o in_progress.
  // - Soporte: solo en tickets asignados a él en estado in_progress.
  // - Ni solicitante ni soporte pueden agregar observaciones en tickets resolved o cancelled.
  const userRole = profile?.role;
  const isRequesterOwner = userRole === 'requester' && ticket?.user_id === user?.id;
  const isAssignedSupport = userRole === 'support' && ticket?.assigned_to === user?.id;

  let canAddObservation = false;
  let blockReason: string | null = null;

  if (ticket) {
    if (ticket.status === 'resolved') {
      blockReason = 'Este ticket ha sido resuelto y no admite nuevas observaciones.';
    } else if (ticket.status === 'cancelled') {
      blockReason = 'Este ticket ha sido cancelado y no admite nuevas observaciones.';
    } else if (userRole === 'requester') {
      if (isRequesterOwner && (ticket.status === 'pending' || ticket.status === 'in_progress')) {
        canAddObservation = true;
      } else if (!isRequesterOwner) {
        blockReason = 'Solo el solicitante que creó este ticket puede registrar observaciones.';
      }
    } else if (userRole === 'support') {
      if (isAssignedSupport && ticket.status === 'in_progress') {
        canAddObservation = true;
      } else if (ticket.status === 'pending') {
        blockReason = 'Debes tomar el ticket antes de poder registrar observaciones técnicas.';
      } else {
        blockReason = 'Solo el especialista técnico asignado a este ticket puede agregar observaciones.';
      }
    } else if (userRole === 'admin') {
      blockReason = 'El rol de administrador no atiende incidencias ni registra observaciones.';
    }
  } else {
    // Si no se proporcionó el objeto completo de ticket, permitir condicionado a sesión
    canAddObservation = !!user?.id;
  }

  const reloadObservations = async () => {
    if (!currentTicketId) return;
    const { data, error } = await supabase
      .from('ticket_observations')
      .select('id, ticket_id, user_id, message, created_at, profiles(full_name, email, role)')
      .eq('ticket_id', currentTicketId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setObservations(data as unknown as TicketObservation[]);
    }
  };

  useEffect(() => {
    if (!currentTicketId) {
      return;
    }
    let isMounted = true;

    supabase
      .from('ticket_observations')
      .select('id, ticket_id, user_id, message, created_at, profiles(full_name, email, role)')
      .eq('ticket_id', currentTicketId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('Error al cargar observaciones:', error.message);
        } else if (data) {
          setObservations(data as unknown as TicketObservation[]);
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTicketId]);

  const handleSend = async () => {
    if (sending) return;

    if (!canAddObservation) {
      setErrorMessage(blockReason || 'No tienes permisos para agregar observaciones a este ticket.');
      return;
    }

    const trimmed = newMessage.trim();
    if (!trimmed) {
      setErrorMessage('Por favor, ingresa una observación.');
      return;
    }

    if (!user?.id) {
      setErrorMessage('Debes iniciar sesión para agregar observaciones.');
      return;
    }

    setSending(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('ticket_observations')
        .insert([
          {
            ticket_id: currentTicketId,
            user_id: user.id,
            message: trimmed,
          },
        ]);

      if (error) {
        console.error('Error al agregar observación:', error);
        if (error.code === '42501') {
          setErrorMessage('No tienes permisos de seguridad para agregar observaciones a este ticket.');
        } else {
          setErrorMessage(error.message || 'No se pudo guardar la observación.');
        }
        return;
      }

      setNewMessage('');
      await reloadObservations();
    } catch (err) {
      console.error('Excepción al enviar observación:', err);
      setErrorMessage('Error de conexión al enviar la observación.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="mt-4">
      {/* Título de la sección */}
      <View className="mb-3 flex-row items-center gap-2">
        <MessageSquare color={COLORS.STEEL} size={16} />
        <Text className="text-xs font-bold tracking-wider text-steel">
          OBSERVACIONES Y NOTAS ({observations.length})
        </Text>
      </View>

      {/* Lista de observaciones / Historial */}
      {loading ? (
        <View className="py-6 items-center">
          <ActivityIndicator color={COLORS.PETROL} size="small" />
        </View>
      ) : observations.length === 0 ? (
        <View className="rounded-2xl border border-sky/30 bg-canvas p-4 text-center items-center">
          <LottieState className="mb-2" size={140} source={emptyBoxAnimation} />
          <Text className="text-xs text-steel">
            Aún no hay observaciones registradas en este ticket.
          </Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {observations.map((obs) => {
            const isCurrentUser = obs.user_id === user?.id;
            const authorName =
              obs.profiles?.full_name ||
              (isCurrentUser ? 'Tú' : 'Usuario');
            const roleLabel =
              obs.profiles?.role === 'support'
                ? 'Soporte'
                : obs.profiles?.role === 'admin'
                  ? 'Admin'
                  : 'Solicitante';

            return (
              <View
                key={obs.id}
                className={`rounded-2xl border p-3.5 ${
                  isCurrentUser
                    ? 'border-sky/50 bg-sky/10'
                    : 'border-sky/30 bg-canvas'
                }`}>
                <View className="flex-row items-center justify-between pb-1.5 border-b border-sky/20">
                  <View className="flex-row items-center gap-1.5">
                    <User color={COLORS.STEEL} size={12} />
                    <Text className="text-xs font-bold text-petrol">
                      {authorName}
                    </Text>
                    <View className="rounded bg-sky/30 px-1.5 py-0.2">
                      <Text className="text-[9px] font-semibold text-steel">
                        {roleLabel}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[10px] text-steel">
                    {formatObservationDate(obs.created_at)}
                  </Text>
                </View>
                <Text className="mt-1.5 text-xs leading-5 text-petrol">
                  {obs.message}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Formulario para agregar nueva observación o mensaje informativo cuando está bloqueado */}
      {canAddObservation ? (
        <View className="mt-3.5 rounded-2xl border border-sky/40 bg-white p-3">
          <Text className="mb-1 text-[11px] font-semibold text-steel">
            Agregar observación
          </Text>
          <TextInput
            className="min-h-[64px] rounded-xl border border-sky/50 bg-canvas p-2.5 text-xs text-petrol"
            editable={!sending}
            multiline
            numberOfLines={2}
            onChangeText={(val) => {
              setNewMessage(val);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Escribe un comentario, aclaración o actualización técnica..."
            placeholderTextColor={COLORS.STEEL}
            textAlignVertical="top"
            value={newMessage}
          />

          {errorMessage ? (
            <Text className="mt-1.5 text-[11px] font-medium text-coral">
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityHint="Envía la observación al historial del ticket."
            accessibilityRole="button"
            className={`mt-2.5 h-10 flex-row items-center justify-center gap-2 rounded-xl bg-petrol active:bg-petrol/90 ${
              sending ? 'opacity-70' : ''
            }`}
            disabled={sending}
            onPress={handleSend}>
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Send color="#FFFFFF" size={14} />
                <Text className="text-xs font-semibold text-white">
                  Enviar observación
                </Text>
              </>
            )}
          </Pressable>
        </View>
      ) : (
        <View className="mt-3.5 flex-row items-center gap-2.5 rounded-2xl border border-sky/40 bg-canvas p-3.5">
          {ticket?.status === 'resolved' ? (
            <CheckCircle2 color={COLORS.STEEL} size={16} />
          ) : ticket?.status === 'cancelled' ? (
            <AlertCircle color={COLORS.CORAL} size={16} />
          ) : (
            <Lock color={COLORS.STEEL} size={16} />
          )}
          <Text className="flex-1 text-xs text-steel leading-relaxed">
            {blockReason || 'No es posible agregar nuevas observaciones en este ticket.'}
          </Text>
        </View>
      )}
    </View>
  );
}
