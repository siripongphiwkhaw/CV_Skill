-- PDPA consent record, captured during registration.
--
-- Consent is collected before the account exists, and this project requires
-- email confirmation (so signUp returns no session). The client therefore
-- cannot write to cv_profiles directly at registration time — RLS needs
-- auth.uid(). Instead the client passes consent through signUp's
-- options.data, and the security-definer trigger below copies it across.

alter table public.cv_profiles
  add column pdpa_consent_at timestamptz,
  add column pdpa_consent_version text;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cv_profiles (id, pdpa_consent_at, pdpa_consent_version)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'pdpa_consent_at')::timestamptz,
    new.raw_user_meta_data ->> 'pdpa_consent_version'
  );
  return new;
end;
$$;
