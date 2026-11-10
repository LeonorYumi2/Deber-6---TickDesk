import { Text, View } from 'react-native';
import { Headphones } from 'lucide-react-native';

import { COLORS } from '@/shared/theme';

export type AppLogoVariant = 'default' | 'inverted';
export type AppLogoSize = 'sm' | 'md' | 'lg';

export type AppLogoProps = {
  variant?: AppLogoVariant;
  size?: AppLogoSize;
  showText?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
};

const SIZES = {
  sm: {
    container: 'h-10 w-10 rounded-2xl',
    iconSize: 20,
    titleSize: 'text-base font-bold tracking-tight',
    subtitleSize: 'text-[10px] font-bold tracking-[2px]',
    gap: 'gap-2.5',
  },
  md: {
    container: 'h-11 w-11 rounded-2xl',
    iconSize: 22,
    titleSize: 'text-lg font-bold tracking-tight',
    subtitleSize: 'text-[10px] font-semibold tracking-[2px]',
    gap: 'gap-3',
  },
  lg: {
    container: 'h-14 w-14 rounded-3xl',
    iconSize: 28,
    titleSize: 'text-xl font-bold tracking-tight',
    subtitleSize: 'text-[11px] font-semibold tracking-[2px]',
    gap: 'gap-3.5',
  },
} as const;

export function AppLogo({
  variant = 'default',
  size = 'md',
  showText = true,
  title = 'TickDesk',
  subtitle = 'SUPPORT SYSTEM',
  className = '',
}: AppLogoProps) {
  const sizeConfig = SIZES[size];
  const isInverted = variant === 'inverted';

  const containerStyle = isInverted
    ? 'border border-white/20 bg-white/15 shadow-sm'
    : 'bg-petrol shadow-sm';

  const titleColorStyle = isInverted ? '#FFFFFF' : COLORS.PETROL;
  const subtitleColorStyle = isInverted ? COLORS.SKY : COLORS.STEEL;

  return (
    <View
      accessibilityLabel={`${title} ${subtitle}`}
      accessibilityRole="header"
      className={`flex-row items-center ${sizeConfig.gap} ${className}`.trim()}>
      <View
        className={`${sizeConfig.container} items-center justify-center ${containerStyle}`}
        style={!isInverted ? { backgroundColor: COLORS.PETROL } : undefined}>
        <Headphones color="#FFFFFF" size={sizeConfig.iconSize} strokeWidth={2.2} />
      </View>

      {showText && (
        <View>
          <Text
            className={`${sizeConfig.titleSize} ${isInverted ? 'text-white' : 'text-petrol'}`}
            style={{ color: titleColorStyle }}>
            {title}
          </Text>
          {Boolean(subtitle) && (
            <Text
              className={`${sizeConfig.subtitleSize} ${isInverted ? 'text-sky' : 'text-steel'}`}
              style={{ color: subtitleColorStyle }}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
