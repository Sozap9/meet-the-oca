import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { ajustesActuales, alCambiarAjustes } from './ajustesBase';

// Efectos de sonido y música de fondo. Todo respeta los ajustes (volumen, silencio, música).
// Si algo falla al sonar, el juego sigue sin sonido.

// Sonidos reales del pack "Casino Audio" de Kenney (licencia CC0). Varios tienen variantes
// y se elige una al azar para que no suenen siempre igual.
// Cada modo suena a lo suyo: el tablero a fichas y dado, el Dado de temas a dados y Cartas a baraja.
const EFECTOS = {
  dado: [
    require('./assets/sonidos/dado-1.m4a'),
    require('./assets/sonidos/dado-2.m4a'),
    require('./assets/sonidos/dado-3.m4a'),
    require('./assets/sonidos/dado-4.m4a'),
  ],
  paso: [
    require('./assets/sonidos/paso-1.m4a'),
    require('./assets/sonidos/paso-2.m4a'),
    require('./assets/sonidos/paso-3.m4a'),
  ],
  especial: [require('./assets/sonidos/especial-1.m4a'), require('./assets/sonidos/especial-2.m4a')],
  oca: [require('./assets/sonidos/oca-1.m4a'), require('./assets/sonidos/oca-2.m4a')],
  carta: [
    require('./assets/sonidos/carta-1.m4a'),
    require('./assets/sonidos/carta-2.m4a'),
    require('./assets/sonidos/carta-3.m4a'),
  ],
  pase: [require('./assets/sonidos/pase-1.m4a'), require('./assets/sonidos/pase-2.m4a')],
  tic: [require('./assets/sonidos/tic.m4a')],
  timbre: [require('./assets/sonidos/timbre.m4a')],
  victoria: [require('./assets/sonidos/victoria.m4a')],
  clic: [require('./assets/sonidos/clic.m4a')],
  barajar: [require('./assets/sonidos/barajar.m4a')], // empezar en el modo Cartas
  // Fichas que se colocan en el tablero (empezar o reiniciar una partida de tablero)
  fichas: [require('./assets/sonidos/fichas-1.m4a'), require('./assets/sonidos/fichas-2.m4a')],
  // Coger los dados (empezar o reiniciar el Dado de temas)
  cogerDados: [require('./assets/sonidos/coger-dados-1.m4a'), require('./assets/sonidos/coger-dados-2.m4a')],
  // Robar una carta del mazo (modo Cartas)
  robar: [require('./assets/sonidos/robar-1.m4a'), require('./assets/sonidos/robar-2.m4a')],
  // Gastar o ganar un pase: una ficha que se deja en la mesa
  ficha: [require('./assets/sonidos/ficha-pase-1.m4a'), require('./assets/sonidos/ficha-pase-2.m4a')],
};

const MUSICAS = {
  basico: require('./assets/sonidos/musica-basico.m4a'),
  personal: require('./assets/sonidos/musica-personal.m4a'),
  caliente: require('./assets/sonidos/musica-caliente.m4a'),
};

export type NombreEfecto = keyof typeof EFECTOS;
export type Ambiente = keyof typeof MUSICAS;

let preparado = false;
function preparar() {
  if (preparado) return;
  preparado = true;
  // Se mezcla con la música que tengas puesta y respeta el botón de silencio del iPhone
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
}

const reproductores = new Map<number, AudioPlayer>(); // uno por archivo

export function sonar(nombre: NombreEfecto) {
  const a = ajustesActuales();
  if (a.silencio || a.efectos <= 0) return;
  if (nombre === 'clic' && !a.sonidoBotones) return;
  try {
    preparar();
    const variantes: number[] = EFECTOS[nombre];
    const fuente = variantes[Math.floor(Math.random() * variantes.length)];
    let r = reproductores.get(fuente);
    if (!r) {
      r = createAudioPlayer(fuente);
      reproductores.set(fuente, r);
    }
    r.volume = a.efectos / 100;
    r.seekTo(0).catch(() => {});
    r.play();
  } catch {
    // sin sonido
  }
}

// ---------- Música ----------

let musica: { ambiente: Ambiente; reproductor: AudioPlayer } | null = null;
let deseada: Ambiente | null = null;

function aplicarMusica() {
  const a = ajustesActuales();
  const debeSonar = deseada !== null && a.musica && !a.silencio && a.volumenMusica > 0;
  try {
    if (!debeSonar) {
      musica?.reproductor.pause();
      return;
    }
    preparar();
    if (!musica || musica.ambiente !== deseada) {
      musica?.reproductor.remove();
      const reproductor = createAudioPlayer(MUSICAS[deseada as Ambiente]);
      reproductor.loop = true;
      musica = { ambiente: deseada as Ambiente, reproductor };
    }
    musica.reproductor.volume = (a.volumenMusica / 100) * 0.6;
    musica.reproductor.play();
  } catch {
    // sin música
  }
}

// Cada partida pide su ambiente al empezar y lo suelta al salir
export function ponerMusica(ambiente: Ambiente | null) {
  deseada = ambiente;
  aplicarMusica();
}

// Si cambian los ajustes (volumen, música sí o no), la música se ajusta sola
alCambiarAjustes(() => aplicarMusica());

