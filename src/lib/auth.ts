import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { username } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { db } from '@/db/conexion';
import { account, rateLimit, session, user, verification } from '@/db/esquema';
import { registrarEnBitacora } from '@/lib/bitacora';

export const LIMITE_INTENTOS_ENTRAR = { ventanaSegundos: 15 * 60, maximo: 5 };

export const auth = betterAuth({
  appName: 'Liga Bacabachi',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification, rateLimit },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      rol: { type: 'string', required: false, defaultValue: 'administrador', input: false },
      debeCambiarContrasena: { type: 'boolean', required: false, defaultValue: true, input: false },
      activo: { type: 'boolean', required: false, defaultValue: true, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    customRules: {
      '/sign-in/username': {
        window: LIMITE_INTENTOS_ENTRAR.ventanaSegundos,
        max: LIMITE_INTENTOS_ENTRAR.maximo,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (nueva) => {
          const [cuenta] = await db
            .select({ activo: user.activo })
            .from(user)
            .where(eq(user.id, nueva.userId));
          if (!cuenta?.activo) return false;
        },
        after: async (nueva, contexto) => {
          if (contexto?.path === '/change-password') return;
          await registrarEnBitacora({
            usuarioId: nueva.userId,
            accion: 'entrar',
            entidad: 'sesion',
            entidadId: nueva.id,
            resumen: 'Entró al panel',
          });
        },
      },
    },
  },
  plugins: [username({ minUsernameLength: 3, maxUsernameLength: 30 }), nextCookies()],
});

export type Sesion = typeof auth.$Infer.Session;
