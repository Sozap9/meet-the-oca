import type { Jugador } from '../engine/juego';
import { BotonModal, CabeceraModal, Caja, TextoModal } from './Capa';

type Props = {
  jugador: number; // quien ha caído en el pozo
  resultado: 'atrapado' | 'condena' | 'rescate';
  liberado: number | null; // a quien rescata, si cae justo donde había alguien
  jugadores: Jugador[];
  onTerminar: () => void;
};

export function EscenaPozoAviso({ jugador, resultado, liberado, jugadores, onTerminar }: Props) {
  const nombre = jugadores[jugador].nombre;
  const otro = jugadores[(jugador + 1) % jugadores.length].nombre;

  let texto: string;
  if (resultado === 'rescate' && liberado !== null) {
    texto = `${nombre} ha caído justo en el pozo y rescata a ${jugadores[liberado].nombre}.`;
  } else if (resultado === 'condena') {
    texto = `${nombre} ha caído en el pozo y ${otro} ya va por delante, así que se queda dentro tres turnos. Cada vez que se salte su turno, ${otro} le hará una pregunta desde arriba, y podrá lanzarle la cuerda para sacarle antes.`;
  } else {
    texto = `${nombre} ha caído en el pozo y no saldrá hasta que ${otro} lo pase. Mientras tanto, ${otro} le hará una pregunta desde arriba cada vez que se salte su turno, y podrá lanzarle la cuerda para sacarle antes.`;
  }

  return (
    <Caja>
      <CabeceraModal
        sangrado
        titulo={resultado === 'rescate' ? '¡Rescate!' : '¡Al pozo!'}
        chip="pozo."
        dibujo="pozo"
      />
      <TextoModal>{texto}</TextoModal>
      <BotonModal principal texto="Entendido" onPress={onTerminar} />
    </Caja>
  );
}
