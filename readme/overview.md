# KEND-SELLER 현재 상황 (Overview)

> 최종 업데이트: 2026-08-06 (Phase 2 종료, Phase 2.5 착수 준비)
> KEND-SELLER의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-seller.md](./changelog-seller.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-SELLER** — 판매자 관리자 웹. 판매자 로그인/업체 등록, 상품·옵션·배너 관리, 주문/배송 처리, 정산을 담당. 단일 Supabase DB를 kend와 공유.

---

## 🚦 지금 상황

> ← _seller에서 작업 시 갱신_

- **Phase 2 종료 (kend-milestones 2026-08-04 갱신 확인)**: 재고차감/복원(P2-4) 포함 필수 항목 완료. 후속으로 **Phase 2.5(주문 라이프사이클 완결 — 구매확정/반품·교환·AS/문의/SLA/배송예외/플랫폼배송비)** 신설됨
- **Phase 2.5 착수 준비 중**: `orders.confirmed_at` 기록(발송 SLA 기산점) 완료 반영. `product_returns.return_window_days`는 실니즈 없어 kend과 협의 후 스킵(법정기간 상수 하드코딩으로 대체)
- **다음 착수 후보(병렬 가능)**: 플랫폼 조건부 배송비 admin 화면 / RTS·장기미수령 기간기반 플래깅(`sync-tracking` 수정)

---

## ✅ 최근 완료

> ← _[changelog-seller.md](./changelog-seller.md)에서 핵심 항목 요약_

- Phase 2.5 착수 준비 (2026-08-06): `orders.confirmed_at` 기록(발송 SLA 연동), kend Phase 2.5 스키마(반품사유·배송비부담주체·반송상태) 타입 반영
- 재고 배지 + 취소주문 노출 버그 수정 (2026-08-04): 품절/재고부족 배지, 화이트리스트→블랙리스트 필터 전환으로 취소건도 계속 조회되도록 수정

---

## 🔄 진행 중 / 대기 (active)

> ← _seller 작업 시 채울 것_ (현재 active/ 폴더 미생성 — 착수 시 structure-guide 규칙대로 생성)

- **Phase 2.5 병렬 작업 착수 예정**: 플랫폼 조건부 배송비 admin 화면, RTS/장기미수령 기간기반 플래깅(`sync-tracking` 수정) — 순서상 후자(1c)는 스마트택배 응답의 반송(RTS) 상태 표현 방식 확인이 선행 필요
- Group 3(반품/교환 승인·검수 화면, 문의처리 화면)는 kend의 구매확정 로직(P2.5-2) + 양쪽 스키마 완료 후 착수 — 아직 대기

---

## 📋 다음 작업

> ← _seller 작업 시 채울 것_
- **플랫폼 조건부 배송비 admin 화면** (Phase 2.5-5)
- **RTS/장기미수령 기간기반 플래깅** (Phase 2.5-6, `sync-tracking` 수정)
- (후순위, Phase 3 관리보완) 재고관리 화면(`/products/stocks-keeping`), 상품 수정 기능, 승인 flow UX 보완 3건 + 관리자 직접 판매자 등록 — [todo/seller-approval-ux-followups.md](./todo/seller-approval-ux-followups.md)

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
