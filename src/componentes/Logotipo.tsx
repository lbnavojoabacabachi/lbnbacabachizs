import Image from 'next/image';

type Propiedades = {
  tamano: number;
  className?: string;
  decorativo?: boolean;
};

export function Logotipo({ tamano, className, decorativo = false }: Propiedades) {
  const archivo = tamano > 96 ? 'logo-liga-192.webp' : 'logo-liga-96.webp';
  return (
    <Image
      src={`/img/${archivo}`}
      width={tamano}
      height={tamano}
      alt={decorativo ? '' : 'Logotipo de la Liga de Beisbol Navojoa Ejidal, Zona Sur Bacabachi'}
      className={className}
      priority
    />
  );
}
