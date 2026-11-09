CREATE TABLE "estadisticas_bateo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "estadisticas_bateo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"temporada_id" integer NOT NULL,
	"equipo_id" integer NOT NULL,
	"orden" smallint NOT NULL,
	"nombre" text NOT NULL,
	"acumulado" boolean DEFAULT false NOT NULL,
	"juegos" smallint DEFAULT 0 NOT NULL,
	"apariciones" smallint DEFAULT 0 NOT NULL,
	"veces_al_bat" smallint DEFAULT 0 NOT NULL,
	"hits" smallint DEFAULT 0 NOT NULL,
	"sencillos" smallint DEFAULT 0 NOT NULL,
	"dobles" smallint DEFAULT 0 NOT NULL,
	"triples" smallint DEFAULT 0 NOT NULL,
	"jonrones" smallint DEFAULT 0 NOT NULL,
	"ponches" smallint DEFAULT 0 NOT NULL,
	"bases_por_bolas" smallint DEFAULT 0 NOT NULL,
	"intencionales" smallint DEFAULT 0 NOT NULL,
	"golpeados" smallint DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "estadisticas_pitcheo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "estadisticas_pitcheo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"temporada_id" integer NOT NULL,
	"equipo_id" integer NOT NULL,
	"orden" smallint NOT NULL,
	"nombre" text NOT NULL,
	"juegos" smallint DEFAULT 0 NOT NULL,
	"ganados" smallint DEFAULT 0 NOT NULL,
	"perdidos" smallint DEFAULT 0 NOT NULL,
	"salvados" smallint DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "reglas_temporada" ADD COLUMN "minimo_apariciones" smallint DEFAULT 70 NOT NULL;
ALTER TABLE "estadisticas_bateo" ADD CONSTRAINT "estadisticas_bateo_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "estadisticas_bateo" ADD CONSTRAINT "estadisticas_bateo_equipo_id_equipos_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "estadisticas_pitcheo" ADD CONSTRAINT "estadisticas_pitcheo_temporada_id_temporadas_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporadas"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "estadisticas_pitcheo" ADD CONSTRAINT "estadisticas_pitcheo_equipo_id_equipos_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
CREATE INDEX "estadisticas_bateo_equipo" ON "estadisticas_bateo" USING btree ("temporada_id","equipo_id");
CREATE INDEX "estadisticas_pitcheo_equipo" ON "estadisticas_pitcheo" USING btree ("temporada_id","equipo_id");