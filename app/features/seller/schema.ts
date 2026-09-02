import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { domains, hashtags } from "../system/schema";
import { ADDRESS_TYPES, SELLER_STATUS } from "./constrants";
import { profiles } from "../users/external/profiles";

export const SellerStatus = pgEnum(
  "seller_status",
  SELLER_STATUS.map((status) => status.value) as [string, ...string[]]
);

/**
 * 판매자 테이블(sellers)
 * id: 판매자id(pk)
 * bizr_no: 사업자등록번호(Business Registration Number) 숫자10자리
 * name: 상호명
 * representative_name: 대표자명
 * zone_code: 사업장 우편번호
 * address: 사업장 기본주소
 * address_detail: 사업장 상세주소
 * business: 비즈니스 형태
 * domain_id: 대표 도메인
 * status: 승인 상태(PENDING/APPROVED/REJECTED)
 * rejection_reason: 반려 사유(REJECTED일 때만 사용)
 * bank_name/account_number/account_holder_name: 정산 계좌 정보(P3.5-1) — 신규 등록부터
 *   필수지만 기존 판매자는 값이 없을 수 있어 컬럼은 nullable. 1원 인증(계좌 실명확인)은
 *   아직 미구현 — Toss 지급대행(EXT-7) 붙을 때 그쪽 KYC로 한 번에 처리 예정이라 지금은
 *   검증 없이 입력값만 저장한다(2026-09-02 결정)
 */
export const sellers = pgTable("admin_sellers", {
  id: uuid().primaryKey().defaultRandom(),
  seller_code: text().notNull().unique(), // SL0001
  bizr_no: text().notNull(),
  name: text().notNull(),
  representative_name: text().notNull(),
  zone_code: text().notNull(),
  address: text().notNull(),
  address_detail: text().notNull(),
  business: text().notNull(),
  domain_id: uuid().references(() => domains.id),
  bank_name: text(),
  account_number: text(),
  account_holder_name: text(),
  status: SellerStatus().notNull().default("PENDING"),
  rejection_reason: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const seller_members = pgTable("admin_seller_members", {
  id: uuid().primaryKey().defaultRandom(),
  seller_id: uuid().references(() => sellers.id, {
    onDelete: "cascade",
  }),
  user_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const AdminAddressType = pgEnum(
  "admin_address_type",
  ADDRESS_TYPES.map((type) => type.value) as [string, ...string[]]
);

/**
 * 배송지/주소지 테이블(admin_seller_address)
 * id: 배송지id(pk)
 * seller_id: 판매자id
 * address_name: 주소명
 * zone_code: 우편번호
 * address: 기본주소
 * address_detail: 상세주소
 * address_type: 출고지/반품지 주소타입
 */
export const sellers_address = pgTable("admin_seller_address", {
  id: uuid().primaryKey().defaultRandom(),
  seller_id: uuid().references(() => sellers.id, {
    onDelete: "cascade",
  }),
  address_name: text().notNull(),
  zone_code: text().notNull(),
  address: text().notNull(),
  address_detail: text().notNull(),
  address_type: AdminAddressType().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

/**
 * 판매자 해시태그 연결 테이블(seller_hashtags)
 * seller_id: 판매자 id (FK → admin_sellers)
 * hashtag_id: 해시태그 id (FK → hashtags)
 */
export const seller_hashtags = pgTable(
  "seller_hashtags",
  {
    id: uuid().primaryKey().defaultRandom(),
    seller_id: uuid()
      .references(() => sellers.id, { onDelete: "cascade" })
      .notNull(),
    hashtag_id: uuid()
      .references(() => hashtags.id, { onDelete: "cascade" })
      .notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => [unique().on(table.seller_id, table.hashtag_id)]
);

/**
 * 판매자 배너 테이블(seller_banners)
 * id: 배너id(pk)
 * seller_id: 판매자id (FK → admin_sellers)
 * title: 배너 제목 (관리자 식별용, 사용자앱에 노출되지 않음)
 * image_url: 배너 이미지 URL (Supabase Storage 공개 URL)
 * display_order: 표시 순서 (스와이퍼 정렬용)
 * is_active: 활성 여부 (비활성 배너는 사용자앱에 노출되지 않음)
 */
export const seller_banners = pgTable("seller_banners", {
  id: uuid().primaryKey().defaultRandom(),
  seller_id: uuid()
    .references(() => sellers.id, { onDelete: "cascade" })
    .notNull(),
  title: text().notNull(),
  image_url: text().notNull(),
  display_order: integer().notNull().default(0),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
