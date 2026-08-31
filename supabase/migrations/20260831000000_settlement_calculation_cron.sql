-- 판매자 정산 계산 배치 (Phase 3.5)
--
-- 매월 1일 새벽, 지난달 구매확정분(delivery_items.purchase_confirmed_at)을 판매자별로
-- 집계해 settlement_items에 기록한다. (seller_id, period_start) unique 제약 + ON CONFLICT
-- DO NOTHING으로 재실행해도 안전(중복 생성 안 됨).
--
-- 계좌 미등록 판매자도 계산 대상에서 제외하지 않는다 — admin_sellers에 계좌 관련 컬럼
-- 자체가 아직 없어 그 판정은 이번 라운드 스코프 밖(화면에서 지급 가능 여부 표시 안 함).
--
-- 개발 중 확인은 크론 주기 변경 대신 `select calculate_monthly_settlements();`를
-- SQL Editor에서 직접 호출할 것.

create extension if not exists pg_cron with schema pg_catalog;

create or replace function calculate_monthly_settlements()
returns void as $$
declare
  v_period_start date := date_trunc('month', now() - interval '1 month')::date;
  v_period_end date := (date_trunc('month', now()) - interval '1 day')::date;
  v_commission_rate integer;
begin
  select commission_rate into v_commission_rate from platform_settings limit 1;
  if v_commission_rate is null then
    v_commission_rate := 10;
  end if;

  insert into settlement_items (
    seller_id, period_start, period_end,
    total_sales_amount, shipping_reimbursement,
    commission_rate, commission_amount, settlement_amount,
    status
  )
  select
    o.seller_id,
    v_period_start,
    v_period_end,
    sum(oi.sale_price * di.quantity)::integer as total_sales_amount,
    sum(case when oi.shipping_fee_bearer = 'PLATFORM' then oi.base_shipping_fee else 0 end)::integer as shipping_reimbursement,
    v_commission_rate,
    round(sum(oi.sale_price * di.quantity) * v_commission_rate / 100.0)::integer as commission_amount,
    (
      sum(oi.sale_price * di.quantity)
      + sum(case when oi.shipping_fee_bearer = 'PLATFORM' then oi.base_shipping_fee else 0 end)
      - round(sum(oi.sale_price * di.quantity) * v_commission_rate / 100.0)
    )::integer as settlement_amount,
    'pending'
  from delivery_items di
  join order_items oi on oi.id = di.order_item_id
  join orders o on o.id = oi.order_id
  where di.status = 'normal'
    and di.purchase_confirmed_at >= v_period_start
    and di.purchase_confirmed_at < (v_period_end + interval '1 day')
  group by o.seller_id
  on conflict (seller_id, period_start) do nothing;
end;
$$ language plpgsql;

select
  cron.schedule(
    'calculate-monthly-settlements',
    '0 1 1 * *', -- 매월 1일 새벽 1시
    $$ select calculate_monthly_settlements(); $$
  );
