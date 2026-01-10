/**
 * TC-HH-03: 日付相関テスト
 * 生年月日 > お迎え日 の場合にエラーを返すことを確認
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// ハリネズミ登録バリデーション（hedgehogs/actions.ts のスキーマを再現）
const hedgehogDateSchema = z
  .object({
    birthDate: z.string().nullable().optional(),
    welcomeDate: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // 両方の日付がある場合のみチェック
      if (data.birthDate && data.welcomeDate) {
        return new Date(data.birthDate) <= new Date(data.welcomeDate);
      }
      return true;
    },
    {
      message: '生年月日はお迎え日より前でなければなりません',
    }
  );

function validateHedgehogDates(birthDate: string | null, welcomeDate: string | null) {
  const result = hedgehogDateSchema.safeParse({ birthDate, welcomeDate });
  if (!result.success) {
    return {
      success: false,
      error: { code: 'VALIDATION', message: result.error.issues[0].message },
    };
  }
  return { success: true };
}

describe('TC-HH-03: 日付相関（生年月日とお迎え日）', () => {
  it('生年月日がお迎え日より後の場合はエラー', () => {
    // 生年月日: 2025/01/10、お迎え日: 2025/01/05
    const result = validateHedgehogDates('2025-01-10', '2025-01-05');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION');
  });

  it('生年月日がお迎え日と同日の場合は成功', () => {
    const result = validateHedgehogDates('2025-01-10', '2025-01-10');
    expect(result.success).toBe(true);
  });

  it('生年月日がお迎え日より前の場合は成功', () => {
    const result = validateHedgehogDates('2025-01-01', '2025-01-10');
    expect(result.success).toBe(true);
  });

  it('生年月日のみ設定の場合は成功', () => {
    const result = validateHedgehogDates('2025-01-01', null);
    expect(result.success).toBe(true);
  });

  it('お迎え日のみ設定の場合は成功', () => {
    const result = validateHedgehogDates(null, '2025-01-10');
    expect(result.success).toBe(true);
  });

  it('両方未設定の場合は成功', () => {
    const result = validateHedgehogDates(null, null);
    expect(result.success).toBe(true);
  });
});
