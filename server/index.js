
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';


const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

console.log(`Server starting...`);
console.log(`API Key configured: ${process.env.GEMINI_API_KEY ? 'YES (' + process.env.GEMINI_API_KEY.substring(0, 5) + '...)' : 'NO'}`);

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for memory storage (we don't need to save files to disk for this)
const upload = multer({ storage: multer.memoryStorage() });

// Validation
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not set in .env file.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// API Routes
// API Routes

// Legacy endpoint removed to enforce strict Gemini usage


app.post('/api/parse-prescription-text', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received prescription text parsing request`);

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text input is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("ERROR: GEMINI_API_KEY is not set.");
            return res.status(500).json({
                error: 'Server configuration error: Gemini API Key is missing.'
            });
        }

        // Use gemini-1.5-pro for text understanding as requested
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
      Analyze the following medical prescription text and extract medicine details.
      
      Prescription Text:
      "${text}"
      
      Return ONLY valid JSON in the following format:
      {
        "medicines": [
          {
            "name": "Medicine Name",
            "dosage": "e.g., 500mg",
            "frequency": "e.g., Twice a day",
            "timing": "e.g., After food",
            "duration": "e.g., 5 days",
            "instructions": "Any special instructions"
          }
        ]
      }
      
      Rules:
      1. If a field is unclear or missing, use null.
      2. Do NOT guess or hallucinate.
      3. Do NOT include markdown formatting like \`\`\`json. Return specific raw JSON.
      4. Handle multiple medicines.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        console.log("Gemini Raw Response (Text):", responseText);

        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        res.json(parsedData);

    } catch (error) {
        console.error('Error parsing prescription text:', error);
        res.status(500).json({ error: 'Failed to parse prescription text', details: error.message });
    }
});

app.post('/api/parse-prescription-image', upload.single('image'), async (req, res) => {
    console.log(`[${new Date().toISOString()}] Received prescription image parsing request`);

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("ERROR: GEMINI_API_KEY is not set.");
            return res.status(500).json({
                error: 'Server configuration error: Gemini API Key is missing.'
            });
        }

        console.log(`Processing Image: Size=${req.file.size} bytes, Type=${req.file.mimetype}`);

        // Use gemini-1.5-pro for image understanding as requested
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
      Analyze this prescription image.
      Identify all medicines prescribed.
      
      Return ONLY valid JSON in the following format:
      {
        "medicines": [
          {
            "name": "Medicine Name",
            "dosage": "e.g., 500mg",
            "frequency": "e.g., Twice a day",
            "timing": "e.g., After food",
            "duration": "e.g., 5 days",
            "instructions": "Any special instructions"
          }
        ]
      }
      
      Rules:
      1. If a field is unclear or missing, use null.
      2. Do NOT guess or hallucinate.
      3. Do NOT include markdown formatting like \`\`\`json. Return specific raw JSON.
      4. Handle multiple medicines.
    `;

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Raw Response (Image):", text);

        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);

        res.json(parsedData);

    } catch (error) {
        console.error('Error parsing prescription image:', error);
        res.status(500).json({ error: 'Failed to parse prescription image', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
