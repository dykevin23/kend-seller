import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * 도메인 테이블(domains)
 * id: 도메인 id(pk)
 * code: 도메인 코드
 * name: 도메인 명
 * use_yn: 사용유무
 */
export const domains = pgTable("domains", {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  use_yn: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const main_categories = pgTable("main_categories", {
  id: uuid().primaryKey().defaultRandom(),
  domain_id: uuid()
    .references(() => domains.id)
    .notNull(),
  code: text().notNull().unique(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const sub_categories = pgTable("sub_categories", {
  id: uuid().primaryKey().defaultRandom(),
  main_category_id: uuid()
    .references(() => main_categories.id, { onDelete: "cascade" })
    .notNull(),
  code: text().notNull(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const system_options = pgTable("system_options", {
  id: uuid().primaryKey().defaultRandom(),
  domain_id: uuid()
    .references(() => domains.id)
    .notNull(),
  code: text().notNull().unique(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const common_code_group = pgTable("common_code_group", {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull().unique(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const common_codes = pgTable("common_codes", {
  id: uuid().primaryKey().defaultRandom(),
  group_id: uuid().references(() => common_code_group.id, {
    onDelete: "cascade",
  }),
  code: text().notNull().unique(),
  name: text().notNull(),
  use_yn: text().notNull().default("Y"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

/**
 * 플랫폼 전역 설정 (싱글턴 — 항상 한 row만 존재)
 * free_shipping_threshold: 장바구니 총액이 이 값 이상이면 플랫폼이 배송비 부담
 *   (판매자별 무료배송 조건과 별개). 0이면 기능 off
 * commission_rate: 정산 수수료율(%, 정수). 정산 계산 배치가 이 값을 스냅샷으로
 *   settlement_items.commission_rate에 기록한다
 */
export const platform_settings = pgTable("platform_settings", {
  id: uuid().primaryKey().defaultRandom(),
  free_shipping_threshold: integer().notNull().default(0),
  commission_rate: integer().notNull().default(10),
  updated_at: timestamp().notNull().defaultNow(),
});

/**
 * 해시태그 마스터 테이블(hashtags)
 * id: 해시태그 id(pk)
 * name: 해시태그 이름 (unique, e.g. "키즈패션", "유아용품")
 */
export const hashtags = pgTable("hashtags", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull().unique(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
