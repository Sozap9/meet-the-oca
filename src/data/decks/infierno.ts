import {
  adivinaOpciones,
  completa,
  en,
  escala,
  prefieres,
  pregunta,
  reto,
  retoConTiempo,
  propuesta,
  yoNunca,
} from '../tarjetas';
import type { Tarjeta } from '../tarjetas';
import { AMPLIACION_INFIERNO } from './ampliaciones/infierno';

// Infierno (+18): el modo Caliente, pero explícito y sin filtros.
// Posturas, placer, juguetes, morbo, pasado y retos de fuego. Lo más arriesgado va como propuesta (del 1 al 10).
// Nivel 1 = romper el hielo · 2 = sin rodeos · 3 = lo más fuerte del mazo.

const posturas = en('posturas');
const placer = en('placer');
const juguetes = en('juguetes');
const morbo = en('morbo');
const pasado = en('pasado');
const fuego = en('fuego');

const ORIGINAL: Tarjeta[] = [
  // ---------- Posturas ----------
  pregunta('¿Cuál es tu postura favorita y por qué?', posturas(1)),
  adivinaOpciones(
    '¿Qué postura prefiero?',
    ['Yo encima', 'Tú encima', 'Por detrás', 'De lado, abrazados'],
    posturas(1),
  ),
  prefieres('Tú encima', 'Yo encima', posturas(1)),
  pregunta('¿Con qué postura llegas antes al orgasmo?', posturas(2)),
  pregunta('¿Qué postura hemos probado una vez y deberíamos repetir?', posturas(2)),
  escala('¿Cuánto te gusta cambiar de postura a mitad?', ['Con una me basta', 'Todas las que quepan'], posturas(2)),
  propuesta('Probar esta semana una postura que no hayamos hecho nunca.', posturas(2)),
  pregunta('¿Qué postura te da morbo pero nunca te has atrevido a pedir?', posturas(3)),
  reto('Sin tocar a tu pareja, descríbele paso a paso la postura con la que acabaríais esta noche.', posturas(3)),
  propuesta('Que tu pareja elija la postura de esta noche y tú no puedas protestar.', posturas(3)),

  // ---------- Placer ----------
  escala('¿Cuánto te gusta el sexo oral?', ['Poco', 'Me encanta'], placer(1)),
  prefieres('Dar sexo oral', 'Recibirlo', placer(1)),
  prefieres('Rápido y contra la pared', 'Lento y sin prisa en la cama', placer(1)),
  pregunta('¿Qué zona de tu cuerpo es la más sensible y casi nadie conoce?', placer(1)),
  pregunta('¿Qué tiene que hacer tu pareja para que pierdas el control?', placer(2)),
  pregunta('¿Qué te gusta que te haga tu pareja con la boca y no te hace lo suficiente?', placer(2)),
  completa('Lo que más me pone en los preliminares es…', placer(2)),
  escala('¿Cuánto ruido te gusta hacer?', ['Discreción total', 'Que se entere el vecino'], placer(2)),
  pregunta('¿Qué es lo que más te ayuda a llegar al orgasmo?', placer(2)),
  pregunta('¿Cuál ha sido el mejor orgasmo que has tenido con tu pareja y qué lo hizo especial?', placer(3)),
  pregunta('¿Qué te gustaría que tu pareja te hiciera con las manos que todavía no te haya hecho?', placer(3)),
  completa('Si tuviera que guiarte esta noche, te diría que empezaras por…', placer(3)),
  propuesta('Una noche en la que solo cuenta el placer de uno: el otro se dedica a dárselo.', placer(3)),

  // ---------- Juguetes y juegos ----------
  pregunta('¿Has usado alguna vez un juguete sexual? ¿Qué te pareció?', juguetes(1)),
  escala('¿Cuánto te tienta probar juguetes juntos?', ['Nada', 'Muchísimo'], juguetes(1)),
  adivinaOpciones(
    '¿Qué me daría más curiosidad probar?',
    ['Un vibrador', 'Esposas', 'Un antifaz', 'Aceite que da calor'],
    juguetes(1),
  ),
  propuesta('Usar un juguete nuevo los dos juntos.', juguetes(2)),
  propuesta('Atarle las manos a tu pareja con un pañuelo durante un rato.', juguetes(2)),
  propuesta('Hielo y algo caliente: alternarlos sobre la piel de tu pareja.', juguetes(2)),
  pregunta('¿Qué juguete te comprarías ahora mismo si pagara tu pareja?', juguetes(2)),
  propuesta('Diez minutos en los que uno da las órdenes y el otro solo obedece.', juguetes(2)),
  propuesta('Un juguete con mando a distancia y salir a cenar.', juguetes(3)),
  pregunta('¿Qué te gustaría que tu pareja te hiciera mientras no puedes moverte?', juguetes(3)),
  propuesta('Una noche con los ojos vendados de principio a fin.', juguetes(3)),

  // ---------- Morbo ----------
  pregunta('¿Qué es lo que más morbo te da del sexo?', morbo(1)),
  pregunta('¿Has visto porno que te haya dado ideas para nosotros? ¿Cuál?', morbo(1)),
  prefieres('Que te digan guarradas al oído', 'Que te lo hagan en silencio', morbo(1)),
  pregunta('¿Qué lugar te parece el más excitante para hacerlo, aunque nunca te atrevieras?', morbo(2)),
  propuesta('Hacerlo delante de un espejo para mirarnos.', morbo(2)),
  propuesta('Hacerlo en un sitio de la casa en el que nunca lo hemos hecho.', morbo(2)),
  pregunta('¿Qué guarrada te gustaría oírme decir en la cama?', morbo(2)),
  completa('Mi fantasía más recurrente cuando estoy solo/a es…', morbo(2)),
  pregunta('¿Dominar o que te dominen? ¿Hasta dónde llegarías?', morbo(2)),
  pregunta('¿Dónde es el sitio más arriesgado en el que te gustaría hacerlo con tu pareja?', morbo(3)),
  pregunta('¿Qué fantasía tienes que crees que escandalizaría a tu pareja?', morbo(3)),
  propuesta('Hacerlo en el coche.', morbo(3)),
  propuesta('Una noche de hotel solo para eso: sin cenar fuera ni hacer turismo.', morbo(3)),
  pregunta('¿Qué te gustaría hacerme que te da vergüenza decir en voz alta? Dilo igual.', morbo(3)),

  // ---------- Pasado ----------
  yoNunca('Yo nunca lo he hecho fuera de una cama.', pasado(1)),
  pregunta('¿Cuál es el sitio más raro donde lo has hecho?', pasado(1)),
  yoNunca('Yo nunca me he masturbado pensando en ti.', pasado(1)),
  pregunta('¿Qué es lo más atrevido que has hecho en la cama?', pasado(2)),
  yoNunca('Yo nunca he mandado una foto desnudo/a.', pasado(2)),
  yoNunca('Yo nunca he fingido un orgasmo.', pasado(2)),
  yoNunca('Yo nunca he hecho un trío.', pasado(2)),
  pregunta('¿Cuántas veces es lo máximo que lo has hecho en un día?', pasado(2)),
  pregunta('¿Cuál ha sido nuestra mejor noche y qué hicimos exactamente?', pasado(3)),
  pregunta('¿Qué te gustaría pedirme en la cama y nunca te has atrevido?', pasado(3)),
  pregunta('¿Qué has hecho alguna vez en la cama que te encantaría repetir con tu pareja?', pasado(3)),

  // ---------- Retos de fuego ----------
  reto('Quítale una prenda a tu pareja con los dientes.', fuego(1)),
  retoConTiempo('Siéntate encima de tu pareja, de frente, y besaos sin usar las manos.', 30, fuego(1)),
  reto('Dile al oído a tu pareja, con todo detalle, lo primero que le harías al llegar a la cama.', fuego(1)),
  reto('Quedaos los dos en ropa interior hasta el final de la partida.', fuego(2)),
  retoConTiempo('Masaje con aceite donde tu pareja elija.', 60, fuego(2)),
  retoConTiempo('Besa a tu pareja por el cuerpo, de la boca hacia abajo, hasta que suene la alarma.', 30, fuego(2)),
  reto('Venda los ojos a tu pareja y tócale por encima de la ropa: tiene que decirte dónde quiere más.', fuego(2)),
  retoConTiempo('Tu pareja te toca donde quiera y tú no puedes tocarle hasta que suene la alarma.', 60, fuego(2)),
  reto('Quítate todo lo que te quede puesto, despacio, mientras tu pareja mira.', fuego(3)),
  reto('Bájale la ropa interior a tu pareja con los dientes.', fuego(3)),
  retoConTiempo('Elegid una postura y quedaos en ella, vestidos, hasta que suene la alarma.', 30, fuego(3)),
  propuesta('Sexo oral sin prisas: lo da quien ha sacado la carta.', fuego(3)),
  retoConTiempo('Haz lo que tu pareja te pida al oído, si los dos estáis de acuerdo.', 60, fuego(3)),

];

export const INFIERNO: Tarjeta[] = [...ORIGINAL, ...AMPLIACION_INFIERNO];
