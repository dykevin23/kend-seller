-- 1. stockKeepings의 status 컬럼을 임시로 text로 변경
ALTER TABLE "product_stock_keepings" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "product_stock_keepings" ALTER COLUMN "status" SET DEFAULT 'PREPARE'::text;--> statement-breakpoint

-- 2. 기존 sales_status enum 삭제
DROP TYPE "public"."sales_status";--> statement-breakpoint

-- 3. 새로운 sales_status enum 생성 (REGISTERED, END 추가)
CREATE TYPE "public"."sales_status" AS ENUM('REGISTERED', 'PREPARE', 'SALE', 'SOLD_OUT', 'STOP', 'END');--> statement-breakpoint

-- 4. products 테이블에 status 컬럼 추가
ALTER TABLE "products" ADD COLUMN "status" "sales_status" DEFAULT 'REGISTERED' NOT NULL;--> statement-breakpoint

-- 5. stockKeepings의 status 컬럼을 다시 enum으로 변경
ALTER TABLE "product_stock_keepings" ALTER COLUMN "status" SET DEFAULT 'PREPARE'::"public"."sales_status";--> statement-breakpoint
ALTER TABLE "product_stock_keepings" ALTER COLUMN "status" SET DATA TYPE "public"."sales_status" USING "status"::"public"."sales_status";