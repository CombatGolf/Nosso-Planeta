-- Ranking público do EcoQuest: somente posição, apelido e XP.
-- Executado no projeto bccivdjincstvwawavhw em 2026-11-05.
-- As tabelas continuam sem SELECT para anon e authenticated.

create or replace function ecoquest_private.ecoquest_public_leaderboard()
returns table(place bigint, nickname text, cloud_xp bigint)
language sql stable security definer set search_path = ''
as $$
  with totals as (
    select p.user_id, p.nickname,
      coalesce(sum(case c.mission
        when 1 then 15 when 2 then 20 when 3 then 15 when 4 then 20 else 0
      end), 0)::bigint as xp
    from public.ecoquest_profiles p
    left join public.ecoquest_completions c on c.user_id = p.user_id
    group by p.user_id, p.nickname
  )
  select row_number() over (order by t.xp desc, t.nickname, t.user_id) as place,
    t.nickname, t.xp as cloud_xp
  from totals t
  order by place
$$;

revoke all on function ecoquest_private.ecoquest_public_leaderboard() from public, anon, authenticated;
grant usage on schema ecoquest_private to anon;
grant execute on function ecoquest_private.ecoquest_public_leaderboard() to anon, authenticated;

create or replace function public.ecoquest_public_leaderboard()
returns table(place bigint, nickname text, cloud_xp bigint)
language sql stable security invoker set search_path = ''
as $$ select * from ecoquest_private.ecoquest_public_leaderboard() $$;

revoke all on function public.ecoquest_public_leaderboard() from public, anon, authenticated;
grant execute on function public.ecoquest_public_leaderboard() to anon, authenticated;
