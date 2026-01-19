import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
