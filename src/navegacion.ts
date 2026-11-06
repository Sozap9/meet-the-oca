import { useRouter } from 'expo-router';

// Vuelve a la portada; si no hay pantallas anteriores (por ejemplo, tras recargar en web), la abre directamente
export function useVolverAlInicio() {
  const router = useRouter();
  return () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };
}
// Vuelve a la pantalla anterior; si no la hay (al recargar en web o abrir un enlace directo),
// va a la pantalla indicada en su lugar
export function useVolver(siNoHay: '/' | '/modos' = '/') {
  const router = useRouter();
  return () => {
    if (router.canGoBack()) router.back();
    else router.replace(siNoHay);
  };
}

// Salir de una partida: vuelve a la pantalla de elegir modo.
// Si está en la pila, se cierran las pantallas de encima; si no (recarga en web), se abre en su lugar.
export function useVolverAModos() {
  const router = useRouter();
  return () => {
    if (router.canDismiss()) router.dismissTo('/modos');
    else router.replace('/modos');
  };
}
