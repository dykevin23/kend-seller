# KEND-SELLER 현재 상황 (Overview)

> 최종 업데이트: 2026-08-04 (P2-4 착수 — 재고 배지·취소버그 반영)
> KEND-SELLER의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-seller.md](./changelog-seller.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-SELLER** — 판매자 관리자 웹. 판매자 로그인/업체 등록, 상품·옵션·배너 관리, 주문/배송 처리, 정산을 담당. 단일 Supabase DB를 kend와 공유.

---

## 🚦 지금 상황

> ← _seller에서 작업 시 갱신_

- **P2-4 착수**: 품절/재고부족 배지 완료, 취소 주문 노출 버그 수정 완료. 재고관리(`/products/stocks-keeping`) 화면은 다음 착수 대상
- kend와 R&R 분담 합의됨(차감/복구 트랜잭션은 kend, 배지·화면은 seller) — 세부 진행상황은 아래 "진행 중/대기" 참고
- 판매자취소 시 환불 스코프(그룹 전체가 아닌 판매자 몫만) + 취소사유 캡처/구매자 노출은 kend와 정의 협의 중

---

## ✅ 최근 완료

> ← _[changelog-seller.md](./changelog-seller.md)에서 핵심 항목 요약_

- 재고 배지 + 취소주문 노출 버그 수정 (2026-08-04): 품절/재고부족 배지, 화이트리스트→블랙리스트 필터 전환으로 취소건도 계속 조회되도록 수정
- 배송 처리(스마트택배 연동) (2026-07-24): 배송사/송장번호 입력 UI, Edge Function+pg_cron 폴링으로 배송완료 자동 갱신. 실제 CJ대한통운 송장 2건으로 종단 테스트 완료

---

## 🔄 진행 중 / 대기 (active)

> ← _seller 작업 시 채울 것_ (현재 active/ 폴더 미생성 — 착수 시 structure-guide 규칙대로 생성)

- **kend 답변 대기**: changelog-kend.md 갱신(`handle_order_cancelled` 트리거·`expire-pending-orders` cron 미기록 상태) / 환불 Edge Function 진행상황 / `decrement_stock`·`expire_pending_orders` 함수의 실제 연결 여부(연결되면 `product_stock_keepings.stock`이 실제로 움직이기 시작함)
- **판매자취소 정의 협의 중** (kend와): 환불 스코프(그룹 전체 아닌 판매자 몫만 부분환불) + 취소사유 캡처·구매자 노출 방식
- **보류 — 다음 스코프 끝나면 논의**: 환불신청/교환신청 기능 누락 가능성 검토 (P2-9 반품/환불 UI [선택]과 별개로 제기됨)

---

## 📋 다음 작업

> ← _seller 작업 시 채울 것_
- **재고관리 화면** (`/products/stocks-keeping`, P2-4 후속): SKU별 재고 조회+수정
- 이후 P2-6 배송비 설정 → P3 정산
- (후순위) 승인 flow UX 보완 3건 + 관리자 직접 판매자 등록 — [todo/seller-approval-ux-followups.md](./todo/seller-approval-ux-followups.md)

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
- [ ] 재고 차감 연동
- [ ] 배송비 설정 (무료/유료/조건부)
- [ ] 정산 (구매확정 → 정산 계산 → 내역 조회)

---

## 🔮 장기 로드맵 (출시 후)

> ← _seller 작업 시 채울 것_ (반품/환불 UI, CS 관리, 대시보드 등 편의 기능)
