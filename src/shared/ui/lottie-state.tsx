import { useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import LottieView, { type AnimationObject } from 'lottie-react-native';

export type LottieStateProps = {
  source: string | AnimationObject | { uri: string };
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function LottieState({
  source,
  size = 120,
  loop = true,
  autoPlay = true,
  className = '',
  style,
}: LottieStateProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Garantizar inicio de reproducción en Android tras el montaje nativo
    const timer = setTimeout(() => {
      lottieRef.current?.play();
    }, 80);

    return () => clearTimeout(timer);
  }, [source]);

  return (
    <View
      className={`items-center justify-center ${className}`.trim()}
      style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={lottieRef}
        autoPlay={autoPlay}
        loop={loop}
        source={source}
        style={{ width: size, height: size }}
      />
    </View>
  );
}
