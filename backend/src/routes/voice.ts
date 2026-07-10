import { Router } from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
    
    // Parsing JSON response from Gemini
    const aiData = JSON.parse(responseText);

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