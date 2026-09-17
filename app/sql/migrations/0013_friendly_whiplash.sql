CREATE TYPE "public"."notice_target" AS ENUM('ALL', 'SELLER', 'BUYER');--> statement-breakpoint
ALTER TABLE "notices" ADD COLUMN "target" "notice_target" DEFAULT 'ALL' NOT NULL;