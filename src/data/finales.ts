import { NIVELES } from './decks';
import type { Nivel } from './decks';
import type { Modo } from './modos';

const FINALES: Record<Nivel, string[]> = {
  basico: [
    'Cada uno cuenta algo que ha descubierto hoy del otro.',
    '¿Qué ha sido lo más divertido de esta partida?',
    'A la de tres, decid a la vez vuestro color favorito. ¿Coincidís?',
  ],
  personal: [
    'Decidle al otro algo que valoráis de él o ella y quizá nunca le habéis dicho.',
    'Contad, por turnos, el recuerdo juntos que más os gustaría repetir.',
    'Cada uno cuenta qué respuesta de hoy le ha hecho ver al otro con otros ojos.',
  ],
  caliente: [
    'Mirándoos a los ojos, decid cada uno qué es lo que más os atrae del otro.',
    'Cada uno propone una cita sorpresa para la próxima semana.',
    'Un beso largo para cerrar la partida.',
  ],
  infierno: [
    'Cada uno dice, sin rodeos, qué carta de hoy quiere cumplir esta misma noche.',
    'Quien haya ganado elige cómo termina la noche. Quien haya perdido, obedece.',
    'Un beso largo, y lo que venga después ya no es parte del juego.',
  ],
};

const FINALES_DADO = [
  'Cada uno elige el tema que más le ha gustado de hoy y cuenta por qué.',
  'A la de tres, decid a la vez qué respuesta de hoy os ha sorprendido más del otro.',
  'Contad, por turnos, algo que habéis descubierto esta noche y no sabíais.',
];

// Pregunta final para los dos, al terminar la partida
export function finalDeModo(modo: Modo, niveles: Nivel[] = NIVELES): string {
  const candidatos =
    modo === 'dado'
      ? FINALES_DADO
      : (modo === 'aleatorio' || modo === 'cartas'
          ? niveles.length
            ? niveles
            : NIVELES
          : [modo]
        ).flatMap(
          (nivel) => FINALES[nivel],
        );
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}