import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import {
  DESCRIPTION_TYPES,
  GENDER_TYPES,
  IMAGE_TYPES,
  SALES_STATUS,
} from "./constrants";
import { domains, system_options } from "../system/schema";
import { sellers } from "../seller/schema";

export const GenderType = pgEnum(
  "gender_type",
  GENDER_TYPES.map((type) => type.value) as [string, ...string[]]
);

export const products = pgTable("products", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  storage_folder: text().notNull(),
  name: text().notNull(),
  gender: GenderType().default("MALE").notNull(),
  domain_id: bigint({ mode: "number" }).references(() => domains.id),
  main_category: text().notNull(),
  sub_category: text().notNull(),
  seller_id: bigint({ mode: "number" }).references(() => sellers.id, {
    onDelete: "cascade",
  }),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const product_detail = pgTable("product_details", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint({ mode: "number" }).references(() => products.id, {
    onDelete: "cascade",
  }),
  brand: text(),
  maker: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const SalesStatus = pgEnum(
  "sales_status",
  SALES_STATUS.map((type) => type.value) as [string, ...string[]]
);

export const stockKeepings = pgTable("product_stock_keepings", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  sku_code: text().notNull(),
  product_id: bigint({ mode: "number" }).references(() => products.id, {
    onDelete: "cascade",
  }),
  stock: integer().notNull().default(0),
  regular_price: integer().default(0),
  sale_price: integer().default(0),
  status: SalesStatus().notNull().default("PREPARE"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const product_options = pgTable("product_options", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint({ mode: "number" }).references(() => products.id, {
    onDelete: "cascade",
  }),
  system_option_id: bigint({ mode: "number" })
    .references(() => system_options.id)
    .notNull(),
  option: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const ImageType = pgEnum(
  "image_type",
  IMAGE_TYPES.map((type) => type.value) as [string, ...string[]]
);

export const product_images = pgTable("product_images", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint({ mode: "number" }).references(() => products.id, {
    onDelete: "cascade",
  }),
  sku_id: bigint({ mode: "number" }).references(() => stockKeepings.id, {
    onDelete: "cascade",
  }),
  type: ImageType().notNull().default("MAIN"),
  url: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const DescriptionType = pgEnum(
  "description_type",
  DESCRIPTION_TYPES.map((type) => type.value) as [string, ...string[]]
);

export const product_descriptions = pgTable("product_descriptions", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  product_id: bigint({ mode: "number" }).references(() => products.id, {
    onDelete: "cascade",
  }),
  type: DescriptionType().notNull().default("IMAGE"),
  content: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
