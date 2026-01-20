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

// 排泄状態の選択肢
export const excretionConditionEnum = z.enum(['none', 'normal', 'abnormal']);

// 排泄記録スキーマ（1日1レコード、うんち・おしっこの状態を記録）
export const excretionSchema = z
  .object({
    stoolCondition: excretionConditionEnum, // うんちの状態
    urineCondition: excretionConditionEnum, // おしっこの状態
    notes: z.string().max(200, '備考は200文字以内で入力してください').optional(),
  })
  .refine(
    (data) => {
      // 異常がある場合は備考が必要
      const hasAbnormal = data.stoolCondition === 'abnormal' || data.urineCondition === 'abnormal';
      return !hasAbnormal || (data.notes && data.notes.trim().length > 0);
    },
    {
      message: '異常がある場合は備考を入力してください',
      path: ['notes'],
    }
  );

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
  excretion: excretionSchema.optional(), // 1日1レコード（配列ではない）
  medications: z
    .array(
      z.object({
        time: z.string(),
        name: z
          .string()
          .min(1, '薬の名前を入力してください')
          .max(50, '薬の名前は50文字以内で入力してください'),
        dosage: z
          .string()
          .max(50, '量・用法は50文字以内で入力してください')
          .optional(),
      })
    )
    .optional(),
  memo: z.string().max(1000, 'メモは1000文字以内で入力してください').optional(),
});

export type DailyBatchInput = z.infer<typeof dailyBatchSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type ExcretionInput = z.infer<typeof excretionSchema>;
export type ExcretionCondition = z.infer<typeof excretionConditionEnum>;