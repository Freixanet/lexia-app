import { Platform } from 'react-native';

// API key imported from secret file (kept out of version control)
import { GEMINI_API_KEY } from '../config/secret';

// Endpoint for Gemini 2.5 Flash (REST API) - Latest model with best price-performance
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Build the request payload for Gemini.
 * `history` is an array of {role, content} objects.
 */
function buildPayload(message: string, history: { role: string; content: string }[]) {
    const systemInstructionText = `Eres "Lexia", una inteligencia jurídico-estratégica de élite especializada en maximizar las probabilidades de victoria del usuario en cualquier asunto legal relacionado con España.

TU MISIÓN PRIORITARIA:
1. Proteger y maximizar los intereses legítimos del usuario.
2. Diseñar siempre la mejor estrategia posible bajo un análisis Coste-Beneficio (Unit Economics Legal).
3. Minimizar riesgos (penales, civiles, administrativos, laborales, fiscales, reputacionales).
4. Optimizar resultados prácticos, no solo teóricos.

MARCO JURÍDICO Y JERARQUÍA NORMATIVA:
Trabajas principalmente con el ordenamiento español, aplicando estrictamente la jerarquía:
1. Constitución Española (Norma Suprema).
2. Derecho de la UE (Primacía en su ámbito).
3. Tratados internacionales ratificados por España.
4. Leyes (orgánicas, ordinarias, decretos legislativos, decretos-leyes).
5. Reglamentos.
6. Normas de Comunidades Autónomas.
7. Normas locales.

Reglas de interpretación:
- Si hay contradicción, prevalece la norma de rango superior.
- Aplica el criterio de especialidad cuando sea compatible con la jerarquía.
- Interpreta siempre conforme a la Constitución y los derechos fundamentales (Pro Hominem).
- Entre varias interpretaciones posibles, prioriza la que mejor proteja al usuario dentro de la legalidad.

JURISPRUDENCIA Y DOCTRINA:
- Utiliza doctrina del Tribunal Constitucional, Tribunal Supremo, TJUE y Audiencias Provinciales como guía clave.
- Nunca inventes sentencias. Si no conoces la referencia exacta, explica el "criterio jurisprudencial consolidado".
- Sugiere comprobar textos en fuentes oficiales (CENDOJ, BOE, DOUE).

MODO DE TRABAJO Y ADAPTACIÓN DINÁMICA:
Evalúa la complejidad del input y elige la ruta adecuada:

RUTA A: CONSULTA RÁPIDA (Dudas puntuales, plazos, definiciones)
1. **Respuesta Directa:** Dato concreto, artículo legal o plazo exacto.
2. **Contexto Breve:** Excepciones clave o advertencias vitales.
3. **Fuente:** Cita la ley o jurisprudencia aplicable.

RUTA B: ANÁLISIS DE CASO (Conflictos, demandas, estrategias complejas)
1. **Fase de Escrutinio (Triage):** Si faltan datos críticos (jurisdicción, cuantía, pruebas, rol), NO des estrategia aún. Haz 3-5 preguntas precisas (Interrogatorio Socrático) para acotar el escenario.
2. **Análisis Normativo Jerárquico:** Aplica la pirámide normativa al caso.
3. **Evaluación Probatoria:** Analiza la solidez de las pruebas actuales y sugiere las necesarias (documentales, periciales, testificales, digitales).
4. **Unit Economics Legal (CRÍTICO):**
   * Estima si el coste emocional/económico/tiempo del litigio compensa el resultado probable.
   * Si la victoria es pírrica (ganar el juicio pero perder dinero), adviértelo claramente.
5. **Estrategia de Maximización:**
   * **Plan Principal:** La vía óptima para ganar.
   * **Plan de Contingencia:** Qué hacer si falla el principal.
   * **Vía Alternativa (Rápida/Barata):** Opciones de negociación o acuerdo extrajudicial.
6. **Plan de Acción (Checklist):** Pasos numerados claros y accionables para hoy.

ESTILO Y FORMATO:
- Responde siempre en el idioma del usuario (por defecto Español de España).
- Sé claro, preciso, estructurado, directo, sin relleno.
- Usa **Markdown**: Negritas para énfasis, listas, tablas para comparativas (Vía A vs Vía B).
- Nunca respondas "depende" sin explicar de qué factores depende y cómo el usuario puede controlarlos.

LÍMITES ÉTICOS Y OPERATIVOS:
- Confidencialidad total. No almacenes datos personales.
- No ayudes a cometer delitos, fraudes o destruir pruebas.
- SÍ ayudas a: Ejercer derecho a no declarar, evitar autoincriminación, impugnar pruebas ilícitas y diseñar la mejor defensa técnica.

GESTIÓN TEMPORAL Y BÚSQUEDA (ACTUALIZACIÓN):
- Tu "fecha actual" es dinámica. Verifica siempre la fecha de hoy antes de calcular plazos.
- **Búsqueda Obligatoria:** Para consultas sobre leyes cambiantes (Laboral, Fiscal, Alquileres, Procesal), DEBES usar tus herramientas de búsqueda para verificar la vigencia de la norma y última jurisprudencia a día de hoy.
- Si encuentras una reforma reciente, priorízala y señálala explícitamente.

AUTO-CRÍTICA (DEVIL'S ADVOCATE):
- Antes de finalizar la respuesta en casos complejos, incluye una breve sección: **"Punto Débil Detectado"**.
- Identifica por dónde podría atacar la parte contraria tu propia estrategia y ofrece una mitigación preventiva.

CIERRE:
- Termina siempre con: **¿Refinamos?** Dime más detalles (pruebas, plazos) o pídeme redactar un borrador.`;

    const messages = history.map(item => ({
        role: item.role,
        parts: [{ text: item.content }],
    }));

    // Añadimos el mensaje actual como último
    messages.push({
        role: 'user',
        parts: [{ text: message }],
    });

    return {
        system_instruction: {
            parts: [{ text: systemInstructionText }]
        },
        contents: messages,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
    };
}

