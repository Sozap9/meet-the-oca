import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  MAZOS_DE_FABRICA,
  alternar,
  añadirPropia,
  borrarPropia,
  editarDeFabrica,
  editarPropia,
  fijarMazos,
  normalizarMazos,
  restablecerMazo,
} from './data/mazosPersonales';
import type { IdMazo, MazosPersonales, TarjetaPropia } from './data/mazosPersonales';
import { alCambiarVistas, fijarVistas, vistasActuales } from './data/vistas';

const CLAVE = 'meet-the-oca/mazos';
const CLAVE_VISTAS = 'meet-the-oca/vistas'; // tarjetas que han salido hace poco

type Valor = {
  mazos: MazosPersonales;
  activar: (id: string, activa: boolean) => void;
  añadir: (datos: Omit<TarjetaPropia, 'id'>) => void;
  borrar: (id: string) => void;
  editarPropia: (id: string, datos: Omit<TarjetaPropia, 'id' | 'mazo'>) => void;
  editarDeFabrica: (id: string, texto: string, original: string) => void;
  restablecer: (mazo: IdMazo) => void;
};

const Contexto = createContext<Valor>({
  mazos: MAZOS_DE_FABRICA,
  activar: () => {},
  añadir: () => {},
  borrar: () => {},
  editarPropia: () => {},
  editarDeFabrica: () => {},
  restablecer: () => {},
});

// Guarda en el móvil los cambios de los mazos (tarjetas desactivadas y propias)
export function MazosProvider({ children }: { children: ReactNode }) {
  const [mazos, setMazos] = useState<MazosPersonales>(MAZOS_DE_FABRICA);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((texto) => {
        if (!texto) return;
        const leidos = normalizarMazos(JSON.parse(texto));
        setMazos(leidos);
        fijarMazos(leidos);
      })
      .catch(() => {});
  }, []);

  // Recuerda entre partidas qué tarjetas han salido, para no repetirlas pronto
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_VISTAS)
      .then((texto) => {
        if (texto) fijarVistas(JSON.parse(texto));
      })
      .catch(() => {});
    let espera: ReturnType<typeof setTimeout> | null = null;
    const quitar = alCambiarVistas(() => {
      if (espera) clearTimeout(espera);
      espera = setTimeout(() => {
        AsyncStorage.setItem(CLAVE_VISTAS, JSON.stringify(vistasActuales())).catch(() => {});
      }, 800);
    });
    return () => {
      quitar();
      if (espera) clearTimeout(espera);
    };
  }, []);

  const guardar = (cambio: (m: MazosPersonales) => MazosPersonales) => {
    setMazos((actual) => {
      const nuevos = cambio(actual);
      fijarMazos(nuevos);
      AsyncStorage.setItem(CLAVE, JSON.stringify(nuevos)).catch(() => {});
      return nuevos;
    });
  };

  return (
    <Contexto.Provider
      value={{
        mazos,
        activar: (id, activa) => guardar((m) => alternar(m, id, activa)),
        añadir: (datos) => guardar((m) => añadirPropia(m, datos)),
        borrar: (id) => guardar((m) => borrarPropia(m, id)),
        editarPropia: (id, datos) => guardar((m) => editarPropia(m, id, datos)),
        editarDeFabrica: (id, texto, original) => guardar((m) => editarDeFabrica(m, id, texto, original)),
        restablecer: (mazo) => guardar((m) => restablecerMazo(m, mazo)),
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useMazos() {
  return useContext(Contexto);
}
