# 🦔 Hariness - ハリネズミ健康管理アプリ

ハリネズミの日々の体重、食事、排泄、通院記録を簡単に管理できるWebアプリです。

## 🌟 機能

- **日々の記録**: 体重・食事・排泄・投薬をまとめて記録
- **通院メモ**: 診断・処置・処方薬を記録
- **カレンダー**: イベント・通院・誕生日を一覧表示
- **お世話リマインダー**: 爪切り・砂浴びなどの定期タスク管理
- **体重グラフ**: 30日/90日/1年の推移を可視化
- **複数匹対応**: 複数のハリネズミを切り替えて管理

## 🛠️ 技術スタック

| カテゴリ         | 技術                    |
| ---------------- | ----------------------- |
| フレームワーク   | Next.js 16 (App Router) |
| 言語             | TypeScript              |
| スタイリング     | Tailwind CSS v4         |
| UIコンポーネント | Radix UI / shadcn/ui    |
| 認証・DB         | Supabase                |
| ホスティング     | Vercel                  |

## 📦 セットアップ

### 前提条件

- Node.js 20+
- npm 10+
- Supabaseプロジェクト

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/hariness.git
cd hariness

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
```

### 環境変数

`.env.local` に以下を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセス。

## 📁 ディレクトリ構成

```
src/
├── app/                    # ルーティング・ページ
│   ├── (auth)/             # 認証系ページ (ログイン/サインアップ)
│   ├── (main)/             # メイン機能ページ
│   │   ├── home/           # ホーム
│   │   ├── records/        # 日々の記録
│   │   ├── calendar/       # カレンダー
│   │   ├── hospital/       # 通院メモ
│   │   └── reminders/      # リマインダー
│   └── layout.tsx          # ルートレイアウト
├── components/             # UIコンポーネント
│   ├── ui/                 # 汎用UI (Button, Card, etc.)
│   ├── calendar/           # カレンダー関連
│   ├── records/            # 記録関連
│   └── layout/             # ナビゲーション等
└── lib/                    # ユーティリティ
    └── supabase/           # Supabaseクライアント
```

## 🧪 テスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e
```

## 🚀 デプロイ

### Vercelへのデプロイ

1. GitHubにプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. デプロイ実行

### Supabase設定

認証リダイレクトURLを追加:

```
https://your-app.vercel.app/auth/callback
```

## 📝 スクリプト一覧

| コマンド         | 説明               |
| ---------------- | ------------------ |
| `npm run dev`    | 開発サーバー起動   |
| `npm run build`  | 本番ビルド         |
| `npm run start`  | 本番サーバー起動   |
| `npm run lint`   | ESLint実行         |
| `npm run format` | Prettier実行       |
| `npm run test`   | ユニットテスト実行 |

## 📄 ライセンス

Private

## 🤝 コントリビューション

このプロジェクトはプライベートリポジトリです。
