# Coding Conventions & Implementation Rules

プロジェクト「Hariness」の開発における実装ルールとコーディング規約です。
詳細な仕様は `Docs/Specifications` ディレクトリ内の各設計書に従いますが、開発時は本ドキュメントを「チートシート」として参照してください。

## 1. テクノロジースタック
*   **Framework**: Next.js 15+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Backend**: Supabase (Auth, Database, Storage)
*   **Deployment**: Vercel

## 2. 命名規約

### 2.1 ファイル・ディレクトリ
*   **コンポーネント**: `PascalCase` (例: `Button.tsx`, `UserProfile.tsx`)
*   **一般ファイル/ユーティリティ**: `camelCase` (例: `utils.ts`, `dateFormatter.ts`)
*   **Next.js App Router**: ケバブケース推奨 (`app/login/page.tsx`, `app/my-page/page.tsx`)

### 2.2 コード
*   **変数/関数**: `camelCase`
*   **コンポーネント関数**: `PascalCase`
*   **型/インターフェース**: `PascalCase`
*   **定数**: `UPPER_SNAKE_CASE` (例: `MAX_FILE_SIZE`)

## 3. 実装ルール

### 3.1 コンポーネント設計
*   **Functional Components**: 全て関数コンポーネントで定義。
*   **Props**: TypeScriptインターフェースで明示的に定義。
*   **Client vs Server**: Next.js App Routerの原則に従い、必要な場合のみ `'use client'` を付与。可能な限りServer Componentを利用する。

### 3.2 データフェッチ & Server Actions
*   **データ取得**: Server Component内での直接フェッチを優先。
*   **データ更新**: Server Actionsを使用。API Routes (`app/api`) はWebhook等が必要な場合のみ使用。
*   **型安全性**: `database.types.ts` を活用し、`any` の使用は避ける。

### 3.3 エラーハンドリング (`13_例外仕様書.md`)
*   Server Actionsは共通レスポンス型 `ActionResponse<T>` を返す。
*   エラーコード体系 (`E001`, `E999` 等) を遵守。
*   UI側では `toast` 等を用いて適切にフィードバックを表示。

### 3.4 バリデーション (`14_バリデーション設計書.md`)
*   **Frontend**: Zod + React Hook Form 等での即時チェック。
*   **Backend**: Server Actions内での Zod 検証（必須）。
*   **Database**: NOT NULL, CHECK制約による最終防衛。

## 4. Git コミットメッセージ規約 (参考)
*   `feat: 新機能追加`
*   `fix: バグ修正`
*   `docs: ドキュメント修正`
*   `style: コードフォーマット（機能変更なし）`
*   `refactor: リファクタリング`
*   `chore: ビルド設定など`

## 5. 主要ドキュメントへのリンク
*   [画面構成リスト](../Specifications/07_画面構成リスト.md)
*   [ER図・テーブル定義](../Specifications/11_ER図、テーブル定義書.md)
*   [API仕様書](../Specifications/12_API仕様書.md)
