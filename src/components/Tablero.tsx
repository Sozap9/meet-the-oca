import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { calcularBanda } from '../data/banda';
import type { Casilla } from '../data/board';
import type { Cuenta } from '../data/banda';
import { AREA_CENTRAL, COLUMNAS, FILAS } from '../data/espiral';
import type { Modo } from '../data/modos';
import { BORDE, FUENTES, PALETAS, TINTA, familiaDeCasilla } from '../diseno';
import type { Paleta } from '../diseno';
import type { Jugador } from '../engine/juego';
import type { Paso } from '../engine/recorrido';
import { DadoAnimado } from './Dado';
import type { TiradaEnCurso } from './Dado';
import { DURACION_PASO, DURACION_SALTO, FichaAnimada } from './FichaAnimada';
import { vibrar } from '../vibracion';
import { sonar } from '../sonido';
import { Grano } from './Grano';
import { DibujoCasilla } from './IconosCasilla';
import { FondoLlamas, Hoguera, Tridente } from './Infierno';

const RATIO_DADO = 1.8; // lado del dado respecto al hueco de una casilla
const ONDAS = 4.5; // cuánto se ensancha cada casilla (0 = banda recta)

// Altura que ocupan cabecera, panel de turno y márgenes
const ALTURA_RESERVADA = 330;

// Desplazamiento de cada ficha respecto al centro de la casilla, para que no se tapen
const DESPLAZAMIENTOS = [
  { x: -0.22, y: -0.22 },
  { x: 0.22, y: 0.22 },
  { x: 0.22, y: -0.22 },
  { x: -0.22, y: 0.22 },
];

// El recorrido que tiene que hacer una ficha tras una tirada
export interface AnimacionFicha {
  id: number;
  jugador: number;
  pasos: Paso[];
}

type Props = {
  modo: Modo;
  jugadores: Jugador[];
  tirada: TiradaEnCurso | null;
  onTiradaTerminada: () => void;
  animacion: AnimacionFicha | null;
  onAnimacionTerminada: () => void;
  turnoActivo: number | null; // a quién le toca jugar (late un aro en su ficha)
  aviso?: ReactNode; // cartel que se dibuja en el hueco central
  tablero?: Casilla[]; // el de esta partida (en el modo aleatorio cambia)
};

// ---------- Cabeza de la oca al final del recorrido, distinta en cada modo ----------
// Coordenadas del diseño original (hueco de 45,5 px); se escalan con "escala".

