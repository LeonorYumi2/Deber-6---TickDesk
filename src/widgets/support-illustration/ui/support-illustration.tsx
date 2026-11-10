import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import LottieView from 'lottie-react-native';

import supportAnimation from '@/shared/assets/animations/support-desk.json';

type SupportIllustrationProps = {
  compact?: boolean;
};

export function SupportIllustration({ compact = false }: SupportIllustrationProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Garantiza inicio de reproducción en Android ante diferencias de ciclo de vida nativo
    const timer = setTimeout(() => {
      lottieRef.current?.play();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      accessible
      accessibilityLabel="Ilustración animada de un escritorio de soporte"
      accessibilityRole="image"
      className={`${
        compact ? 'h-[120px] rounded-2xl' : 'h-[160px] rounded-3xl'
      } items-center justify-center overflow-hidden bg-sky/40`}>
      <LottieView
        ref={lottieRef}
        autoPlay
        loop
        source={supportAnimation}
        style={{
          width: compact ? 170 : 210,
          height: compact ? 120 : 150,
        }}
      />
      <View
        className={`absolute rounded-full bg-canvas/90 ${
          compact ? 'bottom-2 right-3 px-2.5 py-0.5' : 'bottom-3 right-4 px-3 py-1'
        }`}>
        <Text
          className={`font-semibold tracking-[1.4px] text-petrol ${
            compact ? 'text-[8px]' : 'text-[9px]'
          }`}>
          SOPORTE TÉCNICO
        </Text>
      </View>
    </View>
  );
}
