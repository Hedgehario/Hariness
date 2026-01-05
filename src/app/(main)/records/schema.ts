
import { z } from 'zod';

// Zod Schemas
export const mealSchema = z.object({
  time: z.string(), // HH:mm
  content: z.string().min(1, 'フードの種類を入力してください'),
  amount: z.number().min(0),
  unit: z.string(),
});

export const excretionSchema = z.object({
  time: z.string(), // HH:mm
  type: z.enum(['urine', 'stool', 'other']),
  condition: z.string().optional(),
  notes: z.string().optional(),
});

// Export schema for client-side validation if needed
export const dailyBatchSchema = z.object({
  hedgehogId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  weight: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  humidity: z.number().nullable().optional(),
  meals: z.array(mealSchema).optional(),
  excretions: z.array(excretionSchema).optional(),
  medications: z
    .array(
      z.object({
        time: z.string(),
        content: z.string().optional(),
      })
    )
    .optional(),
  memo: z.string().max(1000).optional(),
});

export type DailyBatchInput = z.infer<typeof dailyBatchSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type ExcretionInput = z.infer<typeof excretionSchema>;
