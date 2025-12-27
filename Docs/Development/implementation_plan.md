# Implementation Plan - Phase 1 to 4: 基盤構築から認証機能まで

## 1. 概要
Phase 1（環境構築）、Phase 2（DB構築）、Phase 3（共通UI実装）が完了しました。
現在は **Phase 4: 認証機能 (Auth)** の実装フェーズにあります。

## 2. 進捗状況 (Status)

### ✅ Phase 1: 開発環境セットアップ (Completed)
- [x] プロジェクト初期化 (Next.js 16.1.1, Tailwind CSS v4)
- [x] ディレクトリ構造の整備 (`src/components`, `src/lib`, etc.)
- [x] ベストプラクティス・コーディング規約の策定

### ✅ Phase 2: データベース構築 & 接続設定 (Completed)
- [x] Supabaseプロジェクト連携 (`.env.local`)
- [x] マイグレーション実行 (Users, Hedgehogs, Records等 全15テーブル)
- [x] TypeScript型定義 (`database.types.ts`) の実装

### ✅ Phase 3: 共通UI実装 (Design System) (Completed)
- [x] Tailwind CSSテーマ設定 (配色: Fresh & Soft Vitamin)
- [x] 共通コンポーネント実装 (Button, Input, Select, Card, Textarea, Skeleton, Label)
- [x] デザイン確認ページ (`/design-system`) の作成

## 3. 今後の実装計画

### 🔐 Phase 4: 認証機能 (Auth)
**目標**: ユーザーが安全にログイン・新規登録・ログアウトできる状態にする。

#### 4.1 認証基盤
- [ ] **Middleware実装**: セッション管理と保護ルート(`/(main)/*`)のリダイレクト処理。
- [ ] **AuthProvider**: コンテキストによるユーザー状態の管理（必要であれば）。

#### 4.2 画面実装
- [ ] **ログイン画面 (`/login`)**:
    - メールアドレス/パスワード入力フォーム
    - `signIn` Server Actionの実装
- [ ] **新規登録画面 (`/signup`)**:
    - ユーザー情報入力フォーム
    - `signUp` Server Actionの実装
    - プロフィール自動作成トリガーの確認
- [ ] **ログアウト機能**: ヘッダー/メニューへの組み込み

### 🦔 Phase 5: 主要機能実装 (Core Features)
**目標**: ハリネズミの登録と日々の記録ができるようにする。

#### 5.1 ホーム & 個体管理
- [ ] ホーム画面ダッシュボード (`/home`)
- [ ] 個体登録・編集フロー

#### 5.2 記録機能
- [ ] 体重、食事、排泄の記録フォーム
- [ ] カレンダー表示

### ⚙️ Phase 6: QA & デプロイ
- [ ] 動作検証
- [ ] Vercelへのデプロイ
