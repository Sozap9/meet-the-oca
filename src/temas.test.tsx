import { MODOS } from './data/modos';
import { TEMAS } from './temas';

describe('temas', () => {
  it('hay un tema por cada modo', () => {
    expect(Object.keys(TEMAS).sort()).toEqual(MODOS.map((m) => m.id).sort());
  });

  it('todos los colores son hexadecimales válidos', () => {
    for (const tema of Object.values(TEMAS)) {
      for (const color of Object.values(tema)) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});