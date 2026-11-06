export type TipoRonda = 'adivinar' | 'semaforo' | 'debate';

export interface OpcionRonda {
  id: string;
  etiqueta: string;
  detalle?: string; // texto pequeño bajo la etiqueta
  color?: string;
}

export const OPCIONES_SEMAFORO: OpcionRonda[] = [
  { id: 'verde', etiqueta: 'Verde', detalle: 'me apetece', color: '#3BB273' },
  { id: 'amarillo', etiqueta: 'Ámbar', detalle: 'hablémoslo', color: '#F7D23E' },
  { id: 'rojo', etiqueta: 'Rojo', detalle: 'hoy no', color: '#E2452B' },
];

export const OPCIONES_DEBATE: OpcionRonda[] = [
  { id: 'acuerdo', etiqueta: 'A favor', detalle: 'de acuerdo' },
  { id: 'depende', etiqueta: 'Depende', detalle: 'tiene matices' },
  { id: 'desacuerdo', etiqueta: 'En contra', detalle: 'no lo veo' },
];

export interface Resultado {
  mensaje: string;
  acierto?: boolean; // solo en "adivinar"
}

// Qué se cuenta cuando las dos personas han respondido
export function resolverRonda(tipo: TipoRonda, primera: string, segunda: string): Resultado {
  switch (tipo) {
    case 'semaforo':
      if (primera === 'rojo' || segunda === 'rojo') {
        return { mensaje: 'Hay un rojo: se respeta, y pasáis a otra cosa.' };
      }
      if (primera === 'verde' && segunda === 'verde') {
        return { mensaje: '¡Los dos en verde! Hablad de cómo y cuándo.' };
      }
      return { mensaje: 'Hay ámbar: contad qué os hace dudar.' };
    case 'debate':
      return primera === segunda
        ? { mensaje: 'Pensáis parecido. ¿Por qué?' }
        : { mensaje: 'Opináis distinto: debatidlo un minuto.' };
    case 'adivinar':
      return primera === segunda
        ? { mensaje: '¡Acierto! Qué bien os conocéis.', acierto: true }
        : { mensaje: 'No era esa. ¿Os sorprende?', acierto: false };
  }
}
// Dos verdades y una mentira: ¿ha encontrado la otra persona la frase falsa?
export function resolverMentira(mentira: number, elegida: number): Resultado {
  return mentira === elegida
    ? { mensaje: '¡La has pillado!', acierto: true }
    : { mensaje: 'Te ha colado la mentira.', acierto: false };
}
