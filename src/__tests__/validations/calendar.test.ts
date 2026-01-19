/**
 * カレンダーイベントバリデーションテスト
 * TC-CAL-01: タイトル必須
 * TC-CAL-02: タイトル100文字上限
 * TC-CAL-03: 日付必須
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// ============================================
// スキーマ（calendar/actions.ts の仕様に基づく）
// ============================================

const eventSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, '日付を入力してください'),
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください'),
});

// ============================================
// テストケース
// ============================================

describe('TC-CAL-01: タイトル必須', () => {
  it('タイトルが空の場合エラー', () => {
    const result = eventSchema.safeParse({
      date: '2025-01-15',
      title: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('タイトルを入力');
    }
  });

  it('タイトルが入力されている場合は成功', () => {
    const result = eventSchema.safeParse({
      date: '2025-01-15',
      title: 'フード購入',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-CAL-02: タイトル100文字上限', () => {
  it('100文字のタイトルは許可される', () => {
    const result = eventSchema.safeParse({
      date: '2025-01-15',
      title: 'あ'.repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it('101文字のタイトルはエラー', () => {
    const result = eventSchema.safeParse({
      date: '2025-01-15',
      title: 'あ'.repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('100文字以内');
    }
  });

  it('1文字のタイトルは許可される', () => {
    const result = eventSchema.safeParse({
      date: '2025-01-15',
      title: 'a',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-CAL-03: 日付必須', () => {
  it('日付が空の場合エラー', () => {
    const result = eventSchema.safeParse({
      date: '',
      title: 'フード購入',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('日付を入力');
    }
  });

  it('日付が指定されている場合は成功', () => {
    const result = eventSchema.safeParse({
      date: '2025-01-15',
      title: 'フード購入',
    });
    expect(result.success).toBe(true);
  });

  it('YYYY-MM-DD形式の日付は成功', () => {
    const result = eventSchema.safeParse({
      date: '2025-12-31',
      title: '大晦日',
    });
    expect(result.success).toBe(true);
  });
});

describe('カレンダーイベントの複合バリデーション', () => {
  it('IDありの更新データは成功', () => {
    const result = eventSchema.safeParse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      date: '2025-01-15',
      title: 'フード購入',
    });
    expect(result.success).toBe(true);
  });

  it('IDなしの新規データは成功', () => {
    const result = eventSchema.safeParse({
      date: '2025-01-15',
      title: 'フード購入',
    });
    expect(result.success).toBe(true);
  });

  it('タイトルと日付両方空はエラー（複数エラー）', () => {
    const result = eventSchema.safeParse({
      date: '',
      title: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});
