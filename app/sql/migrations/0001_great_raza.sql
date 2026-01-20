CREATE TYPE "public"."target_age_type" AS ENUM('BABY', 'KIDS');--> statement-breakpoint
CREATE TYPE "public"."target_gender_type" AS ENUM('GIRL', 'BOY', 'UNISEX');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "target_gender" "target_gender_type" DEFAULT 'UNISEX' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "target_age" "target_age_type" DEFAULT 'BABY' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "gender";--> statement-breakpoint
DROP TYPE "public"."gender_type";