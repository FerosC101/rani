import { Router } from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

type VoiceAiData = { userTranscription: string; raniReply: string };

/**
 * Gemini's `responseMimeType: "application/json"` mode is not a strict JSON
 * guarantee — it can still return text wrapped in a ```json fence, with
 * trailing commas, or with stray control characters. Try a plain parse
 * first, then fall back to a couple of cheap, common repairs before
 * giving up. Throws the original error if nothing works, so the caller's
 * catch block still logs it.
 */
function parseGeminiJson(raw: string): VoiceAiData {
  const attempts: Array<() => string> = [
    () => raw,
    // Strip ```json ... ``` or ``` ... ``` code fences some models add.
    () => raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim(),
    // Grab just the outermost { ... } in case there's leading/trailing prose.
    () => {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1 || end <= start) return raw;
      return raw.slice(start, end + 1);
    },
    // Remove raw control characters (unescaped newlines/tabs inside strings)
    // that commonly break JSON parsing of transcribed speech.
    () => raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''),
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const candidate = attempt();
      const parsed = JSON.parse(candidate);
      if (
        parsed &&
        typeof parsed.userTranscription === 'string' &&
        typeof parsed.raniReply === 'string'
      ) {
        return parsed;
      }
      lastError = new Error('Parsed JSON missing expected fields');
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to parse Gemini response');
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Caught audio file! Sending to Gemini...');

    // Sets up the Gemini model — configurable via GEMINI_MODEL env var
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // Convert the audio buffer into the format Gemini wants
    const audioPart = {
      inlineData: {
        data: audioFile.buffer.toString("base64"),
        mimeType: audioFile.mimetype || 'audio/webm',
      },
    };

    // Tells Gemini exactly what to do and how to structure the output
    const prompt = `
      You are Rani, a helpful, concise AI financial assistant. 
      Listen to the user's voice message. 
      
      Respond with a JSON object using this exact structure:
      {
        "userTranscription": "Exactly what the user said in the audio",
        "raniReply": "Your short 1-2 sentence response to the user as Rani"
      }
    `;

    // For sending
    const result = await model.generateContent([prompt, audioPart]);
    const responseText = result.response.text();

    // Log the raw text so malformed responses are easy to diagnose instead of
    // just seeing "SyntaxError: Expected ',' or '}'" with no context.
    console.log('📩 Raw Gemini response:', responseText);

    // Parsing JSON response from Gemini. Gemini's JSON mode can still return
    // text that isn't strictly valid JSON (e.g. an unescaped quote/apostrophe
    // inside the transcribed speech, or the model wrapping the object in a
    // ```json code fence). Try a straight parse first, then fall back to a
    // couple of common repairs before giving up.
    const aiData = parseGeminiJson(responseText);

    console.log(`🗣️ You said: "${aiData.userTranscription}"`);
    console.log(`🤖 Rani says: "${aiData.raniReply}"`);

    // Sends data back to frontend
    res.json({ 
      success: true, 
      userTranscription: aiData.userTranscription, 
      raniReply: aiData.raniReply 
    });

  } catch (error) {
    console.error('❌ AI Processing Error:', error);
    res.status(500).json({ error: 'Internal server error processing voice' });
  }
});

export default router;