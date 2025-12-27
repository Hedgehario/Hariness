# Hariness Development Tasks

プロジェクト「Hariness」の開発進捗を管理するタスクリストです。
`implementation_plan.md` と連動して更新します。

## 🚀 Phase 1: 初期設定 & 環境構築 (完了)
- [x] プロジェクト初期化 (Next.js 15+ App Router)
- [x] Tailwind CSS v4 設定
- [x] ESLint / Prettier / フォント設定

## 🗄️ Phase 2: データベース & スキーマ (完了)
- [x] Supabaseプロジェクト連携
- [x] マイグレーション実行 (15テーブル・RLS・トリガー)
- [x] TypeScript型生成 (`database.types.ts`)

## 🎨 Phase 3: 共通UIコンポーネント (完了)
- [x] カラーテーマ設定 (Fresh & Soft Vitamin)
- [x] 基盤コンポーネント実装 (Button, Input, Card, Select, Skeleton, etc.)
- [x] デザイン確認ページ作成

## 🔐 Phase 4: 認証機能 (完了)
- [x] Server Actions (`signIn`, `signUp`, `logout`) 実装
- [x] ログイン画面 (`/login`)
- [x] 新規登録画面 (`/signup`)
- [x] Middleware (セッション管理・保護ルート)

## 🦔 Phase 5: 主要機能実装 (ホーム & 個体管理)
- [x] **5.1 飼い主プロフィール初期登録**
    - [x] Server Action: `updateProfile` 実装
    - [x] 画面実装 (`/onboarding/profile`)
- [/] **5.2 個体登録・編集**
    - [x] Server Actions (`create`, `update`, `delete`, `upload`) 実装
    - [x] 画面実装 (フォーム、画像プレビュー)
- [x] **5.3 ホーム画面**
    - [x] Server Actions (`getHedgehog`, `getReminders`) 実装
    - [x] UI実装 (ヘッダー、個体カード、クイックアクション)
- [/] **5.4 お世話リマインダー**
    - [x] Server Actions 実装 (一部: `getMyReminders`)
    - [ ] 一覧・登録画面実装
- [ ] **5.5 共通レイアウト (ヘッダー/フッター)**
    - [ ] `src/app/(main)/layout.tsx` 実装
    - [ ] ログアウト、ナビゲーションメニューの共通化

## 📊 Phase 6: 健康記録機能
- [x] **6.1 日次記録一括入力**
    - [x] Server Action: `saveDailyBatch` 実装
    - [x] 入力フォーム実装
- [ ] **6.2 記録履歴・グラフ**
    - [ ] Server Actions (`getWeightHistory` etc.) 実装
    - [ ] グラフUI実装

## 🏥 Phase 7: 通院・カレンダー
- [ ] 7.1 通院記録 (入力フォーム・保存)
- [ ] 7.2 カレンダー (月表示・イベント詳細)

## 🗺️ Phase 8: マップ・設定・通知
- [ ] 8.1 病院マップ埋め込み
- [ ] 8.2 設定画面・退会処理
- [ ] 8.3 通知一覧

## 🔧 Phase 9: 管理者機能 (P1)
- [ ] 管理者ダッシュボード・エクスポート

## ✨ Phase 10: 仕上げ
- [ ] SEO, PWA, エラーハンドリング
