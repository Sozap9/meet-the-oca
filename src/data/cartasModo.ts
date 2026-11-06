import type { Nivel } from './decks';
import { tarjetasDeModo } from './decks';
import type { Tarjeta, TipoTarjeta } from './tarjetas';

// ---------- Las cartas del modo Cartas ----------

export type IdEspecial = 'robaDos' | 'devuelvo' | 'libre' | 'doble' | 'salta' | 'intercambio';

export const ESPECIALES: Record<IdEspecial, { nombre: string; texto: string; guardable: boolean }> = {
  robaDos: { nombre: 'Roba dos', texto: 'Tu pareja roba dos cartas más para su mano.', guardable: false },
  devuelvo: {
    nombre: 'Te la devuelvo',
    texto: 'Guárdala. Úsala cuando te toque una carta y la responde tu pareja.',
    guardable: true,
  },
  libre: { nombre: 'Pregunta libre', texto: 'Hazle a tu pareja la pregunta que quieras.', guardable: false },
  doble: { nombre: 'Doble', texto: 'Los dos respondéis la próxima carta.', guardable: false },
  salta: { nombre: 'Salta turno', texto: 'Tu pareja pierde su próximo turno: vuelves a jugar.', guardable: false },
  intercambio: { nombre: 'Intercambio', texto: 'Quédate con una carta de la mano de tu pareja.', guardable: false },
};
export const IDS_ESPECIALES = Object.keys(ESPECIALES) as IdEspecial[];

export type CartaJuego =
  | { id: number; tipo: 'tarjeta'; tarjeta: Tarjeta; mazo: Nivel }
  | { id: number; tipo: 'especial'; especial: IdEspecial };

// Qué tarjetas entran en este modo: sobre todo preguntas, algunos juegos y retos
export const TIPOS_PREGUNTA: TipoTarjeta[] = ['pregunta', 'completa', 'recuerdo', 'plan'];
export const TIPOS_JUEGO: TipoTarjeta[] = ['prefieres', 'adivina', 'debate', 'yoNunca']; // sin semáforo ni dos verdades
export const TIPOS_RETO: TipoTarjeta[] = ['reto'];
export const REPARTO = { preguntas: 0.7, juegos: 0.15, retos: 0.15 };

// La partida dura hasta jugar todas las cartas: cada ronda, cada uno juega una (unas cartas/2 rondas)
export const DURACIONES_CARTAS = [
  { nombre: 'Rápida', cartas: 20 },
  { nombre: 'Normal', cartas: 30 },
  { nombre: 'Larga', cartas: 40 },
];
export const TAM_MANO = 5;

export function rondasDe(cartas: number): number {
  return Math.round(cartas / 2);
}

export function leerCartas(texto: string | undefined): number {
  const n = Number(texto);
  return DURACIONES_CARTAS.some((d) => d.cartas === n) ? n : 30;
}

// Si la tarjeta es una pregunta, un juego o un reto (para su color y su dibujo)
export function claseDeTarjeta(t: Tarjeta): 'pregunta' | 'juego' | 'reto' {
  if (t.tipo === 'reto') return 'reto';
  if (TIPOS_JUEGO.includes(t.tipo)) return 'juego';
  return 'pregunta';
}

function barajar<T>(lista: T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Monta el mazo de la partida. Las tarjetas van de menos a más intensas (las primeras en salir son
// las suaves) y las especiales se reparten por el mazo.
export function construirMazo(
  niveles: Nivel[],
  total: number,
  azar: () => number = Math.random,
  reciente: (t: Tarjeta) => boolean = () => false,
): CartaJuego[] {
  let id = 0;
  const especialesN = Math.max(2, Math.round(total / 7));
  const normalesN = total - especialesN;
  const cuantos = {
    preguntas: Math.round(normalesN * REPARTO.preguntas),
    juegos: Math.round(normalesN * REPARTO.juegos),
  };
  const retosN = normalesN - cuantos.preguntas - cuantos.juegos;

  const disponibles = niveles.flatMap((mazo) =>
    tarjetasDeModo(mazo).map((tarjeta) => ({ tarjeta, mazo })),
  );
  // Barajadas, con las que han salido hace poco al final (solo entran si no hay bastantes nuevas)
  const coger = (tipos: TipoTarjeta[], n: number) =>
    barajar(
      disponibles.filter((d) => tipos.includes(d.tarjeta.tipo)),
      azar,
    )
      .map((d) => ({ d, vista: reciente(d.tarjeta) ? 1 : 0 }))
      .sort((a, b) => a.vista - b.vista)
      .map(({ d }) => d)
      .slice(0, n);

  const normales = [
    ...coger(TIPOS_PREGUNTA, cuantos.preguntas),
    ...coger(TIPOS_JUEGO, cuantos.juegos),
    ...coger(TIPOS_RETO, retosN),
  ]
    // de menos a más intensas, con un poco de azar para que no vayan en bloques
    .map((d) => ({ d, orden: (d.tarjeta.intensidad ?? 2) + azar() * 1.2 }))
    .sort((a, b) => a.orden - b.orden)
    .map(({ d }): CartaJuego => ({ id: id++, tipo: 'tarjeta', tarjeta: d.tarjeta, mazo: d.mazo }));

  const especiales: CartaJuego[] = Array.from({ length: especialesN }, (_, i) => ({
    id: id++,
    tipo: 'especial',
    especial: barajar(IDS_ESPECIALES, azar)[i % IDS_ESPECIALES.length],
  }));

  // Las especiales entran repartidas, sin ninguna en las dos primeras manos
  const mazo = [...normales];
  for (const e of especiales) {
    const desde = Math.min(TAM_MANO * 2, mazo.length);
    const pos = desde + Math.floor(azar() * (mazo.length - desde + 1));
    mazo.splice(pos, 0, e);
  }
  return mazo;
}
