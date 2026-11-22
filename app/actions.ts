"use server";

// This is a single demonstration question, not the persistent exam engine.
export async function correctDemoAnswer(index: number) {
 const explanations = [
  "La escalabilidad permite ajustar la capacidad ante cambios de demanda.",
  "La latencia describe el tiempo de comunicación, no el ajuste de capacidad.",
  "La residencia se refiere a dónde se almacenan los datos.",
  "La gobernanza establece controles y políticas, pero no amplía por sí sola la capacidad."
 ];
 if (!Number.isInteger(index) || index < 0 || index >= explanations.length) throw new Error("Respuesta no válida");
 return { correct: index === 0, explanation: explanations[index], correctExplanation: index === 0 ? null : explanations[0] };
}
