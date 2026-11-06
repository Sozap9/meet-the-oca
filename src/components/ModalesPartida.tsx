import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { sonar } from '../sonido';
import { INFO_TIPO } from '../data/tarjetas';
import { BORDE, FUENTES, TINTA } from '../diseno';
import type { Jugador } from '../engine/juego';
import { textoTarjeta } from '../engine/resumen';
import type { Resumen } from '../engine/resumen';
import { useTema } from '../temas';
import { AvisoPixel, BotonModal, CabeceraModal, Caja, TextoModal } from './Capa';
import type { LineaHistorial } from './PanelTurno';

type PropsMenu = {
  onReglas: () => void;
  onAjustes: () => void;
  onResumen: () => void;
  onReiniciar: () => void;
  onSalir: () => void;
  onCerrar: () => void;
};

export function MenuContenido({ onReglas, onAjustes, onResumen, onReiniciar, onSalir, onCerrar }: PropsMenu) {
  const tema = useTema();
  return (
    <Caja>
      <CabeceraModal sangrado titulo="Pausa" chip="partida en curso." dibujo="dormido" />
      <BotonModal principal texto="Seguir jugando" onPress={onCerrar} />
      <View style={styles.rejilla}>
        <View style={styles.celda}>
          <BotonModal texto="Reglas" onPress={onReglas} />
        </View>
        <View style={styles.celda}>
          <BotonModal texto="Respuestas" onPress={onResumen} />
        </View>
        <View style={styles.celda}>
          <BotonModal texto="Reiniciar" onPress={onReiniciar} />
        </View>
        <View style={styles.celda}>
          <BotonModal texto="Ajustes" onPress={onAjustes} />
        </View>
        <View style={styles.celda}>
          <BotonModal texto="Salir" color={tema.retro} onPress={onSalir} />
        </View>
      </View>
    </Caja>
  );
}

type PropsVictoria = {
  ganador: Jugador;
  onOtraVez: () => void;
  onResumen: () => void;
  onVerTablero: () => void;
  onSalir: () => void;
};

export function VictoriaContenido({
  ganador,
  onOtraVez,
  onResumen,
  onVerTablero,
  onSalir,
}: PropsVictoria) {
  useEffect(() => sonar('victoria'), []);
  return (
    <Caja>
      <CabeceraModal sangrado titulo={`¡Gana ${ganador.nombre}!`} chip="llegó al jardín." dibujo="jardin" />
      <View style={styles.fila}>
        <View style={[styles.punto, { backgroundColor: ganador.color }]} />
        <TextoModal>¡Enhorabuena a los dos!</TextoModal>
      </View>
      <BotonModal principal texto="Ver respuestas" onPress={onResumen} />
      <BotonModal texto="Jugar otra vez" onPress={onOtraVez} />
      <View style={styles.rejilla}>
        <View style={styles.celda}>
          <BotonModal texto="Ver tablero" onPress={onVerTablero} />
        </View>
        <View style={styles.celda}>
          <BotonModal texto="Elegir modo" onPress={onSalir} />
        </View>
      </View>
    </Caja>
  );
}

export function FinalContenido({ texto, onContinuar }: { texto: string; onContinuar: () => void }) {
  return (
    <Caja>
      <CabeceraModal sangrado titulo="Pregunta final" chip="para los dos." dibujo="feliz" />
      <TextoModal fuerte>{texto}</TextoModal>
      <BotonModal principal texto="Continuar" onPress={onContinuar} />
    </Caja>
  );
}

