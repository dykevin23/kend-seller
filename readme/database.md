# Database Architecture (데이터베이스 아키텍처)

이 문서는 **Kend 서비스의 데이터베이스 구조, 소유권, 접근 규칙**을 설명하기 위한 기준 문서이다.  
실제 테이블 정의 및 컬럼 정보는 `/app/features/**/schema.ts` 에 정의된 schema 파일을 **단일 소스(Source of Truth)** 로 사용한다.

---

## 1. Database Overview

- Database: **Supabase (PostgreSQL)**
- ORM: **Drizzle**
- Authentication / Authorization:
  - Supabase Auth
  - Row Level Security (RLS)
- 단일 Database를 여러 Application이 공유하는 구조

### Applications

- **Kend**: 사용자(Customer) 앱
- **Kend-Seller**: 판매자(Seller) 사이트

---

## 2. Table Ownership Matrix

각 테이블은 명확한 도메인 소유권을 가진다.

| Table Name             | Owner App   | Primary Role              | Description                                   |
| ---------------------- | ----------- | ------------------------- | --------------------------------------------- |
| profiles               | Shared      | customer / seller / admin | 인증 프로필 및 역할 정보                      |
| products               | Kend-Seller | seller                    | 판매자 상품 기본정보                          |
| product_details        | Kend-Seller | seller                    | 판매자 상품 상세정보                          |
| product_stock_keepings | Kend-Seller | seller                    | 상품 재고관리                                 |
| product_options        | Kend-Seller | seller                    | 상품 옵션                                     |
| product_images         | Kend-Seller | seller                    | 상품 이미지                                   |
| product_descriptions   | Kend-Seller | seller                    | 상품 설명                                     |
| admin_sellers          | Kend-Seller | seller                    | 판매자 정보                                   |
| admin_seller_members   | Kend-Seller | seller                    | 판매자 직원정보                               |
| admin_seller_address   | Kend-Seller | seller                    | 판매자 주소지 관리                            |
| domains                | Kend-Seller | admin                     | 서비스 도메인 관리                            |
| main_categories        | Kend-Seller | admin                     | 상품 메인 카테고리                            |
| sub_categories         | Kend-Seller | admin                     | 상품 하위 카테고리                            |
| system_options         | Kend-Seller | admin                     | 시스템 옵션(시스템에서 정의한 기본 제공 옵션) |
| common_code_group      | Kend-Seller | admin                     | 공통코드 그룹                                 |
| common_codes           | Kend-Seller | admin                     | 공통코드                                      |

<!-- | children    | Kend        | customer                  | 사용자 자녀 데이터       |

| inventories | Kend-Seller | seller                    | 상품 재고 관리           |
| orders      | Shared      | customer / seller         | 주문 전체 라이프사이클   |
| order_items | Shared      | customer / seller         | 주문 상세 항목           | -->

> Owner App은 **주로 데이터를 생성/관리하는 책임 주체**를 의미한다.

---

## 3. Design Principles

- 데이터베이스는 **도메인 소유권 기반 설계(Domain Ownership Model)** 를 따른다.
- Application 레벨의 권한 검사는 신뢰하지 않는다.
- 모든 접근 제어는 **DB 레벨(RLS)** 에서 수행한다.
- 여러 앱이 동일 테이블을 사용하더라도,
  - 쓰기 권한은 역할(role)과 소유권에 따라 엄격히 제한된다.
- Schema 변경은 항상 migration을 통해 관리한다.

---

## 4. Authentication & Roles

인증 정보는 Supabase Auth를 사용하며,  
추가적인 역할 정보는 `profiles.role` 컬럼에 저장한다.

### Supported Roles

- `customer` : 일반 사용자
- `seller` : 판매자
- `administrator` : 관리자

### Authentication Rules

- Kend와 Kend-Seller는 **동일한 Auth 시스템**을 사용한다.
- 동일한 email/password 조합이라도
  - role이 다르면 **서로 다른 사용자로 취급**한다.
- 접근 가능한 테이블과 동작은 role에 의해 결정된다.

---

## 5. RLS Policy Principles (High-Level)

RLS 정책은 다음 원칙을 따른다.

- customer
  - 자신의 profile, children, orders 데이터만 접근 가능
- seller
  - 자신이 소유한 products, inventories만 관리 가능
- orders
  - customer / seller 모두 조회 가능
  - 수정 권한은 역할과 상태에 따라 제한
- administrator
  - 필요 시 모든 데이터 접근 가능

> 실제 RLS SQL 정책은 schema 또는 migration 파일에 정의한다.

### Views (Read Models)

- 일부 조회 시나리오에서는 **DB View** 를 사용한다.
- View는 다음 목적을 위해 사용된다.
  - 복잡한 join 로직의 재사용
  - 도메인 개념 단위의 조회 모델 제공
  - 조회 성능 및 쿼리 가독성 개선
- Kend 및 Kend-Seller 애플리케이션은
  - 필요에 따라 base table에 직접 접근할 수 있으며
  - 특정 조회 목적에서는 view를 사용한다.

Rules:

- View는 기본적으로 **read-only**로 사용한다.
- 데이터 생성/수정은 base table을 기준으로 한다.

---

## 6. Schema Source of Truth

- 모든 테이블 정의는 `/app/features/**/schema.ts` 파일이 기준이다.
- 이 문서는 schema를 복제하지 않는다.
- 컬럼 추가/수정/삭제는 반드시 schema → migration 흐름을 따른다.

---

## 7. Type Generation & Shared Types

- Supabase의 typegen 기능을 사용해
  데이터베이스 전체 스키마에 대한 TypeScript 타입을 생성한다. (위치: /database.types.ts)
- Supabase typegen으로 생성된 Database 타입은
  **Database를 기준으로 관리되는 공통 위치**에 저장된다.
- 생성된 타입은 두 Application(Kend, Kend-Seller)에서 공통으로 참조한다.
- 이를 통해
  - 서로 다른 App에서 작성된 schema라도
  - 전체 Database 구조에 대한 타입 일관성을 유지한다.
- 각 Application(Kend, Kend-Seller)은
  해당 타입을 참조하여 Database 타입 일관성을 유지한다.
- 타입 파일은 Application 내부 구현에 종속되지 않도록 관리한다.

Rules:

- Schema 변경이 Database 구조 변경의 출발점이다.
- Schema 변경 후 migration을 생성하고 실행한다.
- Migration이 적용된 이후 typegen을 갱신한다.
- Application 코드는 항상 최신 typegen 결과를 기준으로 한다.

**IMPORTANT: Database 변경 작업 순서**
1. `/app/features/**/schema.ts` 파일 수정
2. `npm run db:generate` - migration 파일 생성
3. `npm run db:migrate` - migration 실행
4. `npm run db:typegen` - TypeScript 타입 생성 (반드시 실행할 것!)

## 8. Notes for AI Assistants

- 실제 컬럼 정의는 항상 `/app/features/**/schema.ts` 를 우선 참고한다.
- 이 문서는 **의도(Intent)와 책임 경계(Boundary)** 를 설명하기 위한 것이다.
- Application 코드에서의 권한 분기는 신뢰하지 않는다.
- RLS가 최종 권한 판단자(Source of Authority)임을 전제로 한다.
