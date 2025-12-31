import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * 도메인 테이블(domains)
 * id: 도메인 id(pk)
 * code: 도메인 코드
 * name: 도메인 명
 * use_yn: 사용유무
 */
export const domains = pgTable("domains", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  code: text().notNull().unique(),
  name: text().notNull(),
  use_yn: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const main_categories = pgTable("main_categories", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  domain_id: bigint({ mode: "number" }).references(() => domains.id),
  code: text().notNull().unique(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const sub_categories = pgTable("sub_categories", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  main_category_code: bigint({ mode: "number" }).references(
    () => main_categories.id,
    { onDelete: "cascade" }
  ),
  code: text().notNull(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const system_options = pgTable("system_options", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  key: text().notNull().unique(),
  domain_id: bigint({ mode: "number" }).references(() => domains.id),
  code: text().notNull(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const common_code_group = pgTable("common_code_group", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  code: text().notNull().unique(),
  name: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const common_codes = pgTable("common_codes", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  group_code: bigint({ mode: "number" }).references(
    () => common_code_group.id,
    { onDelete: "cascade" }
  ),
  code: text().notNull().unique(),
  name: text().notNull(),
  use_yn: text().notNull().default("Y"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
