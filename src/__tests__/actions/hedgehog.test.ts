/**
 * TC-HH-01: 最大頭数制限テスト
 * 11頭目の登録でE007 (LIMIT_EXCEEDED) エラーを返すことを確認
 */

import { beforeEach,describe, expect, it, vi } from 'vitest';

import { createHedgehog } from '@/app/(main)/hedgehogs/actions';

import { createMockSupabaseForHedgehogLimit } from '../mocks/supabase';

// Helper interface matching internal type in actions.ts
interface SupabaseClientLike {
  auth: { getUser: () => Promise<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
  from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Next.js のモジュールをモック
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('TC-HH-01: 最大頭数制限', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('10頭登録済みの状態で11頭目を登録しようとするとエラー', async () => {
    const mockClient = createMockSupabaseForHedgehogLimit(10);

    const result = await createHedgehog(
      {
        name: 'テストハリネズミ',
        gender: 'male',
      },
      mockClient as unknown as SupabaseClientLike
    );

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('上限');
  });

  it('9頭登録済みの状態で10頭目は登録成功', async () => {
    const mockClient = createMockSupabaseForHedgehogLimit(9);

    const result = await createHedgehog(
      {
        name: 'テストハリネズミ',
        gender: 'male',
      },
      mockClient as unknown as SupabaseClientLike
    );

    expect(result.success).toBe(true);
  });

  it('0頭の状態で1頭目は登録成功', async () => {
    const mockClient = createMockSupabaseForHedgehogLimit(0);

    const result = await createHedgehog(
      {
        name: 'はじめてのハリネズミ',
        gender: 'female',
      },
      mockClient as unknown as SupabaseClientLike
    );

    expect(result.success).toBe(true);
  });

  it('未ログイン状態ではエラー', async () => {
    const mockClient = createMockSupabaseForHedgehogLimit(0, null);

    const result = await createHedgehog(
      {
        name: 'テスト',
      },
      mockClient as unknown as SupabaseClientLike
    );

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('ログイン');
  });
});
