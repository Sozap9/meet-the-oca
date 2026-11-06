import type { Categoria, Intensidad, Tarjeta } from './tarjetas';

// Mazos a vuestro gusto: tarjetas desactivadas y tarjetas propias, por mazo.
// Sin dependencias de la app (se guarda en el móvil desde mazos.tsx), para poder probarlo.

export type IdMazo = 'basico' | 'personal' | 'caliente' | 'infierno';
export const IDS_MAZO: IdMazo[] = ['basico', 'personal', 'caliente', 'infierno'];

export type TipoPropia = 'pregunta' | 'reto';

export interface TarjetaPropia {
  id: string; // "propia:<mazo>:<número>"
  mazo: IdMazo;
  tipo: TipoPropia;
  texto: string;
  categoria: Categoria;
  intensidad: Intensidad;
}

export interface MazosPersonales {
  desactivadas: string[]; // ids de tarjetas (de fábrica o propias) que no salen
  propias: TarjetaPropia[];
  editadas: Record<string, string>; // id de una tarjeta de fábrica -> texto nuevo
}

export const MAZOS_DE_FABRICA: MazosPersonales = { desactivadas: [], propias: [], editadas: {} };

// Las de "¿qué prefieres?" se definen por sus dos opciones, no por el texto: esas no se editan
export function sePuedeEditar(t: Tarjeta): boolean {
  return t.tipo !== 'prefieres';
}

// Mínimos para que el juego no se quede sin tarjetas
export const MINIMO_ACTIVAS_MAZO = 10;
export const MINIMO_ACTIVAS_CATEGORIA = 1;
export const LARGO_MAXIMO = 200;

// ---------- Ids estables de las tarjetas de fábrica ----------