function CabezaMeta({ modo, paleta }: { modo: Modo; paleta: Paleta }) {
  const ojo = <Circle cx={191} cy={144} r={3.2} fill={TINTA} />;
  switch (modo) {
    case 'personal':
      // La oca curiosa: lupa en el ojo, ceja levantada e interrogantes
      return (
        <>
          <Path d="M197.5 152 L208 165" stroke={TINTA} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={190} cy={145} r={10} fill={paleta.papel} stroke={TINTA} strokeWidth={2} />
          <Circle cx={190} cy={145} r={5} fill="#FFFFFF" stroke={TINTA} strokeWidth={1.4} />
          <Circle cx={187.5} cy={145} r={2.6} fill={TINTA} />
          <Path d="M180 131 Q190 124 200 130" fill="none" stroke={TINTA} strokeWidth={2} strokeLinecap="round" />
          <SvgText x={146} y={118} fontSize={24} fontFamily={FUENTES.pixel} fill={paleta.papel}>
            ?
          </SvgText>
          <SvgText x={222} y={120} fontSize={14} fontFamily={FUENTES.pixel} fill={paleta.papel}>
            ?
          </SvgText>
        </>
      );
    case 'caliente':
    case 'infierno':
      // La oca demonio: cuernos, ojo entornado, ceja pícara y media sonrisa.
      // En Infierno, además, cruza el cuello con un tridente negro
      return (
        <>
          <Path d="M180 137 C176 129 173 121 176 110 C181 117 186 125 189 133 Z" fill="#FF4D5E" stroke={TINTA} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M197 133 C200 125 205 118 212 111 C213 120 210 129 205 137 Z" fill="#FF4D5E" stroke={TINTA} strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={191} cy={145} r={4.8} fill="#FFFFFF" stroke={TINTA} strokeWidth={1.4} />
          <Path d="M186.2 145 A4.8 4.8 0 0 1 195.8 145 Z" fill={TINTA} />
          <Circle cx={189} cy={147} r={1.7} fill={TINTA} />
          <Path d="M181 140 L199 134" stroke={TINTA} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M154 152 C161 155.5 168 156 175 153.5" fill="none" stroke={TINTA} strokeWidth={1.4} strokeLinecap="round" />
          {modo === 'infierno' ? <Tridente transform="translate(254 112) rotate(25) scale(0.72)" borde={paleta.papel} /> : null}
        </>
      );
    case 'aleatorio':
      // La oca adivina: turbante con joya y destellos de suerte
      return (
        <>
          {ojo}
          <Path d="M196 119 C199 109 205 104 213 101 C211 109 205 115 199 119 Z" fill={paleta.oca} stroke={TINTA} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M170 140 C170 122 186 115 196 117 C208 119 214 130 212 142 C200 136 182 136 170 140 Z" fill={paleta.juego} stroke={TINTA} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M176 133 C186 128 200 128 208 134" fill="none" stroke={TINTA} strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx={190} cy={124} r={3.6} fill={paleta.oca} stroke={TINTA} strokeWidth={1.2} />
          <Path d="M160 109 Q160 116 167 116 Q160 116 160 123 Q160 116 153 116 Q160 116 160 109 Z" fill={paleta.papel} />
          <Path d="M228 104 Q228 110 234 110 Q228 110 228 116 Q228 110 222 110 Q228 110 228 104 Z" fill={paleta.papel} />
          <Path d="M150 175 Q150 180 155 180 Q150 180 150 185 Q150 180 145 180 Q150 180 150 175 Z" fill={paleta.papel} />
        </>
      );
    default:
      return ojo;
  }
}

// ---------- Contenido de cada casilla: número, "?" y "!", o dibujo ----------

const TAM_ICONO = 24; // en el diseño original

function ContenidoCuenta({ cuenta, escala }: { cuenta: Cuenta; escala: number }) {
  const [cx, cy] = cuenta.centro;
  if (cuenta.tipo === 'normal') {
    return (
      <SvgText
        x={cx}
        y={cy + 5.5 * escala}
        fontSize={15 * escala}
        fontFamily={FUENTES.titulo}
        fill={TINTA}
        textAnchor="middle"
      >
        {String(cuenta.numero)}
      </SvgText>
    );
  }
  if (cuenta.tipo === 'puente' && cuenta.cuartos) {
    return (
      <>
        {(['?', '!'] as const).map((signo, i) => (
          <SvgText
            key={signo}
            x={cuenta.cuartos![i][0]}
            y={cuenta.cuartos![i][1] + 5.5 * escala}
            fontSize={16 * escala}
            fontFamily={FUENTES.titulo}
            fill={TINTA}
            textAnchor="middle"
          >
            {signo}
          </SvgText>
        ))}
      </>
    );
  }
  // Laberinto y calavera: la oca y, debajo, la casilla a la que mandan
  if (cuenta.tipo === 'laberinto' || cuenta.tipo === 'calavera') {
    const lado = 20 * escala;
    return (
      <>
        <G transform={`translate(${cx - lado / 2} ${cy - 15 * escala}) scale(${lado / 100})`}>
          <DibujoCasilla tipo={cuenta.tipo} idUnico={`tablero-${cuenta.numero}`} />
        </G>
        <SvgText
          x={cx}
          y={cy + 15 * escala}
          fontSize={13 * escala}
          fontFamily={FUENTES.titulo}
          fill={TINTA}
          textAnchor="middle"
        >
          {cuenta.tipo === 'laberinto' ? '30' : '1'}
        </SvgText>
      </>
    );
  }
  const lado = TAM_ICONO * escala;
  return (
    <G transform={`translate(${cx - lado / 2} ${cy - lado / 2}) scale(${lado / 100})`}>
      <DibujoCasilla tipo={cuenta.tipo} idUnico={`tablero-${cuenta.numero}`} />
    </G>
  );
}

// ---------- Tablero ----------

