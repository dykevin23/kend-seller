# product_main_category(상품 메인카테고리)

- 상품분류(classification) -> product_classification(상품분류).code
- 카테고리번호(group_id) pk
- 카테고리코드(group_code)
- 카테고리명(group_name)
- 사용유무(use_yn)
- 정렬순서(sort_order)
- 판매자번호(vendor_id) -> vendors(판매자).id

# product_sub_cetegory(상품 서브카테고리)

- 상위카테고리번호(group_id) -> product_classification(상품분류).code
- 카테고리번호(code_id) pk
- 카테고리코드(code)
- 카테고리명(name)
- 사용유무(use_yn)
- 정렬순서(sort_order)

# products(상품)

- 상품명(name)
- 상품번호(id) pk
- 성별(gender)
- 상품정보(information)
- 상품분류(classification) -> product_classification(상품분류).code
- 메인카테고리(main_category)
- 상세카테고리(sub_category)
- 가격(price)
- 스탯(stats) => 좋아요/조회수/판매수/리뷰수
- 판매자번호(vendor_id) -> vendors(판매자).id

# stock_keeping(sku)

- 재고번호(sku_id) pk
- 재고코드(sku_code)
- 상품번호(product_id) -> products(상품).id
- 재고수량(stock)
- 가격(price) optional
- 판매상태(status) => 준비중/판매중/품절/판매중지/판매완료 => 공통코드

# seller(판매자)

- 판매자번호(id) pk
- 판매자명(name)
- 사업자등록번호
- 주요서비스 -> product_classification(상품분류).code[]

## option_group(전역옵션그룹)

- id(pk)
- 상품분류(classification) -> product_classification(상품분류).code
- 옵션그룹key(group_key)
- 옵션그룹명(group_name)

## option_value(전역옵션 값)

- id(pk)
- group_id -> option_group(전역옵션그룹).id
- value값(value_key)
- value명(value_name)

# product_option_group(상품옵션그룹)

- id(pk)
- 상품번호(product_id) -> products(상품).id
- 옵션그룹명(group_name)
- 옵션그룹id(group_id) -> option_group(전역옵션그룹).id
- 정렬순서(sort_order)

# product_option_value(상품옵션값)

- id(pk)
- group_id -> product_option_group(상품옵션그룹).id
- value명(value_name)
- 정렬순서(sort_order)
- 상세치수(extra_json)

# orders(주문)

- 주문번호(id) pk
- 상품번호(product_id) -> products(상품).id
- 재고번호(sku_id) -> stock_keeping(sku).id
- 판매자번호(vendor_id) -> vendors(판매자).id
- 구매자번호(user_id) -> users(사용자).id
- 주문상태(order_status) => 주문(결재)/배송중/완료
- 반품번호(return_id) -> returns(반품).id
- todo: 가격정보, 할인정보

# invoices(송장)

- id(pk)
- 송장번호(invoice_number)
- 주문번호(order_id) -> orders(주문).id

# returns(반품)

- id(pk)
- 주문번호(order_id) -> orders(주문).id
- 송장번호(invoice_number)
- 처리상태(return_status) => 접수/처리중/완료

# reviews(상품리뷰)

- 리뷰번호(id) pk
- 상품번호(product_id) -> products(상품).id
- 재고번호(sku_id) -> stock_keeping(sku).id
