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

// ============================================
// 曜日リマインダー表示ロジックのテスト
// ============================================

/**
 * 曜日リマインダーの表示ラベルを生成するヘルパー
 * reminder-list-item.tsx のロジックを再現
 */
function getFrequencyLabel(
  isRepeat: boolean,
  frequency: string | null | undefined,
  daysOfWeek: string[] | undefined
): string | null {
  if (!isRepeat) return null;
  
  const dayMap: Record<string, string> = {
    Mon: '月', Tue: '火', Wed: '水', Thu: '木', Fri: '金', Sat: '土', Sun: '日'
  };
  
  if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
    return daysOfWeek.map(d => dayMap[d] || d).join('');
  }
  
  return '毎日';
}

describe('曜日リマインダー表示ロジック', () => {
  describe('毎日表示のケース', () => {
    it('frequency=daily の場合「毎日」', () => {
      const result = getFrequencyLabel(true, 'daily', undefined);
      expect(result).toBe('毎日');
    });

    it('繰り返しなし (isRepeat=false) の場合は null', () => {
      const result = getFrequencyLabel(false, 'daily', undefined);
      expect(result).toBeNull();
    });

    it('7曜日すべて選択の場合「毎日」', () => {
      const result = getFrequencyLabel(true, 'weekly', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      expect(result).toBe('毎日');
    });

    it('daysOfWeek が空配列の場合「毎日」', () => {
      const result = getFrequencyLabel(true, 'weekly', []);
      expect(result).toBe('毎日');
    });

    it('daysOfWeek が undefined の場合「毎日」', () => {
      const result = getFrequencyLabel(true, 'weekly', undefined);
      expect(result).toBe('毎日');
    });
  });

  describe('曜日表示のケース', () => {
    it('月・水・金 の場合「月水金」', () => {
      const result = getFrequencyLabel(true, 'weekly', ['Mon', 'Wed', 'Fri']);
      expect(result).toBe('月水金');
    });

    it('火・木 の場合「火木」', () => {
      const result = getFrequencyLabel(true, 'weekly', ['Tue', 'Thu']);
      expect(result).toBe('火木');
    });

    it('土・日 の場合「土日」', () => {
      const result = getFrequencyLabel(true, 'weekly', ['Sat', 'Sun']);
      expect(result).toBe('土日');
    });

    it('月曜のみの場合「月」', () => {
      const result = getFrequencyLabel(true, 'weekly', ['Mon']);
      expect(result).toBe('月');
    });

    it('6曜日（日曜以外）の場合は曜日表示', () => {
      const result = getFrequencyLabel(true, 'weekly', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
      expect(result).toBe('月火水木金土');
    });
  });

  describe('エッジケース', () => {
    it('不明な曜日キーはそのまま表示', () => {
      const result = getFrequencyLabel(true, 'weekly', ['Mon', 'Unknown']);
      expect(result).toBe('月Unknown');
    });

    it('frequencyがnullでもisRepeat=trueなら「毎日」', () => {
      const result = getFrequencyLabel(true, null, undefined);
      expect(result).toBe('毎日');
    });
  });
});

