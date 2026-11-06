export type TipoCasilla =
  | 'normal'
  | 'oca'
  | 'puente'
  | 'dados'
  | 'espejo'
  | 'libre'
  | 'cambio'
  | 'posada'
  | 'pozo'
  | 'laberinto'
  | 'carcel'
  | 'calavera'
  | 'jardin';

export interface Casilla {
  numero: number;
  tipo: TipoCasilla;
  destino?: number; // retroceso fijo: laberinto y calavera
}

export const TOTAL_CASILLAS = 63;

// 7 ocas, una cada 9 casillas a partir de la 5
export const OCAS = [5, 14, 23, 32, 41, 50, 59];

// "puente" es la casilla de Verdad o reto (conserva el nombre interno de la oca clásica).
// Las especiales empiezan después de la oca de la 5 y se reparten cada 2-3 casillas.
export const REPARTO: Record<number, TipoCasilla> = {
  // Verdad o reto
  8: 'puente',
  26: 'puente',
  45: 'puente',
  // Dados: duelo o apuesta
  16: 'dados',
  29: 'dados',
  55: 'dados',
  // Pregunta libre: la otra persona pregunta lo que quiera
  11: 'libre',
  38: 'libre',
  // Espejo: los dos responden por turnos sin mirar y comparan
  21: 'espejo',
  // Cambio: intercambiar la posición o responder una pregunta
  35: 'cambio',
  // Clásicas, en su posición de siempre
  19: 'posada',
  31: 'pozo',
  42: 'laberinto',
  52: 'carcel',
  58: 'calavera',
  63: 'jardin',
};

const DESTINOS: Record<number, number> = {
  42: 30,
  58: 1,
};

export const TABLERO: Casilla[] = Array.from(
  { length: TOTAL_CASILLAS },
  (_, i) => {
    const numero = i + 1;
    const tipo: TipoCasilla = OCAS.includes(numero)
      ? 'oca'
      : (REPARTO[numero] ?? 'normal');
    return { numero, tipo, destino: DESTINOS[numero] };
  },
);
// ---------- Tableros variables (modo aleatorio) ----------

// Las casillas especiales que se pueden quitar o mover (el jardín siempre es la 63)
export type TipoEspecial = Exclude<TipoCasilla, 'normal' | 'jardin'>;
export const ESPECIALES: TipoEspecial[] = [
  'oca',
  'puente',
  'dados',
  'libre',
  'espejo',
  'cambio',
  'posada',
  'pozo',
  'laberinto',
  'carcel',
  'calavera',
];

const PRIMERA_ESPECIAL = 5; // ninguna especial antes de la oca de la 5
const ULTIMA_ESPECIAL = TOTAL_CASILLAS - 1;
const RETROCESO_LABERINTO = 12; // la 42 manda a la 30

export type OrdenTablero = 'fijo' | 'aleatorio';

// Las especiales del tablero clásico, en orden, con su posición
function especialesClasicas(): { numero: number; tipo: TipoEspecial }[] {
  return TABLERO.filter((c) => c.tipo !== 'normal' && c.tipo !== 'jardin').map((c) => ({
    numero: c.numero,
    tipo: c.tipo as TipoEspecial,
  }));
}

function construir(posiciones: Map<number, TipoEspecial>): Casilla[] {
  return Array.from({ length: TOTAL_CASILLAS }, (_, i) => {
    const numero = i + 1;
    if (numero === TOTAL_CASILLAS) return { numero, tipo: 'jardin' as TipoCasilla };
    const tipo = posiciones.get(numero) ?? 'normal';
    let destino: number | undefined;
    if (tipo === 'laberinto') destino = Math.max(1, numero - RETROCESO_LABERINTO);
    if (tipo === 'calavera') destino = 1;
    return { numero, tipo, destino };
  });
}

// n posiciones repartidas lo más igual posible entre la 5 y la 62
function repartir(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [Math.round((PRIMERA_ESPECIAL + ULTIMA_ESPECIAL) / 2)];
  const paso = (ULTIMA_ESPECIAL - PRIMERA_ESPECIAL) / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round(PRIMERA_ESPECIAL + i * paso));
}

// n posiciones al azar entre la 5 y la 62, sin dos especiales seguidas
function posicionesAlAzar(n: number, azar: () => number): number[] {
  const huecos = ULTIMA_ESPECIAL - PRIMERA_ESPECIAL + 1;
  const sobrante = huecos - (2 * n - 1); // casillas libres que quedan tras exigir una de separación
  if (sobrante < 0) return repartir(n);
  // Reparte el sobrante al azar entre los n + 1 espacios (antes, entre y después)
  const cortes = Array.from({ length: n }, () => Math.floor(azar() * (sobrante + 1))).sort(
    (a, b) => a - b,
  );
  return cortes.map((corte, i) => PRIMERA_ESPECIAL + corte + 2 * i);
}

function barajar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Genera el tablero de una partida.
// - activas: las especiales que se quieren; las demás pasan a ser casillas normales.
// - orden 'fijo': si están todas, el tablero clásico; si se quitan algunas, las que quedan
//   se reparten por el tablero conservando su orden.
// - orden 'aleatorio': las especiales cambian de orden y de sitio.
export function generarTablero(
  opciones: { activas?: TipoEspecial[]; orden?: OrdenTablero } = {},
  azar: () => number = Math.random,
): Casilla[] {
  const activas = opciones.activas ?? ESPECIALES;
  const orden = opciones.orden ?? 'fijo';
  const clasicas = especialesClasicas().filter((e) => activas.includes(e.tipo));

  if (orden === 'fijo' && activas.length === ESPECIALES.length) return TABLERO;

  const tipos =
    orden === 'aleatorio' ? barajar(clasicas.map((e) => e.tipo), azar) : clasicas.map((e) => e.tipo);
  const posiciones =
    orden === 'aleatorio' ? posicionesAlAzar(tipos.length, azar) : repartir(tipos.length);

  // El laberinto necesita espacio para retroceder: si cae muy pronto, cambia el sitio con otra
  const iLab = tipos.indexOf('laberinto');
  if (iLab >= 0 && posiciones[iLab] <= RETROCESO_LABERINTO + 1) {
    const iOtra = posiciones.findIndex((p) => p > RETROCESO_LABERINTO + 1);
    if (iOtra >= 0) [tipos[iLab], tipos[iOtra]] = [tipos[iOtra], tipos[iLab]];
  }

  const mapa = new Map<number, TipoEspecial>();
  posiciones.forEach((p, i) => mapa.set(p, tipos[i]));
  return construir(mapa);
}

// Lee las especiales que llegan por la ruta ("oca,dados"); vacío = ninguna, sin texto = todas
export function leerEspeciales(texto: string | undefined): TipoEspecial[] {
  if (texto === undefined) return ESPECIALES;
  return texto.split(',').filter((t): t is TipoEspecial => (ESPECIALES as string[]).includes(t));
}
