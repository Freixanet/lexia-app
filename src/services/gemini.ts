import { Platform } from 'react-native';

// API key imported from secret file (kept out of version control)
import { GEMINI_API_KEY } from '../config/secret';

// Endpoint for Gemini 3 Pro preview (REST API)
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';

/**
 * Build the request payload for Gemini.
 * `history` is an array of {role, content} objects.
 */
function buildPayload(message: string, history: { role: string; content: string }[]) {
    const systemInstruction = `Eres Lexia, un asistente legal inteligente especializado en derecho español.
Tu objetivo es ayudar a los usuarios con consultas legales, redacción de documentos y asesoramiento jurídico.
Proporciona respuestas claras, precisas y profesionales. Cuando sea relevante, cita leyes o normativas españolas.
Si algo está fuera de tu ámbito legal o requiere asesoramiento personalizado urgente, recomienda consultar con un abogado.`;

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
        systemInstruction,
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
        // La respuesta está en data.candidates[0].content.parts[0].text
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
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
 * Streaming chat – we emulate streaming by repeatedly calling the API with the same prompt.
 * The REST endpoint does not support true streaming, so we fallback to a simple poll.
 * `onChunk` receives the full accumulated text each time.
 */
export async function streamChat(
    message: string,
    conversationHistory: { role: string; content: string }[] = [],
    onChunk: (text: string) => void
) {
    // For simplicity we just call the normal chat endpoint and deliver the whole response at once.
    // This keeps the UI logic unchanged (it expects incremental updates).
    const fullText = await chat(message, conversationHistory);
    // Simulate streaming by sending the text character by character with a tiny delay.
    let accumulated = '';
    for (let i = 0; i < fullText.length; i++) {
        accumulated += fullText[i];
        onChunk(accumulated);
        // Small delay to mimic streaming (10 ms per char)
        await new Promise(res => setTimeout(res, 10));
    }
    return fullText;
}
