-- =============================================
-- 코드 채번을 위한 Sequence 및 Trigger 설정
-- =============================================

-- 1. Sequence 생성
CREATE SEQUENCE IF NOT EXISTS seller_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS product_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS sku_code_seq START 1;

-- 2. 판매자 코드 생성 함수 (SL0001 형식)
CREATE OR REPLACE FUNCTION generate_seller_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.seller_code IS NULL OR NEW.seller_code = '' THEN
    NEW.seller_code := 'SL' || LPAD(nextval('seller_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 상품 코드 생성 함수 (PR00000001 형식)
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
    NEW.product_code := 'PR' || LPAD(nextval('product_code_seq')::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. SKU 코드 생성 함수 (sku-1 형식)
CREATE OR REPLACE FUNCTION generate_sku_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku_code IS NULL OR NEW.sku_code = '' THEN
    NEW.sku_code := 'sku-' || nextval('sku_code_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger 생성
DROP TRIGGER IF EXISTS set_seller_code ON admin_sellers;
CREATE TRIGGER set_seller_code
  BEFORE INSERT ON admin_sellers
  FOR EACH ROW
  EXECUTE FUNCTION generate_seller_code();

DROP TRIGGER IF EXISTS set_product_code ON products;
CREATE TRIGGER set_product_code
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_code();

DROP TRIGGER IF EXISTS set_sku_code ON product_stock_keepings;
CREATE TRIGGER set_sku_code
  BEFORE INSERT ON product_stock_keepings
  FOR EACH ROW
  EXECUTE FUNCTION generate_sku_code();
