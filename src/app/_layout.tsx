import { Anton_400Regular } from '@expo-google-fonts/anton';
import {
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { AjustesProvider } from '../ajustes';
import { MazosProvider } from '../mazos';
import { FUENTES, PALETAS, TINTA } from '../diseno';

const FONDO = PALETAS.basico.pagina;

export default function RootLayout() {
  const [cargadas, error] = useFonts({
    Anton_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Silkscreen_400Regular,
  });

  // Hasta que estén las fuentes se muestra el fondo, para que no salten los textos
  if (!cargadas && !error) return <View style={{ flex: 1, backgroundColor: FONDO }} />;

  return (
    <AjustesProvider>
    <MazosProvider>
    <View style={{ flex: 1, backgroundColor: FONDO }}>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: FONDO },
        headerShadowVisible: false,
        headerTintColor: TINTA,
        headerTitleStyle: { color: TINTA, fontFamily: FUENTES.titulo, fontSize: 22 },
        contentStyle: { backgroundColor: FONDO },
        headerShown: false, // cada pantalla dibuja su propia cabecera
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="modos" />
      <Stack.Screen name="jugadores" />
      <Stack.Screen name="juego" options={{ gestureEnabled: false }} />
      <Stack.Screen name="dado" options={{ gestureEnabled: false }} />
      <Stack.Screen name="cartas" options={{ gestureEnabled: false }} />
      <Stack.Screen name="reglas" options={{ presentation: 'modal' }} />
      <Stack.Screen name="ajustes" options={{ presentation: 'modal' }} />
      <Stack.Screen name="mazos" options={{ presentation: 'modal' }} />
      <Stack.Screen name="mazo" options={{ presentation: 'modal' }} />
    </Stack>
    </View>
    </MazosProvider>
    </AjustesProvider>
  );
}
