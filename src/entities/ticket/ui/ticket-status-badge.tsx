import { Text, View } from 'react-native';
import type { TicketStatus } from '../model/types';

type TicketStatusBadgeProps = {
  status: TicketStatus | string;
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  let label = 'Pendiente';
  let badgeClasses = 'bg-sky/30 border-sky/70';
  let textClasses = 'text-petrol';
  let dotColor = 'bg-steel';

  if (status === 'in_progress') {
    label = 'En proceso';
    badgeClasses = 'bg-petrol/10 border-petrol/30';
    textClasses = 'text-petrol';
    dotColor = 'bg-petrol';
  } else if (status === 'resolved') {
    label = 'Resuelto';
    badgeClasses = 'bg-steel/10 border-steel/30';
    textClasses = 'text-steel';
    dotColor = 'bg-steel';
  } else if (status === 'cancelled') {
    label = 'Cancelado';
    badgeClasses = 'bg-coral/10 border-coral/30';
    textClasses = 'text-coral';
    dotColor = 'bg-coral';
  }

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${badgeClasses}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <Text className={`text-[10px] font-bold tracking-wider ${textClasses}`}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
