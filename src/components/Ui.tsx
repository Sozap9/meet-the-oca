import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, Keyboard } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { BORDE, DESPLAZAMIENTO_SOMBRA, FUENTES, PAPEL, TINTA, COLOR_SOMBRA } from '../diseno';
import { sonar } from '../sonido';

// ---------- Iconos de línea ----------

export type NombreIcono = 'atras' | 'menu' | 'dado' | 'cerrar' | 'mas' | 'menos' | 'hecho' | 'lista' | 'ajustes';

export function Icono({ nombre, size = 20, color = TINTA }: { nombre: NombreIcono; size?: number; color?: string }) {
  const trazo = { stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {nombre === 'atras' ? <Path d="M15 5 8 12l7 7" {...trazo} /> : null}
      {nombre === 'menu' ? <Path d="M5 7h14M5 12h14M5 17h14" {...trazo} /> : null}
      {nombre === 'cerrar' ? <Path d="M6 6l12 12M18 6 6 18" {...trazo} /> : null}
      {nombre === 'mas' ? <Path d="M12 5v14M5 12h14" {...trazo} /> : null}
      {nombre === 'lista' ? <Path d="M9 7h11M9 12h11M9 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" {...trazo} strokeWidth={2.4} /> : null}
      {nombre === 'ajustes' ? (
        <>
          <Circle cx={12} cy={12} r={3.2} {...trazo} />
          <Path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" {...trazo} />
          <Circle cx={12} cy={12} r={7} {...trazo} />
        </>
      ) : null}
      {nombre === 'menos' ? <Path d="M5 12h14" {...trazo} /> : null}
      {nombre === 'hecho' ? <Path d="M5 12.5l4.5 4.5L19 7" {...trazo} strokeWidth={3} /> : null}
      {nombre === 'dado' ? (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={4} {...trazo} strokeWidth={2} />
          <Circle cx={9} cy={9} r={1.4} fill={color} />
          <Circle cx={12} cy={12} r={1.4} fill={color} />
          <Circle cx={15} cy={15} r={1.4} fill={color} />
        </>
      ) : null}
    </Svg>
  );
}

// ---------- Botón con contorno y sombra dura ----------

type PropsBoton = {
  texto: string;
  onPress: () => void;
  color?: string; // fondo; por defecto papel
  icono?: NombreIcono;
  descripcion?: string;
  desactivado?: boolean;
  grande?: boolean;
  pequeno?: boolean; // botones secundarios (historial...)
  style?: StyleProp<ViewStyle>;
};

export function BotonDuro({
  texto,
  onPress,
  color = PAPEL,
  icono,
  descripcion,
  desactivado = false,
  grande = false,
  pequeno = false,
  style,
}: PropsBoton) {
  const alto = grande ? 56 : pequeno ? 38 : 50;
  const letra = grande ? 22 : pequeno ? 15 : 18;
  return (
    <View style={[styles.envoltura, desactivado && styles.desactivado, style]}>
      <View style={[styles.sombra, { borderRadius: grande ? 16 : 14 }]} />
      <Pressable
        onPress={() => {
          sonar('clic');
          // Cualquier botón cierra antes el teclado: si el botón cambia de pantalla o de paso,
          // el teclado no se queda abierto sin el campo de texto que lo abrió
          Keyboard.dismiss();
          onPress();
        }}
        disabled={desactivado}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.boton,
          {
            backgroundColor: color,
            minHeight: alto,
            paddingHorizontal: pequeno ? 12 : 16,
            paddingVertical: pequeno ? 4 : 8,
            borderRadius: grande ? 16 : 14,
            transform: pressed
              ? [{ translateX: DESPLAZAMIENTO_SOMBRA }, { translateY: DESPLAZAMIENTO_SOMBRA }]
              : [],
          },
        ]}
      >
        <View style={styles.fila}>
          {icono ? <Icono nombre={icono} size={grande ? 22 : pequeno ? 16 : 19} /> : null}
          <Text style={[styles.texto, { fontSize: letra }]}>{texto}</Text>
        </View>
        {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
      </Pressable>
    </View>
  );
}

// ---------- Botón redondo con icono (volver, menú) ----------

export function BotonRedondo({
  icono,
  onPress,
  etiqueta,
  color = PAPEL,
}: {
  icono: NombreIcono;
  onPress: () => void;
  etiqueta: string; // para lectores de pantalla
  color?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        sonar('clic');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={6}
      style={[styles.redondo, { backgroundColor: color }]}
    >
      <Icono nombre={icono} />
    </Pressable>
  );
}

// ---------- Caja con contorno (tarjetas, paneles) ----------

export function CajaContorno({
  children,
  color = PAPEL,
  sombra = true,
  style,
}: {
  children: ReactNode;
  color?: string;
  sombra?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      {sombra ? <View style={[styles.sombra, { borderRadius: 20 }]} /> : null}
      <View style={[styles.caja, { backgroundColor: color }]}>{children}</View>
    </View>
  );
}

// Texto pixelado de los avisos: en minúscula y con punto final
export function TextoPixel({ children, size = 11, color = TINTA }: { children: string; size?: number; color?: string }) {
  const limpio = children.trim().toLowerCase();
  return (
    <Text style={{ fontFamily: FUENTES.pixel, fontSize: size, color }}>
      {/[.!?:]$/.test(limpio) ? limpio : `${limpio}.`}
    </Text>
  );
}

const styles = StyleSheet.create({
  envoltura: { position: 'relative' },
  sombra: {
    position: 'absolute',
    left: DESPLAZAMIENTO_SOMBRA,
    top: DESPLAZAMIENTO_SOMBRA,
    right: -DESPLAZAMIENTO_SOMBRA,
    bottom: -DESPLAZAMIENTO_SOMBRA,
    backgroundColor: COLOR_SOMBRA,
  },
  boton: {
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 2,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  texto: { fontFamily: FUENTES.titulo, color: TINTA, textTransform: 'uppercase', letterSpacing: 0.5 },
  descripcion: { fontFamily: FUENTES.textoSemi, fontSize: 12.5, color: TINTA, textAlign: 'center' },
  desactivado: { opacity: 0.45 },
  redondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: BORDE,
    borderColor: TINTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caja: {
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
