import {
  adivinaOpciones,
  comodin,
  completa,
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

// Caliente (+18): fantasías, gustos, preguntas pícaras y retos de pareja de toda la vida.
// Sin interpretar papeles: besos, caricias, masajes y alguna prenda.
// Nivel 1 = calentar motores · 2 = subir la temperatura · 3 = lo más atrevido del mazo.
// El semáforo sirve para proponer lo más atrevido sabiendo que un rojo siempre se respeta.

const atraccion = en('atraccion');
const coqueteo = en('coqueteo');
const citas = en('citas');
const deseos = en('deseos');
const cercania = en('cercania');
const fantasias = en('fantasias');
const experiencias = en('experiencias');
const libre = en('libre');

export const CALIENTE_V1: Tarjeta[] = [
  // ---------- Atracción ----------
  pregunta('¿Qué fue lo primero que te atrajo de mí?', atraccion(1)),
  pregunta('¿Qué ropa mía te dan ganas de quitarme nada más verla?', atraccion(1)),
  pregunta('¿Qué gesto mío te pone sin que yo me dé cuenta?', atraccion(1)),
  adivinaOpciones(
    '¿Qué parte de mi cuerpo me gusta más que me toquen?',
    ['El cuello', 'La espalda', 'Las piernas', 'El pelo'],
    atraccion(1),
  ),
  escala('¿Cuánto te pone verme recién salido/a de la ducha?', ['Poco', 'Muchísimo'], atraccion(1)),
  pregunta('¿Qué parte de mi cuerpo te distrae cuando intentas concentrarte?', atraccion(2)),
  pregunta('¿Qué ropa interior te gustaría verme puesta esta noche?', atraccion(2)),
  completa('Me pone muchísimo cuando tú…', atraccion(2)),
  pregunta('¿En qué momento del día te parezco más atractivo/a?', atraccion(2)),
  pregunta('¿Qué mirada mía sabes que significa «vámonos a casa ya»?', atraccion(3)),
  pregunta('¿Qué es lo que más te excita de mí y nunca me has dicho tal cual?', atraccion(3)),
  pregunta('¿Cuándo fue la última vez que pensaste en mí de forma nada inocente fuera de casa?', atraccion(3)),
  reto('Dile a tu pareja al oído, muy despacio, qué es lo que más te gusta de su cuerpo.', atraccion(3)),

  // ---------- Provocación ----------
  pregunta('¿Qué mensaje mío te ha dejado con ganas todo el día?', coqueteo(1)),
  escala('¿Cuánto te gusta que te provoque en público, con disimulo?', ['Nada', 'Me encanta'], coqueteo(1)),
  reto('Muérdele suavemente el labio inferior a tu pareja.', coqueteo(1)),
  retoConTiempo('Daos un beso largo, de película, hasta que suene la alarma.', 30, coqueteo(1)),
  reto('Mándale a tu pareja ahora mismo el mensaje más subido de tono que se te ocurra, aunque estéis al lado.', coqueteo(2)),
  retoConTiempo('Bésale el cuello a tu pareja y no pares hasta que suene la alarma.', 30, coqueteo(2)),
  reto('Escribe con el dedo en la espalda de tu pareja una palabra picante. Tiene que adivinarla.', coqueteo(2)),
  reto('Dile a tu pareja al oído algo que te apetezca hacer con ella esta noche.', coqueteo(2)),
  pregunta('¿Qué te gustaría que te dijera al oído en mitad de una cena con amigos?', coqueteo(2)),
  retoConTiempo('Dale besos suaves por el cuello y los hombros a tu pareja.', 30, coqueteo(3)),
  pregunta('¿Qué es lo más atrevido que te gustaría que te dijera por mensaje?', coqueteo(3)),
  reto('Siéntate en las piernas de tu pareja y dile algo que nunca le hayas dicho.', coqueteo(3)),

  // ---------- Citas y planes ----------
  pregunta('¿Cómo terminaría nuestra cita perfecta si no tuviéramos que madrugar?', citas(1)),
  adivinaOpciones(
    '¿Qué plan de noche me apetece más?',
    ['Cena y directos a casa', 'Hotel con todo incluido', 'Sofá, vino y lo que surja', 'Una escapada sorpresa'],
    citas(1),
  ),
  pregunta('¿Qué canción pondrías de fondo para una noche especial?', citas(1)),
  prefieres('Cita elegante y luego en casa', 'Directamente en casa en pijama', citas(1)),
  pregunta('¿Qué te pondrías si quisieras que no aguantara hasta llegar a casa?', citas(2)),
  pregunta('¿Cuál es la cita más romántica que te imaginas conmigo?', citas(2)),
  plan('Diseñad una noche de hotel perfecta para los dos: qué pedís, qué hacéis y a qué hora salís.', citas(2)),
  semaforo('Una noche entera sin móviles, con velas, música y sin salir de la habitación.', citas(2)),
  pregunta('¿Qué sitio de la ciudad te parece perfecto para un beso que se nos vaya de las manos?', citas(3)),
  semaforo('Un fin de semana entero solo para nosotros, sin planes ni visitas.', citas(3)),

  // ---------- Deseos ----------
  prefieres('Por la mañana', 'Por la noche', deseos(1)),
  prefieres('Despacio y con calma', 'Con prisa y sin pensar', deseos(1)),
  escala('¿Cuánto te gustan los preliminares largos?', ['Al grano', 'Que duren horas'], deseos(1)),
  pregunta('¿Dónde te gusta más que te besen, aparte de la boca?', deseos(1)),
  semaforo('Un masaje largo con aceite y sin prisas.', deseos(1)),
  pregunta('¿Cuál es tu postura favorita y por qué?', deseos(2)),
  pregunta('¿Qué es lo que más te gusta que te haga y te gustaría que hiciera más a menudo?', deseos(2)),
  prefieres('Con la luz encendida', 'A oscuras', deseos(2)),
  prefieres('Llevar la iniciativa', 'Dejarte llevar', deseos(2)),
  semaforo('Ducharnos juntos esta noche.', deseos(2)),
  semaforo('Que uno de los dos lleve los ojos vendados y el otro decida todo.', deseos(2)),
  adivinaOpciones(
    '¿Qué me gusta más para empezar?',
    ['Besos en el cuello', 'Caricias en la espalda', 'Que me hablen al oído', 'Que me desnuden despacio'],
    deseos(2),
  ),
  escala('¿Cuánto te gusta que te sorprenda con un plan romántico?', ['Poco', 'Me encanta'], deseos(2)),
  pregunta('¿Qué te gustaría pedirme en la cama y nunca te has atrevido?', deseos(3)),
  semaforo('Usar un juguete nuevo los dos juntos.', deseos(3)),
  semaforo('Hacerlo en un sitio de la casa en el que nunca lo hemos hecho.', deseos(3)),
  pregunta('¿Qué te gustaría que te hiciera para despertarte un domingo?', deseos(3)),
  pregunta('¿Qué te gustaría probar conmigo que todavía no hayamos hecho?', deseos(3)),
  completa('Esta noche me gustaría que tú…', deseos(3)),

  // ---------- Fantasías ----------
  pregunta('¿Qué escena de película o serie te ha puesto más de lo que admitirías?', fantasias(1)),
  pregunta('¿Qué fantasía tenías de adolescente que todavía te ronda?', fantasias(1)),
  prefieres('Hotel de lujo', 'Cabaña perdida en el monte', fantasias(1)),
  pregunta('¿Qué lugar te parece el más excitante para hacerlo, aunque nunca te atrevieras?', fantasias(2)),
  completa('Una fantasía que nunca le he contado a nadie empieza en…', fantasias(2)),
  pregunta('Si tuviéramos una noche sin ningún límite, ¿qué sería lo primero que harías?', fantasias(2)),
  pregunta('¿Con qué disfraz o conjunto te gustaría verme una noche?', fantasias(2)),
  pregunta('¿Qué fantasía tuya crees que me sorprendería más?', fantasias(3)),
  pregunta('¿Dónde es el sitio más arriesgado en el que te gustaría hacerlo conmigo?', fantasias(3)),
  pregunta('¿Qué te gustaría que pasara la próxima vez que estemos solos?', fantasias(3)),
  pregunta('¿Qué fantasía te da un poco de vergüenza contar pero te encantaría cumplir?', fantasias(3)),
  semaforo('Hacerlo delante de un espejo para mirarnos.', fantasias(3)),
  pregunta('Si pudieras elegir cualquier lugar del mundo para una noche juntos, ¿cuál sería?', fantasias(3)),

  // ---------- Experiencias ----------
  pregunta('¿Cuándo y dónde fue tu primer beso de verdad?', experiencias(1)),
  yoNunca('Yo nunca he mandado un mensaje subido de tono a quien no debía.', experiencias(1)),
  yoNunca('Yo nunca me he enrollado con alguien en un sitio público.', experiencias(1)),
  yoNunca('Yo nunca he fingido tener sueño para irme antes a la cama con mi pareja.', experiencias(1)),
  pregunta('¿Cuál es el sitio más raro donde lo has hecho?', experiencias(2)),
  yoNunca('Yo nunca lo he hecho fuera de una cama.', experiencias(2)),
  pregunta('¿Cuál ha sido el beso que más te ha marcado?', experiencias(2)),
  pregunta('¿Qué es lo más atrevido que has hecho en la cama?', experiencias(2)),
  yoNunca('Yo nunca he tenido que esconderme para que no me pillaran.', experiencias(3)),
  pregunta('¿Qué momento nuestro recuerdas cuando quieres ponerte de buen humor?', experiencias(3)),
  pregunta('¿Cuál es el mejor recuerdo íntimo que tienes de los dos?', experiencias(3)),
  pregunta('¿Qué has descubierto que te gusta gracias a mí?', experiencias(3)),
  pregunta('¿Qué noche nuestra te gustaría repetir hoy mismo?', experiencias(3)),

  // ---------- Contacto ----------
  retoConTiempo('Masajea los hombros y la nuca de tu pareja.', 60, cercania(1)),
  reto('Dale a tu pareja un beso en el sitio que elija.', cercania(1)),
  retoConTiempo('Abraza a tu pareja por detrás y respírale en el cuello.', 30, cercania(1)),
  retoConTiempo('Besaos sin usar las manos.', 30, cercania(1)),
  reto('Dale a tu pareja tres besos en sitios distintos de la cara.', cercania(1)),
  retoConTiempo('Acaricia el pelo y la cara de tu pareja con los ojos cerrados.', 30, cercania(2)),
  reto('Véndale los ojos a tu pareja con lo que tengas a mano y dale tres besos en tres sitios distintos. Tiene que adivinar dónde fue cada uno.', cercania(2)),
  retoConTiempo('Besaos como en vuestra primera cita.', 30, cercania(2)),
  retoConTiempo('Besa a tu pareja desde la oreja hasta el hombro, muy despacio.', 30, cercania(2)),
  retoConTiempo('Bailad pegados una canción lenta, aunque sea sin música.', 60, cercania(2)),
  retoConTiempo('Masajea las manos y los brazos de tu pareja.', 60, cercania(2)),
  reto('Elige una parte del cuerpo de tu pareja y bésala durante diez segundos.', cercania(2)),
  reto('Quítate una prenda que elija tu pareja.', cercania(3)),
  retoConTiempo('Venda los ojos a tu pareja y dale besos donde quieras.', 60, cercania(3)),
  reto('Tu pareja elige dónde quiere un beso y tú no puedes negarte.', cercania(3)),
  retoConTiempo('Abrazaos tumbados, en silencio, sin mirar el móvil.', 60, cercania(3)),
  reto('Dile a tu pareja, mirándole a los ojos, qué es lo que más te gusta de cómo te besa.', cercania(3)),
  retoConTiempo('Masaje de espalda con los ojos cerrados: tu pareja te guía con palabras.', 60, cercania(3)),

  // ---------- Libre ----------
  pregunta('¿Qué canción te pone en modo romántico al instante?', libre(1)),
  escala('¿Cuánto te cuesta hablar de sexo con naturalidad?', ['Nada', 'Muchísimo'], libre(1)),
  pregunta('¿Qué palabra o apodo te gustaría que te dijera en un momento íntimo?', libre(1)),
  pregunta('¿Qué te gustaría que hiciéramos más a menudo?', libre(2)),
  completa('La última vez que pensé en ti de esa forma, estaba…', libre(2)),
  pregunta('¿Qué es lo que más te gusta que te diga después?', libre(2)),
  pregunta('¿Qué te hace sentir cómodo/a y seguro/a para dejarte llevar del todo?', libre(3)),
  pregunta('¿Qué te pone nervioso/a, en el buen sentido, de nuestra intimidad?', libre(3)),
  pregunta('¿Qué quieres que pase cuando terminemos esta partida?', libre(3)),

  comodin(),
  comodin('Comodín: propón tú un reto picante para tu pareja.'),
];
