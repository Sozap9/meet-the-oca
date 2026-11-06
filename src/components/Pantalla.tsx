import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FUENTES, PALETAS, TINTA } from '../diseno';
import { Grano } from './Grano';
import { BotonRedondo } from './Ui';
import type { NombreIcono } from './Ui';

// Marco común de las pantallas: fondo de página y cabecera con botón redondo y título grande
export function Pantalla({
  titulo,
  subtitulo,
  onVolver,
  iconoVolver = 'atras',
  derecha,
  fondo = PALETAS.basico.pagina,
  bordes = ['top', 'bottom'],
  children,
}: {
  titulo?: string;
  subtitulo?: string; // texto pixelado encima del título
  onVolver?: () => void;
  iconoVolver?: NombreIcono;
  derecha?: ReactNode;
  fondo?: string;
  bordes?: Edge[];
  children: ReactNode;
}) {
  return (
    <SafeAreaView edges={bordes} style={[styles.contenedor, { backgroundColor: fondo }]}>
      <Grano />
      {titulo || onVolver ? (
        <View style={styles.cabecera}>
          {onVolver ? (
            <BotonRedondo icono={iconoVolver} etiqueta="Volver" onPress={onVolver} />
          ) : null}
          <View style={styles.textos}>
            {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
            {titulo ? (
              <Text style={styles.titulo} numberOfLines={1} adjustsFontSizeToFit>
                {titulo}
              </Text>
            ) : null}
          </View>
          {derecha}
        </View>
      ) : null}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  textos: { flex: 1, gap: 2 },
  subtitulo: { fontFamily: FUENTES.pixel, fontSize: 10, color: TINTA },
  titulo: { fontFamily: FUENTES.titulo, fontSize: 32, color: TINTA, textTransform: 'uppercase' },
});
