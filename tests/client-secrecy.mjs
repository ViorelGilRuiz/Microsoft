// Run against the local development server: node tests/client-secrecy.mjs
import assert from 'node:assert/strict';

const base = process.env.CERTIFYHUB_TEST_URL ?? 'http://localhost:3000';
const response = await fetch(base);
assert.equal(response.status, 200, 'The development server must return HTTP 200');
const html = await response.text();
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
assert.ok(scripts.length, 'Expected browser JavaScript assets');
const bodies = await Promise.all(scripts.map(async src => {
  const asset = await fetch(new URL(src.replaceAll('&amp;', '&'), base));
  assert.equal(asset.status, 200, `Cannot fetch browser asset ${src}`);
  return asset.text();
}));
const reserved = [
  'La escalabilidad permite ajustar la capacidad ante cambios de demanda.',
  'La latencia describe el tiempo de comunicación, no el ajuste de capacidad.',
];
for (const text of reserved) {
  assert.ok(!html.includes(text), 'An explanation appeared in initial HTML');
  assert.ok(bodies.every(body => !body.includes(text)), 'An explanation appeared in a browser script');
}
console.log(`Initial HTML and ${scripts.length} browser scripts do not contain the checked demo explanations.`);
