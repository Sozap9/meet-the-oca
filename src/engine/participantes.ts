export interface Participante {
  nombre: string;
  color: string;
}

const NOMBRE_MAX = 14;

// Convierte lo que llega por la ruta (texto JSON) en la lista de participantes.
// Si falta algo o está corrupto, usa valores por defecto.
export function leerParticipantes(
  texto: string | undefined,
  colores: string[],
): Participante[] {
  const porDefecto = [0, 1].map((i) => ({
    nombre: `Jugador ${i + 1}`,
    color: colores[i],
  }));
  if (!texto) return porDefecto;

  try {
    const datos = JSON.parse(texto);
    if (!Array.isArray(datos)) return porDefecto;

    return [0, 1].map((i) => {
      const dato = datos[i] ?? {};
      const nombre =
        typeof dato.nombre === 'string' ? dato.nombre.trim().slice(0, NOMBRE_MAX) : '';
      const indice = Number.isInteger(dato.color) ? dato.color : i;
      return {
        nombre: nombre || `Jugador ${i + 1}`,
        color: colores[indice] ?? colores[i],
      };
    });
  } catch {
    return porDefecto;
  }
}