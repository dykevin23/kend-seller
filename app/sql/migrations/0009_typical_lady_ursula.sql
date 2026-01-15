CREATE TABLE "product_returns" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_returns_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"address_id" bigint NOT NULL,
	"initial_shipping_fee" integer DEFAULT 0 NOT NULL,
	"return_shipping_fee" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_returns" ADD CONSTRAINT "product_returns_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_returns" ADD CONSTRAINT "product_returns_address_id_admin_seller_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."admin_seller_address"("id") ON DELETE no action ON UPDATE no action;