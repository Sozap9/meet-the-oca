import { View } from 'react-native';
import { BORDE, TINTA } from '../diseno';

type Props = { color: string; size: number };

// Ficha plana con contorno de tinta, como el resto del tablero
export function Ficha({ color, size }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        borderWidth: BORDE,
        borderColor: TINTA,
      }}
    />
  );
}
