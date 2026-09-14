# Phase 3 (판매자 관리보완) — 전체 현황 + kend-seller 인계

> 2026-09-10 작성 (kend에서 정리)
> 원본 트래커: [kend-milestones.md](../kend-milestones.md) `Phase 3 — 판매자 관리보완` 섹션
> **§A** = Phase 3 전체 항목 현황(소유별). **§B 이후** = kend-seller 소유 항목 상세 인계.
> kend 단독 항목은 표에만 넣고 상세는 생략(kend가 처리).

---

## 배경

Phase 2.5(주문 라이프사이클)·Phase 3.5(정산)가 종료되면서, 남은 "판매자 관리 편의기능"이 Phase 3으로 모였다.
대부분 **드롭 가능한 낮은 우선순위**지만, 아래 두 개는 성격이 다르다:

- **공지사항 스키마** — kend 조회 화면을 막고 있음 (kend-seller 선행 필요)
- **교환 처리 화면** — 드롭 불가 핵심 거래 기능 (단, 정책 미정으로 착수 불가)

## 소유권 원칙 (재확인)

> 이 프로젝트의 기존 원칙: **실제로 그 테이블에 read/write 하는 앱이 스키마를 소유**한다.
> `products` / `product_stock_keepings` / `notices` 등 판매자·관리자 도메인 테이블은 kend-seller 소유.
> kend는 조회만 한다.

---

## §A. Phase 3 전체 항목 현황

| 항목 | 소유 | 상태 | 비고 |
|---|---|---|---|
| **상품 수정 기능** | kend-seller | 미착수 🔴 | 등록 후 수정 불가. 실운영 전 필수 → §B-1 |
| **공지사항 스키마 + admin CRUD** | kend-seller → kend | 블록 🟡 | kend 조회화면을 막고 있음 → §B-5 |
| **교환(exchange)** | kend + kend-seller | 정책 대기 ⚠️ | 드롭 불가 핵심 거래기능. 정책 미정으로 착수 불가 → §B-6 |
| 판매자 수동 재고 조정 ("Stocks Keeping") | kend-seller | 미착수 (죽은 링크) | SKU별 재고 조회+수정 → §B-2 |
| Seller 대시보드 (판매 통계) | kend-seller | 미착수 | 구 P2-8 잔여 → §B-3 |
| CS관리 운영기능 (필터/담당자/통계) | kend-seller | 미착수 | 문의 코어 위 레이어 → §B-4 |
| 리뷰 관리 (답변/통계/필터) | kend-seller | 🔄 진행 중 | kend 쪽 완료. → §B-7 |
| 상품 카테고리/태그 필터 + 일괄관리 | kend(검색화면) + kend-seller(일괄관리) | 미착수 | 구 P2-7 잔여 |
| 최근 본 상품 | **kend** | 미착수 | `recent-products-page.tsx` 정적 스텁, 열람이력 로직 없음 |
| 상품 사이즈표 가짜 데이터 | **kend** | 미착수 | 고정 사이즈표(12M/24M/36M), 스키마에 사이즈 데이터 없음 |
| 데이터 신선도 / 캐싱 정책 | **kend + kend-native** | 로드맵 확정, 미착수 | clientLoader 영구캐시 → 삭제. [data-freshness-caching-policy.md](./data-freshness-caching-policy.md) |
| 알림 설정 저장 안 됨 | **kend + kend-native** | 블록 (푸시 인프라 대기) | DB 컬럼 없음, 토글이 로컬 state만 |
| "현재 위치로 주소 찾기" 버튼 | **kend-native** 선행 | 블록 | 위치 권한/좌표 브릿지 필요 |
| 팔로워 수 미연동 | **kend** | 보류 (드롭 후보) | `followerCount: 0` 하드코딩, 팔로우 개념 자체 재검토 중 |
| ~~리뷰 작성/조회~~ | kend | ✅ 완료 (09-07) | |
| ~~찜 목록 "스토어" 탭~~ | kend | ✅ 완료 (09-02) | |
| ~~마이페이지 죽은 링크 정리~~ | kend | ✅ 완료 (09-02) | |
| ~~상품 평점/만족도 가짜 데이터~~ | kend | ✅ 완료 (09-02) | 평점·리뷰수 실데이터 교체 |

