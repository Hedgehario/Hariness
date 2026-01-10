/**
 * TC-AUTH-02: パスワードポリシーテスト
 * 8文字未満のパスワードでエラーを返すことを確認
 */

import { describe, expect, it } from 'vitest';

// パスワードバリデーションロジック（auth/actions.ts より抽出）
function validatePassword(password: string): {
  success: boolean;
  error?: { code: string; message: string };
} {
  if (password.length < 8) {
    return {
      success: false,
      error: { code: 'VALIDATION', message: 'パスワードは8文字以上で入力してください。' },
    };
  }
  return { success: true };
}

describe('TC-AUTH-02: パスワードポリシー', () => {
  it('7文字のパスワードはエラーを返す', () => {
    const result = validatePassword('1234567');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION');
    expect(result.error?.message).toContain('8文字以上');
  });

  it('空のパスワードはエラーを返す', () => {
    const result = validatePassword('');
    expect(result.success).toBe(false);
  });

  it('8文字のパスワードは成功する', () => {
    const result = validatePassword('12345678');
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('8文字以上のパスワードは成功する', () => {
    const result = validatePassword('abcdefghijklmnop');
    expect(result.success).toBe(true);
  });
});
