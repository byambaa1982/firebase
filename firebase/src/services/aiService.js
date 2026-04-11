function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  return key;
}

function getGeminiURL() {
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${getApiKey()}`;
}

async function callGemini(systemPrompt, userPrompt, temperature = 0.7) {
  let res;
  try {
    res = await fetch(getGeminiURL(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: 8192
        }
      })
    });
  } catch (networkErr) {
    console.error('Network error calling Gemini:', networkErr);
    throw new Error('Network error: Could not reach Gemini. Check your internet connection.');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Gemini API error response:', res.status, errText);
    let errMsg = `Gemini API error: ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error?.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  console.log('Gemini full response:', JSON.stringify(data).slice(0, 500));
  
  // Gemini 2.5 "thinking" models may return multiple parts — find the non-thought text part
  const parts = data.candidates?.[0]?.content?.parts || [];
  let content = '';
  for (const part of parts) {
    if (!part.thought && part.text) {
      content = part.text;
    }
  }
  // Fallback: just grab the first text part
  if (!content) {
    content = parts.find(p => p.text)?.text || '';
  }
  
  console.log('Gemini extracted text:', content.slice(0, 300));
  if (!content) throw new Error('Gemini returned an empty response');
  return content;
}

function parseCardJSON(raw) {
  console.log('Parsing AI response, length:', raw.length);
  console.log('First 200 chars:', raw.slice(0, 200));
  
  // Strip all markdown code fences (handles ```json ... ``` anywhere in the string)
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  
  // Try parsing as a direct JSON array
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    // Handle {"cards": [...]} wrapper format
    if (parsed.cards && Array.isArray(parsed.cards)) return parsed.cards;
    if (parsed.flashcards && Array.isArray(parsed.flashcards)) return parsed.flashcards;
  } catch {}
  
  // Fallback: extract JSON array via regex
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error('Failed to parse extracted JSON array:', e, match[0].slice(0, 200));
    }
  }

  // Last resort: try to fix truncated JSON (response cut off mid-array)
  const truncated = tryFixTruncatedJSON(cleaned);
  if (truncated) return truncated;
  
  console.error('Could not parse AI response as cards:', cleaned.slice(0, 500));
  throw new Error('AI returned an unexpected format. Check the browser console for details.');
}

// Attempt to salvage a truncated JSON array by removing the incomplete last item
function tryFixTruncatedJSON(raw) {
  let text = raw.trim();
  if (!text.startsWith('[')) {
    const idx = text.indexOf('[');
    if (idx === -1) return null;
    text = text.slice(idx);
  }
  
  // Find the last complete object (ends with })
  const lastBrace = text.lastIndexOf('}');
  if (lastBrace === -1) return null;
  
  const candidate = text.slice(0, lastBrace + 1) + ']';
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.warn(`Recovered ${parsed.length} cards from truncated response`);
      return parsed;
    }
  } catch {}
  
  return null;
}

const SYSTEM_PROMPT = `You are a flashcard generator. Return ONLY a JSON array of card objects. No other text.
Each card must have exactly these fields:
- "front": A clear question (1-2 sentences max)
- "back": A concise answer (1-3 sentences max)
- "explanation": Why this matters (1 sentence)
- "hints": Array of 1-2 short hints (string[])
- "difficulty": "easy", "medium", or "hard"

IMPORTANT: Keep ALL text short and concise. Never exceed 2 sentences for any field.
Vary question types: definitions, comparisons, cause-effect, applications.`;

// Generate flashcards from pasted notes/text
export async function generateFromText(text, count = 10) {
  const raw = await callGemini(
    SYSTEM_PROMPT,
    `Create ${count} flashcards from the following study material:\n\n${text}`
  );
  return parseCardJSON(raw);
}

// Generate flashcards from a topic name
export async function generateFromTopic(topic, count = 10, difficulty = 'mixed', focus = '') {
  const difficultyInstruction = difficulty === 'mixed'
    ? 'Use a mix of easy, medium, and hard questions.'
    : `Make all questions ${difficulty} difficulty.`;

  const focusInstruction = focus
    ? `Focus specifically on: ${focus}.`
    : '';

  const raw = await callGemini(
    SYSTEM_PROMPT,
    `Create ${count} flashcards about "${topic}". ${difficultyInstruction} ${focusInstruction}\nCover the most important concepts, definitions, and relationships.`
  );
  return parseCardJSON(raw);
}

// Improve an existing card
export async function improveCard(front, back) {
  const raw = await callGemini(
    SYSTEM_PROMPT,
    `Improve this flashcard. Make the question clearer and more specific, make the answer more concise, and add hints and an explanation.\n\nCurrent question: ${front}\nCurrent answer: ${back}\n\nReturn a JSON array with exactly 1 improved card.`,
    0.5
  );
  const cards = parseCardJSON(raw);
  return cards[0];
}

// Explain a card's answer (for the AI tutor)
export async function explainCard(front, back, userQuestion = '') {
  const systemPrompt = `You are a friendly, encouraging study tutor. The student is studying a flashcard:\nQuestion: ${front}\nAnswer: ${back}\n\nHelp the student understand. Be concise (2-4 sentences). Use simple language, analogies, and real-world examples.`;
  return await callGemini(systemPrompt, userQuestion || 'Explain this answer to me simply.', 0.6);
}

// Check if API key is configured
export function isAIConfigured() {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
}