function resumen(texto: string): string {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// El id sale del contenido de la tarjeta, así no cambia si se reordena el mazo
export function idsDeMazo(mazo: IdMazo, tarjetas: Tarjeta[]): string[] {
  const vistos = new Map<string, number>();
  return tarjetas.map((t) => {
    const base = `${mazo}:${resumen(`${t.tipo}|${t.texto}|${(t.opciones ?? []).join('|')}`)}`;
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    return n === 1 ? base : `${base}~${n}`;
  });
}

// Una tarjeta propia, como tarjeta normal del juego
export function tarjetaDePropia(p: TarjetaPropia): Tarjeta {
  return { tipo: p.tipo, texto: p.texto, categoria: p.categoria, intensidad: p.intensidad };
}

// ---------- El mazo que se juega ----------

export interface TarjetaEnMazo {
  id: string;
  tarjeta: Tarjeta;
  propia: boolean;
  activa: boolean;
  editada: boolean; // de fábrica, con el texto cambiado
  original?: string; // el texto de fábrica, si se ha editado
}

// Todas las tarjetas de un mazo, de fábrica y propias, con su estado
export function tarjetasDelMazo(mazo: IdMazo, base: Tarjeta[], personal: MazosPersonales): TarjetaEnMazo[] {
  const desactivadas = new Set(personal.desactivadas);
  const ids = idsDeMazo(mazo, base);
  const deFabrica = base.map((tarjeta, i) => {
    const texto = personal.editadas[ids[i]];
    const editada = texto !== undefined && texto !== tarjeta.texto;
    return {
      id: ids[i],
      tarjeta: editada ? { ...tarjeta, texto } : tarjeta,
      propia: false,
      activa: !desactivadas.has(ids[i]),
      editada,
      original: editada ? tarjeta.texto : undefined,
    };
  });
  const propias = personal.propias
    .filter((p) => p.mazo === mazo)
    .map((p) => ({
      id: p.id,
      tarjeta: tarjetaDePropia(p),
      propia: true,
      activa: !desactivadas.has(p.id),
      editada: false,
    }));
  return [...deFabrica, ...propias];
}

// Las tarjetas que salen en la partida. Sin cambios, el mismo mazo de siempre
export function mazoEnJuego(mazo: IdMazo, base: Tarjeta[], personal: MazosPersonales): Tarjeta[] {
  const hayCambios =
    personal.propias.some((p) => p.mazo === mazo) ||
    personal.desactivadas.some((id) => id.startsWith(`${mazo}:`) || id.startsWith(`propia:${mazo}:`)) ||
    Object.keys(personal.editadas).some((id) => id.startsWith(`${mazo}:`));
  if (!hayCambios) return base;
  return tarjetasDelMazo(mazo, base, personal)
    .filter((t) => t.activa)
    .map((t) => t.tarjeta);
}

// ¿Se puede desactivar esta tarjeta sin dejar el mazo o su categoría sin tarjetas?
export function sePuedeDesactivar(lista: TarjetaEnMazo[], id: string): boolean {
  const objetivo = lista.find((t) => t.id === id);
  if (!objetivo || !objetivo.activa) return true;
  const activas = lista.filter((t) => t.activa);
  if (activas.length - 1 < MINIMO_ACTIVAS_MAZO) return false;
  const categoria = objetivo.tarjeta.categoria;
  if (categoria === undefined) return true;
  return activas.filter((t) => t.tarjeta.categoria === categoria).length - 1 >= MINIMO_ACTIVAS_CATEGORIA;
}

// ---------- Cambios ----------

export function alternar(personal: MazosPersonales, id: string, activa: boolean): MazosPersonales {
  const resto = personal.desactivadas.filter((d) => d !== id);
  return { ...personal, desactivadas: activa ? resto : [...resto, id] };
}

export function añadirPropia(
  personal: MazosPersonales,
  datos: Omit<TarjetaPropia, 'id'>,
): MazosPersonales {
  const usados = personal.propias
    .filter((p) => p.mazo === datos.mazo)
    .map((p) => Number(p.id.split(':')[2]) || 0);
  const id = `propia:${datos.mazo}:${Math.max(0, ...usados) + 1}`;
  const texto = datos.texto.trim().slice(0, LARGO_MAXIMO);
  return { ...personal, propias: [...personal.propias, { ...datos, texto, id }] };
}

export function borrarPropia(personal: MazosPersonales, id: string): MazosPersonales {
  return {
    ...personal,
    desactivadas: personal.desactivadas.filter((d) => d !== id),
    propias: personal.propias.filter((p) => p.id !== id),
  };
}

// Cambia una tarjeta propia (texto, tipo, tema e intensidad)
export function editarPropia(
  personal: MazosPersonales,
  id: string,
  datos: Omit<TarjetaPropia, 'id' | 'mazo'>,
): MazosPersonales {
  const texto = datos.texto.trim().slice(0, LARGO_MAXIMO);
  if (!texto) return personal;
  return {
    ...personal,
    propias: personal.propias.map((p) => (p.id === id ? { ...p, ...datos, texto } : p)),
  };
}

// Cambia el texto de una tarjeta de fábrica; con el texto original (o vacío) vuelve a ser la de fábrica
export function editarDeFabrica(personal: MazosPersonales, id: string, texto: string, original: string): MazosPersonales {
  const limpio = texto.trim().slice(0, LARGO_MAXIMO);
  const editadas = { ...personal.editadas };
  if (!limpio || limpio === original) delete editadas[id];
  else editadas[id] = limpio;
  return { ...personal, editadas };
}

// Vuelve a dejar un mazo como de fábrica (borra también sus tarjetas propias)
export function restablecerMazo(personal: MazosPersonales, mazo: IdMazo): MazosPersonales {
  return {
    desactivadas: personal.desactivadas.filter((d) => !d.startsWith(`${mazo}:`) && !d.startsWith(`propia:${mazo}:`)),
    propias: personal.propias.filter((p) => p.mazo !== mazo),
    editadas: Object.fromEntries(Object.entries(personal.editadas).filter(([id]) => !id.startsWith(`${mazo}:`))),
  };
}

// ---------- Leer lo guardado ----------

const INTENSIDADES = [1, 2, 3];

export function normalizarMazos(guardado: unknown): MazosPersonales {
  const g = (guardado && typeof guardado === 'object' ? guardado : {}) as Record<string, unknown>;
  const desactivadas = Array.isArray(g.desactivadas)
    ? g.desactivadas.filter((d): d is string => typeof d === 'string')
    : [];
  const propias = Array.isArray(g.propias)
    ? g.propias.filter(
        (p): p is TarjetaPropia =>
          !!p &&
          typeof p === 'object' &&
          typeof (p as TarjetaPropia).id === 'string' &&
          IDS_MAZO.includes((p as TarjetaPropia).mazo) &&
          ((p as TarjetaPropia).tipo === 'pregunta' || (p as TarjetaPropia).tipo === 'reto') &&
          typeof (p as TarjetaPropia).texto === 'string' &&
          (p as TarjetaPropia).texto.trim().length > 0 &&
          typeof (p as TarjetaPropia).categoria === 'string' &&
          INTENSIDADES.includes((p as TarjetaPropia).intensidad),
      )
    : [];
  const editadas: Record<string, string> = {};
  if (g.editadas && typeof g.editadas === 'object') {
    for (const [id, texto] of Object.entries(g.editadas as Record<string, unknown>)) {
      if (typeof texto === 'string' && texto.trim()) editadas[id] = texto;
    }
  }
  return { desactivadas, propias, editadas };
}

// ---------- Los mazos en vigor, para el código que no es una pantalla ----------

let actuales: MazosPersonales = MAZOS_DE_FABRICA;

export function mazosActuales(): MazosPersonales {
  return actuales;
}

export function fijarMazos(nuevos: MazosPersonales) {
  actuales = nuevos;
}
