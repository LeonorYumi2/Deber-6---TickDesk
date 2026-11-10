import { Text, View } from 'react-native';
import type { TicketPriority } from '../model/types';

type TicketPriorityBadgeProps = {
  priority: TicketPriority | string;
};

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
  let label = 'Media';
  let badgeClasses = 'bg-petrol/10 border-petrol/20';
  let textClasses = 'text-petrol';

  if (priority === 'low') {
    label = 'Baja';
    badgeClasses = 'bg-steel/10 border-steel/20';
    textClasses = 'text-steel';
  } else if (priority === 'high') {
    label = 'Alta';
    badgeClasses = 'bg-coral/15 border-coral/30';
    textClasses = 'text-coral';
  }

  return (
    <View
      className={`rounded-full border px-2 py-0.5 ${badgeClasses}`}>
      <Text className={`text-[10px] font-semibold ${textClasses}`}>
        {label}
      </Text>
    </View>
  );
}
