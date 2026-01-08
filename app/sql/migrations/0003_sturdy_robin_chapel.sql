ALTER TABLE "main_categories" ALTER COLUMN "domain_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_categories" ALTER COLUMN "main_category_code" SET NOT NULL;