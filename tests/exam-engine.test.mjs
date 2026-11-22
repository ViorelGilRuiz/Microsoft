import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReport, isAnswerCorrect, validateAnswer } from '../lib/exam-engine.ts';

const single = { id: 'single', type: 'single_choice', prompt: 'p', domain: 'cloud', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }] };
const multiple = { id: 'multiple', type: 'multiple_choice', prompt: 'p', domain: 'security', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }] };
const correction = (questionId) => ({ questionId, explanation: 'verified', concept: 'concept', whyExpected: 'expected', whyOthers: 'others', technicalDifference: 'difference', commonMistake: 'mistake', review: 'review', reference: { label: 'source', url: 'https://learn.microsoft.com' } });

test('valida selección única y rechaza duplicados', () => {
  assert.deepEqual(validateAnswer(single, 'a'), ['a']);
  assert.throws(() => validateAnswer(single, ['a', 'a']), /duplicadas/);
  assert.throws(() => validateAnswer(single, 'unknown'), /no válida/);
});

test('acepta selección múltiple sin duplicar opciones', () => {
  assert.deepEqual(validateAnswer(multiple, ['b', 'a']), ['a', 'b']);
  assert.throws(() => validateAnswer(multiple, ['b', 'a', 'b']), /duplicadas/);
  assert.equal(isAnswerCorrect(multiple, ['b', 'a'], ['a', 'b']), true);
});

test('calcula correctas, incorrectas, pendientes y dominios', () => {
  const report = calculateReport([single, multiple], { single: 'a', multiple: null }, { single: ['a'], multiple: ['a', 'b'] }, [correction('single'), correction('multiple')], 50);
  assert.equal(report.correct, 1);
  assert.equal(report.incorrect, 0);
  assert.equal(report.unanswered, 1);
  assert.equal(report.percentage, 50);
  assert.equal(report.status, 'passed');
  assert.equal(report.byDomain.security.percentage, 0);
});

test('no permite corrección sin contenido verificado', () => {
  assert.throws(() => calculateReport([single], { single: 'a' }, { single: ['a'] }, []), /protegida/);
});
