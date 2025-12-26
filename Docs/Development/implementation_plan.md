# Implementation Plan - Phase 1 & 2: 初期セットアップと共通基盤構築

プロジェクト「Hariness」の初期開発フェーズ（Phase 1: 環境セットアップ 〜 Phase 2: DB実装）の実装計画です。

## 1. 概要
Next.js App Routerの標準的なディレクトリ構成を作成し、Supabaseとの接続基盤、および共通UIコンポーネントのベースを構築します。また、TypeScriptの型定義とESLint/Prettier設定を調整し、開発効率を高めます。

## 2. 実装詳細

### 2.1 ディレクトリ構造の整備
`src` ディレクトリ下に以下の構造を作成します。

```
src/
├── app/
│   ├── (auth)/       # 認証関連ページ（Layout共有）
│   ├── (main)/       # メイン機能ページ（Layout共有）
│   ├── api/          # Route Handlers
│   ├── layout.tsx    # Root Layout
│   └── page.tsx      # Landing Page
├── components/
│   ├── ui/           # 基本UIパーツ (Button, Input, etc.)
│   ├── features/     # 機能単位のコンポーネント (Auth, Hedgehog, etc.)
│   └── layout/       # ヘッダー、フッターなど
├── lib/
│   ├── supabase/     # Supabaseクライアント (server/client)
│   └── utils.ts      # ユーティリティ関数
├── types/
│   ├── database.types.ts # Supabase自動生成型
│   └── index.ts      # アプリケーション共通型
└── hooks/            # カスタムHooks
```

### 2.2 Supabase接続設定
*   **パッケージ追加**: `@supabase/ssr`, `@supabase/supabase-js`
*   **環境変数**: `.env.local` に `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定（ユーザー入力待ち）。
*   **クライアント作成**:
    *   `src/lib/supabase/server.ts`: Server Actions/Component用
    *   `src/lib/supabase/client.ts`: Client Component用

### 2.3 データベース実装
*   **マイグレーション管理**: `supabase/migrations` ディレクトリを作成（ローカル開発を行う場合）。
*   **テーブル作成**: `Docs/Specifications/11_ER図、テーブル定義書.md` に基づきSQLを作成。
*   **型生成**: `supabase gen types` コマンド等を用いて `database.types.ts` を生成。

### 2.4 共通UI基盤 (Tailwind CSS)
*   `tailwind.config.ts` (v4の場合はCSSファイル) を調整し、プロジェクトのカラーパレット（メインカラー、アクセントカラー）を定義。
*   `Docs/Specifications/07_画面構成リスト.md` に基づく基本コンポーネントの実装。

## 3. 検証計画

### 3.1 動作確認
*   **ビルド検証**: `npm run build` がエラーなく通ること。
*   **Lint検証**: `npm run lint` が警告なしで通ること。
*   **接続検証**: Supabaseクライアントを通じて、簡単なデータ取得（例: `auth.getUser()`）が成功すること。

### 3.2 ディレクトリ確認
*   作成したディレクトリ構造が意図通りであることを `ls` コマンド等で確認。
