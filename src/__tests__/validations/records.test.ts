/**
 * 健康記録バリデーションテスト
 * TC-VR-07〜11: 体重・湿度の境界値
 * TC-VR-12〜15: 食事内容の文字数
 * TC-VR-16: 排泄記録の種別必須
 * TC-VR-17: 排泄異常時の詳細必須
 * TC-VR-18〜19: 投薬名のバリデーション
 * TC-VR-20: メモ1000文字上限
 */

import { describe, expect, it } from 'vitest';

import { dailyBatchSchema, excretionSchema, mealSchema } from '@/app/(main)/records/schema';

const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000';

// ============================================
// TC-VR-07〜09: 体重の境界値テスト
// ============================================

describe('TC-VR-07: 体重0g許可', () => {
  it('体重0gは許可される', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      weight: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-VR-08: 体重2999g許可', () => {
  it('体重2999gは許可される（仕様上の上限内）', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      weight: 2999,
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-VR-09: 体重null許可', () => {
  it('体重nullは許可される', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      weight: null,
    });
    expect(result.success).toBe(true);
  });

  it('体重undefinedも許可される', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// TC-VR-10〜11: 湿度の境界値テスト
// ============================================

describe('TC-VR-10: 湿度0%許可', () => {
  it('湿度0%は許可される', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      humidity: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-VR-11: 湿度100%許可', () => {
  it('湿度100%は許可される（仕様上の上限）', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      humidity: 100,
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// TC-VR-12〜15: 食事内容の文字数テスト
// ============================================

describe('TC-VR-12: 食事内容30文字許可', () => {
  it('30文字の食事内容は許可される', () => {
    const thirtyChars = 'あ'.repeat(30);
    const result = mealSchema.safeParse({
      time: '12:00',
      content: thirtyChars,
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-VR-13: 食事内容31文字エラー', () => {
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
});

describe('TC-VR-14: 食事内容空エラー', () => {
  it('空の食事内容はエラーになる', () => {
    const result = mealSchema.safeParse({
      time: '12:00',
      content: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('TC-VR-15: 食事内容1文字許可', () => {
  it('1文字の食事内容は許可される', () => {
    const result = mealSchema.safeParse({
      time: '12:00',
      content: 'a',
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// TC-VR-16: 排泄記録の種別必須
// ============================================

describe('TC-VR-16: 排泄記録の種別必須', () => {
  it('type未指定はエラー', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      condition: 'normal',
    });
    expect(result.success).toBe(false);
  });

  it('type: urineは許可される', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'urine',
      condition: 'normal',
    });
    expect(result.success).toBe(true);
  });

  it('type: stoolは許可される', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'stool',
      condition: 'normal',
    });
    expect(result.success).toBe(true);
  });

  it('type: otherは許可される', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'other',
      condition: 'normal',
    });
    expect(result.success).toBe(true);
  });

  it('type: invalidはエラー', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'invalid',
      condition: 'normal',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================
// TC-VR-17: 排泄異常時の詳細必須
// ============================================

describe('TC-VR-17: 排泄異常時の詳細必須', () => {
  it('異常時に詳細が空の場合エラー', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'stool',
      condition: 'abnormal',
      notes: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('異常時は詳細を入力');
    }
  });

  it('異常時に詳細が未定義の場合エラー', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'stool',
      condition: 'abnormal',
    });
    expect(result.success).toBe(false);
  });

  it('異常時に詳細が入力されている場合は成功', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'stool',
      condition: 'abnormal',
      notes: '下痢気味',
    });
    expect(result.success).toBe(true);
  });

  it('正常時は詳細なしでもOK', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'stool',
      condition: 'normal',
    });
    expect(result.success).toBe(true);
  });

  it('正常時に詳細があってもOK', () => {
    const result = excretionSchema.safeParse({
      time: '09:00',
      type: 'stool',
      condition: 'normal',
      notes: '特に問題なし',
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// TC-VR-18〜19: 投薬名のバリデーション
// ============================================

describe('TC-VR-18: 投薬名必須', () => {
  it('薬の名前が空の場合エラー', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      medications: [{ time: '08:00', name: '' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('薬の名前を入力');
    }
  });

  it('薬の名前が入力されている場合は成功', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      medications: [{ time: '08:00', name: 'ビタミン剤' }],
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-VR-19: 投薬名50文字上限', () => {
  it('50文字の薬名は許可される', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      medications: [{ time: '08:00', name: 'あ'.repeat(50) }],
    });
    expect(result.success).toBe(true);
  });

  it('51文字の薬名はエラー', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      medications: [{ time: '08:00', name: 'あ'.repeat(51) }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('50文字以内');
    }
  });
});

// ============================================
// TC-VR-20: メモ1000文字上限
// ============================================

describe('TC-VR-20: メモ1000文字上限', () => {
  it('1000文字のメモは許可される', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      memo: 'あ'.repeat(1000),
    });
    expect(result.success).toBe(true);
  });

  it('1001文字のメモはエラー', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      memo: 'あ'.repeat(1001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('1000文字以内');
    }
  });

  it('空のメモは許可される', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      memo: '',
    });
    expect(result.success).toBe(true);
  });
});

// ============================================
// 複合バリデーションテスト
// ============================================

describe('健康記録の複合バリデーション', () => {
  it('完全なデータは成功する', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
      weight: 350,
      temperature: 25.5,
      humidity: 60,
      meals: [
        { time: '08:00', content: 'フード', amount: 10, unit: 'g' },
        { time: '20:00', content: 'ミルワーム', amount: 5, unit: '匹' },
      ],
      excretions: [{ time: '09:00', type: 'stool', condition: 'normal' }],
      medications: [{ time: '08:00', name: 'ビタミン剤' }],
      memo: '今日は元気でした',
    });
    expect(result.success).toBe(true);
  });

  it('必須項目のみで成功する', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: TEST_UUID,
      date: '2025-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('無効なUUIDはエラー', () => {
    const result = dailyBatchSchema.safeParse({
      hedgehogId: 'invalid-uuid',
      date: '2025-01-01',
    });
    expect(result.success).toBe(false);
  });
});
