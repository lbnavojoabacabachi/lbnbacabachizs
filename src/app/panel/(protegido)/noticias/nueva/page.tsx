import type { Metadata } from 'next';
import { exigirAdministrador } from '@/lib/sesion';
import { CabeceraPagina, Volver } from '../../componentes';
import { FormularioNoticia } from '../FormularioNoticia';

export const metadata: Metadata = { title: 'Nueva noticia' };

export default async function NuevaNoticia() {
  await exigirAdministrador();
  return (
    <>
      <Volver href="/panel/noticias" texto="Todas las noticias" />
      <CabeceraPagina titulo="Nueva noticia" />
      <FormularioNoticia noticia={null} />
    </>
  );
}
