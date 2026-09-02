-- admin_sellers에 컬럼을 추가한 뒤 이 파일을 그대로 재실행하면
-- "cannot change name of view column" 에러가 난다(CREATE OR REPLACE VIEW는
-- 기존 컬럼 뒤에 이어붙이는 것만 허용, seller.* 뒤에 domain_name이 고정돼 있어
-- 새 컬럼이 중간에 끼어들면 순서가 밀림) — DROP VIEW 후 CREATE VIEW로 재생성할 것
CREATE OR REPLACE VIEW seller_information_view AS
SELECT 
  seller.*
  , (SELECT name FROM domains WHERE id = seller.domain_id) AS domain_name
FROM admin_sellers seller
INNER JOIN admin_seller_members member
ON member.seller_id = seller.id
WHERE member.user_id = auth.uid();