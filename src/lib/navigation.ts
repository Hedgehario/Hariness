/**
 * ナビゲーション関連のユーティリティ関数
 *
 * @see Docs/Design/ui_design_guide.md セクション6「ナビゲーション設計ルール」
 */

/**
 * L3 (入力フォーム) ページかどうかを判定する
 *
 * L3ページの条件:
 * - URLに '/entry' を含む（記録入力、リマインダー作成など）
 * - URLが '/hedgehogs/new' である（ハリネズミ新規登録）
 * - URLが '/hedgehogs/[id]/edit' のパターンに一致（ハリネズミ編集）
 *
 * L3ページでは以下の動作が適用される:
 * - メインヘッダー非表示
 * - ボトムナビゲーション非表示
 * - 下部余白なし（pb-0）
 *
 * @param pathname - 現在のパス（usePathname()の戻り値）
 * @returns L3ページの場合はtrue
 */
export function isL3Page(pathname: string): boolean {
  return (
    pathname.includes('/entry') ||
    pathname.includes('/hedgehogs/new') ||
    /\/hedgehogs\/[^/]+\/edit/.test(pathname)
  );
}
