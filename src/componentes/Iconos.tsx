import type { ReactNode } from 'react';

type Propiedades = { className?: string; tamano?: number };

function Svg({ className, tamano = 20, children }: Propiedades & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function IconoMenu(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Svg>
  );
}

export function IconoCerrar(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M5 5l14 14M19 5L5 19" />
    </Svg>
  );
}

export function IconoSol(p: Propiedades) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

export function IconoLuna(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a6.5 6.5 0 0 0 10 10z" />
    </Svg>
  );
}

export function IconoAutomatico(p: Propiedades) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconoReproducir(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconoFlecha(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconoAnterior(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M19 12H6M11 6l-6 6 6 6" />
    </Svg>
  );
}

export function IconoExterno(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
    </Svg>
  );
}

export function IconoDescarga(p: Propiedades) {
  return (
    <Svg {...p}>
      <path d="M12 4v11M7 10l5 5 5-5M4 20h16" />
    </Svg>
  );
}
