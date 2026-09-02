# KEND-SELLER 현재 상황 (Overview)

> 최종 업데이트: 2026-09-02 (정산 조회 화면 실사용 테스트 통과 + 정산 계좌 등록 구현)
> KEND-SELLER의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-seller.md](./changelog-seller.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-SELLER** — 판매자 관리자 웹. 판매자 로그인/업체 등록, 상품·옵션·배너 관리, 주문/배송 처리, 정산을 담당. 단일 Supabase DB를 kend와 공유.

---

## 🚦 지금 상황

> ← _seller에서 작업 시 갱신_

- **Phase 2.5 전체 완료** ✅ (2026-08-25): 구매확정·SLA·반품·플랫폼 무료배송·RTS 플래깅·문의하기까지 kend/kend-seller 양쪽 다 종료
- **Phase 3.5-2/3 정산 계산+조회 완료** ✅ (2026-09-02): `settlement_items`·`calculate_monthly_settlements()` SQL 함수+pg_cron·조회 화면(`/system/settlements`, admin 전용)까지 전부 구현 + **9/1 새벽 실제 배치 실행 성공 → 화면 실사용 테스트까지 통과**
- **Phase 3.5-1 정산 계좌 등록 구현** (2026-09-02, 테스트 대기): 판매자 등록 Step 1에 계좌 정보(은행/계좌번호/예금주명) 필수 입력 추가. 1원 인증(계좌 실명확인)은 벤더 미정 + 나중에 Toss 지급대행 KYC로 통합 예정이라 의도적으로 스킵 — 검증 없이 저장만
- **다음 확인(최우선)**: 정산 계좌 등록 폼(신규 가입 플로우) 클릭 테스트
- **스코프 밖으로 명시적으로 뺀 것**: Toss 지급대행 연동(EXT-7 대기, 계좌 1원 인증도 이때 통합), 엑셀 다운로드(의존성 필요, 백로그)

---

## ✅ 최근 완료

> ← _[changelog-seller.md](./changelog-seller.md)에서 핵심 항목 요약_

- 정산 계산 배치 + 조회 화면(P3.5-2/3) (2026-09-02): 9/1 실제 배치 실행 성공 + 화면 실사용 테스트 통과로 완료 확정
- 문의하기 처리 화면(P2.5-4) (2026-08-25): 판매자용(`/orders/inquiries`, seller_id 체인 필터)·admin용(`/system/inquiries`, order_item_id null 전용) 2종 완료. 실사용 테스트 완료(kend 구매자 화면까지 확인). 공용 Card 컴포넌트 테두리 버그도 함께 발견·수정

---

## 🔄 진행 중 / 대기 (active)

> ← _seller 작업 시 채울 것_ (현재 active/ 폴더 미생성 — 착수 시 structure-guide 규칙대로 생성)

- **플랫폼 무료배송 실사용 종단테스트**: admin이 실제 임계값 설정 → 실주문 생성 → `shipping_fee_bearer=PLATFORM` 기록 확인 (현재 `platform_settings` row 없어 사실상 off 상태)
- **정산 계좌 등록 폼 UI 테스트**: 신규 판매자 가입 플로우로 계좌 필드 입력/저장/읽기전용 노출 확인 필요 (테스트 계정 필요해 아직 못 함)

---

## 📋 다음 작업

> ← _seller 작업 시 채울 것_
- 정산 계좌 등록 폼(신규 가입 플로우) 실사용 테스트 — 최우선
- P3.5-3 잔여: 엑셀 다운로드(라이브러리 선정 필요)
- (Phase 3 관리보완) 재고관리 화면(`/products/stocks-keeping`), 상품 수정 기능, 승인 flow UX 보완 3건 + 관리자 직접 판매자 등록 — [todo/seller-approval-ux-followups.md](./todo/seller-approval-ux-followups.md)

---

## 🏗️ 시스템 아키텍처 스냅샷

- **kend** (웹): React Router SSR + WebView 본체 (구매자 앱)
- **kend-native** (앱): React Native + WebView (iOS/Android)
- **kend-seller** (판매자 관리자, 본 프로젝트): 웹 전용. 상품/주문/배송/정산 관리
- **단일 Supabase DB**: PostgreSQL + Drizzle ORM. product_*·admin_seller_*·seller_* 테이블 다수가 seller 관리
- **결제**: TossPayments (현재 차단, 테스트 키 대기 — kend 측)

> 상세: [core/application-architecture.md](./core/application-architecture.md)

---

## 📂 문서 구조

| 폴더 | 역할 |
|------|------|
| `core/` | 프로젝트 기반 reference (3개 프로젝트 공유) |
| `active/` | 현재 진행 중인 plan/todo |
| `todo/` | 아직 시작 전 plan |
| `archive/` | 완료/보류 |
| `changelog-{kend,seller,native}.md` | 시스템별 변경 이력 (수동 sync) |

> 규칙: [core/readme-structure-guide.md](./core/readme-structure-guide.md)

---

## 🚧 출시 전 반드시 필요한 작업 (체크리스트)

- [x] 판매자 기반 (로그인/인증, 업체 등록+승인 flow, 프로필/사업자 정보) — ✅ 완료 (2026-07-13)
- [x] 주문 관리 화면 (목록/상세, 상태 변경, 신규 주문 알림) — ✅ 완료 (2026-07-22, 대량 일괄처리는 미검증)
- [x] 배송 처리 (송장 입력, 스마트택배 추적 연동) — ✅ 완료 (2026-07-24)
- [x] 재고 차감 연동 — ✅ 완료 (2026-08-04, kend 차감/복원 트랜잭션 + seller 품절/재고부족 배지)
- [x] 배송비 설정 (무료/유료/조건부) — ✅ 완료 (상품등록 화면 기존 구현, kend-milestones P2-6 교차확인)
- [x] 정산 계산 배치 + 내역 조회 — ✅ 완료 (2026-09-02, 실배치+화면 테스트 통과)
- [ ] 정산 계좌 등록 — 구현됨, UI 테스트 대기 (1원 인증은 EXT-7 시 Toss KYC로 통합 예정, 의도적 미구현)

---

## 🔮 장기 로드맵 (출시 후)

> ← _seller 작업 시 채울 것_ (반품/환불 UI, CS 관리, 대시보드 등 편의 기능)
