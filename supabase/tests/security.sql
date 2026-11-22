-- Run ONLY on a disposable Supabase test database after all migrations.
-- psql stops on the first failing assertion; every fixture is rolled back.
\set ON_ERROR_STOP on
begin;

insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'security-test-a@example.invalid'),
  ('10000000-0000-0000-0000-000000000002', 'security-test-b@example.invalid');
insert into public.profiles (id, display_name) values
  ('10000000-0000-0000-0000-000000000001', 'Security test A'),
  ('10000000-0000-0000-0000-000000000002', 'Security test B');
insert into public.certifications (id, code, title, official_url) values
  ('20000000-0000-0000-0000-000000000001', 'SECURITY-TEST', 'Security test', 'https://example.invalid');
insert into public.certification_versions (id, certification_id, label, source_url) values
  ('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'test', 'https://example.invalid');
insert into public.exam_domains (id, version_id, title) values
  ('20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'test');
insert into public.exam_objectives (id, domain_id, title) values
  ('20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'test');
insert into public.questions (id, domain_id, prompt, difficulty, source_url, editorial_status) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'published', 'basic', 'https://example.invalid', 'published'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'draft', 'basic', 'https://example.invalid', 'draft');
insert into public.question_options (id, question_id, option_text, sort_order) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'first', 1),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'second', 1);
insert into private.question_keys (question_id, correct_option_id, explanations) values
  ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '{}');
insert into public.quiz_attempts (id, user_id) values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002');
insert into public.quiz_attempt_questions (attempt_id, question_id, sort_order) values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1);

-- Referential integrity must reject an option belonging to another question.
do $$ begin
  begin
    insert into public.user_answers (attempt_id, question_id, option_id) values
      ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002');
    raise exception 'FAIL: accepted an option from a different question';
  exception when foreign_key_violation then null; end;
  begin
    insert into private.question_keys (question_id, correct_option_id, explanations) values
      ('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '{}');
    raise exception 'FAIL: accepted a key pointing to an option from another question';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.quiz_attempt_questions (attempt_id, question_id, sort_order) values
      ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 1);
    raise exception 'FAIL: accepted duplicate order in an attempt';
  exception when unique_violation then null; end;
  begin
    update public.quiz_attempts set status = 'submitted' where id = '50000000-0000-0000-0000-000000000001';
    raise exception 'FAIL: accepted submission without timestamp';
  exception when check_violation then null; end;
  begin
    update public.profiles set theme = 'invalid' where id = '10000000-0000-0000-0000-000000000001';
    raise exception 'FAIL: accepted invalid theme';
  exception when check_violation then null; end;
  begin
    insert into public.review_schedule (user_id, objective_id, due_at, interval_minutes) values
      ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', now(), -1);
    raise exception 'FAIL: accepted a negative review interval';
  exception when check_violation then null; end;
  begin
    insert into public.review_history (user_id, objective_id, rating, interval_minutes) values
      ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'invalid', 0);
    raise exception 'FAIL: accepted an invalid review rating';
  exception when check_violation then null; end;
end $$;

-- These roles must never be able to access the private key schema.
do $$ begin
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
      and c.relname in ('profiles','certifications','certification_versions','exam_domains','exam_objectives','lessons','lesson_objectives','flashcards','questions','question_options','question_objectives','quiz_attempts','quiz_attempt_questions','user_answers','user_lesson_progress','user_concept_mastery','review_schedule','review_history','study_plans','study_plan_sessions','user_achievements','content_revisions')
  ) then raise exception 'FAIL: an application table has RLS disabled'; end if;
  if exists (select 1 from pg_constraint c join pg_namespace n on n.oid = c.connamespace where n.nspname in ('public','private') and not c.convalidated) then
    raise exception 'FAIL: an application constraint is not validated';
  end if;
  if has_schema_privilege('anon', 'private', 'USAGE') or has_schema_privilege('authenticated', 'private', 'USAGE') then
    raise exception 'FAIL: a client role can use the private schema';
  end if;
  if has_table_privilege('anon', 'private.question_keys', 'SELECT') or has_table_privilege('authenticated', 'private.question_keys', 'SELECT') then
    raise exception 'FAIL: a client role can select the answer key';
  end if;
end $$;

set local role anon;
do $$ begin
  if (select count(*) from public.questions where id in ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002')) <> 0 then
    raise exception 'FAIL: anonymous role can read questions';
  end if;
  if (select count(*) from public.profiles where id in ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')) <> 0 then
    raise exception 'FAIL: anonymous role can read profiles';
  end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
do $$ declare changed integer; begin
  if (select count(*) from public.profiles where id in ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')) <> 1 then
    raise exception 'FAIL: user A profile isolation';
  end if;
  if (select count(*) from public.quiz_attempts where id in ('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002')) <> 1 then
    raise exception 'FAIL: user A attempt isolation';
  end if;
  if (select count(*) from public.questions where id in ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002')) <> 1 then
    raise exception 'FAIL: draft question visible or published question inaccessible';
  end if;
  update public.profiles set display_name = 'tampered' where id = '10000000-0000-0000-0000-000000000002';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'FAIL: user A changed user B profile'; end if;
  begin
    insert into public.quiz_attempts (user_id) values ('10000000-0000-0000-0000-000000000001');
    raise exception 'FAIL: client can create attempts before server API is enabled';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
do $$ begin
  if (select count(*) from public.profiles where id = '10000000-0000-0000-0000-000000000001') <> 0 or
     (select count(*) from public.quiz_attempts where id = '50000000-0000-0000-0000-000000000001') <> 0 then
    raise exception 'FAIL: user B can access user A data';
  end if;
  if (select count(*) from public.profiles where id = '10000000-0000-0000-0000-000000000002') <> 1 or
     (select count(*) from public.quiz_attempts where id = '50000000-0000-0000-0000-000000000002') <> 1 then
    raise exception 'FAIL: user B cannot access own data';
  end if;
end $$;
reset role;
rollback;
\echo 'Security checks passed; transaction rolled back.'
