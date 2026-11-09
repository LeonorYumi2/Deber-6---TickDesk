import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import LottieView from 'lottie-react-native';

import supportAnimation from '@/shared/assets/animations/support-desk.json';

export function SupportIllustration() {
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
      className="h-[184px] items-center justify-center overflow-hidden rounded-[28px] bg-sky/40">
      <LottieView
        ref={lottieRef}
        autoPlay
        loop
        source={supportAnimation}
        style={{ width: 230, height: 170 }}
      />
      <View className="absolute bottom-3 right-4 rounded-full bg-canvas/90 px-3 py-1">
        <Text className="text-[9px] font-semibold tracking-[1.4px] text-petrol">
          SOPORTE TÉCNICO
        </Text>
      </View>
    </View>
  );
}
