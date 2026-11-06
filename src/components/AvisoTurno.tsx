import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BORDE, FUENTES, TINTA } from '../diseno';
import { useTema } from '../temas';

type Props = {
  texto: string;
  subtexto?: string;
  color: string; // color de la ficha del jugador
  onTerminar: () => void;
};

// En minúscula y con punto final, como los avisos pixelados del diseño
const comoPixel = (texto: string) => {
  const limpio = texto.trim().toLowerCase();
  return /[.!?]$/.test(limpio) ? limpio : `${limpio}.`;
};

export function AvisoTurno({ texto, subtexto, color, onTerminar }: Props) {
  const tema = useTema();
  const progreso = useRef(new Animated.Value(0)).current;
  const alTerminar = useRef(onTerminar);
  alTerminar.current = onTerminar;

  // Entra con un pequeño rebote, se queda un momento y se va
  useEffect(() => {
    const animacion = Animated.sequence([
      Animated.timing(progreso, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.back(1.8)),
        useNativeDriver: true,
      }),
      Animated.delay(1300),
      Animated.timing(progreso, {
        toValue: 2,
        duration: 260,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animacion.start(({ finished }) => {
      if (finished) alTerminar.current();
    });
    return () => animacion.stop();
  }, [progreso]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.caja,
        {
          backgroundColor: tema.papel,
          opacity: progreso.interpolate({ inputRange: [0, 0.5, 1, 2], outputRange: [0, 1, 1, 0] }),
          transform: [
            { scale: progreso.interpolate({ inputRange: [0, 1, 2], outputRange: [0.6, 1, 0.9] }) },
          ],
        },
      ]}
    >
      <View style={styles.fila}>
        <View style={[styles.punto, { backgroundColor: color }]} />
        <Text style={styles.texto}>{comoPixel(texto)}</Text>
      </View>
      {subtexto ? <Text style={styles.subtexto}>{comoPixel(subtexto)}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  caja: {
    maxWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: BORDE,
    borderColor: TINTA,
    gap: 4,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  punto: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: TINTA },
  texto: { fontFamily: FUENTES.pixel, fontSize: 12, color: TINTA, flexShrink: 1 },
  subtexto: { fontFamily: FUENTES.pixel, fontSize: 9, color: TINTA },
});
