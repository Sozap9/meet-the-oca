// Los ajustes de la app y sus valores de fábrica (sin dependencias, para poder probarlos)

export interface Ajustes {
  efectos: number; // volumen de los efectos, de 0 a 100
  musica: boolean; // música de fondo en las partidas
  volumenMusica: number; // de 0 a 100
  silencio: boolean; // silencio total
  sonidoBotones: boolean; // clic suave al pulsar botones
  vibracion: boolean;
  pases: number; // pases iniciales de cada persona, de 0 a 5
  preguntaFinal: boolean; // pregunta para los dos al terminar
  ocultarPicante: boolean; // esconde el modo Caliente y los temas +18
  reducirAnimaciones: boolean;
  grano: boolean; // textura de papel en los fondos
}

export const AJUSTES_DE_FABRICA: Ajustes = {
  efectos: 80,
  musica: false,
  volumenMusica: 50,
  silencio: false,
  sonidoBotones: true,
  vibracion: true,
  pases: 3,
  preguntaFinal: true,
  ocultarPicante: true,
  reducirAnimaciones: false,
  grano: true,
};

const entre = (n: unknown, min: number, max: number, defecto: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : defecto;
const booleano = (b: unknown, defecto: boolean) => (typeof b === 'boolean' ? b : defecto);

// Convierte lo guardado (que puede venir de una versión anterior o estar roto) en ajustes válidos
export function normalizarAjustes(guardado: unknown): Ajustes {
  const g = (guardado && typeof guardado === 'object' ? guardado : {}) as Record<string, unknown>;
  const f = AJUSTES_DE_FABRICA;
  return {
    efectos: entre(g.efectos, 0, 100, f.efectos),
    musica: booleano(g.musica, f.musica),
    volumenMusica: entre(g.volumenMusica, 0, 100, f.volumenMusica),
    silencio: booleano(g.silencio, f.silencio),
    sonidoBotones: booleano(g.sonidoBotones, f.sonidoBotones),
    vibracion: booleano(g.vibracion, f.vibracion),
    pases: entre(g.pases, 0, 5, f.pases),
    preguntaFinal: booleano(g.preguntaFinal, f.preguntaFinal),
    ocultarPicante: booleano(g.ocultarPicante, f.ocultarPicante),
    reducirAnimaciones: booleano(g.reducirAnimaciones, f.reducirAnimaciones),
    grano: booleano(g.grano, f.grano),
  };
}

// Los ajustes en vigor, para el código que no es una pantalla (sonidos, vibración...)
let actuales: Ajustes = AJUSTES_DE_FABRICA;
const oyentes = new Set<(a: Ajustes) => void>();

export function ajustesActuales(): Ajustes {
  return actuales;
}

export function fijarAjustes(nuevos: Ajustes) {
  actuales = nuevos;
  oyentes.forEach((o) => o(nuevos));
}

export function alCambiarAjustes(oyente: (a: Ajustes) => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}
