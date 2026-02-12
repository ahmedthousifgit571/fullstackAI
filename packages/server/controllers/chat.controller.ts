// ============================
// Chat Controller
// ============================
// This file handles the HTTP layer for chat-related routes.
// It is responsible for: request validation (Zod), calling the service,
// and sending back the HTTP response.
// It does NOT know about Gemini, history storage, or business logic.

import type { Request, Response } from 'express';
import z from 'zod';
import { chat } from '../services/chat.service';

// -- Validation Schema --
const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required')
      .max(100, 'Prompt is too long (max 100 characters)'),
   conversationId: z.string().uuid().optional(),
});

// -- Controller Functions --

/**
 * Handles POST /api/chat
 * Validates the request body, delegates to the chat service,
 * and returns the AI reply + conversationId.
 */
export async function handleChat(req: Request, res: Response): Promise<void> {
   try {
      // Validate request body with Zod
      const parsed = chatSchema.safeParse(req.body);

      if (!parsed.success) {
         res.status(400).json({ error: parsed.error.format() });
         return;
      }

      // Delegate to the service layer
      const result = await chat(parsed.data);

      res.json(result);
   } catch (error) {
      console.error('Gemini Error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
   }
}
