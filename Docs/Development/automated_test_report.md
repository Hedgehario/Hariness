# 自動テスト報告書

**プロジェクト名**: Hariness（ハリネス）  
**作成日**: 2026-01-06  
**対象**: MVP v0.1.0

---

## 1. 概要

本ドキュメントは、P0テストケースの自動化実施結果をまとめた報告書です。

---

## 2. テスト結果サマリー

| フェーズ | 内容 | テスト数 | 結果 | ツール |
|----------|------|----------|------|--------|
| 1 | バリデーションテスト | 23件 | ✅ 全パス | Vitest |
| 2 | Server Actionsテスト | 9件 | ✅ 全パス | Vitest |
| 3 | E2Eテスト | 2件 | ✅ 全パス | Playwright |
| 4 | 画像アップロードテスト | 10件 | ✅ 全パス | Vitest |
| **合計** | | **44件** | **全パス** | |

---

## 3. 自動化済みテストケース

### 3.1 フェーズ1: バリデーションテスト（Vitest）

| テストID | 項目 | 件数 | ファイル |
|----------|------|------|----------|
| TC-AUTH-02 | パスワード8文字以上 | 4 | `validations/auth.test.ts` |
| TC-HH-03 | 生年月日 ≤ お迎え日 | 6 | `validations/hedgehog.test.ts` |
| TC-VR-07 | 数値レンジ（体重・湿度） | 6 | `validations/records.test.ts` |
| TC-VR-08 | 食事内容30文字制限 | 3 | `validations/records.test.ts` |
| - | ユーティリティ関数 | 4 | `lib/utils.test.ts` |

### 3.2 フェーズ2: Server Actionsテスト（Vitest + モック）

| テストID | 項目 | 件数 | ファイル |
|----------|------|------|----------|
| TC-HH-01 | 最大10頭制限 | 4 | `actions/hedgehog.test.ts` |
| TC-VR-01 | 一括保存ロジック | 5 | `actions/records.test.ts` |

### 3.3 フェーズ3: E2Eテスト（Playwright）

| テストID | 項目 | 件数 | ファイル |
|----------|------|------|----------|
| TC-HH-06 | ゼロ状態UI | 1 | `e2e/basic.spec.ts` |
| TC-SYS-01 | カレンダー表示 | 1 | `e2e/basic.spec.ts` |

---

## 4. 手動検証済みテストケース

以下のテストケースは手動で検証し、全て **PASS** を確認しました。

| テストID | 項目 | 検証日 | 結果 |
|----------|------|--------|------|
| TC-AUTH-06 | セッション切れ時のリダイレクト | 2026-01-07 | ✅ PASS |
| TC-HH-04 | 画像アップロード | 2026-01-06 | ✅ PASS |

### TC-AUTH-06 検証詳細

- **検証方法**: Cookie/localStorage削除によるセッション無効化
- **検証結果**:
  - ✅ 非ログイン状態で `/home` アクセス → `/login` へリダイレクト確認
  - ✅ 既存ユーザーでログイン成功 → `/home` 表示確認
  - ✅ セッション無効化後の再アクセス → `/login` へリダイレクト確認

### TC-HH-04 検証詳細

- **実装完了**: `uploadHedgehogImage`, `deleteHedgehogImage` 関数
- **検証結果**: Supabase Storageへのアップロード・削除正常動作

---

## 5. 未自動化のP0テストケース（手動テスト継続）

| テストID | 項目 | 理由 |
|----------|------|------|
| TC-AUTH-01 | 重複登録防止 | Supabase Authの挙動に依存 |
| TC-AUTH-03 | 退会・物理削除 | DB操作の確認が必要 |
| TC-AUTH-04/05 | RLS（認可） | 複数ユーザーセッションが必要 |
| TC-HH-02 | 連鎖削除 | DB制約の確認が必要 |
| TC-VR-02〜06 | トランザクション等 | 複雑なDB操作 |
| TC-SYS-02 | ネットワーク遮断 | ブラウザ操作が複雑 |
| TC-SYS-03 | リマインダー自動遷移 | 日時操作が必要 |

---

## 6. テスト実行方法

```bash
# ユニット/統合テスト（Vitest）
npm run test:run

# カバレッジ付き
npm run test:coverage

# E2Eテスト（Playwright）
npm run test:e2e

# E2E（UIモード）
npm run test:e2e:ui
```

---

## 7. 作成ファイル一覧

| ファイル | 説明 |
|----------|------|
| `vitest.config.ts` | Vitest設定 |
| `vitest.setup.ts` | テストセットアップ |
| `playwright.config.ts` | Playwright設定 |
| `src/__tests__/mocks/supabase.ts` | Supabaseモック |
| `src/__tests__/validations/*.ts` | バリデーションテスト |
| `src/__tests__/actions/*.ts` | Server Actionsテスト |
| `src/lib/utils.test.ts` | ユーティリティテスト |
| `e2e/basic.spec.ts` | E2Eテスト |

---

## 8. 備考

- 全P0機能が実装完了済み
- 手動検証が必要な項目は本番環境での受入テスト時に再確認推奨

---

**最終更新日**: 2026-01-07
