-- sync-tracking 크론을 새 API 키 방식으로 재등록 (20260724120000_tracking_sync_cron 대체)
--
-- 바뀐 점
-- - 인증: Authorization: Bearer <legacy service_role JWT> → apikey: <sb_secret_ 키>
--   (새 키는 JWT가 아니라 apikey 헤더로 보내고, 함수가 코드에서 직접 검사한다)
-- - 주소: dev 프로젝트 URL 하드코딩 → Vault의 project_url
--   → 같은 SQL을 dev·prod 어디에 적용해도 그 프로젝트 자신의 함수를 호출한다
--
-- 사전 준비 (적용 전, 해당 프로젝트의 SQL Editor에서 1회 직접 실행 — 비밀값이라 git에 넣지 않는다):
--   select vault.create_secret('<그 프로젝트의 sb_secret_ 키>', 'secret_key');
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
-- 예전 Vault 항목 service_role_key는 legacy 키 비활성화 후 삭제해도 된다.

select cron.unschedule('sync-tracking-status')
 where exists (select 1 from cron.job where jobname = 'sync-tracking-status');

select
  cron.schedule(
    'sync-tracking-status',
    '0 0 * * *', -- 하루 1회(자정). 개발 중 확인은 `supabase functions invoke sync-tracking`으로 수동 호출
    $$
    select
      net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
               || '/functions/v1/sync-tracking',
        headers := jsonb_build_object(
          'apikey',
          (select decrypted_secret from vault.decrypted_secrets where name = 'secret_key'),
          'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
      );
    $$
  );
