CREATE TYPE "public"."plataforma_transmision" AS ENUM('youtube', 'facebook');
CREATE TYPE "public"."red_social" AS ENUM('facebook', 'instagram', 'youtube', 'tiktok', 'x');
CREATE TYPE "public"."tipo_imagen" AS ENUM('foto', 'logo', 'poster', 'noticia', 'patrocinador');
CREATE TYPE "public"."estado_juego" AS ENUM('programado', 'jugado', 'forfeit', 'suspendido', 'pospuesto', 'cancelado');
CREATE TYPE "public"."categoria_jugador" AS ENUM('local', 'novato', 'nuevo_valor', 'refuerzo');
CREATE TYPE "public"."estado_temporada" AS ENUM('preparacion', 'regular', 'postemporada', 'terminada');
CREATE TYPE "public"."puesto_cuerpo_tecnico" AS ENUM('delegado', 'manager', 'coach');
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);

CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	"rol" text DEFAULT 'administrador' NOT NULL,
	"debe_cambiar_contrasena" boolean DEFAULT true NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);

CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "bitacora" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bitacora_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"usuario_id" text,
	"accion" text NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" text,
	"resumen" text NOT NULL,
	"cambios" jsonb,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "album_fotos" (
	"album_id" integer NOT NULL,
	"imagen_id" integer NOT NULL,
	"pie" text,
	"orden" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "album_fotos_album_id_imagen_id_pk" PRIMARY KEY("album_id","imagen_id")
);

CREATE TABLE "albumes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "albumes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"titulo" text NOT NULL,
	"slug" text NOT NULL,
	"fecha" date,
	"descripcion" text,
	"portada_id" integer,
	"publicado" boolean DEFAULT false NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "albumes_slug_unique" UNIQUE("slug")
);

CREATE TABLE "configuracion" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"correo_contacto" text,
	"telefono_contacto" text,
	"direccion" text,
	"horario" text,
	"facebook" text,
	"instagram" text,
	"youtube" text,
	"tiktok" text,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "configuracion_unica" CHECK ("configuracion"."id" = 1)
);

CREATE TABLE "documentos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documentos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"titulo" text NOT NULL,
	"url" text NOT NULL,
	"bytes" integer,
	"orden" integer DEFAULT 0 NOT NULL,
	"publicado_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "eventos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eventos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"titulo" text NOT NULL,
	"descripcion" text,
	"inicio" timestamp with time zone NOT NULL,
	"sede" text,
	"poster_id" integer,
	"destacado" boolean DEFAULT false NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "noticias" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "noticias_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"titulo" text NOT NULL,
	"slug" text NOT NULL,
	"resumen" text,
	"cuerpo" text NOT NULL,
	"imagen_id" integer,
	"publicada_en" timestamp with time zone,
	"destacada" boolean DEFAULT false NOT NULL,
	"creado_por_id" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "noticias_slug_unique" UNIQUE("slug")
);

CREATE TABLE "patrocinadores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "patrocinadores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" text NOT NULL,
	"enlace" text,
	"logo_id" integer,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "publicaciones_redes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "publicaciones_redes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"red" "red_social" NOT NULL,
	"url" text NOT NULL,
	"titulo" text,
	"publicada_en" date,
	"destacada" boolean DEFAULT false NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "transmisiones" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transmisiones_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"plataforma" "plataforma_transmision" NOT NULL,
	"url" text NOT NULL,
	"titulo" text NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone,
	"en_vivo" boolean DEFAULT false NOT NULL,
	"encuentro_id" integer,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "imagenes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "imagenes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tipo" "tipo_imagen" NOT NULL,
	"url_chica" text NOT NULL,
	"url_mediana" text NOT NULL,
	"url_grande" text NOT NULL,
	"ancho" integer NOT NULL,
	"alto" integer NOT NULL,
	"color_fondo" text,
	"nombre_original" text,
	"bytes_original" integer,
	"creada_por_id" text,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "ajustes_tabla" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajustes_tabla_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"temporada_id" integer NOT NULL,
	"equipo_id" integer NOT NULL,
	"ganados" smallint DEFAULT 0 NOT NULL,
	"perdidos" smallint DEFAULT 0 NOT NULL,
	"motivo" text NOT NULL,
	"creado_por_id" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "encuentros" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "encuentros_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"jornada_id" integer NOT NULL,
	"local_id" integer NOT NULL,
	"visitante_id" integer NOT NULL,
	"sede" text,
	"hora" time,
	"orden" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "encuentros_equipos_distintos" CHECK ("encuentros"."local_id" <> "encuentros"."visitante_id")
);

