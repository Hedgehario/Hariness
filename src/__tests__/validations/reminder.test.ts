/**
 * リマインダーバリデーションテスト
 * TC-REM-01: タイトル必須
 * TC-REM-02: タイトル50文字上限
 * TC-REM-03: 時間形式
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// ============================================
// スキーマ（reminders/actions.ts の仕様に基づく）
// ============================================

const reminderSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(50, 'タイトルは50文字以内で入力してください'),
  targetTime: z
    .union([
      z.literal(''),
      z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '有効な時間を入力してください'),
    ])
    .optional(),
  isRepeat: z.boolean().default(true),
  frequency: z.enum(['daily', 'weekly']).optional(),
  daysOfWeek: z.array(z.string()).optional(),
});

// ============================================
// テストケース
// ============================================

describe('TC-REM-01: タイトル必須', () => {
  it('タイトルが空の場合エラー', () => {
    const result = reminderSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('タイトルを入力');
    }
  });

  it('タイトルが入力されている場合は成功', () => {
    const result = reminderSchema.safeParse({
      title: '朝ごはん',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-REM-02: タイトル50文字上限', () => {
  it('50文字のタイトルは許可される', () => {
    const result = reminderSchema.safeParse({
      title: 'あ'.repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it('51文字のタイトルはエラー', () => {
    const result = reminderSchema.safeParse({
      title: 'あ'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('50文字以内');
    }
  });

  it('1文字のタイトルは許可される', () => {
    const result = reminderSchema.safeParse({
      title: 'a',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-REM-03: 時間形式', () => {
  it('正しい時間形式（08:00）は成功', () => {
    const result = reminderSchema.safeParse({
      title: '朝ごはん',
      targetTime: '08:00',
    });
    expect(result.success).toBe(true);
  });

  it('正しい時間形式（23:59）は成功', () => {
    const result = reminderSchema.safeParse({
      title: '夜のお世話',
      targetTime: '23:59',
    });
    expect(result.success).toBe(true);
  });

  it('正しい時間形式（00:00）は成功', () => {
    const result = reminderSchema.safeParse({
      title: '深夜',
      targetTime: '00:00',
    });
    expect(result.success).toBe(true);
  });

  it('1桁時間形式（8:00）も成功', () => {
    const result = reminderSchema.safeParse({
      title: '朝ごはん',
      targetTime: '8:00',
    });
    expect(result.success).toBe(true);
  });

  it('不正な時間形式（25:00）はエラー', () => {
    const result = reminderSchema.safeParse({
      title: '朝ごはん',
      targetTime: '25:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('有効な時間');
    }
  });

  it('不正な時間形式（12:60）はエラー', () => {
    const result = reminderSchema.safeParse({
      title: '朝ごはん',
      targetTime: '12:60',
    });
    expect(result.success).toBe(false);
  });

  it('不正な時間形式（文字列）はエラー', () => {
    const result = reminderSchema.safeParse({
      title: '朝ごはん',
      targetTime: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('空の時間は許可される（終日リマインダー）', () => {
    const result = reminderSchema.safeParse({
      title: '床材交換',
      targetTime: '',
    });
    expect(result.success).toBe(true);
  });

  it('時間なしも許可される（任意項目）', () => {
    const result = reminderSchema.safeParse({
      title: 'フード購入',
    });
    expect(result.success).toBe(true);
  });
});

describe('リマインダーの複合バリデーション', () => {
  it('完全なデータ（繰り返しあり・毎日）は成功', () => {
    const result = reminderSchema.safeParse({
      title: '朝ごはん',
      targetTime: '08:00',
      isRepeat: true,
      frequency: 'daily',
    });
    expect(result.success).toBe(true);
  });

  it('完全なデータ（繰り返しあり・週次）は成功', () => {
    const result = reminderSchema.safeParse({
      title: '床材交換',
      targetTime: '10:00',
      isRepeat: true,
      frequency: 'weekly',
      daysOfWeek: ['Mon', 'Thu'],
    });
    expect(result.success).toBe(true);
  });

  it('1回のみ（繰り返しなし）は成功', () => {
    const result = reminderSchema.safeParse({
      title: 'ワクチン接種',
      targetTime: '14:00',
      isRepeat: false,
    });
    expect(result.success).toBe(true);
  });

  it('最小限のデータ（タイトルのみ）で成功', () => {
    const result = reminderSchema.safeParse({
      title: 'お薬',
    });
    expect(result.success).toBe(true);
  });
});
