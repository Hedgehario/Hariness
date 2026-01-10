/**
 * Supabaseクライアントのモック
 * Server Actionsテスト用
 */

import { vi } from 'vitest';

// モックユーザー
export const mockUser = {
  id: 'test-user-id-12345',
  email: 'test@example.com',
};

/**
 * TC-HH-01用: カウント付きモック
 * count パラメータで登録済みハリネズミ数をシミュレート
 */
export function createMockSupabaseForHedgehogLimit(
  count: number,
  user: typeof mockUser | null = mockUser
) {
  const mockSelectResult = {
    count,
    error: null,
  };

  const mockInsertResult = {
    data: { id: 'new-hedgehog-id-123' },
    error: null,
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue(mockSelectResult),
      })),
      insert: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          single: vi.fn().mockResolvedValue(mockInsertResult),
        })),
      })),
    })),
  };
}
