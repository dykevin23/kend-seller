# KEND-SELLER 현재 상황 (Overview)

> 최종 업데이트: 2026-09-21 (CS관리(B-4) 실사용 테스트 중 문의/리뷰 관리 날짜 필터 즉시조회 버그 발견·수정. B-4 나머지 요소·판매자 정산화면은 여전히 테스트 대기 — Phase 3 잔여는 B-6 한 건)
> KEND-SELLER의 현재 상태 단일 대시보드. 개발 진행마다 갱신한다.
> 작성 표준 → [core/readme-structure-guide.md](./core/readme-structure-guide.md) §8 (방식 vs 내용)
> 완료 상세 → [changelog-seller.md](./changelog-seller.md) / 큰 계획 → [kend-roadmap-to-launch.md](./kend-roadmap-to-launch.md)

---

## 🎯 프로젝트 한 줄 요약

**KEND-SELLER** — 판매자 관리자 웹. 판매자 로그인/업체 등록, 상품·옵션·배너 관리, 주문/배송 처리, 정산을 담당. 단일 Supabase DB를 kend와 공유.

---

## 🚦 지금 상황

> ← _seller에서 작업 시 갱신_

- **Phase 3.5 정산 시스템 전체 완료** ✅ (2026-09-07 최종 확인): 계산 배치·조회 화면·계좌 등록에 이어 정산 상세 지급 계좌 노출까지 실사용 테스트 통과
- **Phase 3 — 상품수정(B-1)·재고관리(B-2)·리뷰관리 완료** ✅ (~2026-09-16): 상세는 changelog 참고
- **디자인 시스템 리뉴얼 완료** ✅ (2026-09-17): 흰/회색 기본 톤 → 색 토큰 전면 교체 + 좌측 사이드바 전환(role별 메뉴 분리) + Badge 컴포넌트로 상태표시 통일 + 테이블 Card 래핑 통일. 사용자가 여러 라운드에 걸쳐 화면 확인하며 버그 리포트 → 수정 진행
- **Phase 3 — Seller 대시보드(B-3) 완료** ✅ (2026-09-17): 판매자 대시보드(매출/주문 KPI+운영현황+매출추이+인기상품)와 관리자 대시보드(승인대기/정산대기/미답변문의 중심)를 role별로 분리 구현, 실사용 테스트 통과
- **판매자 정산 조회 화면(`/seller/settlements`) 구현됨(테스트 대기)** (2026-09-17): 목록+상세, 소유권 검증 포함 — 아직 실사용 화면 확인 전
- **Phase 3 — CS관리(B-4) 구현됨(테스트 대기)** (2026-09-17): 문의 관리 화면에 기간 필터·정렬·응답률 통계 추가. 담당자 배정은 스코프 제외. 실사용 테스트 중 날짜 필터 즉시조회 버그 발견·수정(2026-09-21) — 정렬/카테고리 필터 등 나머지는 아직 미검증
- **Phase 3 — 공지사항(B-5) 완료** ✅ (2026-09-17): `notices` 테이블(target: ALL/SELLER/BUYER) 신설, 관리자 CRUD(`/system/notices`) + 판매자 조회화면(`/seller/notices`, 대시보드 카드 포함), 실사용 테스트 통과. kend이 같은 테이블에서 BUYER 대상만 읽으면 됨 — kend 쪽 조회화면 연결은 kend에 알려줘야 진행 가능(아직 안 알림)
- **Phase 3 잔여는 B-6(교환처리) 한 건** — 정책 미정(재고없을때 처리/배송비 부담/횟수제한)으로 착수 불가
- **스코프 밖으로 명시적으로 뺀 것**: Toss 지급대행 연동(EXT-7 대기, 계좌 1원 인증도 이때 통합), 엑셀 다운로드(의존성 필요, 백로그)

---

## ✅ 최근 완료

> ← _[changelog-seller.md](./changelog-seller.md)에서 핵심 항목 요약_

- 문의/리뷰 관리 날짜 필터 버그 수정 (2026-09-21): 네이티브 date input 달력 내비게이션만 눌러도 즉시조회되던 문제 — 검색 버튼 도입으로 해결
- Seller 대시보드(Phase 3, B-3) (2026-09-17): 판매자/관리자 role별 분리 구현, 실사용 테스트 통과
- 디자인 시스템 리뉴얼 (2026-09-17): 색 토큰·사이드바·Badge·테이블 Card 통일, 실사용 테스트 통과
- CS관리(Phase 3, B-4) (2026-09-17): 문의 관리 기간필터/정렬/응답률 통계, 구현됨·테스트 대기
- 공지사항(Phase 3, B-5) (2026-09-17): notices 스키마+관리자 CRUD+판매자 조회화면, 실사용 테스트 통과

---

## 🔄 진행 중 / 대기 (active)

> ← _seller 작업 시 채울 것_ (현재 active/ 폴더 미생성 — 착수 시 structure-guide 규칙대로 생성)

- **플랫폼 무료배송 실사용 종단테스트**: admin이 실제 임계값 설정 → 실주문 생성 → `shipping_fee_bearer=PLATFORM` 기록 확인 (현재 `platform_settings` row 없어 사실상 off 상태)
- **판매자 정산 조회 화면(`/seller/settlements`) 실사용 검증**: 목록/상세/필터/소유권 검증 화면상 확인 필요 (구현만 완료, 실클릭 테스트 전)
- **CS관리(B-4) 실사용 검증**: 날짜 필터 버그는 발견·수정 완료(2026-09-21). 정렬/카테고리 필터/응답률 통계는 아직 화면상 확인 필요
- **공지사항(B-5) 완료를 kend에 알리기**: 테스트는 통과했으나 kend 쪽에 아직 미전달 — 알려야 kend `/myPage/notices` 조회화면 연결 진행 가능

---

## 📋 다음 작업

> ← _seller 작업 시 채울 것_
- P3.5-3 잔여: 엑셀 다운로드(라이브러리 선정 필요)
- **판매자 정산 조회 화면 / CS관리(B-4) 실사용 테스트** — 구현은 완료, 화면 확인 전
- **공지사항(B-5) 완료를 kend에 알리기** — kend 쪽 `/myPage/notices` 조회화면 연결 트리거
- **화면별 deep dive 보강** — 사용자 계획: "더 자세한 건 화면 하나하나 보며 deep하게 보강". 다음 세션에서 어느 화면부터 볼지 정할 것
- **교환 처리 화면(B-6)** — 정책 미정(재고없을때 처리/배송비 부담/횟수제한)으로 착수 불가. 이걸로 Phase 3 관리보완 전 항목 착수/구현 완료
- 승인 flow UX 보완 3건 + 관리자 직접 판매자 등록 — [todo/seller-approval-ux-followups.md](./todo/seller-approval-ux-followups.md)

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
- [x] 정산 (계산 배치 + 내역 조회 + 계좌 등록) — ✅ 완료 (2026-09-03, Phase 3.5 전체 테스트 통과. 1원 인증은 EXT-7 시 Toss KYC로 통합 예정, 의도적 미구현)

---

## 🔮 장기 로드맵 (출시 후)

> ← _seller 작업 시 채울 것_ (반품/환불 UI, CS 관리, 대시보드 등 편의 기능)
