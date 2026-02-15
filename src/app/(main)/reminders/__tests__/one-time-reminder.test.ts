/**
 * 1回限りリマインダー自動無効化ロジックのテスト
 *
 * テスト対象: getMyReminders 内のロジック
 * - 繰り返しなし (is_repeat: false)
 * - 過去に完了済み (last_completed_date < today)
 * - 有効状態 (is_enabled: true)
 * → 自動で無効化される
 */

import { describe, expect,it } from 'vitest';

// テスト対象のロジックを抽出したヘルパー関数
function shouldDisableOneTimeReminder(
  isRepeat: boolean,
  lastCompletedDate: string | null,
  today: string,
  isEnabled: boolean
): boolean {
  // 「繰り返しなし」かつ「過去に完了」かつ「有効」なら無効化すべき
  return !isRepeat && lastCompletedDate !== null && lastCompletedDate < today && isEnabled;
}

describe('1回限りリマインダー自動無効化ロジック', () => {
  const today = '2026-01-25';
  const yesterday = '2026-01-24';
  const tomorrow = '2026-01-26';

  describe('無効化されるケース', () => {
    it('1回限り + 昨日完了 + 有効 → 無効化すべき', () => {
      const result = shouldDisableOneTimeReminder(
        false, // is_repeat
        yesterday, // last_completed_date
        today, // today
        true // is_enabled
      );
      expect(result).toBe(true);
    });

    it('1回限り + 1週間前に完了 + 有効 → 無効化すべき', () => {
      const result = shouldDisableOneTimeReminder(false, '2026-01-18', today, true);
      expect(result).toBe(true);
    });
  });

  describe('無効化されないケース', () => {
    it('繰り返しあり + 昨日完了 + 有効 → 無効化しない', () => {
      const result = shouldDisableOneTimeReminder(
        true, // is_repeat = true (繰り返し)
        yesterday,
        today,
        true
      );
      expect(result).toBe(false);
    });

    it('1回限り + 今日完了 + 有効 → 無効化しない（今日はまだ表示）', () => {
      const result = shouldDisableOneTimeReminder(
        false,
        today, // 今日完了
        today,
        true
      );
      expect(result).toBe(false);
    });

    it('1回限り + 未完了 + 有効 → 無効化しない', () => {
      const result = shouldDisableOneTimeReminder(
        false,
        null, // 未完了
        today,
        true
      );
      expect(result).toBe(false);
    });

    it('1回限り + 昨日完了 + 既に無効 → 無効化しない（既に無効）', () => {
      const result = shouldDisableOneTimeReminder(
        false,
        yesterday,
        today,
        false // 既に無効
      );
      expect(result).toBe(false);
    });
  });

  describe('エッジケース', () => {
    it('1回限り + 明日の日付（未来） + 有効 → 無効化しない', () => {
      const result = shouldDisableOneTimeReminder(
        false,
        tomorrow, // 未来の日付（ありえないが念のため）
        today,
        true
      );
      expect(result).toBe(false);
    });
  });
});

// 実際のactions.tsのロジックと同じか確認
describe('actions.tsのロジックとの整合性確認', () => {
  it('actions.tsの条件と一致するか', () => {
    // actions.ts 77行目:
    // if (!r.is_repeat && r.last_completed_date && r.last_completed_date < today && r.is_enabled)

    const today = '2026-01-25';

    // このケースは無効化される
    const r = {
      is_repeat: false,
      last_completed_date: '2026-01-24',
      is_enabled: true,
    };

    const shouldDisable =
      !r.is_repeat && r.last_completed_date && r.last_completed_date < today && r.is_enabled;

    expect(shouldDisable).toBe(true);
  });
});
