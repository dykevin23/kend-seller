import { bigint, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { domains } from "../system/schema";
import { ADDRESS_TYPES } from "./constrants";

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
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  bizr_no: text().notNull(),
  name: text().notNull(),
  representative_name: text().notNull(),
  zone_code: text().notNull(),
  address: text().notNull(),
  address_detail: text().notNull(),
  business: text().notNull(),
  domain_id: bigint({ mode: "number" }).references(() => domains.id),
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
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  seller_id: bigint({ mode: "number" }).references(() => sellers.id, {
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