**요약**: kend-seller 소유 = 6개(상품수정·재고조정·대시보드·CS관리·공지스키마·교환절반) + 리뷰관리 진행 중. 나머지는 kend / kend-native.

---

## §B. kend-seller 소유 항목 상세

### B-1. 상품 수정 기능 — 없음 🔴 (우선순위 상향 권고)

**현상**
- 상품 등록(`/products/submit`) 후 **이름·가격·재고·옵션·이미지 등 무엇도 수정할 수 없음.** 수정 화면·라우트 자체가 없다.
- `product-detail-page.tsx`는 조회 전용.

**관련: 2026-09-08 kend 조사 중 확인된 상품 노출 문제**
- 신규 셀러(coucou/SL0004)가 등록한 상품이 kend에 안 뜨는 문제를 조사 → **상품 `status`가 `REGISTERED`에 멈춰 있었던 게 원인**.
- kend는 모든 목록 쿼리에서 `status = 'REGISTERED'`를 제외한다. 판매하려면 `SALE`(또는 최소 `PREPARE`)로 전환돼야 함.
- `submit-product-page.tsx`는 **SKU는 `PREPARE`로 명시 생성하면서 `products.status`는 값을 안 넘겨 기본값 `REGISTERED`가 됨** → 레벨 불일치.
- 상태 전환은 `product-list-page.tsx`의 일괄 상태변경 드롭다운(`updateProductsStatus`)이 유일한 경로인데, 신규 셀러는 이 절차를 안내받지 못함.
- ※ 사용자가 등록 로직 버그는 이미 수정함. 다만 아래 두 가지는 별도 확인 필요:
  1. 등록 완료 시 `products.status`를 `PREPARE`로 명시 생성해 SKU와 레벨 맞출지 (의도된 2단계 설계인지 확인)
  2. 등록 후 "판매 시작하려면 상태를 판매중으로 전환하세요" 안내를 등록 완료 화면/목록에 노출할지

**요청 작업**
- 상품 수정 화면 신설 (`/products/:id/edit` 등). 최소 범위: 이름, 가격(SKU별 regular/sale), 재고, 판매상태. 이미지·옵션 수정은 2차.
- 수정 시 kend 캐시 무관(kend는 이제 항상 최신 조회 — [data-freshness-caching-policy.md](./data-freshness-caching-policy.md) 참고).

**kend 영향**: 상품 정보가 잘못 등록되면 현재는 삭제 후 재등록밖에 방법이 없음. 실운영 시작 전 필요.

---

### B-2. 판매자 수동 재고 조정 화면 ("Stocks Keeping")

**현상**
- `navigation.tsx`에 `Stocks Keeping` → `/products/stocks-keeping` 메뉴가 있으나 **라우트 미구현(죽은 링크)**.
- 재고 0 도달 시 상태를 자동 갱신하는 주체가 없음 (kend-seller changelog 2026-07-27 P2-4 항목 참고 — 배지는 `total_stock` 직접 계산으로 표시 중).

**요청 작업**
- SKU별 재고 조회 + 수동 증감 화면. `product_stock_keepings.stock` 직접 수정.
- 재고 변경 이력이 필요한지 판단 (정산·CS 대비). 불필요하면 단순 update.

**kend 영향**: 낮음. kend는 조회 시점 `stock` 값을 그대로 씀.

---

### B-3. Seller 대시보드 (판매 통계)

**현상**: 통계/대시보드 화면 없음 (`navigation.tsx`에 메뉴 자체 없음). 구 P2-8 잔여.

**요청 작업**
- 기간별 매출·주문건수·인기상품 등 기본 지표. 데이터 원천은 `orders`/`order_items`/`delivery_items` (본인 `seller_id` 필터).
- 정산 화면(`/system/settlements`, admin 전용)과 다름 — 이건 판매자 본인용.

