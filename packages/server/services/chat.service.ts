// ============================
// Chat Service
// ============================
// This file contains the BUSINESS LOGIC for chatting with Gemini.
// It knows how to: initialize the model, manage chat sessions, and
// coordinate with the repository for history storage.
// It does NOT know about HTTP requests, Express, or validation.

import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
   getConversationHistory,
   saveConversationHistory,
} from '../repositories/conversation.repository';

// -- Gemini Model Setup --
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// -- Types --
type ChatInput = {
   prompt: string;
   conversationId?: string;
};

type ChatOutput = {
   reply: string;
   conversationId: string;
};

// -- Service Function --

/**
 * Sends a message to Gemini with conversation context.
 * - If `conversationId` is provided, continues an existing conversation.
 * - If not, starts a new conversation and generates a UUID.
 * - Saves the updated history back to the repository.
 */
export async function chat(input: ChatInput): Promise<ChatOutput> {
   const { prompt, conversationId } = input;

   // Generate a new ID if not provided
   const chatId = conversationId || crypto.randomUUID();

   // Retrieve previous history from the repository
   const history = getConversationHistory(chatId);

   // Initialize chat with the retrieved history
   const chatSession = model.startChat({
      history: history,
   });

   // Send the user's message
   const result = await chatSession.sendMessage(prompt);
   const response = await result.response;
   const text = response.text();

   // Update the history: append user message + model reply
   const newHistory = [
      ...history,
      { role: 'user', parts: [{ text: prompt }] },
      { role: 'model', parts: [{ text: text }] },
   ];

   saveConversationHistory(chatId, newHistory);

   return {
      reply: text,
      conversationId: chatId,
   };
}
