import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { domains, hashtags } from "../system/schema";
import { ADDRESS_TYPES } from "./constrants";
import { profiles } from "../users/external/profiles";

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
