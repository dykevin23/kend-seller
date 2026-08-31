import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sellers } from "../seller/schema";
import { SETTLEMENT_STATUS } from "./constrants";

export const SettlementStatus = pgEnum(
  "settlement_status",
  SETTLEMENT_STATUS.map((status) => status.value) as [string, ...string[]]
);

/**
 * 판매자 정산 내역 (settlement_items)
 * seller_id + period_start 조합으로 월별 1건만 존재(재실행 안전, 중복 생성 방지)
 * 원본 명세는 별도 저장하지 않고, 조회 시 delivery_items를 같은 기간·판매자
 * 조건으로 재조회해서 구성한다(정규화, 중복 저장 방지)
 * commission_rate: 계산 시점의 platform_settings.commission_rate 스냅샷
 * shipping_reimbursement: shipping_fee_bearer='PLATFORM' 건의 base_shipping_fee 합계 보전
 */
export const settlement_items = pgTable(
  "settlement_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    seller_id: uuid()
      .references(() => sellers.id)
      .notNull(),
    period_start: timestamp().notNull(),
    period_end: timestamp().notNull(),
    total_sales_amount: integer().notNull(),
    shipping_reimbursement: integer().notNull().default(0),
    commission_rate: integer().notNull(),
    commission_amount: integer().notNull(),
    settlement_amount: integer().notNull(),
    status: SettlementStatus().notNull().default("pending"),
    paid_at: timestamp(),
    created_at: timestamp().notNull().defaultNow(),
  },
  (table) => [unique().on(table.seller_id, table.period_start)]
);
