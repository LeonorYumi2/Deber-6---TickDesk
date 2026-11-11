import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import type { Ticket } from '@/entities/ticket';
import deleteTrashAnimation from '@/shared/assets/animations/delete-trash.json';
import { supabase } from '@/shared/lib/supabase';
import { LottieState } from '@/shared/ui/lottie-state';

type DeleteTicketModalProps = {
  ticket: Ticket | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (deletedTicketId: string) => void;
};

export function DeleteTicketModal({
  ticket,
  visible,
  onClose,
  onSuccess,
}: DeleteTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!ticket) return null;

  const isPending = ticket.status === 'pending';

  const handleDelete = async () => {
    if (!isPending) {
      setErrorMessage('Solo se pueden eliminar tickets en estado pendiente.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticket.id);

      if (error) {
        console.error('Error al eliminar ticket:', error);
        setErrorMessage(error.message || 'No se pudo eliminar el ticket.');
        return;
      }

      onSuccess(ticket.id);
      onClose();
    } catch (err) {
      console.error('Excepción al eliminar ticket:', err);
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View className="flex-1 items-center justify-center bg-petrol/60 px-6">
        <Pressable
          accessibilityLabel="Cerrar modal"
          className="absolute inset-0"
          disabled={loading}
          onPress={onClose}
        />

        <View className="w-full max-w-[380px] items-center rounded-3xl border border-sky/40 bg-white p-6 shadow-xl">
          <LottieState size={90} source={deleteTrashAnimation} />

          <Text className="mt-2 text-center text-xl font-bold tracking-tight text-petrol">
            ¿Eliminar ticket?
          </Text>

          <Text className="mt-2 text-center text-sm leading-6 text-steel">
            ¿Estás seguro de que deseas eliminar «{ticket.title}»? Esta acción no se puede deshacer.
          </Text>

          {!isPending ? (
            <View className="mt-4 w-full rounded-xl border border-coral/30 bg-coral/10 p-3">
              <Text className="text-center text-xs font-semibold text-coral">
                Solo se pueden eliminar tickets en estado pendiente.
              </Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View className="mt-4 w-full rounded-xl border border-coral/30 bg-coral/10 p-3">
              <Text className="text-center text-xs font-medium text-coral">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <View className="mt-6 w-full gap-3">
            {isPending ? (
              <Pressable
                accessibilityRole="button"
                className={`h-13 w-full items-center justify-center rounded-2xl bg-coral shadow-sm ${
                  loading ? 'opacity-70' : 'active:opacity-90'
                }`}
                disabled={loading}
                onPress={handleDelete}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-[15px] font-semibold text-white">
                    Sí, eliminar ticket
                  </Text>
                )}
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className="h-11 w-full items-center justify-center rounded-2xl border border-sky/50 bg-white"
              disabled={loading}
              onPress={onClose}>
              <Text className="text-sm font-semibold text-steel">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
