import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ajustesActuales } from '../ajustesBase';

// Animación de entrada de las ventanas: aparecen con un pequeño salto
export function useEntrada() {
  const valor = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (ajustesActuales().reducirAnimaciones) {
      valor.setValue(1);
      return;
    }
    Animated.spring(valor, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }).start();
  }, []);
  return {
    opacity: valor.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
      { scale: valor.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
      { translateY: valor.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
    ],
  };
}
