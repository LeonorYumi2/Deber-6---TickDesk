import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Headphones,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react-native';

import { useSession } from '@/entities/session';
import {
  TicketPriorityBadge,
  TicketStatusBadge,
  type Ticket,
  type TicketPriority,
} from '@/entities/ticket';
import { DeleteTicketModal } from '@/features/delete-ticket';
import { EditTicketModal } from '@/features/edit-ticket';
import { TicketObservationsList } from '@/features/ticket-observations';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';

type TicketDetailModalProps = {
  ticket: Ticket | null;
  visible: boolean;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket) => void;
  onTicketDeleted?: (ticketId: string) => void;
};

function formatDetailDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function TicketDetailModal({
  ticket,
  visible,
  onClose,
  onTicketUpdated,
  onTicketDeleted,
}: TicketDetailModalProps) {
  const { user, profile } = useSession();

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(ticket);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Estados de soporte
  const [claiming, setClaiming] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [changingPriority, setChangingPriority] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);

  // Sincronizar activeTicket con prop ticket cuando cambia
  if (ticket && activeTicket?.id !== ticket.id) {
    setActiveTicket(ticket);
    setActionError(null);
    setActionSuccess(null);
    setShowPrioritySelector(false);
  }

  if (!activeTicket) return null;

  const currentRole = profile?.role;
  const isPending = activeTicket.status === 'pending';
  const isInProgress = activeTicket.status === 'in_progress';
  const isResolved = activeTicket.status === 'resolved';

  const isOwner = user?.id === activeTicket.user_id;
  const isAssignedToMe = user?.id === activeTicket.assigned_to;
  const isUnassigned = !activeTicket.assigned_to;

  // --- ACCIÓN DE SOPORTE: Reclamar ticket ---
  const handleClaimTicket = async () => {
    if (claiming) return;
    setClaiming(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await supabase.rpc('claim_ticket', {
        p_ticket_id: activeTicket.id,
      });

      if (error) {
        console.error('Error al reclamar ticket:', error);
        const msg = error.message.toLowerCase();
        if (msg.includes('already') || msg.includes('asignado') || msg.includes('activo')) {
          setActionError('No puedes atender este ticket: ya tienes un ticket activo asignado o fue tomado por otro especialista.');
        } else {
          setActionError(error.message || 'No se pudo reclamar el ticket.');
        }
        return;
      }

      // Actualizar estado local
      const updated: Ticket = {
        ...activeTicket,
        status: 'in_progress',
        assigned_to: user?.id || null,
      };
      setActiveTicket(updated);
      setActionSuccess('¡Ticket asignado con éxito! Ahora estás a cargo de esta incidencia.');
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err) {
      console.error('Excepción al reclamar ticket:', err);
      setActionError('Error de conexión al reclamar el ticket.');
    } finally {
      setClaiming(false);
    }
  };

  // --- ACCIÓN DE SOPORTE: Resolver ticket ---
  const handleResolveTicket = async () => {
    if (resolving) return;
    setResolving(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await supabase.rpc('support_update_assigned_ticket', {
        p_ticket_id: activeTicket.id,
        p_new_priority: activeTicket.priority,
        p_resolve: true,
      });

      if (error) {
        console.error('Error al resolver ticket:', error);
        setActionError(error.message || 'No se pudo marcar el ticket como resuelto.');
        return;
      }

      const updated: Ticket = {
        ...activeTicket,
        status: 'resolved',
      };
      setActiveTicket(updated);
      setActionSuccess('El ticket ha sido marcado como Resuelto.');
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err) {
      console.error('Excepción al resolver ticket:', err);
      setActionError('Error de conexión al resolver el ticket.');
    } finally {
      setResolving(false);
    }
  };

  // --- ACCIÓN DE SOPORTE: Cambiar prioridad ---
  const handleChangePriority = async (newPriority: TicketPriority) => {
    if (changingPriority || newPriority === activeTicket.priority) return;
    setChangingPriority(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await supabase.rpc('support_update_assigned_ticket', {
        p_ticket_id: activeTicket.id,
        p_new_priority: newPriority,
        p_resolve: false,
      });

      if (error) {
        console.error('Error al cambiar prioridad:', error);
        setActionError(error.message || 'No se pudo cambiar la prioridad.');
        return;
      }

      const updated: Ticket = {
        ...activeTicket,
        priority: newPriority,
      };
      setActiveTicket(updated);
      setShowPrioritySelector(false);
      setActionSuccess(`Prioridad actualizada a ${newPriority === 'low' ? 'Baja' : newPriority === 'medium' ? 'Media' : 'Alta'}.`);
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err) {
      console.error('Excepción al cambiar prioridad:', err);
      setActionError('Error al cambiar la prioridad.');
    } finally {
      setChangingPriority(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View className="flex-1 items-center justify-end bg-petrol/60 sm:justify-center p-3">
        <View className="w-full max-w-[480px] max-h-[92%] rounded-3xl border border-sky/40 bg-white p-5 shadow-2xl">
          {/* Cabecera */}
          <View className="flex-row items-center justify-between border-b border-sky/20 pb-3">
            <View className="flex-row items-center gap-2">
              <View className="rounded-lg bg-petrol/10 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-petrol">
                  TICKET #{activeTicket.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <TicketStatusBadge status={activeTicket.status} />
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-canvas active:bg-sky/20"
              onPress={onClose}>
              <X color={COLORS.STEEL} size={18} />
            </Pressable>
          </View>

          <ScrollView
            className="flex-grow-0"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View className="py-2 gap-3.5">
              {/* Alerta de acción (error o éxito) */}
              {actionError ? (
                <View className="rounded-2xl border border-coral/30 bg-coral/10 p-3 flex-row items-center gap-2">
                  <AlertTriangle color={COLORS.CORAL} size={16} />
                  <Text className="flex-1 text-xs font-medium text-coral">
                    {actionError}
                  </Text>
                </View>
              ) : null}

              {actionSuccess ? (
                <View className="rounded-2xl border border-sky/60 bg-sky/20 p-3 flex-row items-center gap-2">
                  <CheckCircle color={COLORS.PETROL} size={16} />
                  <Text className="flex-1 text-xs font-medium text-petrol">
                    {actionSuccess}
                  </Text>
                </View>
              ) : null}

              {/* Título y Categoría */}
              <View>
                <Text className="text-xl font-bold tracking-tight text-petrol">
                  {activeTicket.title}
                </Text>

                <View className="mt-2 flex-row flex-wrap items-center gap-2">
                  <View className="flex-row items-center gap-1 rounded-full border border-sky/40 bg-canvas px-2.5 py-0.5">
                    <Tag color={COLORS.STEEL} size={11} />
                    <Text className="text-[11px] font-semibold text-steel">
                      {activeTicket.category || 'General'}
                    </Text>
                  </View>

                  <TicketPriorityBadge priority={activeTicket.priority} />
                </View>
              </View>

              {/* Metadatos: Fechas e involucrados */}
              <View className="rounded-2xl border border-sky/30 bg-canvas p-3.5 gap-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Calendar color={COLORS.STEEL} size={13} />
                    <Text className="text-[11px] text-steel">Creado el:</Text>
                  </View>
                  <Text className="text-[11px] font-medium text-petrol">
                    {formatDetailDate(activeTicket.created_at)}
                  </Text>
                </View>

                {activeTicket.requester_profile?.full_name ? (
                  <View className="flex-row items-center justify-between border-t border-sky/20 pt-1.5">
                    <View className="flex-row items-center gap-1.5">
                      <User color={COLORS.STEEL} size={13} />
                      <Text className="text-[11px] text-steel">Solicitante:</Text>
                    </View>
                    <Text className="text-[11px] font-medium text-petrol">
                      {activeTicket.requester_profile.full_name}
                    </Text>
                  </View>
                ) : null}

                <View className="flex-row items-center justify-between border-t border-sky/20 pt-1.5">
                  <View className="flex-row items-center gap-1.5">
                    <Headphones color={COLORS.STEEL} size={13} />
                    <Text className="text-[11px] text-steel">Especialista asignado:</Text>
                  </View>
                  <Text className="text-[11px] font-medium text-petrol">
                    {activeTicket.assigned_profile?.full_name ||
                      (isAssignedToMe ? 'Tú (Soporte)' : isUnassigned ? 'Sin asignar' : 'Asignado')}
                  </Text>
                </View>
              </View>

              {/* Descripción detallada */}
              <View className="rounded-2xl border border-sky/40 bg-white p-4">
                <Text className="text-[11px] font-bold tracking-wider text-steel uppercase">
                  Descripción del problema
                </Text>
                <Text className="mt-1.5 text-xs leading-5 text-petrol">
                  {activeTicket.description}
                </Text>
              </View>

              {/* ACCIONES PARA ROL SOLICITANTE */}
              {currentRole === 'requester' && isOwner && isPending ? (
                <View className="flex-row gap-2 pt-1">
                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl border border-sky/60 bg-white active:bg-canvas"
                    onPress={() => setIsEditModalVisible(true)}>
                    <Edit3 color={COLORS.PETROL} size={14} />
                    <Text className="text-xs font-semibold text-petrol">Editar ticket</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl border border-coral/40 bg-coral/10 active:bg-coral/20"
                    onPress={() => setIsDeleteModalVisible(true)}>
                    <Trash2 color={COLORS.CORAL} size={14} />
                    <Text className="text-xs font-semibold text-coral">Eliminar</Text>
                  </Pressable>
                </View>
              ) : null}

              {/* ACCIONES PARA ROL SOPORTE */}
              {currentRole === 'support' ? (
                <View className="gap-2 pt-1">
                  {/* Si el ticket está pendiente y sin asignar -> Botón Atender ticket */}
                  {isPending && isUnassigned ? (
                    <Pressable
                      accessibilityRole="button"
                      className={`h-12 w-full flex-row items-center justify-center gap-2 rounded-2xl bg-petrol active:bg-petrol/90 ${
                        claiming ? 'opacity-70' : ''
                      }`}
                      disabled={claiming}
                      onPress={handleClaimTicket}>
                      {claiming ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Headphones color="#FFFFFF" size={16} />
                          <Text className="text-sm font-semibold text-white">
                            Atender ticket (Reclamar)
                          </Text>
                        </>
                      )}
                    </Pressable>
                  ) : null}

                  {/* Si el ticket está asignado a mí y en proceso -> Cambiar prioridad / Resolver */}
                  {isAssignedToMe && isInProgress ? (
                    <View className="gap-2">
                      <View className="flex-row gap-2">
                        <Pressable
                          accessibilityRole="button"
                          className="flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl border border-sky/60 bg-white active:bg-canvas"
                          disabled={changingPriority || resolving}
                          onPress={() => setShowPrioritySelector(!showPrioritySelector)}>
                          <Clock color={COLORS.PETROL} size={14} />
                          <Text className="text-xs font-semibold text-petrol">
                            Cambiar prioridad
                          </Text>
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          className={`flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl bg-petrol active:bg-petrol/90 ${
                            resolving ? 'opacity-70' : ''
                          }`}
                          disabled={resolving || changingPriority}
                          onPress={handleResolveTicket}>
                          {resolving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                          ) : (
                            <>
                              <CheckCircle color="#FFFFFF" size={14} />
                              <Text className="text-xs font-semibold text-white">
                                Resolver ticket
                              </Text>
                            </>
                          )}
                        </Pressable>
                      </View>

                      {/* Selector desplegable de nueva prioridad */}
                      {showPrioritySelector ? (
                        <View className="rounded-2xl border border-sky/40 bg-canvas p-3">
                          <Text className="text-[11px] font-semibold text-steel mb-2">
                            Selecciona la nueva prioridad:
                          </Text>
                          <View className="flex-row gap-2">
                            {(['low', 'medium', 'high'] as const).map((p) => {
                              const isCurrent = activeTicket.priority === p;
                              const label = p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta';
                              const activeColor = p === 'high' ? 'bg-coral' : p === 'medium' ? 'bg-petrol' : 'bg-steel';

                              return (
                                <Pressable
                                  key={p}
                                  accessibilityRole="button"
                                  className={`flex-1 h-9 items-center justify-center rounded-xl border ${
                                    isCurrent ? `${activeColor} border-transparent` : 'border-sky/50 bg-white'
                                  }`}
                                  disabled={changingPriority}
                                  onPress={() => handleChangePriority(p)}>
                                  <Text className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-petrol'}`}>
                                    {label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {isResolved ? (
                    <View className="rounded-2xl border border-sky/30 bg-sky/10 p-3 flex-row items-center gap-2">
                      <CheckCircle color={COLORS.STEEL} size={16} />
                      <Text className="text-xs text-steel">
                        Este ticket ha sido resuelto y cerrado.
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* SECCIÓN DE OBSERVACIONES / HILO DE COMENTARIOS */}
              <TicketObservationsList
                ticket={activeTicket}
                ticketId={activeTicket.id}
              />
            </View>
          </ScrollView>

          {/* Botón de cierre inferior */}
          <Pressable
            accessibilityRole="button"
            className="mt-3 h-11 w-full items-center justify-center rounded-2xl border border-sky/40 bg-white active:bg-canvas"
            onPress={onClose}>
            <Text className="text-xs font-semibold text-steel">Cerrar detalle</Text>
          </Pressable>
        </View>
      </View>

      {/* Modal de edición */}
      <EditTicketModal
        ticket={activeTicket}
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={(updated) => {
          setActiveTicket(updated);
          setActionSuccess('Ticket actualizado con éxito.');
          if (onTicketUpdated) onTicketUpdated(updated);
        }}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteTicketModal
        ticket={activeTicket}
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onSuccess={(deletedId) => {
          setIsDeleteModalVisible(false);
          onClose();
          if (onTicketDeleted) onTicketDeleted(deletedId);
        }}
      />
    </Modal>
  );
}
