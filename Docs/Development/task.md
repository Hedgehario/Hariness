# Hariness Development Tasks

プロジェクト「Hariness」の開発進捗を管理するタスクリストです。
MVPリリース（2025/1/21予定）に向けた実装項目を網羅しています。

## 🚀 フェーズ1: 開発環境セットアップ
- [x] プロジェクト構成（Next.js App Router）の確認
- [x] 開発用ドキュメントの整備 (`Docs/Development/`)
- [x] **Supabase接続と環境変数設定** (`.env.local`)
- [x] プロジェクトディレクトリ構造の作成 (`src/components`, `src/lib`, `src/types`, etc.)
- [x] **Next.js App Router ベストプラクティス策定** (`Docs/Development/nextjs_best_practices.md`)
- [ ] 共通設定（ESLint, Prettier, TypeScript）の調整

## 🗄️ フェーズ2: データベース & 型定義実装
- [ ] **Supabaseマイグレーションファイルの作成**
    - [ ] Users, Hedgehogs, Records系テーブル定義
    - [ ] RLSポリシー（Row Level Security）の実装
    - [ ] Supabaseへの適用と確認
- [ ] **TypeScript型定義の実装**
    - [ ] `src/types/database.types.ts` (Supabase自動生成 or 手動)
    - [ ] `src/types/schema.ts` (アプリケーション内部型 - API仕様書準拠)

## 🎨 フェーズ3: 共通UI実装 (Design System)
- [x] **Tailwind CSS設定** (theme, colors, fonts)
- [x] **共通UIコンポーネント (Atoms/Molecules)**
    - [x] Button, Input, Select, Textarea
    - [x] Card, Modal, Toast (Notification)
    - [x] Spinner / Loading Skeleton
- [x] **レイアウトコンポーネント**
    - [ ] Bottom Navigation (Mobile Tab)
    - [ ] Header / Layout Wrapper

## 🔐 フェーズ4: 認証機能 (Auth)
- [ ] ログイン画面 (`/login`)
- [ ] 新規登録画面 (`/signup`)
- [ ] パスワードリセットフロー
- [ ] Server Actions: `signUp`, `signIn`, `signOut`
- [ ] Middlewareによるセッション管理とリダイレクト

## 🦔 フェーズ5: 主要機能実装 (Core Features)

### 5.1 個体管理
- [ ] ホーム画面 (`/home`) - 個体切替UI
- [ ] 個体登録・編集画面 (`/hedgehogs/*`)
- [ ] 画像アップロード機能 (Supabase Storage)

### 5.2 健康記録 (Daily Records)
- [ ] 今日の記録画面 (`/records/today`)
- [ ] 一括保存ロジック (Server Actions: `saveDailyBatch`)
- [ ] 記録履歴・カレンダー表示 (`/records/history`)
- [ ] グラフ表示機能 (`/records/analytics`)

### 5.3 通院・ケア管理
- [ ] 通院記録 (`/hospital`)
- [ ] お世話リマインダー設定 (`/reminders`)
- [ ] マップ表示 (`/map`)

## ⚙️ フェーズ6: 設定・管理者機能
- [ ] ユーザー設定・プロフィール編集
- [ ] 管理者ダッシュボード (データ閲覧)
- [ ] CSVエクスポート機能

## ✅ フェーズ7: テスト・検証 & PWA化
- [ ] 重点項目の動作検証（テスト設計書準拠）
- [ ] PWAマニフェスト設定 (`manifest.json`)
- [ ] 本番ビルド確認
