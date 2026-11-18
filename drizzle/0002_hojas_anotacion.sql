CREATE TYPE "public"."decision_pitcher" AS ENUM('ganado', 'perdido', 'salvado');
CREATE TABLE "hojas_anotacion" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hojas_anotacion_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"juego_id" integer NOT NULL,
	"equipo_id" integer NOT NULL,
	"sin_numeros" boolean DEFAULT false NOT NULL,
	"capturada_por_id" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "lineas_bateo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lineas_bateo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hoja_id" integer NOT NULL,
	"jugador_id" integer NOT NULL,
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
	"golpeados" smallint DEFAULT 0 NOT NULL
);

CREATE TABLE "lineas_pitcheo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "lineas_pitcheo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hoja_id" integer NOT NULL,
	"jugador_id" integer NOT NULL,
	"decision" "decision_pitcher"
);

ALTER TABLE "hojas_anotacion" ADD CONSTRAINT "hojas_anotacion_juego_id_juegos_id_fk" FOREIGN KEY ("juego_id") REFERENCES "public"."juegos"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "hojas_anotacion" ADD CONSTRAINT "hojas_anotacion_equipo_id_equipos_id_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipos"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "hojas_anotacion" ADD CONSTRAINT "hojas_anotacion_capturada_por_id_user_id_fk" FOREIGN KEY ("capturada_por_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "lineas_bateo" ADD CONSTRAINT "lineas_bateo_hoja_id_hojas_anotacion_id_fk" FOREIGN KEY ("hoja_id") REFERENCES "public"."hojas_anotacion"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lineas_bateo" ADD CONSTRAINT "lineas_bateo_jugador_id_jugadores_id_fk" FOREIGN KEY ("jugador_id") REFERENCES "public"."jugadores"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "lineas_pitcheo" ADD CONSTRAINT "lineas_pitcheo_hoja_id_hojas_anotacion_id_fk" FOREIGN KEY ("hoja_id") REFERENCES "public"."hojas_anotacion"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "lineas_pitcheo" ADD CONSTRAINT "lineas_pitcheo_jugador_id_jugadores_id_fk" FOREIGN KEY ("jugador_id") REFERENCES "public"."jugadores"("id") ON DELETE restrict ON UPDATE no action;
CREATE UNIQUE INDEX "hojas_anotacion_juego_equipo" ON "hojas_anotacion" USING btree ("juego_id","equipo_id");
CREATE UNIQUE INDEX "lineas_bateo_hoja_jugador" ON "lineas_bateo" USING btree ("hoja_id","jugador_id");
CREATE INDEX "lineas_bateo_jugador" ON "lineas_bateo" USING btree ("jugador_id");
CREATE UNIQUE INDEX "lineas_pitcheo_hoja_jugador" ON "lineas_pitcheo" USING btree ("hoja_id","jugador_id");
CREATE INDEX "lineas_pitcheo_jugador" ON "lineas_pitcheo" USING btree ("jugador_id");