export function ResumenContenido({ resumen, onCerrar }: { resumen: Resumen; onCerrar: () => void }) {
  const tema = useTema();
  return (
    <Caja>
      <CabeceraModal sangrado titulo="Respuestas" chip="lo que habéis compartido." dibujo="normal" />

      <View style={styles.marcador}>
        {resumen.porJugador.map((jugador) => (
          <View key={jugador.nombre} style={styles.marcadorFila}>
            <View style={[styles.punto, { backgroundColor: jugador.color }]} />
            <Text style={styles.marcadorTexto}>
              {jugador.nombre}: {jugador.hechas} {jugador.hechas === 1 ? 'hecha' : 'hechas'} ·{' '}
              {jugador.pasadas} {jugador.pasadas === 1 ? 'pasada' : 'pasadas'}
            </Text>
          </View>
        ))}
        {resumen.sintonia ? (
          <AvisoPixel>{`sintonía: ${resumen.sintonia.aciertos} de ${resumen.sintonia.total}.`}</AvisoPixel>
        ) : null}
      </View>

      {resumen.hechas.length === 0 ? (
        <AvisoPixel>todavía no habéis completado ninguna tarjeta.</AvisoPixel>
      ) : (
        <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
          {resumen.hechas.map((entrada, i) => (
            <View key={i} style={[styles.item, { backgroundColor: tema.papel }]}>
              <Text style={styles.itemTipo}>{`${INFO_TIPO[entrada.tarjeta.tipo].etiqueta.toLowerCase()}.`}</Text>
              <Text style={styles.itemTexto}>{textoTarjeta(entrada.tarjeta)}</Text>
              {entrada.respuesta ? <Text style={styles.itemRespuesta}>{entrada.respuesta}</Text> : null}
              <View style={styles.fila}>
                <View
                  style={[styles.puntoPequeno, { backgroundColor: resumen.porJugador[entrada.jugador].color }]}
                />
                <Text style={styles.itemQuien}>{resumen.porJugador[entrada.jugador].nombre}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <BotonModal principal texto="Cerrar" onPress={onCerrar} />
    </Caja>
  );
}

// ---------- Confirmar salir o reiniciar ----------

export interface Confirmacion {
  titulo: string;
  texto: string;
  ok: string;
  alAceptar: () => void;
}

export function ConfirmarContenido({
  confirmacion,
  onCancelar,
}: {
  confirmacion: Confirmacion;
  onCancelar: () => void;
}) {
  const tema = useTema();
  return (
    <Caja>
      <CabeceraModal sangrado titulo={confirmacion.titulo} dibujo="preocupado" />
      <TextoModal>{confirmacion.texto}</TextoModal>
      <View style={styles.filaBotones}>
        <View style={styles.flex}>
          <BotonModal texto="Cancelar" onPress={onCancelar} />
        </View>
        <View style={styles.flex}>
          <BotonModal texto={confirmacion.ok} color={tema.retro} onPress={confirmacion.alAceptar} />
        </View>
      </View>
    </Caja>
  );
}

// ---------- Historial de turnos completo ----------

export function HistorialContenido({
  lineas,
  jugadores,
  onCerrar,
}: {
  lineas: LineaHistorial[]; // lo más nuevo primero
  jugadores: Jugador[];
  onCerrar: () => void;
}) {
  const tema = useTema();
  return (
    <Caja>
      <CabeceraModal sangrado titulo="Historial" chip="turno a turno." dibujo="normal" />
      {lineas.length === 0 ? (
        <AvisoPixel>todavía no ha pasado nada.</AvisoPixel>
      ) : (
        <ScrollView style={styles.listaHistorial} contentContainerStyle={styles.listaContenido}>
          {lineas.map((linea, i) => (
            <View
              key={linea.id}
              style={[
                styles.paso,
                { backgroundColor: i === 0 ? tema.duo : tema.papel },
              ]}
            >
              <View style={[styles.punto, { backgroundColor: jugadores[linea.jugador].color }]} />
              <Text style={styles.pasoTexto}>{linea.texto}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <BotonModal principal texto="Volver a la partida" onPress={onCerrar} />
    </Caja>
  );
}

const styles = StyleSheet.create({
  listaHistorial: { maxHeight: 360, width: '100%' },
  flex: { flex: 1 },
  filaBotones: { width: '100%', flexDirection: 'row', gap: 12 },
  paso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  pasoTexto: { flex: 1, fontFamily: FUENTES.textoSemi, fontSize: 14, lineHeight: 19, color: TINTA },
  rejilla: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  celda: { width: '47%', flexGrow: 1 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  punto: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: TINTA },
  puntoPequeno: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: TINTA },
  marcador: { width: '100%', gap: 6 },
  marcadorFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marcadorTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 14, color: TINTA },
  lista: { maxHeight: 280, width: '100%' },
  listaContenido: { gap: 10 },
  item: {
    borderWidth: BORDE,
    borderColor: TINTA,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  itemTipo: { fontFamily: FUENTES.pixel, fontSize: 9, color: TINTA },
  itemTexto: { fontFamily: FUENTES.textoFuerte, fontSize: 14, lineHeight: 19, color: TINTA },
  itemRespuesta: { fontFamily: FUENTES.textoSemi, fontSize: 14, lineHeight: 19, color: TINTA },
  itemQuien: { fontFamily: FUENTES.textoSemi, fontSize: 12, color: TINTA },
});
