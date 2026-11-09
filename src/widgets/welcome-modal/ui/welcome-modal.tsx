import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import techWelcomeAnimation from "@/shared/assets/animations/tech-welcome.json";

type WelcomeModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function WelcomeModal({ visible, onClose }: WelcomeModalProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      // Garantizar inicio de reproducción en Android tras el montaje nativo
      const timer = setTimeout(() => {
        lottieRef.current?.play();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 items-center justify-center bg-petrol/60 px-6">
        <View className="w-full max-w-[380px] items-center rounded-3xl border border-sky/40 bg-white p-6 shadow-xl">
          {/* Píldora de estado superior */}
          <View className="mb-2 rounded-full border border-sky/60 bg-sky/20 px-3 py-1">
            <Text className="text-[10px] font-bold tracking-[1.5px] text-steel">
              SISTEMA DE SOPORTE
            </Text>
          </View>

          {/* Personaje animado: técnico de soporte informático saludando */}
          <View className="my-2 h-[180px] w-[180px] items-center justify-center">
            <LottieView
              ref={lottieRef}
              autoPlay
              loop
              source={techWelcomeAnimation}
              style={{ width: 180, height: 180 }}
            />
          </View>

          {/* Título principal */}
          <Text className="text-center text-2xl font-bold tracking-tight text-petrol">
            ¡Bienvenido a TickDesk!
          </Text>

          {/* Mensaje principal */}
          <Text className="mt-2.5 text-center text-[15px] leading-6 text-steel">
            ¡Qué bueno tenerte de vuelta! Tu espacio de soporte técnico está
            listo.
          </Text>

          {/* Botón de confirmación */}
          <Pressable
            accessibilityHint="Cierra la bienvenida y te lleva a tu panel de control."
            accessibilityRole="button"
            className="mt-6 h-14 w-full items-center justify-center rounded-2xl bg-petrol active:opacity-90"
            onPress={onClose}
          >
            <Text className="text-[15px] font-semibold text-white">
              Continuar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
