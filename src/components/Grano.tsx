import { Image, StyleSheet, View } from 'react-native';
import { useAjustes } from '../ajustes';

// Textura de papel. Se pone DETRÁS del contenido (primer hijo de un fondo), así los botones,
// las opciones y los textos quedan limpios por encima. No recibe toques.
const TEXTURA = require('../assets/grano.png');

export function Grano({ opacidad = 1 }: { opacidad?: number }) {
  const { ajustes } = useAjustes();
  if (!ajustes.grano) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: opacidad }]}>
      <Image source={TEXTURA} resizeMode="repeat" style={styles.imagen} />
    </View>
  );
}

const styles = StyleSheet.create({
  imagen: { width: '100%', height: '100%' },
});
