import type { EstadoJuego, Evento } from './juego';

export function describirEvento(estado: EstadoJuego, evento: Evento): string {
  const nombre = (id: number) => estado.jugadores[id].nombre;

  switch (evento.tipo) {
    case 'mueve':
      return evento.rebota
        ? `${nombre(evento.jugador)} se pasa del 63 y rebota hasta la ${evento.hasta}`
        : `${nombre(evento.jugador)} avanza ${evento.valor} y llega a la ${evento.hasta}`;
    case 'salto':
      return evento.casilla === 'laberinto'
        ? `${nombre(evento.jugador)} se pierde en el laberinto y vuelve a la ${evento.hasta}`
        : `¡Calavera! ${nombre(evento.jugador)} vuelve a la ${evento.hasta}`;
    case 'oca':
      return `¡Oca! ${nombre(evento.jugador)} contesta una pregunta ligera`;
    case 'verdadReto':
      return `${nombre(evento.jugador)} cae en Verdad o reto`;
    case 'dados':
      return `${nombre(evento.jugador)} cae en los dados: duelo o apuesta`;
    case 'espejo':
      return `${nombre(evento.jugador)} cae en el espejo: los dos responden sin mirar`;
    case 'libre':
      return `${nombre(evento.jugador)} cae en pregunta libre: la otra persona pregunta lo que quiera`;
    case 'cambio':
      return `${nombre(evento.jugador)} cae en el cambio: cambiar de sitio o responder`;
    case 'intercambio':
      return `${nombre(evento.jugador)} cambia su sitio con ${nombre(evento.con)} y pasa a la ${evento.hasta}`;
    case 'tiraOtraVez':
      return `${nombre(evento.jugador)} vuelve a tirar`;
    case 'pierdeTurnos':
      return evento.casilla === 'posada'
        ? `${nombre(evento.jugador)} cae en la posada: perder un turno, o pagarla con una pregunta`
        : `${nombre(evento.jugador)} cae en la cárcel: cumplir ${evento.turnos} turnos, o pagar la fianza`;
    case 'pagaPenalizacion':
      return evento.casilla === 'posada'
        ? `${nombre(evento.jugador)} paga la posada y no pierde el turno`
        : `${nombre(evento.jugador)} paga la fianza y sale de la cárcel`;
    case 'pozo':
      if (evento.resultado === 'rescate' && evento.liberado !== null) {
        return `${nombre(evento.jugador)} cae en el pozo y rescata a ${nombre(evento.liberado)}`;
      }
      return evento.resultado === 'condena'
        ? `${nombre(evento.jugador)} cae en el pozo y, como la otra persona va por delante, se queda tres turnos dentro`
        : `${nombre(evento.jugador)} cae en el pozo y queda atrapado/a hasta que le pasen`;
    case 'salePozo':
      return `${nombre(evento.jugador)} sale del pozo: ${nombre(evento.por)} ya ha pasado de largo`;
    case 'cuerda':
      return `${nombre(evento.por)} lanza la cuerda y rescata a ${nombre(evento.jugador)}`;
    case 'retrocede':
      return `${nombre(evento.jugador)} retrocede hasta la ${evento.hasta}`;
    case 'saltaTurno':
      return evento.motivo === 'pozo'
        ? `${nombre(evento.jugador)} sigue en el pozo`
        : `${nombre(evento.jugador)} pierde este turno`;
    case 'gana':
      return `¡${nombre(evento.jugador)} llega al jardín y gana la partida!`;
  }
}

export function describirEventos(estado: EstadoJuego): string[] {
  return estado.eventos.map((evento) => describirEvento(estado, evento));
}

// Una línea corta para el historial de turnos: qué sacó y qué le pasó
export function resumirTurno(
  estado: EstadoJuego,
  jugador: number,
  valor: number,
  eventos: Evento[],
): string {
  const nombre = (id: number) => estado.jugadores[id].nombre;
  const partes: string[] = [];

  for (const e of eventos) {
    switch (e.tipo) {
      case 'mueve':
        partes.push(
          e.rebota ? `saca ${valor}, rebota a la ${e.hasta}` : `saca ${valor} → casilla ${e.hasta}`,
        );
        break;
      case 'salto':
        partes.push(
          e.casilla === 'laberinto'
            ? `laberinto, vuelve a la ${e.hasta}`
            : `calavera, vuelve a la ${e.hasta}`,
        );
        break;
      case 'oca':
        partes.push('oca');
        break;
      case 'tiraOtraVez':
        partes.push('vuelve a tirar');
        break;
      case 'verdadReto':
        partes.push('verdad o reto');
        break;
      case 'dados':
        partes.push('dados');
        break;
      case 'espejo':
        partes.push('espejo');
        break;
      case 'libre':
        partes.push('pregunta libre');
        break;
      case 'cambio':
        partes.push('cambio');
        break;
      case 'intercambio':
        partes.push(`cambia de sitio con ${nombre(e.con)}`);
        break;
      case 'pierdeTurnos':
        partes.push(e.casilla === 'posada' ? 'posada' : 'cárcel');
        break;
      case 'pagaPenalizacion':
        partes.push(e.casilla === 'posada' ? 'paga la posada' : 'paga la fianza');
        break;
      case 'pozo':
        if (e.resultado === 'rescate' && e.liberado !== null) {
          partes.push(`pozo, rescata a ${nombre(e.liberado)}`);
        } else {
          partes.push(e.resultado === 'condena' ? 'pozo, 3 turnos' : 'pozo, atrapado/a');
        }
        break;
      case 'salePozo':
        partes.push(`${nombre(e.jugador)} sale del pozo`);
        break;
      case 'cuerda':
        partes.push(`${nombre(e.por)} lanza la cuerda a ${nombre(e.jugador)}`);
        break;
      case 'retrocede':
        partes.push(`${nombre(e.jugador)} retrocede a la ${e.hasta}`);
        break;
      case 'saltaTurno':
        partes.push(
          e.motivo === 'pozo' ? `${nombre(e.jugador)} sigue en el pozo` : `${nombre(e.jugador)} pierde el turno`,
        );
        break;
      case 'gana':
        partes.push('¡gana!');
        break;
    }
  }

  return `${nombre(jugador)}: ${partes.join(' · ')}`;
}

// Línea del historial cuando alguien gasta un pase
export function describirPase(
  estado: EstadoJuego,
  jugador: number,
  quedan: number,
  gastados: number,
): string {
  const nombre = estado.jugadores[jugador].nombre;
  const resto =
    quedan === 0 ? 'ya no le quedan' : quedan === 1 ? 'le queda 1' : `le quedan ${quedan}`;
  return `${nombre} gasta un pase · ${resto} (gastados: ${gastados})`;
}