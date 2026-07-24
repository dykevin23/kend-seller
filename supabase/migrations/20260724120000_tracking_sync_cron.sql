-- 스마트택배 배송상태 폴링 스케줄러 (sync-tracking Edge Function 주기 호출)
--
-- 사전 준비 (이 마이그레이션 적용 전, Supabase Dashboard SQL Editor에서 1회 직접 실행 —
-- 비밀값이라 마이그레이션 파일(git)에는 포함하지 않는다):
--   select vault.create_secret('<프로젝트의 service_role key 값>', 'service_role_key');

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'sync-tracking-status',
    '0 0 * * *', -- 하루 1회(자정). 개발 중 확인은 크론 주기 변경 대신
                 -- `supabase functions invoke sync-tracking`으로 수동 호출할 것.
                 -- 운영 필요 시 Dashboard > Database > Cron Jobs에서 주기 조정.
    $$
    select
      net.http_post(
        url := 'https://obbpfpdlqbyplrakclhh.supabase.co/functions/v1/sync-tracking',
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
          'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
      );
    $$
  );