export function Tablero({
  modo,
  jugadores,
  tirada,
  onTiradaTerminada,
  animacion,
  onAnimacionTerminada,
  turnoActivo,
  aviso,
  tablero,
}: Props) {
  const paleta = PALETAS[modo];
  const { width, height } = useWindowDimensions();
  const porAncho = (width - 20) / COLUMNAS;
  const porAlto = (height - ALTURA_RESERVADA) / FILAS;
  const hueco = Math.floor(Math.min(porAncho, porAlto));
  const ancho = hueco * COLUMNAS;
  const alto = hueco * FILAS;

  const banda = useMemo(() => calcularBanda(hueco, ONDAS, true, tablero), [hueco, tablero]);
  const k = banda.escala;
  const tamFicha = 20 * k;
  const tamDado = hueco * RATIO_DADO;

  // Las cuentas de cada color se pintan juntas, en un solo trazado por familia
  const rellenos = useMemo(() => {
    const porFamilia: Record<string, string[]> = { oca: [], juego: [], duo: [], freno: [], retro: [] };
    for (const c of banda.cuentas) {
      if (c.tipo === 'salida' || c.tipo === 'normal') continue;
      if (c.mitades) {
        porFamilia.juego.push(c.mitades[0]);
        porFamilia.oca.push(c.mitades[1]);
        continue;
      }
      const familia = familiaDeCasilla(c.tipo);
      porFamilia[familia]?.push(c.contorno);
    }
    return porFamilia;
  }, [banda]);

  // Casilla en la que se está dibujando cada ficha, y cómo llegó hasta ella
  const [visuales, setVisuales] = useState(() => jugadores.map((j) => j.posicion));
  const [llegada, setLlegada] = useState<('paso' | 'salto')[]>(() => jugadores.map(() => 'paso'));
  const [rebotes, setRebotes] = useState<number[]>(() => jugadores.map(() => 0));
  const alTerminar = useRef(onAnimacionTerminada);
  alTerminar.current = onAnimacionTerminada;

  // Si algo mueve las fichas sin recorrido (reiniciar, retroceder, cambio...), saltan a su sitio
  useEffect(() => {
    if (animacion) return;
    if (jugadores.some((j, i) => j.posicion !== visuales[i])) {
      setLlegada(jugadores.map(() => 'salto'));
      setVisuales(jugadores.map((j) => j.posicion));
    }
  }, [jugadores, animacion, visuales]);

  // Recorre la ruta paso a paso y avisa cuando la ficha ha llegado
  useEffect(() => {
    if (!animacion) return;
    let cancelado = false;
    const temporizadores: ReturnType<typeof setTimeout>[] = [];
    let espera = 0;

    animacion.pasos.forEach((paso) => {
      temporizadores.push(
        setTimeout(() => {
          if (cancelado) return;
          setLlegada((l) => l.map((t, i) => (i === animacion.jugador ? paso.tipo : t)));
          sonar('paso');
          setVisuales((v) => v.map((p, i) => (i === animacion.jugador ? paso.posicion : p)));
        }, espera),
      );
      espera += paso.tipo === 'salto' ? DURACION_SALTO : DURACION_PASO;
    });
    // Al llegar a una casilla especial, la ficha bota y el móvil vibra un poco
    const final = animacion.pasos[animacion.pasos.length - 1]?.posicion;
    const tipoFinal = final !== undefined ? banda.cuentas[final]?.tipo : undefined;
    if (tipoFinal && tipoFinal !== 'normal' && tipoFinal !== 'salida') {
      temporizadores.push(
        setTimeout(() => {
          if (cancelado) return;
          setRebotes((r) => r.map((n, i) => (i === animacion.jugador ? n + 1 : n)));
          vibrar('especial');
          sonar(tipoFinal === 'oca' ? 'oca' : 'especial');
        }, espera),
      );
    }
    temporizadores.push(
      setTimeout(() => {
        if (!cancelado) alTerminar.current();
      }, espera + (tipoFinal && tipoFinal !== 'normal' && tipoFinal !== 'salida' ? 520 : 120)),
    );

    return () => {
      cancelado = true;
      temporizadores.forEach(clearTimeout);
    };
  }, [animacion?.id]);

  const tinta = TINTA;

  return (
    <View
      style={{
        width: ancho + BORDE * 2,
        height: alto + BORDE * 2,
        backgroundColor: paleta.suelo,
        borderWidth: BORDE,
        borderColor: tinta,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <Svg width={ancho} height={alto} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* Infierno: llamas apagadas por todo el suelo, debajo de la banda */}
        {modo === 'infierno' ? (
          <G transform={`scale(${k})`}>
            <FondoLlamas ancho={ancho / k} alto={alto / k} />
          </G>
        ) : null}
        {/* Contorno del cuello, debajo de la banda */}
        <Path d={banda.cuello} fill="none" stroke={tinta} strokeWidth={banda.anchoCuello + 4} strokeLinecap="round" strokeLinejoin="round" />
        {/* La banda de papel con las cuentas de color */}
        <Path d={banda.relleno} fill={paleta.papel} />
        <Path d={rellenos.oca.join(' ')} fill={paleta.oca} />
        <Path d={rellenos.juego.join(' ')} fill={paleta.juego} />
        <Path d={rellenos.duo.join(' ')} fill={paleta.duo} />
        <Path d={rellenos.freno.join(' ')} fill={paleta.freno} />
        <Path d={rellenos.retro.join(' ')} fill={paleta.retro} />
        <Path d={banda.divisores} fill="none" stroke={tinta} strokeWidth={1} strokeLinecap="round" />
        <Path d={banda.bordes} fill="none" stroke={tinta} strokeWidth={BORDE} strokeLinejoin="round" />
        {/* Relleno del cuello y pico */}
        <Path d={banda.cuello} fill="none" stroke={paleta.papel} strokeWidth={banda.anchoCuello} strokeLinecap="round" strokeLinejoin="round" />
        <G transform={`scale(${k})`}>
          <Path d="M176 140 C164 141 154 146 149 151 C155 156 165 160 176 161 Z" fill={paleta.oca} stroke={tinta} strokeWidth={2} strokeLinejoin="round" />
          <CabezaMeta modo={modo} paleta={paleta} />
          {/* Infierno: la hoguera en el hueco de abajo, a la izquierda del cuello */}
          {modo === 'infierno' ? <Hoguera x={160} y={358} /> : null}
        </G>
        {/* Números y dibujos */}
        {banda.cuentas.map((cuenta) => (
          <ContenidoCuenta key={cuenta.numero} cuenta={cuenta} escala={k} />
        ))}
      </Svg>

      {/* Grano de papel sobre el tablero (las fichas y el aviso van encima, limpios) */}
      <Grano />

      {/* Aviso de turno: en el hueco libre a la izquierda del cuello */}
      {aviso ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: AREA_CENTRAL.columna * hueco + 4,
            top: (AREA_CENTRAL.fila + 2) * hueco,
            width: 2.8 * hueco,
            height: 3.6 * hueco,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {aviso}
        </View>
      ) : null}

      {/* Fichas */}
      {jugadores.map((jugador, i) => {
        const desplazamiento = DESPLAZAMIENTOS[i % DESPLAZAMIENTOS.length];
        const [cx, cy] = banda.cuentas[visuales[i] ?? jugador.posicion].centro;
        return (
          <FichaAnimada
            key={jugador.id}
            color={jugador.color}
            size={tamFicha}
            x={cx - tamFicha / 2 + desplazamiento.x * hueco}
            y={cy - tamFicha / 2 + desplazamiento.y * hueco}
            tipo={llegada[i] ?? 'paso'}
            activa={turnoActivo === i}
            rebote={rebotes[i] ?? 0}
          />
        );
      })}

      {/* Dado: entra y gira sobre el hueco central */}
      {tirada ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: (AREA_CENTRAL.columna + AREA_CENTRAL.columnas / 2) * hueco - tamDado / 2,
            top: (AREA_CENTRAL.fila + AREA_CENTRAL.filas / 2) * hueco - tamDado / 2,
          }}
        >
          <DadoAnimado key={tirada.id} valor={tirada.valor} size={tamDado} onTerminar={onTiradaTerminada} />
        </View>
      ) : null}
    </View>
  );
}
