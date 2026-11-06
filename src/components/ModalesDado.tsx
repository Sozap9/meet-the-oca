import { useEffect } from 'react';
import { sonar } from '../sonido';
import type { Resumen } from '../engine/resumen';
import { AvisoPixel, BotonModal, CabeceraModal, Caja, TextoModal } from './Capa';

type PropsFin = {
  total: number;
  resumen: Resumen;
  onOtraVez: () => void;
  onResumen: () => void;
  onSalir: () => void;
};

export function FinDadoContenido({ total, resumen, onOtraVez, onResumen, onSalir }: PropsFin) {
  useEffect(() => sonar('victoria'), []);
  return (
    <Caja>
      <CabeceraModal sangrado titulo="¡Partida completada!" chip="dado de temas." dibujo="feliz" />
      <TextoModal>
        {total} tiradas · {resumen.totalHechas} tarjetas hechas · {resumen.totalPasadas} pasadas
      </TextoModal>
      {resumen.sintonia ? (
        <AvisoPixel>{`sintonía: ${resumen.sintonia.aciertos} de ${resumen.sintonia.total}.`}</AvisoPixel>
      ) : null}
      <BotonModal principal texto="Ver respuestas" onPress={onResumen} />
      <BotonModal texto="Jugar otra vez" onPress={onOtraVez} />
      <BotonModal texto="Elegir modo" onPress={onSalir} />
    </Caja>
  );
}
