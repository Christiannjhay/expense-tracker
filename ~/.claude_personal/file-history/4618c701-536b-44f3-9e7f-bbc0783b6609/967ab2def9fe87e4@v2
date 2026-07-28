-- handle_new_user is only meant to run as the auth.users insert trigger.
-- Postgres grants EXECUTE to PUBLIC by default on new functions, which
-- would otherwise expose it as a public RPC endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
