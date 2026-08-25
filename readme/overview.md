# KEND-SELLER 현재 상황 (Overview)

> 최종 업데이트: 2026-08-25 (문의하기 처리 화면 완료로 Phase 2.5 전체 종료 — kend/kend-seller 양쪽 다)
> KEND-SELLER의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-seller.md](./changelog-seller.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-SELLER** — 판매자 관리자 웹. 판매자 로그인/업체 등록, 상품·옵션·배너 관리, 주문/배송 처리, 정산을 담당. 단일 Supabase DB를 kend와 공유.

---

## 🚦 지금 상황

> ← _seller에서 작업 시 갱신_

- **Phase 2.5 전체 완료** ✅: 구매확정·SLA 자동취소·반품(P2.5-3)·플랫폼 무료배송·RTS 플래깅(P2.5-6)에 이어 **문의하기(P2.5-4) 처리 화면까지 완료** — kend(접수 UI)·kend-seller(판매자/admin 답변 화면) 양쪽 다 끝나 Phase 2.5가 완전히 종료됨. 실사용 테스트(판매자 답변 → kend 구매자 화면 노출) 확인 완료
- **부수 발견**: 앱 전체가 공유하는 `Card` 컴포넌트의 테두리 클래스가 깨져 있던 버그(`border-1`/`border-1-muted` → 존재하지 않는 클래스) 발견·수정 — 모든 화면의 카드 시각에 영향
- **다음 착수(최우선)**: Phase 2.5가 끝나 이제 Phase 3(관리보완) 순번 — 재고관리 화면(`/products/stocks-keeping`), 상품 수정 기능 등 [todo/seller-approval-ux-followups.md](./todo/seller-approval-ux-followups.md) 참고

---

## ✅ 최근 완료

> ← _[changelog-seller.md](./changelog-seller.md)에서 핵심 항목 요약_

- 문의하기 처리 화면(P2.5-4) (2026-08-25): 판매자용(`/orders/inquiries`, seller_id 체인 필터)·admin용(`/system/inquiries`, order_item_id null 전용) 2종 완료. 실사용 테스트 완료(kend 구매자 화면까지 확인). 공용 Card 컴포넌트 테두리 버그도 함께 발견·수정
- RTS·장기미수령 기간기반 플래깅(P2.5-6) (2026-08-24): SweetTracker API에 반송 전용 코드 없음을 문서로 확인, 상태 자동전환 대신 기간기반 알림(배송중 7일 초과 시 상세 배너+목록 배지) 채택. 사용자 확인으로 테스트 완료, sync-tracking 배포까지 완료

---

## 🔄 진행 중 / 대기 (active)

> ← _seller 작업 시 채울 것_ (현재 active/ 폴더 미생성 — 착수 시 structure-guide 규칙대로 생성)

- **플랫폼 무료배송 실사용 종단테스트**: admin이 실제 임계값 설정 → 실주문 생성 → `shipping_fee_bearer=PLATFORM` 기록 확인 (현재 `platform_settings` row 없어 사실상 off 상태)

---

## 📋 다음 작업

> ← _seller 작업 시 채울 것_
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
- [ ] 정산 (구매확정 → 정산 계산 → 내역 조회) — Phase 3.5로 이동, 선행 작업(Phase 2.5) 진행 중

---

## 🔮 장기 로드맵 (출시 후)

> ← _seller 작업 시 채울 것_ (반품/환불 UI, CS 관리, 대시보드 등 편의 기능)
