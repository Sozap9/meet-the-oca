import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { ajustesActuales } from './ajustesBase';

// Vibraciones suaves. En la web no hay, y si el móvil no las admite no pasa nada.
export function vibrar(tipo: 'dado' | 'especial' | 'toque' = 'toque') {
  if (Platform.OS === 'web' || !ajustesActuales().vibracion) return;
  const promesa =
    tipo === 'dado'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      : tipo === 'especial'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  promesa.catch(() => {});
}
