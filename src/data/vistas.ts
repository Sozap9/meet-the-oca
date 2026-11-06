import type { Tarjeta } from './tarjetas';

// Las últimas tarjetas que han salido, de esta partida y de las anteriores.
// Al robar se prefieren las que no se han visto hace poco, para que no salgan siempre las mismas.
// Se guarda en el móvil desde mazos.tsx; aquí no hay dependencias de la app, para poder probarlo.

export const MAXIMO_VISTAS = 450; // algo más de dos mazos enteros

export function claveTarjeta(t: Tarjeta): string {
  return `${t.tipo}|${t.texto}|${(t.opciones ?? []).join('|')}`;
}

let lista: string[] = [];
let conjunto = new Set<string>();
const oyentes = new Set<() => void>();

export function esReciente(t: Tarjeta): boolean {
  return conjunto.has(claveTarjeta(t));
}

export function marcarVista(t: Tarjeta) {
  const clave = claveTarjeta(t);
  lista = [...lista.filter((c) => c !== clave), clave].slice(-MAXIMO_VISTAS);
  conjunto = new Set(lista);
  oyentes.forEach((o) => o());
}

export function vistasActuales(): string[] {
  return lista;
}

export function fijarVistas(guardadas: unknown) {
  lista = Array.isArray(guardadas)
    ? guardadas.filter((c): c is string => typeof c === 'string').slice(-MAXIMO_VISTAS)
    : [];
  conjunto = new Set(lista);
}

export function alCambiarVistas(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

// Lo que se pasa a crearBaraja para que tenga en cuenta las vistas
export const MEMORIA_VISTAS = { reciente: esReciente, alRobar: marcarVista };
