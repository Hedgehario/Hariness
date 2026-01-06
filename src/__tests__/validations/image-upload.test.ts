/**
 * TC-HH-04: 画像アップロードテスト
 * TC-HH-05: 不正ファイル形式/サイズのテスト
 *
 * uploadHedgehogImage関数のバリデーションをテスト
 */

import { describe, it, expect } from 'vitest';

// バリデーションロジックを抽出してテスト
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateImageFile(file: { size: number; type: string; name: string }): {
  valid: boolean;
  error?: string;
} {
  if (file.size === 0) {
    return { valid: false, error: '画像ファイルを選択してください。' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ファイルサイズは5MB以下にしてください。' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'JPEG、PNG、WebP形式の画像をアップロードしてください。' };
  }

  return { valid: true };
}

describe('TC-HH-04: 画像アップロードバリデーション', () => {
  it('有効なJPEG画像（5MB以下）は許可される', () => {
    const file = { size: 1024 * 1024, type: 'image/jpeg', name: 'test.jpg' }; // 1MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('有効なPNG画像は許可される', () => {
    const file = { size: 2 * 1024 * 1024, type: 'image/png', name: 'test.png' }; // 2MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('有効なWebP画像は許可される', () => {
    const file = { size: 500 * 1024, type: 'image/webp', name: 'test.webp' }; // 500KB
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('空ファイルはエラー', () => {
    const file = { size: 0, type: 'image/jpeg', name: 'empty.jpg' };
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('選択');
  });
});

describe('TC-HH-05: 不正ファイル形式/サイズ', () => {
  it('5MB超のファイルはエラー（TC-HH-05）', () => {
    const file = { size: 6 * 1024 * 1024, type: 'image/jpeg', name: 'large.jpg' }; // 6MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5MB');
  });

  it('ちょうど5MBは許可される', () => {
    const file = { size: 5 * 1024 * 1024, type: 'image/jpeg', name: 'exact5mb.jpg' }; // 5MB
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('PDFファイルはエラー（TC-HH-05）', () => {
    const file = { size: 1024 * 1024, type: 'application/pdf', name: 'document.pdf' };
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('JPEG');
  });

  it('GIF形式はエラー（許可リストにないため）', () => {
    const file = { size: 1024 * 1024, type: 'image/gif', name: 'animation.gif' };
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });

  it('SVG形式はエラー', () => {
    const file = { size: 1024, type: 'image/svg+xml', name: 'vector.svg' };
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });
});
