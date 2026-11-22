import test from 'node:test';
import assert from 'node:assert/strict';
import { correctDemoAnswer } from '../app/actions.ts';

test('corrige la opción correcta y explica un distractor', async () => {
 const correct = await correctDemoAnswer(0);
 const wrong = await correctDemoAnswer(1);
 assert.equal(correct.correct, true);
 assert.equal(correct.correctExplanation, null);
 assert.equal(wrong.correct, false);
 assert.match(wrong.explanation, /latencia/i);
 assert.match(wrong.correctExplanation, /escalabilidad/i);
});

test('rechaza opciones fuera de rango o inválidas', async () => {
 for (const input of [-1, 4, 1.5, NaN]) await assert.rejects(correctDemoAnswer(input));
});