CREATE TABLE "jornadas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jornadas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"temporada_id" integer NOT NULL,
	"numero" smallint NOT NULL,
	"fecha" date,
	"vuelta" smallint,
	"equipo_descansa_id" integer,
	"nota" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "juegos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "juegos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"encuentro_id" integer NOT NULL,
	"numero" smallint NOT NULL,
	"estado" "estado_juego" DEFAULT 'programado' NOT NULL,
	"carreras_local" smallint,
	"carreras_visitante" smallint,
	"forfeit_pierde_id" integer,
	"cuenta_para_tabla" boolean DEFAULT true NOT NULL,
	"nota_publica" text,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "juegos_carreras_no_negativas" CHECK ("juegos"."carreras_local" >= 0 and "juegos"."carreras_visitante" >= 0)
);

CREATE TABLE "reglas_temporada" (
	"temporada_id" integer PRIMARY KEY NOT NULL,
	"juegos_por_encuentro" smallint DEFAULT 2 NOT NULL,
	"forfeit_carreras_ganador" smallint DEFAULT 7 NOT NULL,
	"forfeit_carreras_perdedor" smallint DEFAULT 0 NOT NULL,
	"forfeit_cuenta_carreras" boolean DEFAULT false NOT NULL,
	"permite_empates" boolean DEFAULT true NOT NULL,
	"criterios_desempate" jsonb DEFAULT '["ave","diferencia_carreras"]'::jsonb NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cuerpo_tecnico" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cuerpo_tecnico_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"temporada_id" integer NOT NULL,
	"equipo_id" integer NOT NULL,
	"puesto" "puesto_cuerpo_tecnico" NOT NULL,
	"nombre" text NOT NULL
);

CREATE TABLE "datos_privados_jugador" (
	"jugador_id" integer PRIMARY KEY NOT NULL,
	"fecha_nacimiento" date,
	"notas" text,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "equipos" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "equipos_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" text NOT NULL,
	"nombre_corto" text NOT NULL,
	"slug" text NOT NULL,
	"poblado" text,
	"color_principal" text,
	"logo_id" integer,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "equipos_nombre_unique" UNIQUE("nombre"),
	CONSTRAINT "equipos_slug_unique" UNIQUE("slug")
);

CREATE TABLE "jugadores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jugadores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "plantillas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "plantillas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"temporada_id" integer NOT NULL,
	"equipo_id" integer NOT NULL,
	"jugador_id" integer NOT NULL,
	"numero" smallint,
	"categoria" "categoria_jugador" DEFAULT 'local' NOT NULL,
	"alta" date,
	"baja" date,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "temporada_equipos" (
	"temporada_id" integer NOT NULL,
	"equipo_id" integer NOT NULL,
	"grupo" text,
	CONSTRAINT "temporada_equipos_temporada_id_equipo_id_pk" PRIMARY KEY("temporada_id","equipo_id")
);

