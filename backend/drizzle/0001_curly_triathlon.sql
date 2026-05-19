CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"segment" varchar(255) NOT NULL,
	"brand" varchar(255) NOT NULL,
	"name" varchar(500) NOT NULL,
	"volume" integer NOT NULL,
	"prices" jsonb NOT NULL,
	"stock" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
