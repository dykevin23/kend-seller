CREATE TABLE "common_code_group" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "common_code_group_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "common_code_group_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "common_codes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "common_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"group_code" bigint,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "common_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "common_codes" ADD CONSTRAINT "common_codes_group_code_common_code_group_id_fk" FOREIGN KEY ("group_code") REFERENCES "public"."common_code_group"("id") ON DELETE cascade ON UPDATE no action;