import {
  adivinaOpciones,
  completa,
  debate,
  en,
  escala,
  plan,
  pregunta,
  recuerdo,
  reto,
  retoConTiempo,
  yoNunca,
} from '../tarjetas';
import type { Tarjeta } from '../tarjetas';
import { AMPLIACION_PERSONAL } from './ampliaciones/personal';

// Personal: conocerse de verdad. Infancia, familia y amistades, sueños, valores y miedos.
// Nivel 1 = abrir la puerta · 2 = contar con calma · 3 = lo que cuesta decir.

const infancia = en('infancia');
const recuerdos = en('recuerdos');
const amistades = en('amistades');
const futuro = en('futuro');
const valores = en('valores');
const miedos = en('miedos');
const percepcion = en('percepcion');
const delicados = en('delicados');

const ORIGINAL: Tarjeta[] = [
  // ---------- Infancia ----------
  pregunta('¿Cuál es tu recuerdo más antiguo?', infancia(1)),
  adivinaOpciones(
    '¿Dónde pasaba más tiempo de pequeño/a?',
    ['En casa', 'En la calle', 'En casa de mis abuelos', 'En el colegio'],
    infancia(1),
  ),
  pregunta('¿Qué querías ser de mayor cuando tenías ocho años?', infancia(1)),
  pregunta('¿Cuál era tu juguete o dibujo animado favorito?', infancia(1)),
  adivinaOpciones(
    '¿Cómo era yo en el colegio?',
    ['Aplicado/a', 'El payaso de clase', 'Tímido/a', 'Un poco trasto'],
    infancia(1),
  ),
  pregunta('¿Qué olor o sabor te devuelve de golpe a tu infancia?', infancia(2)),
  pregunta('¿Qué travesura hiciste de pequeño/a que tus padres nunca supieron?', infancia(2)),
  yoNunca('Yo nunca he conservado un objeto de mi infancia hasta hoy.', infancia(2)),
  reto('Enséñale a tu pareja una foto tuya de pequeño/a y cuéntale su historia.', infancia(2)),
  pregunta('¿Cómo eran los veranos de tu infancia?', infancia(2)),
  completa('De pequeño/a me daba muchísimo miedo…', infancia(2)),
  pregunta('¿Qué cosa de tu infancia te gustaría que vivieran tus hijos, si los tienes algún día?', infancia(3)),
  pregunta('¿Hay algo de tu infancia que todavía te pese o te duela un poco?', infancia(3)),
  pregunta('¿En qué momento sentiste que dejabas de ser niño/a?', infancia(3)),

  // ---------- Recuerdos ----------
  pregunta('¿Qué momento de tu adolescencia recuerdas con más cariño?', recuerdos(1)),
  completa('Una canción que me devuelve a los dieciséis años es…', recuerdos(1)),
  pregunta('¿Cuál ha sido el mejor cumpleaños de tu vida?', recuerdos(1)),
  recuerdo('Cuenta un día en el que te sentiste increíblemente libre.', recuerdos(2)),
  pregunta('¿Qué decisión de tu pasado cambió el rumbo de tu vida?', recuerdos(2)),
  pregunta('¿Qué profesor/a o adulto te marcó cuando eras joven?', recuerdos(2)),
  pregunta('¿Cuál es el momento en el que más orgullo has sentido de ti?', recuerdos(2)),
  recuerdo('Cuenta la primera vez que te rompieron el corazón.', recuerdos(3)),
  pregunta('¿Qué recuerdo te emociona cada vez que lo cuentas?', recuerdos(3)),
  pregunta('Si pudieras hablar cinco minutos con tu yo de hace diez años, ¿qué le dirías?', recuerdos(3)),
  pregunta('¿Qué etapa de tu vida fue la más difícil y qué te ayudó a salir?', recuerdos(3)),

  // ---------- Familia y amistades ----------
  pregunta('¿Quién es la persona de tu familia con la que más te ríes?', amistades(1)),
  adivinaOpciones(
    '¿Qué papel tengo en mi grupo de amigos?',
    ['El/la que organiza', 'El/la gracioso/a', 'El/la que escucha', 'El/la que llega tarde'],
    amistades(1),
  ),
  pregunta('¿Cómo conociste a tu mejor amigo/a?', amistades(1)),
  pregunta('¿Qué tradición familiar te encanta, aunque sea un poco rara?', amistades(1)),
  debate('Los amigos son la familia que se elige.', amistades(1)),
  pregunta('¿En qué te pareces a tu madre o a tu padre, aunque te cueste admitirlo?', amistades(2)),
  pregunta('¿Qué amistad te cambió la vida?', amistades(2)),
  yoNunca('Yo nunca he dejado de hablar con un amigo/a sin saber muy bien por qué.', amistades(2)),
  pregunta('¿Qué es lo que más valoras de cómo te criaron?', amistades(2)),
  completa('Algo que mi familia no sabe de mí es…', amistades(2)),
  reto('Manda ahora un mensaje bonito a alguien de tu familia o a un amigo/a y enséñaselo a tu pareja.', amistades(2)),
  pregunta('¿Qué amistad echas de menos y qué pasó?', amistades(3)),
  pregunta('¿Qué conversación tienes pendiente con alguien de tu familia?', amistades(3)),
  pregunta('¿Qué te gustaría hacer distinto de como lo hicieron en tu casa?', amistades(3)),

  // ---------- Sueños y futuro ----------
  pregunta('¿Dónde te imaginas viviendo dentro de diez años?', futuro(1)),
  escala('¿Cuánto te preocupa el futuro?', ['Nada, vivo el presente', 'Muchísimo'], futuro(1)),
  pregunta('¿Qué te gustaría aprender antes de cumplir un año más?', futuro(1)),
  plan('Describe cómo sería tu casa ideal, habitación por habitación.', futuro(1)),
  pregunta('¿Qué sueño has aparcado y te gustaría retomar?', futuro(2)),
  pregunta('¿Qué tendría que pasar para que dijeras que tu vida ha merecido la pena?', futuro(2)),
  completa('Dentro de cinco años me encantaría estar…', futuro(2)),
  pregunta('¿Qué riesgo te gustaría atreverte a tomar algún día?', futuro(2)),
  plan('Haced una lista de tres cosas que os gustaría vivir juntos este año.', futuro(2)),
  retoConTiempo('Describe en treinta segundos tu vida perfecta a los setenta años.', 30, futuro(2)),
  pregunta('¿Qué te da más miedo de hacerte mayor?', futuro(3)),
  pregunta('¿Qué legado te gustaría dejar, aunque sea pequeño?', futuro(3)),
  pregunta('¿Qué cosa tienes clara que quieres en tu vida y qué cosa tienes clara que no?', futuro(3)),
  pregunta('Si supieras que no puedes fallar, ¿qué harías mañana?', futuro(3)),

  // ---------- Valores ----------
  debate('Es mejor ser sincero/a siempre, aunque duela.', valores(1)),
  adivinaOpciones(
    '¿Qué valoro más en una persona?',
    ['Lealtad', 'Humor', 'Sinceridad', 'Generosidad'],
    valores(1),
  ),
  pregunta('¿Qué gesto pequeño de alguien te gana para siempre?', valores(1)),
  pregunta('¿Qué te hace perder el respeto por alguien al instante?', valores(1)),
  debate('El dinero da la felicidad, o al menos ayuda mucho.', valores(2)),
  pregunta('¿Por qué causa te pondrías a defender algo en público?', valores(2)),
  escala('¿Cuánto te importa lo que piensen los demás de ti?', ['Nada', 'Demasiado'], valores(2)),
  pregunta('¿Qué opinión tuya ha cambiado por completo con los años?', valores(2)),
  completa('Una regla que nunca me salto es…', valores(2)),
  pregunta('¿Qué significa para ti tener éxito?', valores(3)),
  pregunta('¿Hay algo que hayas hecho que vaya en contra de lo que crees?', valores(3)),
  debate('Se puede perdonar cualquier cosa si la otra persona se arrepiente de verdad.', valores(3)),
  pregunta('¿Qué es lo que nunca negociarías en una relación?', valores(3)),

  // ---------- Miedos y vulnerabilidad ----------
  pregunta('¿Qué miedo absurdo tienes que sabes que no tiene sentido?', miedos(1)),
  escala('¿Cuánto te cuesta pedir ayuda?', ['Nada', 'Muchísimo'], miedos(1)),
  pregunta('¿Qué situación social te pone más nervioso/a?', miedos(1)),
  pregunta('¿Qué haces cuando tienes un mal día y nadie lo sabe?', miedos(2)),
  completa('Me siento inseguro/a cuando…', miedos(2)),
  pregunta('¿Qué crítica te dolió y todavía recuerdas?', miedos(2)),
  yoNunca('Yo nunca he fingido estar bien para no preocupar a nadie.', miedos(2)),
  pregunta('¿Cuándo fue la última vez que lloraste y por qué?', miedos(2)),
  pregunta('¿Qué es lo que más te cuesta mostrar de ti?', miedos(3)),
  pregunta('¿Qué miedo te gustaría superar con la ayuda de tu pareja?', miedos(3)),
  pregunta('¿Qué parte de ti crees que la gente no llega a ver?', miedos(3)),
  pregunta('¿Qué necesitas escuchar cuando estás pasándolo mal?', miedos(3)),

  // ---------- Cómo te veo ----------
  pregunta('¿Qué fue lo primero que pensaste de tu pareja?', percepcion(1)),
  pregunta('¿Qué crees que hacía tu pareja los sábados con quince años?', percepcion(1)),
  pregunta('¿Qué canción crees que representa a tu pareja?', percepcion(1)),
  pregunta('¿En qué crees que tu pareja vale mucho y no se lo cree?', percepcion(2)),
  pregunta('¿Qué crees que hacía feliz a tu pareja en su infancia?', percepcion(2)),
  pregunta('¿Qué crees que es lo que más le preocupa ahora mismo a tu pareja?', percepcion(2)),
  reto('Di tres cosas que admiras de tu pareja mirándole a los ojos.', percepcion(2)),
  completa('Algo que he aprendido de ti es…', percepcion(2)),
  pregunta('¿Qué crees que piensa la gente de tu pareja antes de conocerla bien?', percepcion(3)),
  pregunta('¿Qué crees que necesito y no suelo pedir?', percepcion(3)),
  pregunta('¿Qué piensas de tu pareja que nunca te has atrevido a decirle?', percepcion(3)),
  pregunta('¿En qué ha cambiado tu pareja desde que la conoces?', percepcion(3)),

  // ---------- Temas delicados ----------
  pregunta('¿Cómo te gusta que te cuiden cuando estás enfermo/a?', delicados(1)),
  pregunta('¿Cómo sueles reaccionar cuando discutes con alguien?', delicados(1)),
  pregunta('¿Cuál es tu forma favorita de recibir cariño: palabras, gestos, tiempo, regalos o contacto?', delicados(2)),
  pregunta('¿Qué te cuesta perdonar?', delicados(2)),
  pregunta('¿Qué aprendiste de tu última relación?', delicados(2)),
  completa('Me siento querido/a de verdad cuando…', delicados(2)),
  pregunta('¿Qué te gustaría que mejorara entre nosotros, aunque sea algo pequeño?', delicados(3)),
  pregunta('¿Hay algo que todavía no le hayas contado a tu pareja porque no encontraste el momento?', delicados(3)),
  pregunta('¿Qué te daría miedo perder de nuestra relación?', delicados(3)),
  pregunta('¿Qué cosa tuya te gustaría que tu pareja entendiera mejor?', delicados(3)),

];

export const PERSONAL: Tarjeta[] = [...ORIGINAL, ...AMPLIACION_PERSONAL];
