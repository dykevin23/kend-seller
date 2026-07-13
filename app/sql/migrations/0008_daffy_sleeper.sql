CREATE TYPE "public"."seller_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TABLE "admin_sellers" ADD COLUMN "status" "seller_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_sellers" ADD COLUMN "rejection_reason" text;