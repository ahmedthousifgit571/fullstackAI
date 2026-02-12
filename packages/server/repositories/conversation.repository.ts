// ============================
// Conversation Repository
// ============================
// This file is responsible ONLY for data access (storage & retrieval).
// It knows nothing about HTTP requests, Gemini API, or validation.
// Think of it as: "How do I store and fetch conversation data?"

// -- Types --
// Define the shape of a single message in a conversation
export type ConversationMessage = {
   role: string;
   parts: { text: string }[];
};

// A conversation history is just an array of messages
export type ConversationHistory = ConversationMessage[];

// -- Data Store --
// Currently using an in-memory Map. Later, you can swap this
// with MongoDB, PostgreSQL, Redis, etc. — and NOTHING else
// in the app needs to change, because only this file touches the data store.
const conversations = new Map<string, ConversationHistory>();

// -- Repository Functions --

/**
 * Get the conversation history for a given chat ID.
 * Returns an empty array if no history exists (new conversation).
 */
export function getConversationHistory(chatId: string): ConversationHistory {
   return conversations.get(chatId) || [];
}

/**
 * Save (or update) the conversation history for a given chat ID.
 */
export function saveConversationHistory(
   chatId: string,
   history: ConversationHistory
): void {
   conversations.set(chatId, history);
}
