import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useEntrada } from './Entrada';
import { Grano } from './Grano';
import Svg, { Path } from 'react-native-svg';
import { BORDE, FUENTES, TINTA, COLOR_SOMBRA } from '../diseno';
import { useTema } from '../temas';
import { DibujoCasilla } from './IconosCasilla';
import { CuerpoOca } from './Oca';
import type { Ojo } from './Oca';
import { BotonDuro } from './Ui';
import type { NombreIcono } from './Ui';

// Una única ventana emergente para todo el juego: cambiar de contenido dentro de ella
// evita cerrar una ventana y abrir otra a la vez, que en iPhone puede fallar.
export function Capa({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <KeyboardAvoidingView
        style={styles.fondo}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Tocar el fondo oscuro, fuera de la ventana, cierra el teclado */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        {children}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// La caja de las ventanas: papel, contorno de tinta y sombra dura.
// "grande" es la de las tarjetas (sin relleno, para que la cabecera llegue al borde).
// "oculta" la esconde sin desmontarla (por ejemplo, mientras se pasa el móvil)
export function Caja({
  children,
  grande = false,
  oculta = false,
}: {
  children: ReactNode;
  grande?: boolean;
  oculta?: boolean;
}) {
  const tema = useTema();
  const entrada = useEntrada();
  // Escondida (mientras se pasa el móvil), su campo de texto no puede seguir con el teclado abierto
  useEffect(() => {
    if (oculta) Keyboard.dismiss();
  }, [oculta]);
  return (
    <Animated.View
      style={[
        styles.envoltura,
        grande ? styles.envolturaGrande : styles.envolturaNormal,
        oculta && styles.oculta,
        entrada,
      ]}
    >
      <View style={styles.sombra} />
      <View
        style={[
          styles.caja,
          grande ? styles.cajaGrande : styles.cajaEncogible,
          { backgroundColor: tema.papel },
        ]}
      >
        {/* El papel de las ventanas lleva un grano más suave */}
        <Grano opacidad={0.55} />
        {grande ? (
          children
        ) : (
          // Si no cabe (por ejemplo, con el teclado abierto), la ventana se desplaza en vez de salirse
          <ScrollView
            style={styles.desplazable}
            contentContainerStyle={styles.cajaNormal}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );
}

// ---------- Cabecera de color con onda y la oca asomando ----------

// La onda se calcula para el ancho real de la cabecera, así siempre llega de borde a borde
function onda(ancho: number): string {
  const pasos = Math.ceil(ancho / 3);
  let d = 'M0 8';
  for (let i = 1; i <= pasos; i++) {
    const x = Math.min(i * 3, ancho);
    d += ` L${x.toFixed(1)} ${(8 + 4 * Math.sin((2 * Math.PI * x) / 42)).toFixed(1)}`;
  }
  return d;
}

export type DibujoCabecera = Parameters<typeof DibujoCasilla>[0]['tipo'] | Ojo;

type PropsCabecera = {
  titulo: string;
  chip?: string; // texto pixelado de arriba (casilla, categoría...)
  nivel?: 1 | 2 | 3; // puntos de intensidad
  dibujo?: DibujoCabecera; // una casilla (posada, pozo...) o la oca con un ojo concreto
  sangrado?: boolean; // dentro de una caja normal: ocupa también su relleno
  ilustracion?: ReactNode; // un dibujo propio en lugar de la oca o la casilla (temas del dado)
};

const OJOS: Ojo[] = ['normal', 'feliz', 'dormido', 'enfadado', 'preocupado', 'mareado', 'ko'];

export function CabeceraModal({
  titulo,
  chip,
  nivel,
  dibujo = 'normal',
  sangrado = false,
  ilustracion,
}: PropsCabecera) {
  const tema = useTema();
  const esOca = OJOS.includes(dibujo as Ojo);
  const [ancho, setAncho] = useState(0);
  const linea = ancho > 0 ? onda(ancho) : '';
  return (
    <View
      onLayout={(e) => setAncho(Math.ceil(e.nativeEvent.layout.width) + 2)}
      style={[styles.cabecera, { backgroundColor: tema.cabecera }, sangrado && styles.sangrado]}
    >
      <View style={styles.dibujo} pointerEvents="none">
        <Svg width={74} height={74} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
          {ilustracion ? (
            ilustracion
          ) : esOca ? (
            <CuerpoOca ojo={dibujo as Ojo} grosor={6} />
          ) : (
            <DibujoCasilla tipo={dibujo as Exclude<DibujoCabecera, Ojo>} idUnico="cabecera" />
          )}
        </Svg>
      </View>
      {chip || nivel ? (
        <View style={styles.chipFila}>
          {chip ? <Text style={[styles.chip, { color: tema.cabeceraTexto }]}>{chip}</Text> : null}
          {nivel ? (
            <View style={styles.puntos} accessibilityLabel={`Intensidad ${nivel} de 3`}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.puntoNivel, { backgroundColor: i <= nivel ? tema.oca : tema.papel }]}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <Text style={[styles.titulo, { color: tema.cabeceraTexto }]}>{titulo}</Text>
      {ancho > 0 ? (
        <Svg width={ancho} height={16} viewBox={`0 0 ${ancho} 16`} style={styles.onda}>
          <Path d={`${linea} L${ancho} 16 L0 16 Z`} fill={tema.papel} />
          <Path d={linea} fill="none" stroke={TINTA} strokeWidth={2} />
        </Svg>
      ) : null}
    </View>
  );
}

// ---------- Textos y botones de las ventanas ----------

export function TextoModal({ children, fuerte = false }: { children: ReactNode; fuerte?: boolean }) {
  return <Text style={fuerte ? styles.textoFuerte : styles.texto}>{children}</Text>;
}

export function AvisoPixel({ children }: { children: string }) {
  const limpio = children.trim().toLowerCase();
  return <Text style={styles.pixel}>{/[.!?:]$/.test(limpio) ? limpio : `${limpio}.`}</Text>;
}

export function BotonModal({
  texto,
  descripcion,
  onPress,
  principal = false,
  desactivado = false,
  icono,
  color,
}: {
  texto: string;
  descripcion?: string;
  onPress: () => void;
  principal?: boolean;
  desactivado?: boolean;
  icono?: NombreIcono;
  color?: string;
}) {
  const tema = useTema();
  return (
    <BotonDuro
      texto={texto}
      descripcion={descripcion}
      onPress={onPress}
      desactivado={desactivado}
      icono={icono}
      color={color ?? (principal ? tema.oca : tema.papel)}
      style={styles.botonAncho}
    />
  );
}

const SOMBRA = 3;

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(21,21,21,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  envoltura: { width: '100%', paddingRight: SOMBRA, paddingBottom: SOMBRA },
  envolturaNormal: { maxWidth: 380, maxHeight: '100%' },
  oculta: { display: 'none' },
  envolturaGrande: { maxWidth: 430, maxHeight: '92%' },
  sombra: {
    position: 'absolute',
    left: SOMBRA,
    top: SOMBRA,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    backgroundColor: COLOR_SOMBRA,
  },
  caja: {
    width: '100%',
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 22,
    overflow: 'hidden',
  },
  cajaNormal: { padding: 20, gap: 12, alignItems: 'center' },
  cajaEncogible: { flexShrink: 1 },
  desplazable: { flexGrow: 0, flexShrink: 1 },
  cajaGrande: { minHeight: 420, flexShrink: 1 },
  cabecera: {
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 8,
    minHeight: 104,
    justifyContent: 'flex-end',
  },
  sangrado: { width: undefined, alignSelf: 'stretch', marginTop: -20, marginHorizontal: -20, marginBottom: 4 },
  dibujo: { position: 'absolute', right: 10, bottom: 4 },
  chipFila: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 80 },
  chip: { fontFamily: FUENTES.pixel, fontSize: 11 },
  puntos: { flexDirection: 'row', gap: 4 },
  puntoNivel: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: TINTA },
  titulo: {
    fontFamily: FUENTES.titulo,
    fontSize: 30,
    lineHeight: 38,
    paddingTop: 2,
    textTransform: 'uppercase',
    maxWidth: '72%',
  },
  onda: { position: 'absolute', left: -1, bottom: -1 },
  texto: {
    fontFamily: FUENTES.textoSemi,
    fontSize: 15,
    lineHeight: 21,
    color: TINTA,
    textAlign: 'center',
  },
  textoFuerte: {
    fontFamily: FUENTES.textoFuerte,
    fontSize: 20,
    lineHeight: 25,
    color: TINTA,
    textAlign: 'center',
  },
  pixel: { fontFamily: FUENTES.pixel, fontSize: 11, color: TINTA, textAlign: 'center' },
  botonAncho: { width: '100%' },
});
