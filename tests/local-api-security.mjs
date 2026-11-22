// Local development only. Credentials are read from environment and never printed.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.CERTIFYHUB_LOCAL_API_URL;
const anonKey = process.env.CERTIFYHUB_LOCAL_ANON_KEY;
const serviceKey = process.env.CERTIFYHUB_LOCAL_SERVICE_KEY;
assert.ok(url && anonKey && serviceKey, 'Local Supabase test credentials are required');
const parsed = new URL(url);
assert.ok(['127.0.0.1', 'localhost', '::1', '[::1]'].includes(parsed.hostname), 'This test refuses non-local endpoints');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, serviceKey, options);
const anonymous = createClient(url, anonKey, options);
const created = [];
const password = `${randomUUID()}aA1!`;

try {
  const clients = [];
  for (const label of ['a', 'b']) {
    const email = `rls-${label}-${randomUUID()}@example.invalid`;
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ifError(error);
    assert.ok(data.user?.id);
    created.push(data.user.id);
    const client = createClient(url, anonKey, options);
    const login = await client.auth.signInWithPassword({ email, password });
    assert.ifError(login.error);
    const profile = await client.from('profiles').insert({ id: data.user.id, display_name: `API test ${label}` });
    assert.ifError(profile.error);
    clients.push(client);
  }

  for (let i = 0; i < clients.length; i++) {
    const own = await clients[i].from('profiles').select('id').eq('id', created[i]);
    assert.ifError(own.error);
    assert.equal(own.data.length, 1, 'User can read their own profile');
    const other = await clients[i].from('profiles').select('id').eq('id', created[1 - i]);
    assert.ifError(other.error);
    assert.equal(other.data.length, 0, 'User cannot read the other profile');
    const update = await clients[i].from('profiles').update({ display_name: 'unauthorized' }).eq('id', created[1 - i]).select('id');
    assert.ifError(update.error);
    assert.equal(update.data.length, 0, 'User cannot update the other profile');
    const privateKeys = await clients[i].schema('private').from('question_keys').select('*');
    assert.ok(privateKeys.error, 'Answer key schema must not be exposed to authenticated API clients');
    const attempt = await clients[i].from('quiz_attempts').insert({ user_id: created[i] });
    assert.ok(attempt.error, 'Direct attempt creation must remain disabled');
  }
  const anonProfiles = await anonymous.from('profiles').select('id').in('id', created);
  assert.ok(anonProfiles.error || anonProfiles.data.length === 0, 'Anonymous clients cannot read profiles');
  const anonQuestions = await anonymous.from('questions').select('id');
  assert.ok(anonQuestions.error || anonQuestions.data.length === 0, 'Anonymous clients cannot read questions');
  const anonKeys = await anonymous.schema('private').from('question_keys').select('*');
  assert.ok(anonKeys.error, 'Answer key schema must not be exposed anonymously');
  console.log('Local API security checks passed for two authenticated users and anon.');
} finally {
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) { console.error(`Failed to remove a user created by this test: ${id}`); process.exitCode = 1; }
  }
}
