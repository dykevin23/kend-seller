CREATE TYPE "public"."settlement_status" AS ENUM('pending', 'paid');--> statement-breakpoint
CREATE TABLE "settlement_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_sales_amount" integer NOT NULL,
	"shipping_reimbursement" integer DEFAULT 0 NOT NULL,
	"commission_rate" integer NOT NULL,
	"commission_amount" integer NOT NULL,
	"settlement_amount" integer NOT NULL,
	"status" "settlement_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settlement_items_seller_id_period_start_unique" UNIQUE("seller_id","period_start")
);
--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "commission_rate" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "settlement_items" ADD CONSTRAINT "settlement_items_seller_id_admin_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."admin_sellers"("id") ON DELETE no action ON UPDATE no action;