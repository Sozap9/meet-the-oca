import type { TextStyle, ViewStyle } from 'react-native';
import type { TipoCasilla } from './data/board';
import type { Modo } from './data/modos';

// ---------- Sistema de diseño: estilo serigrafía ----------
// Tinta negra, papel crema, colores planos por modo, contornos finos y sombras duras.

export const TINTA = '#151515';
export const PAPEL = '#F4EFE3';
export const BLANCO = '#FFFFFF';
export const PICO = '#FF8A1F'; // pico y patas de la oca

// Grosor de los contornos
export const BORDE = 2;
export const BORDE_FINO = 1.5;

// Fuentes (se cargan en app/_layout.tsx con @expo-google-fonts)
export const FUENTES = {
  titulo: 'Anton_400Regular', // titulares, números y botones
  texto: 'Archivo_500Medium',
  textoSemi: 'Archivo_600SemiBold',
  textoFuerte: 'Archivo_700Bold',
  pixel: 'Silkscreen_400Regular', // avisos cortos en minúscula con punto final
} as const;

// Colores de cada modo
export interface Paleta {
  suelo: string; // fondo del tablero y cabeceras
  pagina: string; // fondo de las pantallas
  papel: string; // banda del recorrido, tarjetas y botones secundarios
  oca: string; // ocas, meta y botón principal
  juego: string; // verdad o reto y dados: elegir o competir
  duo: string; // espejo, pregunta libre y cambio: los dos juntos
  freno: string; // posada, pozo y cárcel: te paran
  retro: string; // laberinto y calavera: te hacen retroceder
}

export const PALETAS: Record<Modo, Paleta> = {
  basico: {
    suelo: '#1E8E47',
    pagina: '#EEE8DA',
    papel: PAPEL,
    oca: '#F7D23E',
    juego: '#F28C6B',
    duo: '#B9E4F4',
    freno: '#9FC9B0',
    retro: '#E2452B',
  },
  personal: {
    suelo: '#2747A8',
    pagina: '#EEE8DA',
    papel: PAPEL,
    oca: '#F6C744',
    juego: '#C9B6F2',
    duo: '#9BE3D0',
    freno: '#9BE3D0',
    retro: '#F08A6B',
  },
  caliente: {
    suelo: '#B3203D',
    pagina: '#F2E6DE',
    papel: '#F7EEE6',
    oca: '#FFC94A',
    juego: '#FF8FB1',
    duo: '#F9B9A4',
    freno: '#C9B6F2',
    retro: '#FF7A2E',
  },
  // Infierno: el Caliente explícito. Suelo casi negro con llamas, fuego en las casillas
  infierno: {
    suelo: '#2B0A12',
    pagina: '#F2E6DE',
    papel: '#F3E2D2',
    oca: '#FFB23F',
    juego: '#FF5A4E',
    duo: '#F9B9A4',
    freno: '#C9B6F2',
    retro: '#FF7A2E',
  },
  aleatorio: {
    suelo: '#6A4FC2',
    pagina: '#EEE8DA',
    papel: PAPEL,
    oca: '#FFD23F',
    juego: '#43C59E',
    duo: '#7FC8F8',
    freno: '#B8A9F0',
    retro: '#FF6B6B',
  },
  dado: {
    suelo: '#0F7C83',
    pagina: '#EEE8DA',
    papel: PAPEL,
    oca: '#F7D23E',
    juego: '#F28C6B',
    duo: '#B9E4F4',
    freno: '#9FD3D6',
    retro: '#E2452B',
  },
  // Modo Cartas: tapete verde de mesa de juego; las especiales en lila
  cartas: {
    suelo: '#2E7D5B',
    pagina: '#EEE8DA',
    papel: PAPEL,
    oca: '#F7D23E',
    juego: '#C9B6F2',
    duo: '#B9E4F4',
    freno: '#9FC9B0',
    retro: '#FF6B4A',
  },
};

// Familia de color de cada casilla (el mismo significado en todos los modos)
export type Familia = 'normal' | 'oca' | 'juego' | 'duo' | 'freno' | 'retro' | 'salida';

export function familiaDeCasilla(tipo: TipoCasilla): Familia {
  switch (tipo) {
    case 'oca':
    case 'jardin':
      return 'oca';
    // Todas las casillas con mecánica comparten color en cada tablero
    case 'puente':
    case 'dados':
    case 'espejo':
    case 'libre':
    case 'cambio':
      return 'juego';
    case 'posada':
    case 'pozo':
    case 'carcel':
      return 'freno';
    case 'laberinto':
    case 'calavera':
      return 'retro';
    default:
      return 'normal';
  }
}

export function colorDeCasilla(tipo: TipoCasilla, paleta: Paleta): string {
  const familia = familiaDeCasilla(tipo);
  if (familia === 'normal' || familia === 'salida') return paleta.papel;
  return paleta[familia];
}

// Colores de las fichas, por orden
export const COLORES_FICHA = ['#FF5A36', '#2F6BFF', '#3BB273', '#F7D23E', '#C9B6F2', '#FF8FB1'];

// Colores de los temas del Dado de temas (caras 1 a 6)
export const COLORES_TEMA_DADO = ['#F7D23E', '#B9E4F4', '#C9B6F2', '#F28C6B', '#FF8FB1', '#E2452B'];

// ---------- Estilos reutilizables ----------

// Sombra dura desplazada, como en una impresión. En Android "elevation" no permite
// sombras duras, así que los componentes que la necesitan dibujan una capa detrás.
export const DESPLAZAMIENTO_SOMBRA = 2;
// Sutil: tinta translúcida, con la misma forma (y esquinas) que la caja que la proyecta
export const COLOR_SOMBRA = 'rgba(21, 21, 21, 0.28)';

export const contorno = (color: string = TINTA, ancho: number = BORDE): ViewStyle => ({
  borderWidth: ancho,
  borderColor: color,
});

export const textoTitulo = (tamano: number, color: string = TINTA): TextStyle => ({
  fontFamily: FUENTES.titulo,
  fontSize: tamano,
  lineHeight: Math.round(tamano * 1.08),
  color,
  textTransform: 'uppercase',
  letterSpacing: 0.3,
});

export const textoPixel = (tamano: number, color: string = TINTA): TextStyle => ({
  fontFamily: FUENTES.pixel,
  fontSize: tamano,
  color,
});

export const textoCuerpo = (
  tamano: number,
  color: string = TINTA,
  peso: 'normal' | 'semi' | 'fuerte' = 'semi',
): TextStyle => ({
  fontFamily:
    peso === 'fuerte' ? FUENTES.textoFuerte : peso === 'semi' ? FUENTES.textoSemi : FUENTES.texto,
  fontSize: tamano,
  lineHeight: Math.round(tamano * 1.32),
  color,
});
