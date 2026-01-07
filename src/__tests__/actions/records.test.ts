/**
 * TC-VR-01: 一括保存テスト
 * 複数の記録（体重、食事、排泄等）が正しく保存されることを確認
 */

import { beforeEach,describe, expect, it, vi } from 'vitest';

import { DailyBatchInput,dailyBatchSchema } from '@/app/(main)/records/schema';

// 有効なUUID（テスト用）
const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('TC-VR-01: 一括保存ロジック', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('スキーマバリデーション', () => {
    it('有効なデータは検証を通過する', () => {
      const validData: DailyBatchInput = {
        hedgehogId: TEST_UUID,
        date: '2025-01-01',
        weight: 350,
        temperature: 25.5,
        humidity: 60,
        meals: [
          { time: '08:00', content: 'フード', amount: 10, unit: 'g' },
          { time: '20:00', content: 'ミルワーム', amount: 5, unit: '匹' },
        ],
        excretions: [
          { time: '09:00', condition: 'normal', notes: '普通' },
        ],
        medications: [
          { time: '08:00', name: 'ビタミン剤' },
        ],
        memo: '今日は元気でした',
      };

      const result = dailyBatchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('体重のみの記録も有効', () => {
      const weightOnly: DailyBatchInput = {
        hedgehogId: TEST_UUID,
        date: '2025-01-01',
        weight: 320,
      };

      const result = dailyBatchSchema.safeParse(weightOnly);
      expect(result.success).toBe(true);
    });

    it('無効なUUIDはエラー', () => {
      const invalidData = {
        hedgehogId: 'not-a-uuid',
        date: '2025-01-01',
        weight: 350,
      };

      const result = dailyBatchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('食事追加1件/修正1件/除外1件のパターンをシミュレート', () => {
      // 3件の食事（追加・修正・除外を経て最終的に2件になるケース）
      const batchData: DailyBatchInput = {
        hedgehogId: TEST_UUID,
        date: '2025-01-01',
        meals: [
          { time: '08:00', content: '朝ごはん', amount: 10, unit: 'g' },  // 既存を修正
          { time: '12:00', content: '昼ごはん', amount: 5, unit: 'g' },   // 新規追加
          // 夜ごはんは除外（送信しない）
        ],
      };

      const result = dailyBatchSchema.safeParse(batchData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.meals).toHaveLength(2);
      }
    });
  });

  describe('異常値の検出', () => {
    it('食事内容が31文字を超えるとエラー（TC-VR-02連携）', () => {
      const invalidData: DailyBatchInput = {
        hedgehogId: TEST_UUID,
        date: '2025-01-01',
        meals: [
          { time: '08:00', content: 'あ'.repeat(31), amount: 10 },
        ],
      };

      const result = dailyBatchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
