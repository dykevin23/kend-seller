# KEND-SELLER 현재 상황 (Overview)

> 최종 업데이트: 2026-07-22 (P2-2 주문 관리 화면 완료 반영)
> KEND-SELLER의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-seller.md](./changelog-seller.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-SELLER** — 판매자 관리자 웹. 판매자 로그인/업체 등록, 상품·옵션·배너 관리, 주문/배송 처리, 정산을 담당. 단일 Supabase DB를 kend와 공유.

---

## 🚦 지금 상황

> ← _seller에서 작업 시 갱신_

- **P2-2 주문 관리 화면 완료**: 목록(필터/검색/일괄처리)·상세·상태변경(접수확인→배송준비→취소)·신규주문 배지까지 실제 계정으로 테스트 확인 완료 (대량 일괄처리만 테스트 데이터 부족으로 미검증)
- 다음은 **P2-3 배송 처리** — 착수 전 EXT-4 스마트택배 API 신청 여부 확인 필요

---

## ✅ 최근 완료

> ← _[changelog-seller.md](./changelog-seller.md)에서 핵심 항목 요약_

- 판매자 주문 관리 화면 (2026-07-22): 목록/상세/상태변경(화이트리스트 기반)/신규배지. 유령 주문(결제 미완료) 필터링 반영, 키워드검색 500 에러 수정
- 판매자 업체 등록 승인(approval) flow (2026-07-13): 승인 전 접근 차단, 대기/반려/승인 상태별 화면, 관리자 승인 화면(`/system/sellers`), 전역 로그아웃 버튼

---

## 🔄 진행 중 / 대기 (active)

> ← _seller 작업 시 채울 것_ (현재 active/ 폴더 미생성 — 착수 시 structure-guide 규칙대로 생성)

---

## 📋 다음 작업

> ← _seller 작업 시 채울 것_
- **P2-3 배송 처리** (다음 착수 후보): 배송사+송장번호 UI, 배송 추적 연동 — 선행: EXT-4 스마트택배 API 신청
- 이후 P2-4 재고 차감 → P2-6 배송비 설정 → P3 정산
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
- [ ] 배송 처리 (송장 입력, 스마트택배 추적 연동)
- [ ] 재고 차감 연동
- [ ] 배송비 설정 (무료/유료/조건부)
- [ ] 정산 (구매확정 → 정산 계산 → 내역 조회)

---

## 🔮 장기 로드맵 (출시 후)

> ← _seller 작업 시 채울 것_ (반품/환불 UI, CS 관리, 대시보드 등 편의 기능)
