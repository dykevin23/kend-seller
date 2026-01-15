CREATE TYPE "public"."bundle_delivery_type" AS ENUM('AVAILABLE', 'UNAVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."delivery_method_type" AS ENUM('STANDARD', 'FRESH_FROZEN', 'CUSTOM_ORDER', 'PURCHASE_AGENCY', 'INSTALLATION_DIRECT');--> statement-breakpoint
CREATE TYPE "public"."island_delivery_type" AS ENUM('AVAILABLE', 'UNAVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."shipping_fee_type" AS ENUM('FREE', 'PAID', 'COD', 'CONDITIONAL');--> statement-breakpoint
CREATE TABLE "product_deliveries" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_deliveries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"address_id" bigint NOT NULL,
	"island_delivery" "island_delivery_type" DEFAULT 'AVAILABLE' NOT NULL,
	"delivery_method" "delivery_method_type" DEFAULT 'STANDARD' NOT NULL,
	"bundle_delivery" "bundle_delivery_type" DEFAULT 'AVAILABLE' NOT NULL,
	"shipping_fee_type" "shipping_fee_type" DEFAULT 'FREE' NOT NULL,
	"shipping_fee" integer DEFAULT 0 NOT NULL,
	"free_shipping_condition" integer DEFAULT 0,
	"shipping_days" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_deliveries" ADD CONSTRAINT "product_deliveries_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_deliveries" ADD CONSTRAINT "product_deliveries_address_id_admin_seller_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."admin_seller_address"("id") ON DELETE no action ON UPDATE no action;