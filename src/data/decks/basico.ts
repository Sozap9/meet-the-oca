import {
  adivinaOpciones,
  completa,
  debate,
  dosVerdades,
  en,
  escala,
  plan,
  prefieres,
  pregunta,
  reto,
  retoConTiempo,
  yoNunca,
} from '../tarjetas';
import type { Tarjeta } from '../tarjetas';
import { AMPLIACION_BASICO } from './ampliaciones/basico';

// Básico: preguntas ligeras y divertidas para conocerse sin presión.
// Nivel 1 = gustos rápidos · 2 = algo más personal · 3 = anécdotas y opiniones con historia.

const gustos = en('gustos');
const comida = en('comida');
const humor = en('humor');
const rutinas = en('rutinas');
const viajes = en('viajes');
const hipoteticas = en('hipoteticas');
const prefs = en('prefieres');

const ORIGINAL: Tarjeta[] = [
  // ---------- Gustos ----------
  pregunta('¿Cuál es tu color favorito y en qué cosa tuya aparece más?', gustos(1)),
  pregunta('¿Qué canción te pone de buen humor al instante?', gustos(1)),
  pregunta('¿Qué serie has visto más de una vez y la volverías a ver?', gustos(1)),
  adivinaOpciones(
    '¿Qué estación del año es mi favorita?',
    ['Primavera', 'Verano', 'Otoño', 'Invierno'],
    gustos(1),
  ),
  escala('¿Cuánto te gusta cantar cuando nadie te escucha?', ['Nada', 'Soy una estrella'], gustos(1)),
  adivinaOpciones(
    '¿Qué animal tendría si pudiera tener cualquiera?',
    ['Perro', 'Gato', 'Algo exótico', 'Ninguno'],
    gustos(1),
  ),
  reto('Tararea una canción que te encante y que tu pareja adivine cuál es.', gustos(1)),
  pregunta('¿Qué película te sabes casi de memoria?', gustos(2)),
  pregunta('¿Qué cantante o grupo te avergüenza un poco que te guste?', gustos(2)),
  completa('Un placer culpable que no pienso dejar es…', gustos(2)),
  pregunta('¿Qué objeto de tu casa salvarías primero si tuvieras que irte corriendo?', gustos(2)),
  yoNunca('Yo nunca he llorado viendo una película de dibujos.', gustos(2)),
  pregunta('¿Qué afición empezaste con muchas ganas y abandonaste a la semana?', gustos(2)),
  retoConTiempo('Pon una canción que os encante y bailadla juntos treinta segundos.', 30, gustos(2)),
  pregunta('¿Qué libro, peli o serie te cambió un poco la forma de ver las cosas?', gustos(3)),
  pregunta('¿Qué canción pondrías para resumir cómo eres?', gustos(3)),
  completa('Si mi vida tuviera banda sonora, la primera canción sería…', gustos(3)),
  pregunta('¿Qué te gustaba muchísimo hace diez años y ahora no soportas?', gustos(3)),

  // ---------- Comida ----------
  pregunta('¿Cuál es tu comida favorita de toda la vida?', comida(1)),
  adivinaOpciones(
    '¿Cómo me gustan los huevos?',
    ['Fritos', 'Revueltos', 'En tortilla', 'Cocidos'],
    comida(1),
  ),
  pregunta('¿Qué comida odias aunque todo el mundo diga que está buenísima?', comida(1)),
  adivinaOpciones(
    '¿Tortilla de patatas con o sin cebolla?',
    ['Con cebolla', 'Sin cebolla', 'Me da igual', 'Con lo que haya'],
    comida(1),
  ),
  escala('¿Cuánto picante aguantas?', ['Nada', 'Todo el que haya'], comida(1)),
  pregunta('¿Qué pedirías siempre en un restaurante aunque probaras la carta entera?', comida(1)),
  pregunta('¿Cuál es tu desayuno perfecto de domingo?', comida(2)),
  pregunta('¿Qué plato te sale mejor que a nadie?', comida(2)),
  adivinaOpciones(
    '¿Qué es lo que más pico entre horas?',
    ['Algo salado', 'Chocolate', 'Fruta', 'Lo primero que pille'],
    comida(2),
  ),
  yoNunca('Yo nunca me he comido algo caducado sabiendo que lo estaba.', comida(2)),
  pregunta('¿Qué combinación rara de comida te encanta?', comida(2)),
  reto('Describe tu bocadillo ideal como si fuera un anuncio de televisión.', comida(2)),
  debate('La pizza con piña es una buena idea.', comida(2)),
  pregunta('¿Qué comida te recuerda a casa de tu familia?', comida(3)),
  pregunta('Si fuera tu última cena, ¿qué habría en la mesa?', comida(3)),
  completa('El peor desastre que he tenido en la cocina fue…', comida(3)),
  pregunta('¿Qué comida probaste en un viaje y todavía echas de menos?', comida(3)),

  // ---------- Humor ----------
  pregunta('¿Qué meme o vídeo te hace reír siempre, aunque lo hayas visto cien veces?', humor(1)),
  debate('Los chistes malos son los mejores.', humor(1)),
  escala('¿Cuánto te ríes de tus propios chistes?', ['Nada', 'Antes de terminarlos'], humor(1)),
  reto('Cuenta el peor chiste que te sepas con toda la seriedad del mundo.', humor(1)),
  pregunta('¿Qué palabra o expresión dices tanto que ya es tu marca personal?', humor(1)),
  yoNunca('Yo nunca me he reído en el peor momento posible.', humor(2)),
  pregunta('¿Cuál es la cosa más ridícula que has hecho por quedar bien?', humor(2)),
  retoConTiempo('Haz reír a tu pareja en treinta segundos sin tocarla.', 30, humor(2)),
  pregunta('¿Qué tontería te enfada más de lo que debería?', humor(2)),
  completa('La vez que más vergüenza he pasado en público fue cuando…', humor(2)),
  reto('Imita a alguien famoso hasta que tu pareja adivine quién es.', humor(2)),
  dosVerdades('Cuenta tres anécdotas tuyas: dos verdaderas y una inventada.', humor(2)),
  pregunta('¿Qué anécdota graciosa de tu vida cuentas siempre en las reuniones?', humor(3)),
  pregunta('¿Qué malentendido te ha pasado que todavía te hace reír?', humor(3)),
  pregunta('¿Cuál es el mensaje más vergonzoso que has enviado a la persona equivocada?', humor(3)),
  yoNunca('Yo nunca he fingido saber de algo para no quedar mal.', humor(3)),

  // ---------- Rutinas y manías ----------
  escala('¿Cuánto te cuesta salir de la cama por la mañana?', ['Nada', 'Muchísimo'], rutinas(1)),
  adivinaOpciones(
    '¿Qué hago lo primero al despertarme?',
    ['Mirar el móvil', 'Ir al baño', 'Café', 'Remolonear'],
    rutinas(1),
  ),
  pregunta('¿Ducha por la mañana o por la noche? Defiende tu respuesta.', rutinas(1)),
  pregunta('¿Qué manía tienes que nadie más entiende?', rutinas(1)),
  adivinaOpciones(
    '¿Cómo suelo dormir?',
    ['Boca arriba', 'De lado', 'Boca abajo', 'En posiciones imposibles'],
    rutinas(1),
  ),
  pregunta('¿Cuál es tu plan perfecto para un día de lluvia?', rutinas(2)),
  debate('Hacer la cama todos los días es imprescindible.', rutinas(2)),
  yoNunca('Yo nunca he puesto cinco alarmas para levantarme.', rutinas(2)),
  retoConTiempo(
    'Representa tu mañana de siempre sin hablar y que tu pareja adivine cada escena.',
    30,
    rutinas(2),
  ),
  pregunta('¿Qué tarea de casa harías encantado/a siempre y cuál odias con toda tu alma?', rutinas(2)),
  pregunta('¿Qué pequeño ritual te ayuda a desconectar al final del día?', rutinas(2)),
  completa('Si pudiera cambiar una cosa de mi día a día, sería…', rutinas(3)),
  pregunta('¿Qué costumbre tuya te gustaría que se te pegara de otra persona?', rutinas(3)),
  pregunta('¿Cómo sería un domingo perfecto de principio a fin?', rutinas(3)),
  pregunta('¿Qué hábito has intentado empezar mil veces?', rutinas(3)),

  // ---------- Viajes y planes ----------
  pregunta('¿A qué lugar volverías mil veces?', viajes(1)),
  adivinaOpciones(
    '¿Qué tipo de viaje me pide más el cuerpo?',
    ['Aventura', 'Descanso total', 'Ciudad y cultura', 'Comida y pueblos'],
    viajes(1),
  ),
  pregunta('¿Maleta grande o mochila con lo justo?', viajes(1)),
  pregunta('¿Cuál es el mejor plan barato que conoces en tu ciudad?', viajes(1)),
  escala('¿Cuánto te gusta improvisar en un viaje?', ['Lo quiero todo planeado', 'Cero planes'], viajes(1)),
  plan('Planifica en una frase un fin de semana perfecto con poco presupuesto.', viajes(2)),
  retoConTiempo('Inventa un viaje en treinta segundos y convence a tu pareja de hacerlo.', 30, viajes(2)),
  yoNunca('Yo nunca he perdido un avión, un tren o un autobús.', viajes(2)),
  pregunta('¿Qué es lo más raro que te ha pasado en un viaje?', viajes(2)),
  pregunta('¿Playa de arena o de piedras? ¿Y por qué es obvio?', viajes(2)),
  pregunta('¿Qué ciudad te decepcionó y cuál te sorprendió para bien?', viajes(2)),
  completa('El viaje que sueño hacer algún día es…', viajes(3)),
  pregunta('¿Cuál ha sido el mejor viaje de tu vida y qué lo hizo especial?', viajes(3)),
  plan('Si os tocara un viaje sorpresa mañana, ¿adónde iríais y qué haríais el primer día?', viajes(3)),
  pregunta('¿En qué lugar del mundo te imaginas viviendo una temporada?', viajes(3)),

  // ---------- ¿Y si…? ----------
  pregunta('Si fueras un animal, ¿cuál serías y por qué?', hipoteticas(1)),
  pregunta('Si pudieras tener un superpoder solo los lunes, ¿cuál elegirías?', hipoteticas(1)),
  pregunta('Si tu vida fuera una serie, ¿cómo se llamaría la temporada actual?', hipoteticas(1)),
  adivinaOpciones(
    'Si me tocara la lotería, ¿qué haría primero?',
    ['Viajar', 'Comprar casa', 'Dejar el trabajo', 'No contárselo a nadie'],
    hipoteticas(1),
  ),
  pregunta('Si pudieras cenar con cualquier persona, viva o no, ¿a quién invitarías?', hipoteticas(2)),
  pregunta('Si pudieras dominar un talento de un día para otro, ¿cuál sería?', hipoteticas(2)),
  pregunta('Si mañana te despertaras famoso/a, ¿por qué crees que sería?', hipoteticas(2)),
  pregunta('Si pudieras vivir en cualquier época, ¿cuál elegirías?', hipoteticas(2)),
  reto('Si fueras un producto de supermercado, véndete en un anuncio de quince segundos.', hipoteticas(2)),
  pregunta('Si pudieras cambiar de trabajo un año sin consecuencias, ¿a qué te dedicarías?', hipoteticas(3)),
  pregunta('Si pudieras volver a un día de tu vida para repetirlo, ¿cuál sería?', hipoteticas(3)),
  pregunta('Si escribieras un libro sobre tu vida, ¿cómo se llamaría el capítulo actual?', hipoteticas(3)),
  pregunta('Si pudieras saber la respuesta a una sola pregunta, ¿qué preguntarías?', hipoteticas(3)),

  // ---------- ¿Qué prefieres? ----------
  prefieres('Playa', 'Montaña', prefs(1)),
  prefieres('Madrugar', 'Trasnochar', prefs(1)),
  prefieres('Dulce', 'Salado', prefs(1)),
  prefieres('Perros', 'Gatos', prefs(1)),
  prefieres('Cine en casa', 'Cine en sala', prefs(1)),
  prefieres('Calor extremo', 'Frío extremo', prefs(1)),
  prefieres('Planes improvisados', 'Planes organizados', prefs(2)),
  prefieres('Cocinar', 'Fregar después', prefs(2)),
  prefieres('Ver una serie entera de golpe', 'Un capítulo cada semana', prefs(2)),
  prefieres('Poder volar', 'Ser invisible', prefs(2)),
  prefieres('Una fiesta enorme', 'Una cena con cuatro amigos', prefs(2)),
  prefieres('No volver a usar el móvil', 'No volver a ver la tele', prefs(2)),
  prefieres('Saber el final de una historia', 'Que me sorprenda', prefs(3)),
  prefieres('Viajar al pasado', 'Viajar al futuro', prefs(3)),
  prefieres('Vivir en la ciudad', 'Vivir en el campo', prefs(3)),
  prefieres('Tener mucho tiempo libre', 'Tener mucho dinero', prefs(3)),

];

export const BASICO: Tarjeta[] = [...ORIGINAL, ...AMPLIACION_BASICO];
