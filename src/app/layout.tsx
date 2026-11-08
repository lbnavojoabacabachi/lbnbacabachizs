import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Sofia_Sans, Sofia_Sans_Semi_Condensed } from 'next/font/google';
import type { ReactNode } from 'react';
import { NOMBRE_SITIO, OPEN_GRAPH_BASE, URL_SITIO } from '@/lib/sitio';
import './globals.css';

const display = Big_Shoulders({ subsets: ['latin'], variable: '--fuente-display', display: 'swap' });
const texto = Sofia_Sans({ subsets: ['latin'], variable: '--fuente-texto', display: 'swap' });
const datos = Sofia_Sans_Semi_Condensed({ subsets: ['latin'], variable: '--fuente-datos', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: URL_SITIO,
  applicationName: NOMBRE_SITIO,
  openGraph: { ...OPEN_GRAPH_BASE, type: 'website' },
  title: {
    default: 'Liga de Beisbol Navojoa Ejidal · Zona Sur Bacabachi',
    template: '%s · Liga Bacabachi',
  },
  description:
    'Resultados, calendario, posiciones, estadísticas y transmisiones de la Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1b2c55' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1122' },
  ],
};

export default function RaizLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-MX" className={`${display.variable} ${texto.variable} ${datos.variable}`}>
      <body>{children}</body>
    </html>
  );
}
