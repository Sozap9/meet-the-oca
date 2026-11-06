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
  recuerdo,
  reto,
  retoConTiempo,
  propuesta,
  yoNunca,
} from '../tarjetas';
import type { Tarjeta } from '../tarjetas';

const ligeras = en('ligeras');
const futuro = en('futuro');
const reflexiones = en('reflexiones');
const confesiones = en('confesiones');
const intimo = en('intimo');
const retos = en('retos');

export const DADO: Tarjeta[] = [
  // Ligeras
  pregunta('¿Cuál es tu color favorito y qué te recuerda?', ligeras(1)),
  prefieres('Té', 'Café', ligeras(1)),
  escala('¿Cuánto te gusta bailar?', ['Nada', 'Me encanta'], ligeras(1)),
  adivinaOpciones(
    '¿Qué superpoder elegirías?',
    ['Volar', 'Ser invisible', 'Leer mentes', 'Parar el tiempo'],
    ligeras(2),
  ),
  yoNunca('Yo nunca me he quedado dormido/a en el cine.', ligeras(2)),
  pregunta('¿Qué aplicación no podrías borrar de tu móvil y por qué?', ligeras(2)),
  completa('Mi plan perfecto para una tarde de lluvia es…', ligeras(2)),
  pregunta('¿Qué pequeña cosa cotidiana te hace feliz sin que nadie lo sepa?', ligeras(3)),

  // Futuro
  plan('Describe en una frase tu fin de semana perfecto dentro de un año.', futuro(1)),
  escala('¿Cuánto te gusta planificar el futuro?', ['Prefiero improvisar', 'Lo planifico todo'], futuro(1)),
  pregunta('¿Dónde te imaginas viviendo dentro de diez años?', futuro(2)),
  completa('Dentro de cinco años me gustaría haber aprendido…', futuro(2)),
  adivinaOpciones(
    '¿Qué te haría más ilusión dentro de un año?',
    ['Un gran viaje', 'Un cambio profesional', 'Una casa nueva', 'Más tiempo para mí'],
    futuro(2),
  ),
  debate('Es mejor tener un plan de vida claro que dejarse llevar.', futuro(2)),
  pregunta('¿Qué sueño que hoy parece lejano te gustaría cumplir?', futuro(3)),
  plan('Si el dinero no fuera un problema, ¿cómo sería tu año ideal?', futuro(3)),

  // Reflexiones
  debate('Las personas cambian de verdad con el tiempo.', reflexiones(1)),
  escala('¿Cuánto crees que influye la suerte en la vida?', ['Nada', 'Muchísimo'], reflexiones(1)),
  pregunta('¿Qué has aprendido este último año que no esperabas aprender?', reflexiones(2)),
  completa('Algo que hoy veo distinto a como lo veía hace cinco años es…', reflexiones(2)),
  debate('Es más importante ser amable que tener razón.', reflexiones(2)),
  pregunta('¿Qué decisión pequeña acabó cambiando mucho tu vida?', reflexiones(2)),
  escala('¿Cuánto te cuesta perdonar?', ['Poco', 'Muchísimo'], reflexiones(3)),
  pregunta('¿Qué crees que la gente no entiende de ti a primera vista?', reflexiones(3)),

  // Confesiones
  yoNunca('Yo nunca he fingido que me gustaba un regalo.', confesiones(1)),
  dosVerdades('Cuenta tres cosas sobre ti: dos verdaderas y una falsa.', confesiones(1)),
  completa('Una manía mía que casi nadie conoce es…', confesiones(2)),
  yoNunca('Yo nunca he mentido para librarme de un plan.', confesiones(2)),
  adivinaOpciones(
    '¿Cuál es tu pequeño vicio?',
    ['Series hasta tarde', 'Picar a deshoras', 'Comprar online', 'Aplazar cosas'],
    confesiones(2),
  ),
  pregunta('¿Qué secreto inocente guardas desde hace años?', confesiones(3)),
  completa('Algo que me da vergüenza admitir es…', confesiones(3)),
  pregunta('¿Cuál ha sido la mentira piadosa más grande que has dicho?', confesiones(3)),

  // Íntimo
  pregunta('¿Qué fue lo primero que te llamó la atención de tu pareja?', intimo(1)),
  adivinaOpciones(
    '¿Qué gesto mío te enamora más?',
    ['Mi risa', 'Cómo te cuido', 'Cómo te miro', 'Mis abrazos'],
    intimo(1),
  ),
  recuerdo('¿Qué momento nuestro te gustaría volver a vivir?', intimo(2)),
  completa('Me siento más cerca de ti cuando…', intimo(2)),
  escala('¿Cuánto necesitas que te demuestre cariño con gestos?', ['Poco', 'Mucho'], intimo(2)),
  propuesta('Una noche sin móviles, solo con velas y música, para nosotros.', intimo(2)),
  pregunta('¿Qué te gustaría que hiciéramos más a menudo para sentirnos cerca?', intimo(3)),
  propuesta('Escribirnos una carta con lo que más valoramos del otro y leerla en voz alta.', intimo(3)),

  // Retos
  retoConTiempo('Haz tu mejor baile durante 20 segundos.', 20, retos(1)),
  reto('Cuéntale un chiste a tu pareja sin reírte tú.', retos(1)),
  retoConTiempo('Describe a tu pareja en 30 segundos usando solo gestos, sin hablar.', 30, retos(2)),
  retoConTiempo('Canta un trozo de una canción que os recuerde algo, no hace falta afinar.', 30, retos(2)),
  retoConTiempo('Dile a tu pareja un cumplido distinto cada diez segundos durante un minuto.', 60, retos(2)),
  retoConTiempo('Ponle un apodo cariñoso nuevo y justifícalo en 30 segundos.', 30, retos(2)),
  reto('Dale un abrazo de diez segundos sin decir nada.', retos(3)),
  retoConTiempo('Miraos a los ojos en silencio sin reíros.', 30, retos(3)),
];