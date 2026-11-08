import type { Metadata } from 'next';
import { Formulario } from '@/app/panel/componentes/Formulario';
import { Grupo, Texto } from '@/app/panel/componentes/Entradas';
import { obtenerConfiguracion } from '@/lib/consultas/contenido';
import { exigirAdministrador } from '@/lib/sesion';
import { CabeceraPagina } from '../componentes';
import { guardarContacto } from '../patrocinadores/acciones';

export const metadata: Metadata = { title: 'Contacto y perfiles' };

export default async function ContactoPanel() {
  await exigirAdministrador();
  const c = await obtenerConfiguracion();
  return (
    <>
      <CabeceraPagina titulo="Contacto y perfiles">
        <p>Se muestran en la página Contacto, en el pie de todas las páginas y en Redes. Deja vacío lo que no se deba publicar.</p>
      </CabeceraPagina>
      <Formulario accion={guardarContacto} boton="Guardar contacto">
        <Grupo titulo="Contacto">
          <Texto nombre="telefonoContacto" etiqueta="Teléfono" tipo="tel" valor={c?.telefonoContacto} maximo={20} />
          <Texto nombre="correoContacto" etiqueta="Correo" tipo="email" valor={c?.correoContacto} maximo={200} />
          <Texto nombre="direccion" etiqueta="Dirección" valor={c?.direccion} maximo={200} />
          <Texto nombre="horario" etiqueta="Horario de atención" valor={c?.horario} maximo={200} />
        </Grupo>
        <Grupo titulo="Perfiles de la liga" ayuda="Pega el enlace completo del perfil, empezando con https://">
          <Texto nombre="facebook" etiqueta="Facebook" tipo="url" valor={c?.facebook} maximo={500} />
          <Texto nombre="instagram" etiqueta="Instagram" tipo="url" valor={c?.instagram} maximo={500} />
          <Texto nombre="youtube" etiqueta="YouTube" tipo="url" valor={c?.youtube} maximo={500} />
          <Texto nombre="tiktok" etiqueta="TikTok" tipo="url" valor={c?.tiktok} maximo={500} />
        </Grupo>
      </Formulario>
    </>
  );
}
