import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Edit3, X } from 'lucide-react-native';

import { TicketPriorityBadge, type Ticket } from '@/entities/ticket';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';
import { TextField } from '@/shared/ui/text-field';

type EditTicketModalProps = {
  ticket: Ticket | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (updated: Ticket) => void;
};

function EditTicketFormContent({
  ticket,
  onClose,
  onSuccess,
}: {
  ticket: Ticket;
  onClose: () => void;
  onSuccess: (updated: Ticket) => void;
}) {
  const [title, setTitle] = useState(ticket.title || '');
  const [description, setDescription] = useState(ticket.description || '');
  const [category, setCategory] = useState(ticket.category || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPending = ticket.status === 'pending';

  const handleSave = async () => {
    // 7. No permitir editar si el ticket no está pendiente
    if (!isPending) {
      setErrorMessage('Solo se pueden editar tickets en estado pendiente.');
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();

    if (!trimmedTitle || trimmedTitle.length < 5) {
      setErrorMessage('El título debe tener al menos 5 caracteres.');
      return;
    }

    if (!trimmedCategory) {
      setErrorMessage('Por favor, indica la categoría.');
      return;
    }

    if (!trimmedDescription || trimmedDescription.length < 10) {
      setErrorMessage('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Llamada RPC con nombres exactos de parámetros definidos en Supabase
      // 2. Envío de valores validados del formulario
      const { data, error } = await supabase.rpc('requester_update_pending_ticket', {
        p_ticket_id: ticket.id,
        p_title: trimmedTitle,
        p_description: trimmedDescription,
        p_category: trimmedCategory,
      });

      // 5. Capturar el error real devuelto por Supabase para depurar
      if (error) {
        console.error('Error al actualizar ticket mediante RPC requester_update_pending_ticket:', error);
        setErrorMessage(error.message || 'No se pudo actualizar el ticket.');
        return;
      }

      // 3 y 4. Comprobar resultado booleano: data === false NO es éxito
      if (data === false) {
        setErrorMessage('No se pudo actualizar el ticket. Es posible que ya no esté pendiente o no tengas permisos para modificarlo.');
        return;
      }

      // 6. Al completarse exitosamente, actualizar la interfaz
      const updated: Ticket = {
        ...ticket,
        title: trimmedTitle,
        description: trimmedDescription,
        category: trimmedCategory,
      };

      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error('Excepción al actualizar ticket:', err);
      setErrorMessage('Error de conexión al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full max-w-[460px] max-h-[92%] rounded-3xl border border-sky/40 bg-white p-6 shadow-2xl">
      {/* Cabecera */}
      <View className="mb-4 flex-row items-center justify-between border-b border-sky/30 pb-3">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-petrol/10">
            <Edit3 color={COLORS.PETROL} size={18} />
          </View>
          <View>
            <Text className="text-base font-bold text-petrol">
              Editar ticket
            </Text>
            <Text className="text-[10px] font-semibold tracking-wider text-steel">
              SOLICITUD PENDIENTE
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          className="h-8 w-8 items-center justify-center rounded-full bg-canvas"
          disabled={loading}
          onPress={onClose}>
          <X color={COLORS.STEEL} size={18} />
        </Pressable>
      </View>

      {!isPending ? (
        <View className="py-6 items-center">
          <Text className="text-center text-sm font-semibold text-coral">
            Este ticket ya no se encuentra en estado pendiente y no puede ser modificado.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-grow-0"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="gap-3.5 pb-2">
            <TextField
              editable={!loading}
              label="Título *"
              onChangeText={(val) => {
                setTitle(val);
                if (errorMessage) setErrorMessage(null);
              }}
              value={title}
            />

            <TextField
              editable={!loading}
              label="Categoría *"
              onChangeText={(val) => {
                setCategory(val);
                if (errorMessage) setErrorMessage(null);
              }}
              value={category}
            />

            <View>
              <Text className="mb-1.5 text-xs font-semibold text-steel">
                Prioridad
              </Text>
              <View className="flex-row items-center justify-between rounded-2xl border border-sky/30 bg-canvas px-3.5 py-2.5">
                <TicketPriorityBadge priority={ticket.priority} />
                <Text className="text-[11px] text-steel">
                  Asignada al registrar el ticket
                </Text>
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-petrol">
                Descripción del problema *
              </Text>
              <TextInput
                className="min-h-[95px] rounded-2xl border border-sky bg-white p-3.5 text-xs text-petrol"
                editable={!loading}
                multiline
                numberOfLines={4}
                onChangeText={(val) => {
                  setDescription(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholderTextColor={COLORS.STEEL}
                textAlignVertical="top"
                value={description}
              />
            </View>

            {errorMessage ? (
              <View className="rounded-xl border border-coral/30 bg-coral/10 p-2.5">
                <Text className="text-center text-xs font-medium text-coral">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <View className="mt-2 gap-2">
              <Pressable
                accessibilityRole="button"
                className={`h-12 w-full items-center justify-center rounded-2xl bg-petrol ${
                  loading ? 'opacity-70' : 'active:bg-petrol/90'
                }`}
                disabled={loading}
                onPress={handleSave}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    Guardar cambios
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="h-10 w-full items-center justify-center rounded-xl border border-sky/50 bg-white"
                disabled={loading}
                onPress={onClose}>
                <Text className="text-xs font-semibold text-steel">
                  Cancelar
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export function EditTicketModal({
  ticket,
  visible,
  onClose,
  onSuccess,
}: EditTicketModalProps) {
  if (!visible || !ticket) return null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-petrol/60 px-5 py-6">
        <Pressable
          accessibilityLabel="Cerrar modal"
          className="absolute inset-0"
          onPress={onClose}
        />

        <EditTicketFormContent
          key={`${ticket.id}-${ticket.updated_at || ticket.created_at}`}
          onClose={onClose}
          onSuccess={onSuccess}
          ticket={ticket}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}
