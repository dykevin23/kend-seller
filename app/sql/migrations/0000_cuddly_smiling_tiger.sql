CREATE TYPE "public"."bundle_delivery_type" AS ENUM('AVAILABLE', 'UNAVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."courier_company" AS ENUM('CJ', 'POST', 'HANJIN', 'LOGEN', 'LOTTE', 'KDEXP', 'DAESIN', 'GSM', 'ILYANG', 'HDEXP');--> statement-breakpoint
CREATE TYPE "public"."delivery_method_type" AS ENUM('STANDARD', 'FRESH_FROZEN', 'CUSTOM_ORDER', 'PURCHASE_AGENCY', 'INSTALLATION_DIRECT');--> statement-breakpoint
CREATE TYPE "public"."description_type" AS ENUM('IMAGE', 'HTML');--> statement-breakpoint
CREATE TYPE "public"."gender_type" AS ENUM('MALE', 'FEMALE', 'UNISEX');--> statement-breakpoint
CREATE TYPE "public"."image_type" AS ENUM('MAIN', 'ADDITIONAL');--> statement-breakpoint
CREATE TYPE "public"."island_delivery_type" AS ENUM('AVAILABLE', 'UNAVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."sales_status" AS ENUM('REGISTERED', 'PREPARE', 'SALE', 'SOLD_OUT', 'STOP', 'END');--> statement-breakpoint
CREATE TYPE "public"."shipping_fee_type" AS ENUM('FREE', 'PAID', 'COD', 'CONDITIONAL');--> statement-breakpoint
CREATE TYPE "public"."admin_address_type" AS ENUM('SHIPPING', 'RETURN');--> statement-breakpoint
CREATE TABLE "product_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"island_delivery" "island_delivery_type" DEFAULT 'AVAILABLE' NOT NULL,
	"delivery_method" "delivery_method_type" DEFAULT 'STANDARD' NOT NULL,
	"bundle_delivery" "bundle_delivery_type" DEFAULT 'AVAILABLE' NOT NULL,
	"shipping_fee_type" "shipping_fee_type" DEFAULT 'FREE' NOT NULL,
	"shipping_fee" integer DEFAULT 0 NOT NULL,
	"free_shipping_condition" integer DEFAULT 0,
	"shipping_days" integer DEFAULT 1 NOT NULL,
	"courier_company" "courier_company" DEFAULT 'CJ' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_descriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"type" "description_type" DEFAULT 'IMAGE' NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"brand" text,
	"maker" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"sku_id" uuid,
	"type" "image_type" DEFAULT 'MAIN' NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"system_option_id" uuid NOT NULL,
	"option" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_returns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"initial_shipping_fee" integer DEFAULT 0 NOT NULL,
	"return_shipping_fee" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_code" text NOT NULL,
	"storage_folder" text NOT NULL,
	"name" text NOT NULL,
	"gender" "gender_type" DEFAULT 'MALE' NOT NULL,
	"domain_id" uuid,
	"main_category" text NOT NULL,
	"sub_category" text NOT NULL,
	"seller_id" uuid,
	"status" "sales_status" DEFAULT 'REGISTERED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_product_code_unique" UNIQUE("product_code")
);
--> statement-breakpoint
CREATE TABLE "product_stock_keepings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku_code" text NOT NULL,
	"product_id" uuid,
	"stock" integer DEFAULT 0 NOT NULL,
	"regular_price" integer DEFAULT 0,
	"sale_price" integer DEFAULT 0,
	"status" "sales_status" DEFAULT 'PREPARE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_stock_keepings_sku_code_unique" UNIQUE("sku_code")
);
--> statement-breakpoint
CREATE TABLE "admin_seller_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sellers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_code" text NOT NULL,
	"bizr_no" text NOT NULL,
	"name" text NOT NULL,
	"representative_name" text NOT NULL,
	"zone_code" text NOT NULL,
	"address" text NOT NULL,
	"address_detail" text NOT NULL,
	"business" text NOT NULL,
	"domain_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sellers_seller_code_unique" UNIQUE("seller_code")
);
--> statement-breakpoint
CREATE TABLE "admin_seller_address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid,
	"address_name" text NOT NULL,
	"zone_code" text NOT NULL,
	"address" text NOT NULL,
	"address_detail" text NOT NULL,
	"address_type" "admin_address_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "common_code_group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "common_code_group_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "common_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"use_yn" text DEFAULT 'Y' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "common_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"use_yn" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "domains_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "main_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "main_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sub_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"main_category_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_options_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "product_deliveries" ADD CONSTRAINT "product_deliveries_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_deliveries" ADD CONSTRAINT "product_deliveries_address_id_admin_seller_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."admin_seller_address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_descriptions" ADD CONSTRAINT "product_descriptions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_details" ADD CONSTRAINT "product_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_sku_id_product_stock_keepings_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_stock_keepings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_system_option_id_system_options_id_fk" FOREIGN KEY ("system_option_id") REFERENCES "public"."system_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_returns" ADD CONSTRAINT "product_returns_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_returns" ADD CONSTRAINT "product_returns_address_id_admin_seller_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."admin_seller_address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_admin_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."admin_sellers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_stock_keepings" ADD CONSTRAINT "product_stock_keepings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_seller_members" ADD CONSTRAINT "admin_seller_members_seller_id_admin_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."admin_sellers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_seller_members" ADD CONSTRAINT "admin_seller_members_user_id_profiles_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sellers" ADD CONSTRAINT "admin_sellers_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_seller_address" ADD CONSTRAINT "admin_seller_address_seller_id_admin_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."admin_sellers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "common_codes" ADD CONSTRAINT "common_codes_group_id_common_code_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."common_code_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main_categories" ADD CONSTRAINT "main_categories_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_main_category_id_main_categories_id_fk" FOREIGN KEY ("main_category_id") REFERENCES "public"."main_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_options" ADD CONSTRAINT "system_options_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;