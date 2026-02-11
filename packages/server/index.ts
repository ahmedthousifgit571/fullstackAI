import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import z from 'zod';
import crypto from 'crypto';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
   res.send(process.env.OPENAI_KEY);
});

// Store conversation history in memory
const conversations = new Map<
   string,
   { role: string; parts: { text: string }[] }[]
>();

const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required')
      .max(100, 'Prompt is too long (max 100 characters)'),
   conversationId: z.string().uuid().optional(), // Made conversationId optional
});

// chat route for gemini
app.post('/api/chat', async (req: Request, res: Response) => {
   try {
      // Validate request body with Zod
      const parsed = chatSchema.safeParse(req.body);

      if (!parsed.success) {
         res.status(400).json({ error: parsed.error.format() });
         return; // Ensure we return to stop execution
      }

      const { prompt, conversationId } = parsed.data; // Destructure from parsed.data

      // Generate a new ID if not provided (using UUID to match schema)
      const chatId = conversationId || crypto.randomUUID(); // Use crypto.randomUUID()

      // Retrieve previous history from the Map, or start fresh
      const history = conversations.get(chatId) || [];

      // Initialize chat with the retrieved history
      const chat = model.startChat({
         history: history,
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      // Key Step: Update the history in our Map
      // We append the new user message and the model's reply
      const newHistory = [
         ...history,
         { role: 'user', parts: [{ text: prompt }] },
         { role: 'model', parts: [{ text: text }] },
      ];

      conversations.set(chatId, newHistory);

      // Return the reply AND the conversationId so the client can use it next time
      res.json({ reply: text, conversationId: chatId });
   } catch (error) {
      console.error('Gemini Error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
   }
});

app.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'hello world 2' });
});

app.listen(port, () => {
   console.log(`server is running on http://localhost:${port}`);
});