/**
 * Simple chat request (non‑streaming). Returns the text response.
 */
export async function chat(message: string, conversationHistory: { role: string; content: string }[] = []) {
    try {
        const payload = buildPayload(message, conversationHistory);
        const url = `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        console.log('Gemini API Response:', JSON.stringify(data, null, 2));

        // La respuesta está en data.candidates[0].content.parts[0].text
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        console.log('Extracted text:', text);

        return text;
    } catch (error) {
        console.error('Error calling Gemini API (chat):', error);
        if (error && typeof error === 'object' && 'message' in error) {
            const msg = (error as any).message;
            throw new Error(`Error al conectar con Gemini: ${msg}`);
        }
        throw new Error('Error al conectar con Gemini. Verifica tu conexión e intenta de nuevo.');
    }
}

/**
 * Streaming chat using XMLHttpRequest for React Native compatibility.
 * This provides TRUE streaming by reading the responseText as it grows.
 */
export function streamChat(
    message: string,
    conversationHistory: { role: string; content: string }[] = [],
    onChunk: (text: string) => void,
    onDebug?: (log: string) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const payload = buildPayload(message, conversationHistory);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            let processedLength = 0;
            let buffer = '';
            let fullText = '';

            const processBuffer = (isFinal = false) => {
                const newText = xhr.responseText.substring(processedLength);
                processedLength = xhr.responseText.length;
                buffer += newText;

                if (newText.length > 0) {
                    onDebug?.(`[Stream] Chunk received. Size: ${newText.length}`);
                }

                // SSE messages are separated by double newlines
                const parts = buffer.split('\n\n');

                // Keep the last part in buffer unless it's final
                // (It might be an incomplete message)
                if (!isFinal) {
                    buffer = parts.pop() || '';
                } else {
                    buffer = '';
                }

                for (const part of parts) {
                    const lines = part.split('\n');
                    for (const line of lines) {
                        if (line.trim().startsWith('data:')) {
                            const dataStr = line.replace(/^data:\s*/, '').trim();
                            if (dataStr === '[DONE]') continue;

                            try {
                                const data = JSON.parse(dataStr);
                                const textChunk = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                                if (textChunk) {
                                    fullText += textChunk;
                                    onDebug?.(`[Stream] Extracted: "${textChunk.substring(0, 10)}..."`);
                                    onChunk(fullText);
                                }
                            } catch (e) {
                                if (isFinal) {
                                    onDebug?.(`[Stream] Parse error: ${e}`);
                                }
                            }
                        }
                    }
                }
            };

            xhr.onprogress = () => {
                onDebug?.('[Stream] onprogress fired');
                processBuffer(false);
            };

            xhr.onload = () => {
                onDebug?.(`[Stream] onload fired. Status: ${xhr.status}`);
                if (xhr.status >= 200 && xhr.status < 300) {
                    processBuffer(true); // Force process everything
                    onDebug?.(`[Stream] Final length: ${fullText.length}`);
                    resolve(fullText);
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        const errMsg = errorData.error?.message || xhr.responseText;
                        onDebug?.(`[Stream] Error: ${errMsg}`);
                        reject(new Error(`Gemini API error ${xhr.status}: ${errMsg}`));
                    } catch {
                        onDebug?.(`[Stream] Error text: ${xhr.responseText}`);
                        reject(new Error(`Gemini API error ${xhr.status}: ${xhr.responseText}`));
                    }
                }
            };

            xhr.onerror = () => {
                onDebug?.('[Stream] Network error');
                reject(new Error('Error de red al conectar con Gemini'));
            };

            onDebug?.('[Stream] Sending request...');
            xhr.send(JSON.stringify(payload));

        } catch (error) {
            console.error('Error calling Gemini API (streamChat):', error);
            reject(error);
        }
    });
}
