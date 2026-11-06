import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Ficha } from './Ficha';
import { ajustesActuales } from '../ajustesBase';

// Cuánto dura cada paso y cada salto (en milisegundos)
export const DURACION_PASO = 300;
export const DURACION_SALTO = 400;

type Props = {
  color: string;
  size: number;
  x: number; // posición en el tablero
  y: number;
  tipo: 'paso' | 'salto'; // cómo llega a su nueva posición
  activa: boolean; // le toca jugar: late un aro a su alrededor
  rebote?: number; // cada vez que cambia, la ficha da un bote (al caer en una casilla especial)
};

export function FichaAnimada({ color, size, x, y, tipo, activa, rebote = 0 }: Props) {
  const posX = useRef(new Animated.Value(x)).current;
  const posY = useRef(new Animated.Value(y)).current;
  const brinco = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(1)).current;
  const aro = useRef(new Animated.Value(0)).current;
  const primera = useRef(true);

  // Cuando cambia el destino: un saltito hasta la casilla, o desaparece y reaparece
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    if (tipo === 'salto') {
      Animated.sequence([
        Animated.timing(escala, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(posX, { toValue: x, duration: 0, useNativeDriver: true }),
        Animated.timing(posY, { toValue: y, duration: 0, useNativeDriver: true }),
        Animated.spring(escala, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(posX, {
          toValue: x,
          duration: DURACION_PASO,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(posY, {
          toValue: y,
          duration: DURACION_PASO,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(brinco, {
            toValue: -size * 0.8,
            duration: DURACION_PASO * 0.45,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(brinco, {
            toValue: 0,
            duration: DURACION_PASO * 0.55,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [x, y]);

  // Bote al caer en una casilla especial: se estira y vuelve con un muelle
  useEffect(() => {
    if (rebote === 0 || ajustesActuales().reducirAnimaciones) return;
    Animated.sequence([
      Animated.timing(escala, { toValue: 1.45, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(escala, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true }),
    ]).start();
  }, [rebote]);

  // El aro que late alrededor de la ficha a la que le toca jugar
  useEffect(() => {
    if (!activa) {
      aro.setValue(0);
      return;
    }
    const bucle = Animated.loop(
      Animated.timing(aro, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    bucle.start();
    return () => {
      bucle.stop();
      aro.setValue(0);
    };
  }, [activa]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.contenedor,
        {
          width: size,
          height: size,
          transform: [
            { translateX: posX },
            { translateY: Animated.add(posY, brinco) },
            { scale: escala },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.aro,
          {
            borderColor: color,
            borderRadius: size,
            opacity: aro.interpolate({ inputRange: [0, 1], outputRange: activa ? [0.7, 0] : [0, 0] }),
            transform: [{ scale: aro.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
          },
        ]}
      />
      <Ficha color={color} size={size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: { position: 'absolute', left: 0, top: 0 },
  aro: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 2 },
});