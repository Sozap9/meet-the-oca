import { StyleSheet, Text, View } from 'react-native';
import { FUENTES, TINTA } from '../diseno';
import type { EstadoJuego } from '../engine/juego';
import { useTema } from '../temas';
import { BotonDuro } from './Ui';

// Una línea del historial de turnos
export interface LineaHistorial {
  id: string;
  jugador: number;
  texto: string;
}

type Props = {
  estado: EstadoJuego;
  pases: number[];
  tirando: boolean;
  bloqueado: boolean;
  accion?: { texto: string; onPress: () => void };
  historial?: LineaHistorial[];
  onTirar: () => void;
  onReiniciar: () => void;
  onHistorial: () => void;
  // A quién se muestra en el panel. Mientras se resuelve la casilla de una tirada, sigue siendo
  // el turno de quien ha tirado, aunque el juego ya haya pasado el turno a la otra persona
  turnoVisible?: number;
};

export function PanelTurno({
  estado,
  pases,
  tirando,
  bloqueado,
  accion,
  historial = [],
  onTirar,
  onReiniciar,
  onHistorial,
  turnoVisible,
}: Props) {
  const tema = useTema();
  const ganador = estado.ganador !== null ? estado.jugadores[estado.ganador] : null;
  const turno = turnoVisible ?? estado.turno;
  const jugador = estado.jugadores[turno];
  const disponibles = pases[turno] ?? 0;
  const inactivo = tirando || bloqueado;

  return (
    <View style={styles.panel}>
      {/* 1 y 2: de quién es el turno y cuántos pases tiene */}
      <View style={styles.cabecera}>
        <View style={styles.turno}>
          <View style={[styles.punto, { backgroundColor: (ganador ?? jugador).color }]} />
          <Text style={styles.turnoTexto}>
            {ganador ? `¡Gana ${ganador.nombre}!` : `Turno de ${jugador.nombre}`}
          </Text>
        </View>
        {!ganador ? (
          <View style={[styles.chip, { backgroundColor: tema.papel }]}>
            <Text style={styles.chipTexto}>
              {disponibles} {disponibles === 1 ? 'pase' : 'pases'}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Acción opcional (la cuerda) */}
      {accion && !ganador ? (
        <BotonDuro texto={accion.texto} onPress={accion.onPress} desactivado={inactivo} style={styles.ancho} />
      ) : null}

      {/* 3: tirar dado */}
      {ganador ? (
        <BotonDuro grande texto="Jugar otra vez" color={tema.oca} onPress={onReiniciar} style={styles.ancho} />
      ) : (
        <BotonDuro
          grande
          icono="dado"
          texto={tirando ? 'Tirando…' : 'Tirar dado'}
          color={tema.oca}
          onPress={onTirar}
          desactivado={inactivo}
          style={styles.ancho}
        />
      )}

      {/* 4: el último movimiento y el botón que abre el historial completo */}
      <View style={styles.historial}>
        <View style={styles.linea}>
          {historial[0] ? (
            <View
              style={[styles.lineaPunto, { backgroundColor: estado.jugadores[historial[0].jugador].color }]}
            />
          ) : null}
          <Text style={styles.lineaTexto} numberOfLines={2}>
            {historial[0]?.texto ?? 'Aquí irán los movimientos de los dos.'}
          </Text>
        </View>
        <BotonDuro
          pequeno
          icono="lista"
          texto="Historial"
          color={tema.duo}
          onPress={onHistorial}
          desactivado={historial.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { width: '100%', paddingHorizontal: 14, paddingTop: 10, gap: 10 },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  turno: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  punto: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: TINTA },
  turnoTexto: { fontFamily: FUENTES.titulo, fontSize: 19, color: TINTA, textTransform: 'uppercase' },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: TINTA,
  },
  chipTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 12, color: TINTA },
  ancho: { width: '100%' },
  historial: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  linea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineaPunto: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: TINTA },
  lineaTexto: { flex: 1, fontFamily: FUENTES.textoSemi, fontSize: 13, lineHeight: 17, color: TINTA },
});
