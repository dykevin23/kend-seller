-- 기존 product_options 데이터를 product_stock_keepings의 options 컬럼으로 마이그레이션
-- 옵션 2개 상품 전용: COLOR x SIZE (Cartesian Product)
-- product_options 테이블에서 옵션이 행별로 저장되어 있으므로 array_agg로 집계

-- Step 1: 먼저 options 초기화
UPDATE product_stock_keepings SET options = NULL;

-- Step 2: 마이그레이션 실행
-- SKU 순서: COLOR가 외부 루프, SIZE가 내부 루프
-- 예: 색상 [빨강, 파랑], 사이즈 [S, M, L]
-- SKU idx 0: 빨강+S, idx 1: 빨강+M, idx 2: 빨강+L
-- SKU idx 3: 파랑+S, idx 4: 파랑+M, idx 5: 파랑+L

WITH color_agg AS (
  SELECT
    po.product_id,
    array_agg(trim(po.option) ORDER BY po.created_at, po.id) as color_values,
    COUNT(*)::int as color_len
  FROM product_options po
  JOIN system_options so ON po.system_option_id = so.id
  WHERE so.code = 'COLOR'
  GROUP BY po.product_id
),
size_agg AS (
  SELECT
    po.product_id,
    array_agg(trim(po.option) ORDER BY po.created_at, po.id) as size_values,
    COUNT(*)::int as size_len
  FROM product_options po
  JOIN system_options so ON po.system_option_id = so.id
  WHERE so.code = 'SIZE'
  GROUP BY po.product_id
),
product_options_combined AS (
  SELECT
    c.product_id,
    c.color_values,
    c.color_len,
    s.size_values,
    s.size_len
  FROM color_agg c
  JOIN size_agg s ON c.product_id = s.product_id
),
numbered_skus AS (
  SELECT
    psk.id as sku_id,
    psk.product_id,
    psk.sku_code,
    (ROW_NUMBER() OVER (PARTITION BY psk.product_id ORDER BY psk.created_at, psk.id))::int - 1 as sku_idx
  FROM product_stock_keepings psk
),
sku_with_options AS (
  SELECT
    ns.sku_id,
    ns.sku_code,
    ns.sku_idx,
    poc.color_len,
    poc.size_len,
    poc.color_values[((ns.sku_idx / poc.size_len) % poc.color_len) + 1] as color_value,
    poc.size_values[(ns.sku_idx % poc.size_len) + 1] as size_value
  FROM numbered_skus ns
  JOIN product_options_combined poc ON ns.product_id = poc.product_id
)
UPDATE product_stock_keepings psk
SET options = jsonb_build_object(
  'COLOR', swo.color_value,
  'SIZE', swo.size_value
)
FROM sku_with_options swo
WHERE psk.id = swo.sku_id;

-- Step 3: 결과 확인
SELECT
  p.name as product_name,
  psk.sku_code,
  psk.options
FROM product_stock_keepings psk
JOIN products p ON psk.product_id = p.id
ORDER BY p.name, psk.created_at, psk.id;
