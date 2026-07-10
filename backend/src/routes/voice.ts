import { Router } from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Groq (primary) — dedicated Whisper transcription, fast + isolated quota ──
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const GROQ_STT_MODEL = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo';

// ── Gemini (fallback only) — used solely if Groq is unavailable ──
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_VOICE_FALLBACK_MODEL || 'gemini-2.5-flash-lite';

/** Errors worth retrying on a different provider: network issues, timeouts,
 *  rate limits, and server-side failures. A 400 (e.g. bad/corrupt audio)
 *  will fail on Gemini too, so don't waste a second call on those. */
function isRetryableError(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  if (status === undefined) return true; // network/timeout error, no HTTP status
  return status === 429 || status >= 500;
}

async function transcribeWithGroq(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
  const file = new File([buffer], filename, { type: mimetype });
  const result = await groq.audio.transcriptions.create({
    file,
    model: GROQ_STT_MODEL,
  });
  return result.text.trim();
}

async function transcribeWithGemini(buffer: Buffer, mimetype: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: GEMINI_FALLBACK_MODEL });
  const audioPart = {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimetype || 'audio/webm',
    },
  };
  const prompt = 'Transcribe exactly what is said in this audio. Respond with the transcription only — no preamble, no quotes, no extra commentary.';
  const result = await model.generateContent([prompt, audioPart]);
  return result.response.text().trim();
}

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('🎤 Caught audio file! Sending to Groq for transcription...');

    let userTranscription: string;

    try {
      userTranscription = await transcribeWithGroq(
        audioFile.buffer,
        audioFile.originalname || 'audio.webm',
        audioFile.mimetype || 'audio/webm'
      );
    } catch (groqError) {
      if (!isRetryableError(groqError)) {
        throw groqError; // bad audio etc. — no point trying Gemini too
      }
      console.warn('⚠️ Groq STT failed, falling back to Gemini:', groqError);
      userTranscription = await transcribeWithGemini(audioFile.buffer, audioFile.mimetype || 'audio/webm');
    }

    console.log(`🗣️ You said: "${userTranscription}"`);

    // Voice is transcription-only. The transcript is handed to the same
    // /parse pipeline chat uses (parseCommand -> nlp.ts -> geminiFallback.ts),
    // so intent parsing, disambiguation, and replies are already unified —
    // no need to generate a reply here.
    res.json({
      success: true,
      userTranscription,
    });

  } catch (error) {
    console.error('❌ Voice transcription error (both Groq and Gemini failed or were skipped):', error);
    // Both providers are unavailable/failed. Give the user a clear, actionable
    // message instead of a generic error — they can still use chat.
    res.status(503).json({
      success: false,
      error: 'voice_unavailable',
      message: 'The voice command is currently timed-out. Please use chat instead.',
    });
  }
});

export default router;