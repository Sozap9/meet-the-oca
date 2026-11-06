export type Modo = 'basico' | 'personal' | 'caliente' | 'infierno' | 'aleatorio' | 'dado' | 'cartas';

export const MODOS: {
  id: Modo;
  nombre: string;
  descripcion: string;
  oculto?: boolean; // no sale en la lista: se elige desde otro modo (Infierno, desde Caliente)
}[] = [
  { id: 'basico', nombre: 'Básico', descripcion: 'Gustos y curiosidades para empezar' },
  { id: 'personal', nombre: 'Personal', descripcion: 'Infancia, sueños, amistades y cómo eres' },
  { id: 'caliente', nombre: 'Caliente', descripcion: 'Deseos, fantasías y retos picantes' },
  { id: 'infierno', nombre: 'Infierno', descripcion: 'Como Caliente, pero explícito y sin filtros', oculto: true },
  { id: 'aleatorio', nombre: 'Aleatorio', descripcion: 'Elegid mazos y casillas, o dejadlo todo al azar' },
  { id: 'dado', nombre: 'Dado de temas', descripcion: 'Un dado elige el tema y salta la pregunta' },
  { id: 'cartas', nombre: 'Cartas', descripcion: 'Preguntas por rondas, con cartas en la mano' },
];