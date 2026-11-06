// Casillas que retrocede quien pierde la apuesta
export const CASILLAS_APUESTA = 10;

// Quién ha sacado menos: su posición en la lista, o null si hay empate por lo más bajo
export function perdedorDeDados(valores: number[]): number | null {
  const minimo = Math.min(...valores);
  const empatados = valores.filter((v) => v === minimo).length;
  return empatados === 1 ? valores.indexOf(minimo) : null;
}