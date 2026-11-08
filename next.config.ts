import type { NextConfig } from 'next';

const PAGINAS_ANTERIORES: [string, string][] = [
  ['/index.html', '/'],
  ['/pages/rol-juegos.html', '/calendario'],
  ['/pages/rosters.html', '/equipos'],
  ['/pages/altas-bajas.html', '/altas-y-bajas'],
  ['/pages/estadisticas.html', '/estadisticas'],
  ['/pages/formatos.html', '/documentos'],
  ['/pages/contacto.html', '/contacto'],
  ['/pages/admin-resultados.html', '/panel'],
];

const configuracion: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  images: { unoptimized: true },
  outputFileTracingExcludes: { '/*': ['.medios/**', 'legado/**', 'reportes/**'] },
  outputFileTracingIncludes: { '/**/opengraph-image': ['assets/fuentes/*.ttf', 'assets/og/*.png'] },
  async redirects() {
    return PAGINAS_ANTERIORES.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default configuracion;
