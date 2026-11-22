"use server";

import { calculateReport, type AnswerMap, type ExamQuestion } from "../lib/exam-engine.ts";

const demoQuestion: ExamQuestion = {
 id: "demo-cloud-scalability",
 type: "single_choice",
 prompt: "Una tienda necesita aumentar temporalmente la capacidad de su aplicación durante una campaña. ¿Qué característica de la nube le ayuda directamente?",
 domain: "Conceptos de la nube",
 options: ["Escalabilidad", "Latencia de red", "Residencia de datos", "Gobernanza"].map((text, index) => ({ id: `option-${index}`, text })),
};

const demoCorrections = [{
 questionId: demoQuestion.id,
 explanation: "La escalabilidad permite ajustar la capacidad ante cambios de demanda.",
 concept: "Escalabilidad",
 whyExpected: "La escalabilidad permite añadir o retirar capacidad según la demanda temporal.",
 whyOthers: "La latencia mide tiempo de comunicación; la residencia indica dónde se almacenan los datos; la gobernanza define controles y políticas.",
 technicalDifference: "Escalar modifica la capacidad disponible; no describe velocidad de red, ubicación de datos ni control organizativo.",
 commonMistake: "Confundir una mayor capacidad con una menor latencia.",
 review: "Repasa escalabilidad, elasticidad y los modelos de servicio cloud.",
 reference: { label: "Microsoft Learn: describe cloud compute", url: "https://learn.microsoft.com/es-es/training/modules/describe-cloud-compute/" },
}];
const expected = { [demoQuestion.id]: ["option-0"] };

export async function submitDemoAttempt(answers: AnswerMap) {
 if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw new Error("Respuestas no válidas");
 const report = calculateReport([demoQuestion], answers, expected, demoCorrections, 70);
 // Expected option ids remain server-only; the client receives only the educational correction.
 return { ...report, corrections: report.corrections.map(({ expected: _protected, ...correction }) => correction) };
}

export async function correctDemoAnswer(index: number) {
 if (!Number.isInteger(index) || index < 0 || index >= demoQuestion.options.length) throw new Error("Respuesta no válida");
 const report = await submitDemoAttempt({ [demoQuestion.id]: `option-${index}` });
 const correction = report.corrections[0];
 const summary = `Sesión actual · ${report.correct} correcta · ${report.incorrect} incorrecta · ${report.unanswered} sin responder · ${report.percentage}% de aciertos · ${report.status === "passed" ? "Superado" : "No superado"} (umbral ${report.passThreshold}%).`;
 return { correct: correction.correct, explanation: `${summary} ${correction.correct ? correction.whyExpected : correction.whyOthers}`, correctExplanation: correction.correct ? null : correction.whyExpected };
}
