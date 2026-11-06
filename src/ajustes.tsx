import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { AJUSTES_DE_FABRICA, fijarAjustes, normalizarAjustes } from './ajustesBase';
import type { Ajustes } from './ajustesBase';

export type { Ajustes } from './ajustesBase';

const CLAVE = 'meet-the-oca/ajustes';

type Valor = {
  ajustes: Ajustes;
  cambiar: (cambio: Partial<Ajustes>) => void;
  restablecer: () => void;
};

const Contexto = createContext<Valor>({
  ajustes: AJUSTES_DE_FABRICA,
  cambiar: () => {},
  restablecer: () => {},
});

// Guarda los ajustes en el móvil y los comparte con toda la app
export function AjustesProvider({ children }: { children: ReactNode }) {
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_DE_FABRICA);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((texto) => {
        if (!texto) return;
        const leidos = normalizarAjustes(JSON.parse(texto));
        setAjustes(leidos);
        fijarAjustes(leidos);
      })
      .catch(() => {});
  }, []);

  const guardar = (nuevos: Ajustes) => {
    setAjustes(nuevos);
    fijarAjustes(nuevos);
    AsyncStorage.setItem(CLAVE, JSON.stringify(nuevos)).catch(() => {});
  };

  return (
    <Contexto.Provider
      value={{
        ajustes,
        cambiar: (cambio) => guardar(normalizarAjustes({ ...ajustes, ...cambio })),
        restablecer: () => guardar(AJUSTES_DE_FABRICA),
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAjustes() {
  return useContext(Contexto);
}
