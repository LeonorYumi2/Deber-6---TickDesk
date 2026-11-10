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
import { CheckCircle2, Ticket as TicketIcon, X } from 'lucide-react-native';

import { useSession } from '@/entities/session';
import type { CreateTicketDTO, Ticket, TicketPriority } from '@/entities/ticket';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';
import { TextField } from '@/shared/ui/text-field';

const SUGGESTED_CATEGORIES = [
  'Hardware',
  'Software',
  'Red / Internet',
  'Cuentas / Accesos',
  'Impresoras',
  'Otro',
];

type CreateTicketModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (newTicket: Ticket) => void;
};

export function CreateTicketModal({
  visible,
  onClose,
  onSuccess,
}: CreateTicketModalProps) {
  const { user } = useSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (loading) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();

    if (!trimmedTitle) {
      setErrorMessage('Por favor, ingresa el título del ticket.');
      return;
    }

    if (trimmedTitle.length < 5) {
      setErrorMessage('El título debe tener al menos 5 caracteres.');
      return;
    }

    if (!trimmedCategory) {
      setErrorMessage('Por favor, indica o selecciona una categoría.');
      return;
    }

    if (!trimmedDescription) {
      setErrorMessage('Por favor, ingresa la descripción del problema.');
      return;
    }

    if (trimmedDescription.length < 10) {
      setErrorMessage('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    if (!user?.id) {
      setErrorMessage('No se encontró una sesión activa de usuario. Inicia sesión nuevamente.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const payload: CreateTicketDTO = {
      title: trimmedTitle,
      description: trimmedDescription,
      category: trimmedCategory,
      priority,
      status: 'pending',
      user_id: user.id,
      assigned_to: null,
    };

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([payload])
        .select()
        .single();

      setLoading(false);

      if (error) {
        console.error('Error al insertar ticket en Supabase:', error);
        setErrorMessage(
          error.message || 'Ocurrió un error al crear el ticket. Inténtalo de nuevo.'
        );
        return;
      }

      setIsSuccess(true);
      if (onSuccess && data) {
        onSuccess(data as Ticket);
      }
    } catch (err) {
      setLoading(false);
      console.error('Excepción al registrar ticket:', err);
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : 'Error inesperado al conectar con el servidor.'
      );
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-petrol/60 px-5 py-6">
        <Pressable
          accessibilityLabel="Cerrar modal"
          className="absolute inset-0"
          disabled={loading}
          onPress={handleClose}
        />

        <View className="w-full max-w-[460px] max-h-[92%] rounded-3xl border border-sky/40 bg-white p-6 shadow-2xl">
          {/* Cabecera del modal */}
          <View className="mb-4 flex-row items-center justify-between border-b border-sky/30 pb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-petrol/10">
                <TicketIcon color={COLORS.PETROL} size={20} />
              </View>
              <View>
                <Text className="text-lg font-bold tracking-tight text-petrol">
                  {isSuccess ? 'Ticket creado' : 'Nuevo ticket'}
                </Text>
                <Text className="text-[10px] font-semibold tracking-wider text-steel">
                  SOPORTE TÉCNICO
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityHint="Cierra el formulario de creación de ticket."
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-canvas active:bg-sky/20"
              disabled={loading}
              hitSlop={8}
              onPress={handleClose}>
              <X color={COLORS.STEEL} size={18} />
            </Pressable>
          </View>

          {isSuccess ? (
            /* Pantalla de confirmación exitosa */
            <View className="items-center py-4">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-petrol/10">
                <CheckCircle2 color={COLORS.PETROL} size={36} />
              </View>

              <Text className="text-center text-xl font-bold tracking-tight text-petrol">
                ¡Ticket registrado con éxito!
              </Text>

              <Text className="mt-2 text-center text-sm leading-6 text-steel">
                Tu solicitud ha sido guardada con estado Pendiente. El equipo de soporte técnico la revisará en breve.
              </Text>

              <View className="mt-5 w-full rounded-2xl border border-sky/40 bg-canvas p-4">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-steel">
                  Resumen de la solicitud
                </Text>
                <Text className="mt-1 text-sm font-semibold text-petrol" numberOfLines={1}>
                  {title.trim()}
                </Text>
                <View className="mt-2 flex-row items-center gap-3">
                  <View className="rounded-full bg-sky/30 px-2.5 py-0.5">
                    <Text className="text-[11px] font-medium text-steel">
                      {category.trim()}
                    </Text>
                  </View>
                  <View className="rounded-full bg-petrol/10 px-2.5 py-0.5">
                    <Text className="text-[11px] font-medium text-petrol">
                      Prioridad {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityHint="Cierra esta ventana y regresa a tu panel."
                accessibilityRole="button"
                className="mt-6 h-13 w-full items-center justify-center rounded-2xl bg-petrol shadow-sm active:bg-petrol/90"
                onPress={handleClose}>
                <Text className="text-[15px] font-semibold text-white">Entendido</Text>
              </Pressable>
            </View>
          ) : (
            /* Formulario de creación */
            <ScrollView
              className="flex-grow-0"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View className="gap-4 pb-2 pt-1">
                {/* Título */}
                <TextField
                  editable={!loading}
                  label="Título del ticket *"
                  onChangeText={(val) => {
                    setTitle(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ej. Falla al encender equipo o sin internet"
                  value={title}
                />

                {/* Categoría con sugerencias */}
                <View>
                  <TextField
                    editable={!loading}
                    label="Categoría *"
                    onChangeText={(val) => {
                      setCategory(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Ej. Hardware, Software, Redes, Accesos..."
                    value={category}
                  />

                  {/* Sugerencias rápidas de categoría */}
                  <ScrollView
                    className="mt-2"
                    horizontal
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-1.5 py-0.5">
                      {SUGGESTED_CATEGORIES.map((cat) => {
                        const isSelected = category.toLowerCase() === cat.toLowerCase();
                        return (
                          <Pressable
                            key={cat}
                            accessibilityRole="button"
                            className={`rounded-xl border px-2.5 py-1 ${
                              isSelected
                                ? 'border-petrol bg-petrol/10'
                                : 'border-sky/50 bg-canvas active:bg-sky/20'
                            }`}
                            disabled={loading}
                            onPress={() => {
                              setCategory(cat);
                              if (errorMessage) setErrorMessage(null);
                            }}>
                            <Text
                              className={`text-[11px] font-semibold ${
                                isSelected ? 'text-petrol' : 'text-steel'
                              }`}>
                              {cat}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                {/* Prioridad */}
                <View>
                  <Text className="mb-2 text-sm font-medium text-petrol">
                    Prioridad *
                  </Text>
                  <View className="flex-row gap-2.5">
                    {(['low', 'medium', 'high'] as const).map((p) => {
                      const isSelected = priority === p;
                      const label =
                        p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta';
                      const activeBg =
                        p === 'high'
                          ? 'bg-coral'
                          : p === 'medium'
                            ? 'bg-petrol'
                            : 'bg-steel';
                      const borderCol =
                        p === 'high'
                          ? 'border-coral'
                          : p === 'medium'
                            ? 'border-petrol'
                            : 'border-steel';

                      return (
                        <Pressable
                          key={p}
                          accessibilityRole="button"
                          className={`h-11 flex-1 flex-row items-center justify-center rounded-2xl border ${
                            isSelected
                              ? `${activeBg} ${borderCol}`
                              : 'border-sky/60 bg-white active:bg-canvas'
                          }`}
                          disabled={loading}
                          onPress={() => {
                            setPriority(p);
                            if (errorMessage) setErrorMessage(null);
                          }}>
                          <Text
                            className={`text-xs font-bold ${
                              isSelected ? 'text-white' : 'text-petrol'
                            }`}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Descripción del problema */}
                <View>
                  <Text className="mb-2 text-sm font-medium text-petrol">
                    Descripción del problema *
                  </Text>
                  <TextInput
                    className="min-h-[105px] rounded-2xl border border-sky bg-white p-4 text-[15px] text-petrol"
                    editable={!loading}
                    multiline
                    numberOfLines={4}
                    onChangeText={(val) => {
                      setDescription(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Describe detalladamente el problema, mensajes de error observados y el área de trabajo afectada..."
                    placeholderTextColor={COLORS.STEEL}
                    textAlignVertical="top"
                    value={description}
                  />
                </View>

                {/* Mensaje de error de validación o del servidor */}
                {errorMessage ? (
                  <View className="rounded-xl border border-coral/30 bg-coral/10 p-3">
                    <Text className="text-center text-xs font-medium text-coral">
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                {/* Botones de acción */}
                <View className="mt-2 gap-2.5">
                  <Pressable
                    accessibilityHint="Guarda el ticket en el sistema."
                    accessibilityRole="button"
                    className={`h-13 w-full items-center justify-center rounded-2xl bg-petrol shadow-sm ${
                      loading ? 'opacity-70' : 'active:bg-petrol/90'
                    }`}
                    disabled={loading}
                    onPress={handleSave}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-[15px] font-semibold text-white">
                        Guardar ticket
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    accessibilityHint="Descarta el formulario y regresa al panel."
                    accessibilityRole="button"
                    className={`h-11 w-full items-center justify-center rounded-2xl border border-sky/50 bg-white active:bg-canvas ${
                      loading ? 'opacity-50' : ''
                    }`}
                    disabled={loading}
                    onPress={handleClose}>
                    <Text className="text-sm font-semibold text-steel">
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
