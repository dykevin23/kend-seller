-- products.name이 완성형(NFC)이 아닌 분해형(NFD, 한글 자모 단위)으로 저장된
-- 행이 있어 화면 표시는 정상이지만(브라우저가 자동 조합) ILIKE 키워드 검색이
-- 안 되는 문제가 있었다(2026-09, 재고관리 화면 검색 테스트 중 발견).
-- 실측 확인 결과 products.name 5건만 이 문제였고, product_details.brand/maker,
-- product_options.option, product_stock_keepings.options는 이미 전부 정상(NFC)이었다.

UPDATE products
SET name = normalize(name, NFC)
WHERE name IS DISTINCT FROM normalize(name, NFC);
