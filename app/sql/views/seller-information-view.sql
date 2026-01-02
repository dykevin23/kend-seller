CREATE OR REPLACE VIEW seller_information_view AS
SELECT 
  seller.*
  , (SELECT name FROM domains WHERE id = seller.domain_id) AS domain_name
FROM admin_sellers seller
INNER JOIN admin_seller_members member
ON member.seller_id = seller.id
WHERE member.user_id = auth.uid();