import type { ReactNode } from 'react';
import { COLORES_COMPARTIR as C } from './recursos';

type Propiedades = { logo: string; antetitulo: string; titulo: string; detalle?: string; pie?: string; children?: ReactNode };

export function MarcoCompartir({ logo, antetitulo, titulo, detalle, pie, children }: Propiedades) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: C.pizarra,
        color: C.texto,
        fontFamily: 'Sofia Sans Semi Condensed',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '40px 56px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} width={92} height={92} alt="" style={{ borderRadius: 46, background: C.logo }} />
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 22 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2.5, color: C.suave, textTransform: 'uppercase' }}>
              {antetitulo}
            </div>
            <div style={{ fontFamily: 'Big Shoulders', fontSize: 70, lineHeight: 1, textTransform: 'uppercase' }}>{titulo}</div>
            {detalle && <div style={{ fontSize: 26, color: C.suave, marginTop: 4 }}>{detalle}</div>}
          </div>
        </div>
        {children}
        {pie !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', fontSize: 26, color: C.suave }}>
            <div style={{ display: 'flex' }}>{pie}</div>
            <div style={{ display: 'flex' }}>ligabeisbolbacabachi.com</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', height: 16, background: C.rojo }} />
    </div>
  );
}
