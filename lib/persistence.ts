import type { AnswerMap, ExamReport } from "./exam-engine.ts";

// Explicitly disabled until migrations, RLS and transactional functions are verified in a test instance.
export const PERSISTENCE_ENABLED = false;
export type AttemptRepository = { createAttempt: (questionIds: string[]) => Promise<{ id: string }>; recordAnswers: (attemptId: string, answers: AnswerMap) => Promise<void>; finishAttempt: (attemptId: string) => Promise<ExamReport>; getOwnResult: (attemptId: string) => Promise<ExamReport | null>; listOwnHistory: () => Promise<ExamReport[]>; resumeAttempt: (attemptId: string) => Promise<{ id: string; answers: AnswerMap }> };
function unavailable(): never { throw new Error("La persistencia está deshabilitada hasta verificar Supabase, permisos y RLS"); }
export const supabaseAttemptRepository: AttemptRepository = { createAttempt: async () => unavailable(), recordAnswers: async () => unavailable(), finishAttempt: async () => unavailable(), getOwnResult: async () => unavailable(), listOwnHistory: async () => unavailable(), resumeAttempt: async () => unavailable() };
