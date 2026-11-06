import {
  adivinaOpciones,
  comodin,
  completa,
  debate,
  en,
  escala,
  plan,
  pregunta,
  reto,
  retoConTiempo,
  yoNunca,
} from '../../tarjetas';
import type { Tarjeta } from '../../tarjetas';

const recuerdos = en('recuerdos');
const valores = en('valores');
const futuro = en('futuro');
const miedos = en('miedos');
const delicados = en('delicados');

export const PERSONAL_ANTERIOR: Tarjeta[] = [
  // Recuerdos (los tuyos, no los de pareja)
  pregunta('¿Cuál es tu recuerdo más antiguo?', recuerdos(1)),
  adivinaOpciones(
    '¿Dónde pasabas más tiempo de pequeño/a?',
    ['En casa', 'En la calle', 'En casa de mis abuelos', 'En el colegio'],
    recuerdos(1),
  ),
  completa('Una canción, un olor o un sabor que me devuelve a mi adolescencia es…', recuerdos(2)),
  pregunta('¿Qué momento de tu adolescencia recuerdas con más cariño?', recuerdos(2)),
  yoNunca('Yo nunca he conservado un objeto de mi infancia hasta hoy.', recuerdos(2)),
  reto('Enséñale a tu pareja una foto antigua tuya y cuéntale su historia.', recuerdos(2)),
  pregunta('¿Qué recuerdo te emociona cada vez que lo cuentas?', recuerdos(3)),

  // Valores
  debate('Es mejor ser sincero/a siempre, aunque duela.', valores(1)),
  adivinaOpciones(
    '¿Qué valoras más en una amistad?',
    ['Lealtad', 'Humor', 'Estar siempre ahí', 'Sinceridad'],
    valores(1),
  ),
  escala('¿Cuánto te importa la opinión de los demás?', ['Nada', 'Muchísimo'], valores(2)),
  pregunta('¿Qué principio tuyo no negociarías nunca?', valores(2)),
  debate('El dinero da la felicidad hasta cierto punto.', valores(2)),
  retoConTiempo(
    'Durante un minuto, cuéntale a tu pareja algo que admiras de cómo es.',
    60,
    valores(2),
  ),
  pregunta('¿Qué te enseñaron en casa que sigues defendiendo hoy?', valores(3)),

  // Futuro
  plan('Describe en una frase tu día ideal dentro de cinco años.', futuro(1)),
  escala('¿Cuánto te ilusiona el futuro?', ['Nada', 'Muchísimo'], futuro(1)),
  pregunta('¿Qué te gustaría haber conseguido dentro de diez años?', futuro(2)),
  adivinaOpciones(
    '¿Qué tipo de vida te atrae más?',
    ['Tranquila en un pueblo', 'Intensa en una gran ciudad', 'Viajando sin parar', 'Cerca de la naturaleza'],
    futuro(2),
  ),
  completa('Un hábito que quiero construir en los próximos meses es…', futuro(2)),
  retoConTiempo('Describe en 30 segundos la casa de tus sueños con todo detalle.', 30, futuro(2)),
  pregunta('¿Qué decisión importante estás aplazando y por qué?', futuro(3)),

  // Miedos y confianza
  escala('¿Cuánto te cuesta pedir ayuda?', ['Nada', 'Muchísimo'], miedos(1)),
  yoNunca('Yo nunca he sentido que no daba la talla en algo importante.', miedos(1)),
  pregunta('¿Qué miedo te gustaría perder?', miedos(2)),
  adivinaOpciones(
    '¿Qué te da más inseguridad?',
    ['Hablar en público', 'Quedarme solo/a', 'Equivocarme', 'Decepcionar a alguien'],
    miedos(2),
  ),
  completa('Me siento más seguro/a cuando…', miedos(2)),
  pregunta('¿En qué momento sentiste que podías confiar de verdad en alguien?', miedos(3)),
  retoConTiempo(
    'Cuéntale a tu pareja algo que te cuesta contar; durante un minuto solo escucha, sin opinar.',
    60,
    miedos(3),
  ),

  // Temas delicados
  debate('Hablar de dinero en pareja es incómodo.', delicados(1)),
  escala(
    '¿Cuánto te cuesta decir "no" cuando algo no te apetece?',
    ['Nada', 'Muchísimo'],
    delicados(2),
  ),
  debate('Discutir de vez en cuando es sano en una pareja.', delicados(2)),
  pregunta('¿Cómo te gusta que te traten cuando estás enfadado/a?', delicados(2)),
  pregunta('¿Qué te cuesta pedirle a las personas que quieres?', delicados(3)),
  completa('Algo que necesito más de lo que pido es…', delicados(3)),
  pregunta('¿Qué conversación tienes pendiente con alguien, o contigo mismo/a?', delicados(3)),

  comodin(),
];