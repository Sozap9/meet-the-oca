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
  semaforo,
  yoNunca,
} from '../../tarjetas';
import type { Tarjeta } from '../../tarjetas';

const atraccion = en('atraccion');
const coqueteo = en('coqueteo');
const citas = en('citas');
const deseos = en('deseos');
const cercania = en('cercania');
const libre = en('libre');

export const CALIENTE_ANTERIOR: Tarjeta[] = [
  // Atracción
  pregunta('¿Qué fue lo primero que te atrajo de mí?', atraccion(1)),
  escala('¿Cuánto te gusta sentirte deseado/a?', ['Poco', 'Muchísimo'], atraccion(1)),
  adivinaOpciones(
    '¿Qué parte de ti te hace sentir más atractivo/a?',
    ['Mi sonrisa', 'Mis ojos', 'Mi forma de moverme', 'Mi voz'],
    atraccion(2),
  ),
  completa('Lo que me parece irresistible de ti es…', atraccion(2)),
  pregunta('¿Qué momento de los últimos meses te hizo desearme más?', atraccion(3)),
  completa('Lo que más me atrae de cómo eres cuando estamos solos es…', atraccion(3)),

  // Coqueteo
  debate('Un buen coqueteo empieza con la mirada.', coqueteo(1)),
  prefieres('Un mensaje atrevido', 'Un piropo en persona', coqueteo(1)),
  yoNunca('Yo nunca he mandado un mensaje atrevido a la persona equivocada.', coqueteo(2)),
  retoConTiempo('Dile un piropo distinto cada diez segundos durante un minuto.', 60, coqueteo(2)),
  completa('Si quisiera conquistarte esta noche, empezaría por…', coqueteo(2)),
  pregunta('¿Cuál fue el coqueteo más divertido que recuerdas entre nosotros?', coqueteo(3)),

  // Citas y sorpresas
  prefieres('Cena romántica en casa', 'Cena en un sitio nuevo', citas(1)),
  plan('Planifica en una frase una cita perfecta que dure menos de tres horas.', citas(1)),
  adivinaOpciones(
    '¿Qué sorpresa te haría más ilusión?',
    ['Una escapada', 'Una cena especial', 'Un regalo hecho a mano', 'Un día entero planeado'],
    citas(2),
  ),
  escala('¿Cuánto te gustan las sorpresas?', ['Nada', 'Me encantan'], citas(2)),
  completa('La cita que me encantaría vivir contigo es…', citas(2)),
  pregunta('¿Qué sorpresa te gustaría hacerme y aún no te has atrevido?', citas(3)),

  // Deseos (con semáforo)
  semaforo('Un masaje largo, sin prisas, con música suave.', deseos(1)),
  semaforo('Bailar muy pegados una canción lenta en el salón.', deseos(1)),
  semaforo('Una noche solo para nosotros, con velas y sin móviles.', deseos(2)),
  semaforo('Un baño juntos con música y luz tenue.', deseos(2)),
  semaforo(
    'Escribirnos mensajes atrevidos durante el día y no responder hasta la noche.',
    deseos(2),
  ),
  semaforo(
    'Contarnos, con calma y sin prisas, algo que nos gustaría probar juntos.',
    deseos(3),
  ),
  semaforo('Pasar un fin de semana entero sin salir de casa, solo para nosotros.', deseos(3)),

  // Retos de cercanía
  retoConTiempo('Abrazaos treinta segundos sin decir nada.', 30, cercania(1)),
  reto('Dile algo bonito al oído.', cercania(1)),
  retoConTiempo('Miraos a los ojos en silencio, sin reíros.', 30, cercania(2)),
  retoConTiempo('Dale un masaje de hombros a tu pareja durante un minuto.', 60, cercania(2)),
  reto('Dale un beso de diez segundos.', cercania(2)),
  retoConTiempo(
    'Con los ojos cerrados, acaricia con suavidad la cara y las manos de tu pareja durante un minuto.',
    60,
    cercania(3),
  ),
  reto('Susúrrale al oído algo que te gustaría hacer con tu pareja esta semana.', cercania(3)),

  // Libre
  pregunta('¿Qué canción pondrías para describirnos?', libre(1)),
  adivinaOpciones(
    '¿Qué te apetece más ahora mismo?',
    ['Un abrazo largo', 'Un beso lento', 'Una conversación tranquila', 'Una locura improvisada'],
    libre(2),
  ),
  debate('Hablar de lo que nos gusta en pareja es más difícil de lo que parece.', libre(2)),
  pregunta('¿Qué te gustaría que supiera de ti y aún no te he preguntado?', libre(3)),

  comodin(undefined, libre(2)),
];