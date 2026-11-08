import type { Metadata } from 'next';
import { exigirAdministrador } from '@/lib/sesion';
import { CabeceraPagina, Volver } from '../../componentes';
import { FormularioEvento } from '../FormularioEvento';

export const metadata: Metadata = { title: 'Nuevo evento' };

export default async function NuevoEvento() {
  await exigirAdministrador();
  return (
    <>
      <Volver href="/panel/eventos" texto="Todos los eventos" />
      <CabeceraPagina titulo="Nuevo evento" />
      <FormularioEvento evento={null} />
    </>
  );
}
