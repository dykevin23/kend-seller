import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  DESCRIPTION_TYPES,
  TARGET_GENDER_TYPES,
  TARGET_AGE_TYPES,
  IMAGE_TYPES,
  SALES_STATUS,
  ISLAND_DELIVERY_TYPES,
  DELIVERY_METHOD_TYPES,
  BUNDLE_DELIVERY_TYPES,
  SHIPPING_FEE_TYPES,
  COURIER_COMPANIES,
} from "./constrants";
import { domains, system_options } from "../system/schema";
import { sellers, sellers_address } from "../seller/schema";

export const TargetGenderType = pgEnum(
  "target_gender_type",
  TARGET_GENDER_TYPES.map((type) => type.value) as [string, ...string[]]
);

export const TargetAgeType = pgEnum(
  "target_age_type",
  TARGET_AGE_TYPES.map((type) => type.value) as [string, ...string[]]
);

export const SalesStatus = pgEnum(
  "sales_status",
  SALES_STATUS.map((type) => type.value) as [string, ...string[]]
);

export const products = pgTable("products", {
  id: uuid().primaryKey().defaultRandom(),
  product_code: text().notNull().unique(), // PR00000001
  storage_folder: text().notNull(),
  name: text().notNull(),
  target_gender: TargetGenderType().default("UNISEX").notNull(),
  target_age: TargetAgeType().default("BABY").notNull(),
  domain_id: uuid().references(() => domains.id),
  main_category: text().notNull(),
  sub_category: text().notNull(),
  seller_id: uuid().references(() => sellers.id, {
    onDelete: "cascade",
  }),
  status: SalesStatus().notNull().default("REGISTERED"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const product_detail = pgTable("product_details", {
  id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().references(() => products.id, {
    onDelete: "cascade",
  }),
  brand: text(),
  maker: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const stockKeepings = pgTable("product_stock_keepings", {
  id: uuid().primaryKey().defaultRandom(),
  sku_code: text().notNull().unique(), // sku-1
  product_id: uuid().references(() => products.id, {
    onDelete: "cascade",
  }),
  options: jsonb().$type<Record<string, string>>(), // {"color": "빨강", "size": "M"}
  stock: integer().notNull().default(0),
  regular_price: integer().default(0),
  sale_price: integer().default(0),
  status: SalesStatus().notNull().default("PREPARE"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const product_options = pgTable("product_options", {
  id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().references(() => products.id, {
    onDelete: "cascade",
  }),
  system_option_id: uuid()
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
  id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().references(() => products.id, {
    onDelete: "cascade",
  }),
  sku_id: uuid().references(() => stockKeepings.id, {
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
  id: uuid().primaryKey().defaultRandom(),
  product_id: uuid().references(() => products.id, {
    onDelete: "cascade",
  }),
  type: DescriptionType().notNull().default("IMAGE"),
  content: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

// 제주/도서산간 배송여부
export const IslandDeliveryType = pgEnum(
  "island_delivery_type",
  ISLAND_DELIVERY_TYPES.map((type) => type.value) as [string, ...string[]]
);

// 배송방법
export const DeliveryMethodType = pgEnum(
  "delivery_method_type",
  DELIVERY_METHOD_TYPES.map((type) => type.value) as [string, ...string[]]
);

// 묶음배송
export const BundleDeliveryType = pgEnum(
  "bundle_delivery_type",
  BUNDLE_DELIVERY_TYPES.map((type) => type.value) as [string, ...string[]]
);

// 배송비 종류
export const ShippingFeeType = pgEnum(
  "shipping_fee_type",
  SHIPPING_FEE_TYPES.map((type) => type.value) as [string, ...string[]]
);

// 택배사
export const CourierCompany = pgEnum(
  "courier_company",
  COURIER_COMPANIES.map((type) => type.value) as [string, ...string[]]
);

// 상품 배송정보
export const product_deliveries = pgTable("product_deliveries", {
  id: uuid().primaryKey().defaultRandom(),
  product_id: uuid()
    .references(() => products.id, {
      onDelete: "cascade",
    })
    .notNull(),
  address_id: uuid()
    .references(() => sellers_address.id)
    .notNull(),
  island_delivery: IslandDeliveryType().notNull().default("AVAILABLE"),
  delivery_method: DeliveryMethodType().notNull().default("STANDARD"),
  bundle_delivery: BundleDeliveryType().notNull().default("AVAILABLE"),
  shipping_fee_type: ShippingFeeType().notNull().default("FREE"),
  shipping_fee: integer().notNull().default(0),
  free_shipping_condition: integer().default(0),
  shipping_days: integer().notNull().default(1),
  courier_company: CourierCompany().notNull().default("CJ"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

// 상품 반품/교환 정보
export const product_returns = pgTable("product_returns", {
  id: uuid().primaryKey().defaultRandom(),
  product_id: uuid()
    .references(() => products.id, {
      onDelete: "cascade",
    })
    .notNull(),
  address_id: uuid()
    .references(() => sellers_address.id)
    .notNull(),
  initial_shipping_fee: integer().notNull().default(0),
  return_shipping_fee: integer().notNull().default(0),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
