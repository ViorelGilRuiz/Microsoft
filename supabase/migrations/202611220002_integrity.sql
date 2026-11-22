-- Integrity improvements; safe to apply after the initial migration.
begin;
alter table public.question_options add constraint question_options_question_id_id_unique unique (question_id, id);
alter table private.question_keys add constraint key_option_matches_question foreign key (question_id, correct_option_id) references public.question_options (question_id, id);
alter table public.user_answers add constraint answer_option_matches_question foreign key (question_id, option_id) references public.question_options (question_id, id);
alter table public.quiz_attempt_questions add constraint attempt_question_order_unique unique (attempt_id, sort_order);
alter table public.quiz_attempts add constraint attempt_status_timestamp_consistent check ((status = 'in_progress' and submitted_at is null) or (status = 'submitted' and submitted_at is not null));
alter table public.review_schedule add constraint review_interval_nonnegative check (interval_minutes >= 0), add constraint review_attempts_nonnegative check (attempts >= 0);
create table public.review_history (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 objective_id uuid not null references public.exam_objectives(id) on delete cascade,
 reviewed_at timestamptz not null default now(),
 rating text not null check (rating in ('again','hard','good','easy')),
 question_id uuid references public.questions(id),
 interval_minutes integer not null check (interval_minutes >= 0)
);
create index review_history_user_objective_time_idx on public.review_history(user_id,objective_id,reviewed_at desc);
alter table public.review_history enable row level security;
create policy read_own_review_history on public.review_history for select to authenticated using (user_id = auth.uid());
-- Writing review history and calculating mastery will be server-controlled.
revoke all on all tables in schema private from public, anon, authenticated;
commit;
