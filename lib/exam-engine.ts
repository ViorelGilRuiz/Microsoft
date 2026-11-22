export type QuestionType = "single_choice" | "multiple_choice" | "scenario";
export type ExamOption = { id: string; text: string };
export type ExamQuestion = { id: string; type: QuestionType; prompt: string; scenario?: string; domain: string; options: ExamOption[] };
export type AnswerValue = string | string[] | null;
export type AnswerMap = Record<string, AnswerValue>;
export type QuestionCorrection = { questionId: string; selected: string[]; expected: string[]; correct: boolean; explanation: string; concept: string; whyExpected: string; whyOthers: string; technicalDifference: string; commonMistake: string; review: string; reference: { label: string; url: string } };
export type ExamReport = { status: "passed" | "not_passed"; total: number; answered: number; correct: number; incorrect: number; unanswered: number; percentage: number; passThreshold: number; byDomain: Record<string, { total: number; correct: number; percentage: number }>; corrections: QuestionCorrection[]; source: "current_session" };

function normalise(value: AnswerValue): string[] {
  if (value === null || value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.filter((item): item is string => typeof item === "string"))].sort();
}

export function validateAnswer(question: ExamQuestion, value: AnswerValue): string[] {
  if (Array.isArray(value) && new Set(value).size !== value.length) throw new Error("No se permiten respuestas duplicadas");
  const selected = normalise(value);
  const valid = new Set(question.options.map((option) => option.id));
  if ((question.type === "single_choice" || question.type === "scenario") && selected.length > 1) throw new Error("Una pregunta de selección única solo admite una opción");
  if (selected.some((id) => !valid.has(id))) throw new Error("La respuesta contiene una opción no válida");
  return selected;
}

export function isAnswerCorrect(question: ExamQuestion, value: AnswerValue, expected: string[]): boolean {
  return JSON.stringify(validateAnswer(question, value)) === JSON.stringify([...new Set(expected)].sort());
}

export function calculateReport(questions: ExamQuestion[], answers: AnswerMap, expected: Record<string, string[]>, corrections: Omit<QuestionCorrection, "selected" | "expected" | "correct">[], passThreshold = 70): ExamReport {
  if (!Number.isFinite(passThreshold) || passThreshold < 0 || passThreshold > 100) throw new Error("Umbral no válido");
  const details = questions.map((question) => {
    const selected = validateAnswer(question, answers[question.id] ?? null);
    const expectedOptions = [...new Set(expected[question.id] ?? [])].sort();
    const base = corrections.find((item) => item.questionId === question.id);
    if (!base) throw new Error("Falta la corrección protegida de una pregunta");
    return { ...base, selected, expected: expectedOptions, correct: JSON.stringify(selected) === JSON.stringify(expectedOptions) };
  });
  const correct = details.filter((item) => item.correct).length;
  const answered = details.filter((item) => item.selected.length > 0).length;
  const byDomain: ExamReport["byDomain"] = {};
  for (const question of questions) {
    const item = byDomain[question.domain] ?? { total: 0, correct: 0, percentage: 0 };
    item.total += 1;
    if (details.find((detail) => detail.questionId === question.id)?.correct) item.correct += 1;
    item.percentage = Math.round((item.correct / item.total) * 100);
    byDomain[question.domain] = item;
  }
  const percentage = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return { status: percentage >= passThreshold ? "passed" : "not_passed", total: questions.length, answered, correct, incorrect: answered - correct, unanswered: questions.length - answered, percentage, passThreshold, byDomain, corrections: details, source: "current_session" };
}

export function nextQuestionIndex(current: number, total: number): number {
  if (!Number.isInteger(current) || !Number.isInteger(total) || total < 1 || current < 0 || current >= total) throw new Error("Índice de pregunta no válido");
  return Math.min(current + 1, total - 1);
}
export function previousQuestionIndex(current: number, total: number): number {
  if (!Number.isInteger(current) || !Number.isInteger(total) || total < 1 || current < 0 || current >= total) throw new Error("Índice de pregunta no válido");
  return Math.max(current - 1, 0);
}
