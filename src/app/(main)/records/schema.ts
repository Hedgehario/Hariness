import { z } from 'zod';

// Zod Schemas
// Zod Schemas
export const mealSchema = z.object({
  time: z.string(), // HH:mm
  content: z
    .string()
    .min(1, '食事内容を入力してください')
    .max(30, '食事内容は30文字以内で入力してください'),
  amount: z.number().min(0).optional(),
  unit: z.string().optional(),
});

export const excretionSchema = z
  .object({
    time: z.string(), // HH:mm
    type: z.enum(['urine', 'stool', 'other']), // 必須（設計書準拠）
    condition: z.enum(['normal', 'abnormal']),
    notes: z.string().max(200, '詳細は200文字以内で入力してください').optional(),
  })
  .refine((data) => data.condition !== 'abnormal' || (data.notes && data.notes.trim().length > 0), {
    message: '異常時は詳細を入力してください',
    path: ['notes'],
  });

// Export schema for client-side validation if needed
export const dailyBatchSchema = z.object({
  hedgehogId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  weight: z
    .number()
    .nullable()
    .optional()
    .refine((val) => !val || (val > 0 && val < 3000), {
      message: '体重は0〜3000gの範囲で入力してください',
    }),
  temperature: z
    .number()
    .nullable()
    .optional()
    .refine((val) => val === null || val === undefined || (val >= -10 && val <= 50), {
      message: '気温は-10〜50℃の範囲で入力してください',
    }),
  humidity: z
    .number()
    .nullable()
    .optional()
    .refine((val) => val === null || val === undefined || (val >= 0 && val <= 100), {
      message: '湿度は0〜100%の範囲で入力してください',
    }),
  meals: z.array(mealSchema).optional(),
  excretions: z.array(excretionSchema).optional(),
  medications: z
    .array(
      z.object({
        time: z.string(),
        name: z
          .string()
          .min(1, '薬の名前を入力してください')
          .max(50, '薬の名前は50文字以内で入力してください'),
      })
    )
    .optional(),
  memo: z.string().max(1000, 'メモは1000文字以内で入力してください').optional(),
});

export type DailyBatchInput = z.infer<typeof dailyBatchSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type ExcretionInput = z.infer<typeof excretionSchema>;
