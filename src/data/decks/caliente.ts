import {
  adivinaOpciones,
  completa,
  en,
  escala,
  plan,
  prefieres,
  pregunta,
  reto,
  retoConTiempo,
  propuesta,
  yoNunca,
} from '../tarjetas';
import type { Tarjeta } from '../tarjetas';
import { AMPLIACION_CALIENTE } from './ampliaciones/caliente';

// Caliente (+18), v2: más pícaro y más jugable. Menos charla y más retos, juegos y propuestas.
// Lo explícito vive en el mazo Infierno. La versión anterior está en anteriores/caliente-v1.ts.
// Nivel 1 = calentar motores · 2 = subir la temperatura · 3 = lo más atrevido del mazo.
// Las propuestas (del 1 al 10) sirven para lanzar lo más atrevido sin compromiso.

const atraccion = en('atraccion');
const coqueteo = en('coqueteo');
const citas = en('citas');
const deseos = en('deseos');
const fantasias = en('fantasias');
const experiencias = en('experiencias');
const cercania = en('cercania');
const libre = en('libre');

const ORIGINAL: Tarjeta[] = [
  // ---------- Atracción ----------
  adivinaOpciones(
    '¿Qué parte de mi cuerpo me gusta más que me toquen?',
    ['El cuello', 'La espalda', 'Las piernas', 'El pelo'],
    atraccion(1),
  ),
  pregunta('¿Qué gesto de tu pareja te pone sin que se dé cuenta?', atraccion(1)),
  reto('Señala, sin decir nada, la parte del cuerpo de tu pareja que más te gusta. Luego dale un beso ahí.', atraccion(1)),
  escala('¿Cuánto te pone verme recién salido/a de la ducha?', ['Poco', 'Muchísimo'], atraccion(1)),
  prefieres('Que te mire de arriba abajo', 'Que te mire solo a los ojos', atraccion(1)),
  adivinaOpciones(
    '¿Qué me pone más que lleves puesto?',
    ['Algo ajustado', 'Solo mi camisa', 'Ropa de deporte', 'Arreglado/a para salir'],
    atraccion(2),
  ),
  completa('Me pone muchísimo cuando tú…', atraccion(2)),
  reto('Quítate una prenda delante de tu pareja, lo más despacio que puedas. La elige tu pareja.', atraccion(2)),
  retoConTiempo('Miraos de arriba abajo sin decir nada. Quien se ría primero se quita una prenda.', 30, atraccion(2)),
  pregunta('¿Qué es lo que más te excita de tu pareja y nunca le has dicho tal cual?', atraccion(3)),
  reto('Dile a tu pareja al oído, muy despacio, qué es lo que más te gusta de su cuerpo.', atraccion(3)),
  propuesta('Desvestirnos el uno al otro sin usar las manos.', atraccion(3)),

  // ---------- Provocación ----------
  retoConTiempo('Daos un beso largo, de película, hasta que suene la alarma.', 30, coqueteo(1)),
  reto('Muérdele suavemente el labio inferior a tu pareja.', coqueteo(1)),
  escala('¿Cuánto te gusta que te provoque en público, con disimulo?', ['Nada', 'Me encanta'], coqueteo(1)),
  yoNunca('Yo nunca he pensado en desnudar a alguien en mitad de una cena.', coqueteo(1)),
  reto('Escribe con el dedo en la espalda de tu pareja una palabra picante. Tiene que adivinarla.', coqueteo(2)),
  reto('Mándale a tu pareja el mensaje más subido de tono que se te ocurra. Tiene que leerlo en voz alta.', coqueteo(2)),
  retoConTiempo('Bésale el cuello a tu pareja y no pares hasta que suene la alarma.', 30, coqueteo(2)),
  retoConTiempo('Pon nerviosa a tu pareja sin tocarla, solo con miradas y palabras. Tu pareja decide si lo has conseguido.', 30, coqueteo(2)),
  prefieres('Que te susurren algo picante en público', 'Que te lo escriban en un mensaje', coqueteo(2)),
  reto('Siéntate en las piernas de tu pareja y dile algo que nunca le hayas dicho.', coqueteo(3)),
  retoConTiempo('Susúrrale a tu pareja qué le harías si estuvierais solos ahora mismo.', 30, coqueteo(3)),
  retoConTiempo('Provoca a tu pareja con besos y caricias. Si te toca, se quita una prenda.', 60, coqueteo(3)),
  pregunta('¿Qué es lo más atrevido que te gustaría que tu pareja te dijera por mensaje?', coqueteo(3)),

  // ---------- Citas y planes ----------
  adivinaOpciones(
    '¿Qué plan de noche me apetece más?',
    ['Cena y directos a casa', 'Hotel con todo incluido', 'Sofá, vino y lo que surja', 'Una escapada sorpresa'],
    citas(1),
  ),
  prefieres('Cita elegante y luego en casa', 'Directamente en casa en pijama', citas(1)),
  pregunta('¿Cómo terminaría nuestra cita perfecta si no tuviéramos que madrugar?', citas(1)),
  reto('Proponle a tu pareja una cita para esta semana en una sola frase, lo más sugerente posible. Si le convence, queda hecha.', citas(2)),
  pregunta('¿Qué te pondrías si quisieras que tu pareja no aguantara hasta llegar a casa?', citas(2)),
  plan('Diseñad una noche de hotel perfecta para los dos: qué pedís, qué hacéis y a qué hora salís.', citas(2)),
  propuesta('Una noche entera sin móviles, con velas, música y sin salir de la habitación.', citas(2)),
  propuesta('Una cena en casa en la que cada plato cuesta una prenda.', citas(3)),
  pregunta('¿Qué sitio de la ciudad te parece perfecto para un beso que se nos vaya de las manos?', citas(3)),
  propuesta('Un fin de semana entero solo para nosotros, sin planes ni visitas.', citas(3)),

  // ---------- Deseos ----------
  prefieres('Por la mañana', 'Por la noche', deseos(1)),
  prefieres('Despacio y con calma', 'Con prisa y sin pensar', deseos(1)),
  escala('¿Cuánto te gustan los preliminares largos?', ['Al grano', 'Que duren horas'], deseos(1)),
  adivinaOpciones(
    '¿Dónde me gusta más que me besen, aparte de la boca?',
    ['El cuello', 'Detrás de la oreja', 'La espalda', 'La tripa'],
    deseos(1),
  ),
  propuesta('Un masaje largo con aceite y sin prisas.', deseos(1)),
  prefieres('Llevar la iniciativa', 'Dejarte llevar', deseos(2)),
  prefieres('Con la luz encendida', 'A oscuras', deseos(2)),
  prefieres('Que te desnude yo', 'Desnudarte tú mientras miro', deseos(2)),
  adivinaOpciones(
    '¿Qué me gusta más para empezar?',
    ['Besos en el cuello', 'Caricias en la espalda', 'Que me hablen al oído', 'Que me desnuden despacio'],
    deseos(2),
  ),
  propuesta('Ducharnos juntos esta noche.', deseos(2)),
  propuesta('Que uno de los dos lleve los ojos vendados y el otro decida todo.', deseos(2)),
  propuesta('Dormir esta noche sin nada de ropa.', deseos(2)),
  completa('Esta noche me gustaría que tú…', deseos(3)),
  pregunta('¿Qué te gustaría que te hiciera tu pareja para despertarte un domingo?', deseos(3)),
  pregunta('¿Qué te gustaría probar con tu pareja que todavía no hayáis hecho?', deseos(3)),

  // ---------- Fantasías ----------
  pregunta('¿Qué escena de película o serie te ha puesto más de lo que admitirías?', fantasias(1)),
  prefieres('Hotel de lujo', 'Cabaña perdida en el monte', fantasias(1)),
  adivinaOpciones(
    '¿Qué escenario me da más morbo?',
    ['Un hotel', 'La playa de noche', 'Un probador', 'El coche'],
    fantasias(2),
  ),
  completa('Una fantasía que nunca le he contado a nadie empieza en…', fantasias(2)),
  pregunta('Si tuviéramos una noche sin ningún límite, ¿qué sería lo primero que harías?', fantasias(2)),
  pregunta('¿Con qué disfraz o conjunto te gustaría verme una noche?', fantasias(2)),
  reto('Cuéntale a tu pareja una fantasía al oído en tres frases. Si se sonroja, te debe un beso donde tú quieras.', fantasias(2)),
  pregunta('¿Qué fantasía tuya crees que sorprendería más a tu pareja?', fantasias(3)),
  pregunta('¿Qué fantasía te da un poco de vergüenza contar pero te encantaría cumplir?', fantasias(3)),
  pregunta('¿Qué fantasía te gustaría que preparásemos para un fin de semana?', fantasias(3)),

  // ---------- Experiencias ----------
  yoNunca('Yo nunca he mandado un mensaje subido de tono a quien no debía.', experiencias(1)),
  yoNunca('Yo nunca me he enrollado con alguien en un sitio público.', experiencias(1)),
  yoNunca('Yo nunca he fingido tener sueño para irme antes a la cama con mi pareja.', experiencias(1)),
  yoNunca('Yo nunca he pensado en ti de forma nada inocente en mitad del trabajo.', experiencias(1)),
  pregunta('¿Cuál ha sido el beso que más te ha marcado?', experiencias(2)),
  yoNunca('Yo nunca he hecho un striptease.', experiencias(2)),
  pregunta('¿Cuál ha sido nuestro beso más peligroso?', experiencias(2)),
  reto('Repetid vuestro primer beso, lo más parecido posible.', experiencias(2)),
  yoNunca('Yo nunca he tenido que esconderme para que no me pillaran.', experiencias(3)),
  pregunta('¿Qué has descubierto que te gusta gracias a tu pareja?', experiencias(3)),
  pregunta('¿Qué noche nuestra te gustaría repetir hoy mismo?', experiencias(3)),

  // ---------- Contacto ----------
  retoConTiempo('Masajea los hombros y la nuca de tu pareja.', 60, cercania(1)),
  reto('Dale a tu pareja un beso en el sitio que elija.', cercania(1)),
  retoConTiempo('Abraza a tu pareja por detrás y respírale en el cuello.', 30, cercania(1)),
  retoConTiempo('Besaos sin usar las manos.', 30, cercania(1)),
  retoConTiempo('Abrazaos tumbados, en silencio, sin mirar el móvil.', 60, cercania(1)),
  reto('Véndale los ojos a tu pareja con lo que tengas a mano y dale tres besos en tres sitios distintos. Tiene que adivinar dónde fue cada uno.', cercania(2)),
  retoConTiempo('Besa a tu pareja desde la oreja hasta el hombro, muy despacio.', 30, cercania(2)),
  retoConTiempo('Bailad pegados una canción lenta, aunque sea sin música.', 60, cercania(2)),
  reto('Elige una parte del cuerpo de tu pareja y bésala durante diez segundos.', cercania(2)),
  retoConTiempo('Acaríciale la espalda a tu pareja por debajo de la camiseta.', 30, cercania(2)),
  reto('Quítate una prenda que elija tu pareja.', cercania(3)),
  reto('Quítale a tu pareja una prenda usando una sola mano.', cercania(3)),
  retoConTiempo('Venda los ojos a tu pareja y dale besos donde quieras.', 60, cercania(3)),
  reto('Tu pareja elige dónde quiere un beso y tú no puedes negarte.', cercania(3)),
  retoConTiempo('Masaje de espalda con los ojos cerrados: tu pareja te guía con palabras.', 60, cercania(3)),
  retoConTiempo('Túmbate y deja que tu pareja te bese donde quiera, menos en la boca.', 60, cercania(3)),

  // ---------- Libre ----------
  escala('¿Cuánto te cuesta hablar de sexo con naturalidad?', ['Nada', 'Muchísimo'], libre(1)),
  pregunta('¿Qué palabra o apodo te gustaría que tu pareja te dijera en un momento íntimo?', libre(1)),
  pregunta('¿Qué olor de tu pareja te vuelve loco/a?', libre(1)),
  reto('Pon la canción que te pone en modo romántico y bailadla pegados.', libre(2)),
  completa('La última vez que pensé en ti de esa forma, estaba…', libre(2)),
  pregunta('¿Qué te hace sentir cómodo/a y seguro/a para dejarte llevar del todo?', libre(3)),
  propuesta('Al acabar la partida, quien pierda cumple un deseo de quien gane.', libre(3)),

];

export const CALIENTE: Tarjeta[] = [...ORIGINAL, ...AMPLIACION_CALIENTE];
