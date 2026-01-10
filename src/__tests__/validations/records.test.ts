/**
 * TC-VR-07: 数値レンジテスト
 * TC-VR-08: 食事文字数テスト
 *
 * 体重・湿度の上限チェック、食事内容の30文字制限を確認
 */

import { describe, expect, it } from 'vitest';

import { dailyBatchSchema, mealSchema } from '@/app/(main)/records/schema';

describe('TC-VR-07: 数値レンジ（体重・湿度）', () => {
  describe('体重のバリデーション', () => {
    it('体重0gは許可される（空も許可）', () => {
      const result = dailyBatchSchema.safeParse({
        hedgehogId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-01-01',
        weight: 0,
      });
      expect(result.success).toBe(true);
    });

    it('体重2999gは許可される（仕様上の上限内）', () => {
      const result = dailyBatchSchema.safeParse({
        hedgehogId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-01-01',
        weight: 2999,
      });
      expect(result.success).toBe(true);
    });

    it('体重nullは許可される', () => {
      const result = dailyBatchSchema.safeParse({
        hedgehogId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-01-01',
        weight: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('湿度のバリデーション', () => {
    it('湿度0%は許可される', () => {
      const result = dailyBatchSchema.safeParse({
        hedgehogId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-01-01',
        humidity: 0,
      });
      expect(result.success).toBe(true);
    });

    it('湿度100%は許可される（仕様上の上限）', () => {
      const result = dailyBatchSchema.safeParse({
        hedgehogId: '123e4567-e89b-12d3-a456-426614174000',
        date: '2025-01-01',
        humidity: 100,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('TC-VR-08: 食事内容の文字数', () => {
  it('30文字の食事内容は許可される', () => {
    const thirtyChars = 'あ'.repeat(30);
    const result = mealSchema.safeParse({
      time: '12:00',
      content: thirtyChars,
    });
    expect(result.success).toBe(true);
  });

  it('31文字の食事内容はエラーになる', () => {
    const thirtyOneChars = 'あ'.repeat(31);
    const result = mealSchema.safeParse({
      time: '12:00',
      content: thirtyOneChars,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('30文字以内');
    }
  });

  it('空の食事内容はエラーになる', () => {
    const result = mealSchema.safeParse({
      time: '12:00',
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('1文字の食事内容は許可される', () => {
    const result = mealSchema.safeParse({
      time: '12:00',
      content: 'a',
    });
    expect(result.success).toBe(true);
  });
});