**kend 영향**: 없음.

---

### B-4. CS관리 운영기능

**현상**: 문의하기 코어(P2.5-4)는 kend·kend-seller·admin 3면 모두 완료. 그 위에 얹는 **운영 레이어**가 미구현.

**요청 작업**
- 판매자 문의 목록(`/orders/inquiries`)에 필터링(기간/카테고리/상태), 정렬, 미답변 하이라이트.
- (선택) 담당자 배정, 응답률 통계.

**kend 영향**: 없음. kend는 단일 질문+단일 답변 조회만.

---

### B-5. 공지사항 스키마 + admin CRUD 🟡 (kend를 막고 있음)

**현상**
- `notices` 테이블 자체가 없음. kend `/myPage/notices` 화면은 항상 빈 상태.
- 문의하기(P2.5-4)와 동일한 소유권 구조: **kend-seller(=admin)가 스키마 + CRUD 화면, kend는 조회만.**

**요청 작업**
- `notices` 테이블 (제목/본문/게시일/노출여부 정도). 마이그레이션은 kend-seller에서.
- admin 공지 CRUD 화면 (`/system/notices` 등, 기존 `admin-layout` 재사용).
- 완료되면 kend에 알려주기 → kend가 조회 화면 연결 (반나절).

**kend 영향**: **kend-seller 작업 전까지 kend 착수 불가.**

---

### B-6. 교환(exchange) 처리 화면 ⚠️ (드롭 불가, 정책 선행)

**현상**
- 반품(P2.5-3)은 kend(신청·환불)·kend-seller(4단계 승인/검수) 양쪽 완료. **교환은 미착수.**
- 개발이 밀린 게 아니라 **정책이 안 정해져서 착수 불가**:
  - 교환할 옵션의 재고가 없을 때 처리 (환불 전환? 대기?)
  - 교환 배송비 부담 주체 (사유별)
  - 교환 횟수 제한
  - 부분 교환 (한 주문 여러 상품 중 일부)
- kend-seller changelog 2026-08-04, kend-milestones Phase 3 `⚠️ 교환` 항목 참고.

**요청 작업**: 정책 결정 후 착수. 반품 4단계 승인 플로우(`getSellerReturnRequests` 등) 재사용 가능성 높음.

**kend 영향**: kend도 교환 신청 화면 미착수 상태. **양쪽 다 정책 대기.**

---

### B-7. 리뷰 관리 — 진행 중 (참고용, 인계 아님)

- kend 쪽(작성/조회/이미지/`seller_reply` 스키마) 전부 완료·실사용 테스트 통과 (2026-09-07).
- kend-seller가 답변 작성·통계·날짜검색·미답변 필터 화면 **진행 중**.
- kend 추가 작업 없음. 완료되면 kend-seller changelog에 기록.

---

## §C. 우선순위 제안 (kend 관점, kend-seller 항목 한정)

| 순위 | 항목 | 이유 |
|---|---|---|
| 1 | **상품 수정 기능** (B-1) | 실운영 전 필수. 잘못 등록 시 복구 수단이 없음 |
| 2 | **공지사항 스키마** (B-5) | kend 화면을 막고 있음. 작업량 작음 |
| 3 | 교환 (B-6) | 드롭 불가지만 정책 결정이 선행 — 정책부터 |
| 4 | 재고 조정 (B-2) | 실운영 중 필요해짐 |
| 5 | CS관리 운영 (B-4), 대시보드 (B-3) | 드롭 가능, 출시 후로 이연 가능 |

---

## §D. 인계 방법

- 이 파일은 kend `readme/todo/`에 있고 **자동 sync 대상 아님** (sync는 milestones/roadmap/core/changelog만).
- kend-seller 팀에 이 파일 내용을 직접 전달하거나, kend-seller repo에 복사할 것.
- 진행 상황은 kend-seller changelog에 기록하면 kend가 sync로 받아본다.
