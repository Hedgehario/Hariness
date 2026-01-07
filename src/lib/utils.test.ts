import { describe, expect,it } from 'vitest';

import { cn } from './utils';

describe('cn (classNames utility)', () => {
  it('複数のクラス名を結合できる', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('条件付きクラス名を処理できる', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('Tailwindの重複クラスをマージできる', () => {
    // 後のクラスが優先される（tailwind-merge の機能）
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('空の入力を処理できる', () => {
    expect(cn()).toBe('');
  });
});
