import { z } from "zod";

// Pure zod input schemas used by route handlers
export const insertBillItemSchema = z.object({
  userId: z.string(),
  name: z.string(),
  quantity: z.string(),
  rate: z.number(),
  amount: z.number(),
  sessionId: z.string(),
});

export const insertBillSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  customerPhone: z.string().optional().nullable(),
  totalAmount: z.number(),
  status: z.enum(["active", "completed"]).optional(),
});

export const insertVoiceCommandSchema = z.object({
  userId: z.string(),
  command: z.string(),
  action: z.string(),
  success: z.number().int().optional(), // 0 or 1
});

export const insertVoicePrintSchema = z.object({
  userId: z.string(),
  voiceData: z.string(),
  isActive: z.number().int().optional(),
});

export const insertLearningContentSchema = z.object({
  userId: z.string(),
  type: z.string(), // flashcard, quiz, definition
  title: z.string(),
  content: z.string(),
  language: z.string().optional(), // en, ta, mixed
});