CREATE TABLE "temporadas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "temporadas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" text NOT NULL,
	"inicio" date NOT NULL,
	"fin" date,
	"estado" "estado_temporada" DEFAULT 'preparacion' NOT NULL,
	"vigente" boolean DEFAULT false NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "temporadas_nombre_unique" UNIQUE("nombre")
);

ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_usuario_id_user_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "album_fotos" ADD CONSTRAINT "album_fotos_album_id_albumes_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albumes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "album_fotos" ADD CONSTRAINT "album_fotos_imagen_id_imagenes_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."imagenes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "albumes" ADD CONSTRAINT "albumes_portada_id_imagenes_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."imagenes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_poster_id_imagenes_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."imagenes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_imagen_id_imagenes_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."imagenes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "noticias" ADD CONSTRAINT "noticias_creado_por_id_user_id_fk" FOREIGN KEY ("creado_por_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "patrocinadores" ADD CONSTRAINT "patrocinadores_logo_id_imagenes_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."imagenes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "transmisiones" ADD CONSTRAINT "transmisiones_encuentro_id_encuentros_id_fk" FOREIGN KEY ("encuentro_id") REFERENCES "public"."encuentros"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_creada_por_id_user_id_fk" FOREIGN KEY ("creada_por_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "ajustes_tabla" ADD CONSTRAINT "ajustes_tabla_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ajustes_tabla" ADD CONSTRAINT "ajustes_tabla_equipo_id_equipos_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "ajustes_tabla" ADD CONSTRAINT "ajustes_tabla_creado_por_id_user_id_fk" FOREIGN KEY ("creado_por_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "encuentros" ADD CONSTRAINT "encuentros_jornada_id_jornadas_id_fk" FOREIGN KEY ("jornada_id") REFERENCES "public"."jornadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "encuentros" ADD CONSTRAINT "encuentros_local_id_equipos_id_fk" FOREIGN KEY ("local_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "encuentros" ADD CONSTRAINT "encuentros_visitante_id_equipos_id_fk" FOREIGN KEY ("visitante_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_equipo_descansa_id_equipos_id_fk" FOREIGN KEY ("equipo_descansa_id") REFERENCES "public"."equipos"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "juegos" ADD CONSTRAINT "juegos_encuentro_id_encuentros_id_fk" FOREIGN KEY ("encuentro_id") REFERENCES "public"."encuentros"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "juegos" ADD CONSTRAINT "juegos_forfeit_pierde_id_equipos_id_fk" FOREIGN KEY ("forfeit_pierde_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "reglas_temporada" ADD CONSTRAINT "reglas_temporada_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cuerpo_tecnico" ADD CONSTRAINT "cuerpo_tecnico_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cuerpo_tecnico" ADD CONSTRAINT "cuerpo_tecnico_equipo_id_equipos_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "datos_privados_jugador" ADD CONSTRAINT "datos_privados_jugador_jugador_id_jugadores_id_fk" FOREIGN KEY ("jugador_id") REFERENCES "public"."jugadores"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_logo_id_imagenes_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."imagenes"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "plantillas" ADD CONSTRAINT "plantillas_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "plantillas" ADD CONSTRAINT "plantillas_equipo_id_equipos_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "plantillas" ADD CONSTRAINT "plantillas_jugador_id_jugadores_id_fk" FOREIGN KEY ("jugador_id") REFERENCES "public"."jugadores"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "temporada_equipos" ADD CONSTRAINT "temporada_equipos_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "temporada_equipos" ADD CONSTRAINT "temporada_equipos_equipo_id_equipos_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
CREATE INDEX "account_user_id" ON "account" USING btree ("user_id");
CREATE INDEX "session_user_id" ON "session" USING btree ("user_id");
CREATE INDEX "verification_identifier" ON "verification" USING btree ("identifier");
CREATE INDEX "bitacora_creado_en" ON "bitacora" USING btree ("creado_en");
CREATE INDEX "noticias_publicada_en" ON "noticias" USING btree ("publicada_en");
CREATE INDEX "transmisiones_inicio" ON "transmisiones" USING btree ("inicio");
CREATE INDEX "ajustes_tabla_temporada" ON "ajustes_tabla" USING btree ("temporada_id");
CREATE INDEX "encuentros_jornada" ON "encuentros" USING btree ("jornada_id");
CREATE UNIQUE INDEX "jornadas_numero" ON "jornadas" USING btree ("temporada_id","numero");
CREATE UNIQUE INDEX "juegos_numero" ON "juegos" USING btree ("encuentro_id","numero");
CREATE INDEX "cuerpo_tecnico_equipo" ON "cuerpo_tecnico" USING btree ("temporada_id","equipo_id");
CREATE UNIQUE INDEX "plantillas_jugador_en_equipo" ON "plantillas" USING btree ("temporada_id","equipo_id","jugador_id");
CREATE INDEX "plantillas_jugador" ON "plantillas" USING btree ("temporada_id","jugador_id");
CREATE UNIQUE INDEX "temporadas_una_vigente" ON "temporadas" USING btree ("vigente") WHERE "temporadas"."vigente";