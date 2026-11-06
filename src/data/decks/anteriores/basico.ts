import {
  adivinaOpciones,
  comodin,
  completa,
  debate,
  en,
  escala,
  plan,
  prefieres,
  pregunta,
  reto,
  retoConTiempo,
  yoNunca,
} from '../../tarjetas';
import type { Tarjeta } from '../../tarjetas';

const gustos = en('gustos');
const humor = en('humor');
const rutinas = en('rutinas');
const viajes = en('viajes');
const prefs = en('prefieres');

export const BASICO_ANTERIOR: Tarjeta[] = [
  // Gustos
  pregunta('¿Qué canción te pone de buen humor al instante?', gustos(1)),
  escala('¿Cuánto te gusta cocinar?', ['Nada', 'Me encanta'], gustos(1)),
  reto('Pon una canción que os encante y bailad juntos veinte segundos.', gustos(1)),
  adivinaOpciones(
    '¿Cuál es tu comida para consolarte?',
    ['Pasta', 'Pizza', 'Algo de cuchara', 'Algo dulce'],
    gustos(2),
  ),
  completa('Un olor que me lleva directo a mi infancia es…', gustos(3)),

  // Humor
  debate('Los chistes malos son los mejores.', humor(1)),
  yoNunca('Yo nunca me he reído en el peor momento posible.', humor(2)),
  retoConTiempo('Haz reír a tu pareja en 30 segundos sin tocarla.', 30, humor(2)),
  pregunta('¿Qué anécdota graciosa de tu vida cuentas siempre en las reuniones?', humor(3)),

  // Rutinas
  escala('¿Cuánto te cuesta salir de la cama por la mañana?', ['Nada', 'Muchísimo'], rutinas(1)),
  adivinaOpciones(
    '¿Cómo sería tu mañana ideal?',
    ['Tranquila y sin prisas', 'Con deporte', 'Con un desayuno largo', 'Durmiendo un poco más'],
    rutinas(2),
  ),
  debate('Tener rutinas fijas hace la vida más fácil.', rutinas(2)),
  retoConTiempo(
    'Representa tu mañana de siempre en 30 segundos, sin hablar, y que tu pareja adivine cada escena.',
    30,
    rutinas(2),
  ),
  completa('Si pudiera cambiar una cosa de mi día a día, sería…', rutinas(3)),

  // Viajes y planes
  pregunta('¿A qué lugar volverías mil veces?', viajes(1)),
  adivinaOpciones(
    '¿Qué tipo de viaje te pide más el cuerpo?',
    ['Aventura', 'Descanso total', 'Ciudad y cultura', 'Comida y pueblos'],
    viajes(2),
  ),
  plan('Planifica en una frase un fin de semana perfecto con poco presupuesto.', viajes(2)),
  retoConTiempo(
    'Inventa un viaje en 30 segundos y convence a tu pareja de que lo hagáis.',
    30,
    viajes(2),
  ),
  completa('El viaje que sueño hacer algún día es…', viajes(3)),

  // ¿Qué prefieres?
  prefieres('Playa', 'Montaña', prefs(1)),
  prefieres('Madrugar', 'Trasnochar', prefs(1)),
  prefieres('Planes improvisados', 'Planes organizados', prefs(2)),
  prefieres('Saber el final de una historia', 'Que me sorprenda', prefs(3)),

  comodin(),
];