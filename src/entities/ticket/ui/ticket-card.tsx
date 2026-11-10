import { Pressable, Text, View } from 'react-native';
import { Calendar, ChevronRight, Clock, UserCheck } from 'lucide-react-native';

import { COLORS } from '@/shared/theme';
import type { Ticket } from '../model/types';
import { TicketPriorityBadge } from './ticket-priority-badge';
import { TicketStatusBadge } from './ticket-status-badge';

type TicketCardProps = {
  ticket: Ticket;
  onPress: (ticket: Ticket) => void;
};

function formatDate(dateStr: string): string {
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

export function TicketCard({ ticket, onPress }: TicketCardProps) {
  const formattedDate = formatDate(ticket.created_at);

  return (
    <Pressable
      accessibilityHint="Toca para ver el detalle del ticket."
      accessibilityRole="button"
      className="mb-3 rounded-2xl border border-sky/40 bg-white p-4 shadow-sm active:bg-sky/5"
      onPress={() => onPress(ticket)}>
      {/* Fila superior: categoría y badges */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="max-w-[50%] rounded-md bg-canvas px-2 py-0.5 border border-sky/30">
          <Text className="text-[10px] font-semibold text-steel" numberOfLines={1}>
            {ticket.category || 'General'}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <TicketPriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
        </View>
      </View>

      {/* Título y descripción */}
      <View className="mt-2.5">
        <Text className="text-base font-bold tracking-tight text-petrol" numberOfLines={2}>
          {ticket.title}
        </Text>
        <Text className="mt-1 text-xs leading-4 text-steel" numberOfLines={2}>
          {ticket.description}
        </Text>
      </View>

      {/* Indicador de asignación */}
      <View className="mt-2.5 flex-row items-center">
        {ticket.assigned_to ? (
          <View className="flex-row items-center gap-1 rounded-md bg-petrol/5 border border-petrol/20 px-2 py-0.5">
            <UserCheck color={COLORS.PETROL} size={11} />
            <Text className="text-[10px] font-medium text-petrol" numberOfLines={1}>
              Asignado: {ticket.assigned_profile?.full_name || 'Técnico de soporte'}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1 rounded-md bg-canvas border border-sky/40 px-2 py-0.5">
            <Clock color={COLORS.STEEL} size={11} />
            <Text className="text-[10px] font-medium text-steel">
              Pendiente de asignación
            </Text>
          </View>
        )}
      </View>

      {/* Fila inferior: fecha y chevron */}
      <View className="mt-3 flex-row items-center justify-between border-t border-sky/20 pt-2.5">
        <View className="flex-row items-center gap-1.5">
          <Calendar color={COLORS.STEEL} size={12} />
          <Text className="text-[11px] text-steel">{formattedDate}</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Text className="text-[11px] font-semibold text-steel">Ver detalle</Text>
          <ChevronRight color={COLORS.STEEL} size={14} />
        </View>
      </View>
    </Pressable>
  );
}
