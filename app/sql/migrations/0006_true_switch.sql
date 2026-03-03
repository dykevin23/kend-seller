CREATE TABLE "seller_banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seller_banners" ADD CONSTRAINT "seller_banners_seller_id_admin_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."admin_sellers"("id") ON DELETE cascade ON UPDATE no action;