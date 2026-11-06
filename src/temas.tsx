import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Modo } from './data/modos';
import { PALETAS, TINTA } from './diseno';
import type { Paleta } from './diseno';

export interface Tema {
  // ---- Colores del estilo serigrafía (ver diseno.ts) ----
  suelo: string; // fondo del tablero y cabeceras
  pagina: string; // fondo de las pantallas
  papel: string; // banda del recorrido, tarjetas y botones secundarios
  tinta: string; // contornos y texto
  oca: string; // ocas, meta y botón principal
  juego: string; // verdad o reto y dados
  duo: string; // espejo, pregunta libre y cambio
  freno: string; // posada, pozo y cárcel
  retro: string; // laberinto y calavera

  // ---- Nombres anteriores, que siguen usando las pantallas aún sin rediseñar ----
  fondo: string; // fondo de la pantalla de partida
  fondoTablero: string; // lo que se ve entre los anillos de la pista
  pista: string; // la cinta que une las casillas
  casilla: string; // casilla normal
  casillaAlterna: string; // casilla normal par
  numero: string; // número de las casillas normales
  centro: string; // hueco de la imagen central
  centroBorde: string;
  centroTexto: string;
  acento: string; // botones principales
  acentoTexto: string;
  texto: string; // textos de la pantalla
  textoSuave: string;
  tarjeta: string; // fondo de las tarjetas y ventanas
  cabecera: string; // banda superior de la tarjeta
  cabeceraTexto: string;
  opcionActiva: string; // fondo de la opción elegida
  borde: string; // bordes
}

const TEXTO_SUAVE = '#4A4740';

// Cada tema sale de la paleta de su modo, así todo cambia a la vez al tocar diseno.ts
function temaDesdePaleta(p: Paleta): Tema {
  return {
    suelo: p.suelo,
    pagina: p.pagina,
    papel: p.papel,
    tinta: TINTA,
    oca: p.oca,
    juego: p.juego,
    duo: p.duo,
    freno: p.freno,
    retro: p.retro,

    fondo: p.pagina,
    fondoTablero: p.suelo,
    pista: p.papel,
    casilla: p.papel,
    casillaAlterna: p.papel,
    numero: TINTA,
    centro: p.suelo,
    centroBorde: TINTA,
    centroTexto: p.papel,
    acento: p.oca,
    acentoTexto: TINTA,
    texto: TINTA,
    textoSuave: TEXTO_SUAVE,
    tarjeta: p.papel,
    cabecera: p.suelo,
    cabeceraTexto: p.papel,
    opcionActiva: p.oca,
    borde: TINTA,
  };
}

export const TEMAS: Record<Modo, Tema> = {
  basico: temaDesdePaleta(PALETAS.basico),
  personal: temaDesdePaleta(PALETAS.personal),
  caliente: temaDesdePaleta(PALETAS.caliente),
  infierno: temaDesdePaleta(PALETAS.infierno),
  aleatorio: temaDesdePaleta(PALETAS.aleatorio),
  dado: temaDesdePaleta(PALETAS.dado),
  cartas: temaDesdePaleta(PALETAS.cartas),
};

const TemaContext = createContext<Tema>(TEMAS.basico);

// "cambios" permite retocar algún color de un tema (por ejemplo, la cabecera de una tarjeta)
export function TemaProvider({
  modo,
  cambios,
  children,
}: {
  modo: Modo;
  cambios?: Partial<Tema>;
  children: ReactNode;
}) {
  return (
    <TemaContext.Provider value={{ ...TEMAS[modo], ...cambios }}>{children}</TemaContext.Provider>
  );
}

export function useTema(): Tema {
  return useContext(TemaContext);
}