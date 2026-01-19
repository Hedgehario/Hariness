/**
 * 通院記録バリデーションテスト
 * TC-HV-01: ハリネズミID必須
 * TC-HV-02: 受診日必須
 * TC-HV-03: タイトル100文字上限
 * TC-HV-04: 診断名500文字上限
 * TC-HV-05: 治療内容500文字上限
 * TC-HV-06: 薬名必須
 * TC-HV-07: 薬名50文字上限
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// ============================================
// スキーマ（hospital/actions.ts の仕様に基づく）
// ============================================

const MedicineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, '薬名は必須です').max(50, '薬名は50文字以内で入力してください'),
  note: z.string().max(100, '備考は100文字以内で入力してください').optional(),
});

const HospitalVisitSchema = z.object({
  id: z.string().optional(),
  hedgehog_id: z.string().min(1, 'ハリネズミの選択は必須です'),
  visit_date: z.string().min(1, '受診日は必須です'),
  title: z.string().max(100, 'タイトルは100文字以内で入力してください').optional(),
  diagnosis: z.string().max(500, '診断名は500文字以内で入力してください').optional(),
  treatment: z.string().max(500, '治療内容は500文字以内で入力してください').optional(),
  medications: z.array(MedicineSchema).optional(),
  next_visit_date: z.string().optional().nullable(),
});

// ============================================
// テストケース
// ============================================

const TEST_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('TC-HV-01: ハリネズミID必須', () => {
  it('ハリネズミIDが空の場合エラー', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: '',
      visit_date: '2025-01-15',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('ハリネズミの選択は必須');
    }
  });

  it('ハリネズミIDが指定されている場合は成功', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-HV-02: 受診日必須', () => {
  it('受診日が空の場合エラー', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('受診日は必須');
    }
  });

  it('受診日が指定されている場合は成功', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-HV-03: タイトル100文字上限', () => {
  it('100文字のタイトルは許可される', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      title: 'あ'.repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it('101文字のタイトルはエラー', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      title: 'あ'.repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('100文字以内');
    }
  });

  it('タイトル空は許可される（任意項目）', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      title: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-HV-04: 診断名500文字上限', () => {
  it('500文字の診断名は許可される', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      diagnosis: 'あ'.repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it('501文字の診断名はエラー', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      diagnosis: 'あ'.repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('500文字以内');
    }
  });
});

describe('TC-HV-05: 治療内容500文字上限', () => {
  it('500文字の治療内容は許可される', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      treatment: 'あ'.repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it('501文字の治療内容はエラー', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      treatment: 'あ'.repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('500文字以内');
    }
  });
});

describe('TC-HV-06: 薬名必須', () => {
  it('薬名が空の場合エラー', () => {
    const result = MedicineSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('薬名は必須');
    }
  });

  it('薬名が入力されている場合は成功', () => {
    const result = MedicineSchema.safeParse({
      name: 'ビタミン剤',
    });
    expect(result.success).toBe(true);
  });

  it('配列内の薬名が空の場合もエラー', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      medications: [{ name: '' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('TC-HV-07: 薬名50文字上限', () => {
  it('50文字の薬名は許可される', () => {
    const result = MedicineSchema.safeParse({
      name: 'あ'.repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it('51文字の薬名はエラー', () => {
    const result = MedicineSchema.safeParse({
      name: 'あ'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('50文字以内');
    }
  });
});

describe('通院記録の複合バリデーション', () => {
  it('完全なデータは成功する', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
      title: '定期検診',
      diagnosis: '健康状態良好',
      treatment: '特になし',
      medications: [
        { name: 'ビタミン剤', note: '毎日1回' },
        { name: '整腸剤' },
      ],
      next_visit_date: '2025-02-15',
    });
    expect(result.success).toBe(true);
  });

  it('最小限のデータ（必須項目のみ）で成功する', () => {
    const result = HospitalVisitSchema.safeParse({
      hedgehog_id: TEST_UUID,
      visit_date: '2025-01-15',
    });
    expect(result.success).toBe(true);
  });
});
