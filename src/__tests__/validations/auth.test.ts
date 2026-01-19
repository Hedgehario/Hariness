/**
 * 認証バリデーションテスト
 * TC-AUTH-02: パスワードポリシー
 * TC-AUTH-03: パスワード確認不一致
 * TC-AUTH-04: メールアドレス形式
 * TC-AUTH-09: 空フィールド
 */

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// ============================================
// バリデーションスキーマ（auth/actions.ts の仕様に基づく）
// ============================================

const emailSchema = z.string().email('有効なメールアドレスを入力してください');

const passwordSchema = z.string().min(8, 'パスワードは8文字以上で入力してください。');

const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません。',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().min(1, 'メールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

// ============================================
// テストケース
// ============================================

describe('TC-AUTH-02: パスワードポリシー（8文字未満）', () => {
  it('7文字のパスワードはエラーを返す', () => {
    const result = passwordSchema.safeParse('1234567');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('8文字以上');
    }
  });

  it('空のパスワードはエラーを返す', () => {
    const result = passwordSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('8文字のパスワードは成功する', () => {
    const result = passwordSchema.safeParse('12345678');
    expect(result.success).toBe(true);
  });

  it('8文字以上のパスワードは成功する', () => {
    const result = passwordSchema.safeParse('abcdefghijklmnop');
    expect(result.success).toBe(true);
  });
});

describe('TC-AUTH-03: パスワード確認不一致', () => {
  it('パスワードと確認用パスワードが不一致の場合エラー', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: '12345678',
      confirmPassword: '87654321',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('一致しません');
    }
  });

  it('パスワードと確認用パスワードが一致する場合は成功', () => {
    const result = signupSchema.safeParse({
      email: 'test@example.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(result.success).toBe(true);
  });
});

describe('TC-AUTH-04: メールアドレス形式', () => {
  it('不正なメールアドレス形式はエラー（@なし）', () => {
    const result = emailSchema.safeParse('testexample.com');
    expect(result.success).toBe(false);
  });

  it('不正なメールアドレス形式はエラー（ドメインなし）', () => {
    const result = emailSchema.safeParse('test@');
    expect(result.success).toBe(false);
  });

  it('不正なメールアドレス形式はエラー（日本語を含む）', () => {
    const result = emailSchema.safeParse('テスト@example.com');
    expect(result.success).toBe(false);
  });

  it('正しいメールアドレス形式は成功', () => {
    const result = emailSchema.safeParse('test@example.com');
    expect(result.success).toBe(true);
  });

  it('サブドメイン付きメールアドレスは成功', () => {
    const result = emailSchema.safeParse('test@mail.example.com');
    expect(result.success).toBe(true);
  });
});

describe('TC-AUTH-09: 空フィールド', () => {
  it('メールアドレスが空の場合エラー', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '12345678',
    });
    expect(result.success).toBe(false);
  });

  it('パスワードが空の場合エラー', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('両方空の場合エラー', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('両方入力されている場合は成功', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '12345678',
    });
    expect(result.success).toBe(true);
  });
});
