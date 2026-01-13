ALTER TABLE "system_options" DROP CONSTRAINT "system_options_key_unique";--> statement-breakpoint
ALTER TABLE "system_options" DROP COLUMN "key";--> statement-breakpoint
ALTER TABLE "system_options" ADD CONSTRAINT "system_options_code_unique" UNIQUE("code");