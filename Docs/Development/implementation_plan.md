# 🦔 Hariness 実装計画書 (Implementation Plan)

## 📝 ドキュメントステータス
- **最終更新日**: 2025-12-27
- **基準ドキュメント**: 
    - `05_要件定義書.md`, `14_バリデーション設計書.md`, `12_API仕様書.md`
    - `nextjs_best_practices.md`

## 🚀 フェーズサマリー

| フェーズ | 機能グループ | ステータス | 優先度 |
| :--- | :--- | :--- | :--- |
| **Phase 1** | 初期設定 & 環境構築 | ✅ 完了 | 必須 |
| **Phase 2** | データベース & スキーマ | ✅ 完了 | 必須 |
| **Phase 3** | UIコンポーネント (デザインシステム) | ✅ 完了 | 必須 |
| **Phase 4** | 認証機能 (Auth) | ✅ 完了 | 必須 |
| **Phase 5** | 主要機能 (ホーム & 個体管理) | 🚧 着手 | 必須 |
| **Phase 6** | 健康記録 (グラフ & 入力) | 📅 予定 | 必須 |
| **Phase 7** | 通院 & カレンダー | ✅ 完了 | 必須 |
| **Phase 8** | マップ・設定・通知 | 📅 予定 | 必須 |
| **Phase 9** | 管理者機能 | 📅 予定 | P1 |
| **Phase 10** | 仕上げ・SEO・PWA | 📅 予定 | 必須 |

---

## 🛠 詳細タスク

### 🦔 Phase 1: 初期設定 (Project Setup) - ✅ 完了
- [x] Next.js 15+ App Router プロジェクト初期化
- [x] Tailwind CSS v4 設定 (`globals.css` と HSL変数)
- [x] ESLint / Prettier 設定
- [x] フォント設定 (Zen Maru Gothic)

### 🦔 Phase 2: データベース構築 (Database & Schema) - ✅ 完了
- [x] Supabase プロジェクト連携
- [x] マイグレーション実行 (`20251226173000_initial_schema.sql`)
    - [x] 全15テーブル作成 (`users`, `hedgehogs`, `weight_records` 等)
    - [x] RLSポリシー定義
    - [x] トリガー作成 (`updated_at` 等)
- [x] TypeScript型生成 (`database.types.ts`)

### 🦔 Phase 3: 共通UIコンポーネント (Design System) - ✅ 完了
- [x] **テーマ適用**: フレッシュ＆ソフト・ビタミン (オレンジ/ライム/クリーム)
- [x] **コアコンポーネント実装**:
    - [x] `Button`
    - [x] `Input`, `Textarea`, `Label`
    - [x] `Card` (Header, Content, Footer)
    - [x] `Select` (Radix UI ベース)
    - [x] `Skeleton`
- [x] **デザイン確認**: `src/app/design-system/page.tsx`

### 🦔 Phase 4: 認証機能 (Authentication) - ✅ 完了
- [x] **Server Actions (`src/app/(auth)/actions.ts`)**:
    - [x] `signUp` (A02)
    - [x] `signIn` (A01)
    - [x] `logout`
- [x] **画面実装**:
    - [x] ログイン画面 (A01) - エラー処理含む
    - [x] 新規登録画面 (A02) - バリデーション含む
    - [x] Authコールバック (`/auth/callback`)
- [x] **Middleware**:
    - [x] セッション管理 (Supabase SSR)
    - [x] 保護ルートのリダイレクト (`/home` 等)

---

### 🦔 Phase 5: 主要機能実装 - ホーム & 個体管理 (Core Features)
**目標**: ユーザーログイン後、飼い主プロフィールの登録、個体登録を経て、ホーム画面が利用可能になること。

#### 5.1 飼い主プロフィール初期登録 (A09)
- [x] **Server Action**: `updateProfile(data)` の実装 (`getProfile` も含む)
    - [x] バリデーション: ニックネーム必須 (最大50文字)
- [x] **画面実装 (`/onboarding/profile`)**:
    - [x] 入力フォーム: ニックネーム、性別、年代、居住地
    - [x] 完了後、個体登録へ遷移

#### 5.2 個体登録・編集 (P10, A10)
- [x] **Server Actions**:
    - [x] `createHedgehog(data)`
    - [x] `updateHedgehog(id, data)`
    - [ ] `deleteHedgehog(id)`
    - [x] `getMyHedgehogs()`
    - [x] 画像アップロード処理 (`hedgehog-images` バケット)
- [x] **画面実装 (`/hedgehogs/new`, `/hedgehogs/[id]/edit`)**:
    - [x] 入力項目: 名前(必須)、性別、生年月日、お迎え日、画像、特徴、保険番号
    - [x] バリデーション: 未来日チェック、画像サイズチェック
    - [x] 画像プレビュー機能

#### 5.3 ホーム画面 (H10)
- [x] **Server Actions**: `getHedgehogById(id)`, `getMyReminders()`
- [x] **UIコンポーネント**:
    - [x] **ヘッダー**: 設定アイコン、通知アイコン
    - [x] **個体切替**: 複数飼育時の切替タブ/ドロップダウン
    - [x] **個体カード**: 写真、名前、年齢(月齢計算)、特徴表示
    - [x] **クイックアクション**: 「今日の記録」(H10-2), 「通院記録」(H10-3)
    - [x] **リマインダー/アラート**: 当日の予定表示
    - [x] **フッター**: 協会リンク

#### 5.4 お世話リマインダー (H11, H12)
- [x] **Server Actions**: `saveReminder`, `toggleReminder`, `completeReminder`, `deleteReminder`
    - *一部 `getMyReminders` 実装済み*
- [ ] **画面実装**:
    - [ ] **一覧 (H11)**: 時間順ソート、完了チェックボックス
    - [ ] **登録・編集 (H12)**: 時間設定、繰り返し設定(毎日/曜日)

#### 5.5 共通レイアウト (ヘッダー/フッター)
- [x] **レイアウト実装 (`src/app/(main)/layout.tsx`)**:
    - [x] 共通ヘッダー（タイトル、ログアウト⇒設定へ移動、通知/設定アイコン）
    - [x] 共通ボトムナビゲーション（ホーム、記録履歴、カレンダー、マップ）
    - [x] メインコンテンツエリアのスタイル統一

---

### 🦔 Phase 6: 健康記録機能 (Vital Records)
**目標**: グラフによる健康管理と、日々の効率的な記録入力。

#### 6.1 日次記録一括入力フォーム (R12)
- [x] **Record History Features**
  - [x] Weight Graph (Recharts)
  - [x] Record List (Summary View)
  - [x] Date Navigation & Tab Switching
- [x] **UI Refinement (Spec Compliance)**
  - [x] Separate Weight/Environment cards
  - [x] Add Medication section
  - [x] Sticky Header & Fixed Bottom Button
- [x] **Server Actions**:
    - [x] `getDailyRecords(hedgehogId, date)`
    - [x] `saveDailyBatch(hedgehogId, date, data)` (食事・排泄の配列処理含む)
- [x] **画面実装 (`/records/[id]/entry`)**:
    - [x] 日付ナビゲーション
    - [x] 体重・温湿度: 数値入力
    - [x] 食事・排泄・投薬: 動的リスト(追加/削除)
    - [x] バリデーション実装 (食事30文字制限など)

#### 6.2 記録履歴・グラフ (R10, R11, R13)
- [x] **Server Actions**: `getWeightHistory`, `getTemperatureHumidityHistory`
- [x] **画面実装 (`/records/[id]`, `/records`)**:
    - [x] **リスト表示 (R10)**: 履歴一覧 (タブ切り替え実装)
    - [x] **詳細表示 (R11)**: 既存の入力画面(`entry`)ヘ遷移
    - [x] **グラフ表示 (R13)**: Recharts導入、期間切替(30日/90日/180日)

---

#### 7.1 Database & Server Actions
- [x] **Schema Check**: Verified `calendar_events` and `hospital_visits`.
- [x] **Server Actions**:
  - `getMonthlyEvents`: Fetches merged events.
  - `saveEvent`, `deleteEvent`: Implemented.

#### 7.2 Calendar UI (C10)
- [x] **Page**: `src/app/(main)/calendar/page.tsx` (Renamed from /hospital)
- [x] **Component**: `CalendarContainer` (react-day-picker).
- [x] **Component**: `DayEventsSheet` (Bottom sheet).
- [x] **Features**: Dot indicators, Hospital/Event merging.

#### 7.3 Event Management (C11) - ✅ 完了
- [x] **Page**: `src/app/(main)/calendar/events/entry/page.tsx`.
- [x] **Form**: Title, Date inputs, Validation.
- [x] **Refactor**: Route updated to `/calendar`.

#### 7.4 Hospital Records (V10) - ✅ 完了
- [x] **Directory**: `src/app/(main)/hospital` (Dedicated to Visits).
  - Note: Separated from `/calendar` (View).
- [x] **Page**: `src/app/(main)/hospital/entry/page.tsx` (or similar).
- [x] **Feature**:
  - Diagnosis, Treatment, Medicine (Name + Note), Next Visit Date.
  - Linked from Home (H10-3).
- [x] **UX Improvement**: Unified Form UI & Focus Mode (Hidden Bottom Nav).
- [ ] **V11 Confirmation Screen**: Skipped for MVC (Direct Save).

#### 7.5 UI Unification & Data Maintenance (Final Polish) - ✅ 完了
- [x] **UI Unification**:
    - [x] Daily Record / Hospital Visit Form Consistency (Footer, Header, DateNavi).
    - [x] Unified Hedgehog Selector (Radix UI).
- [x] **Data Seeding**:
    - [x] `/seed` page created.
    - [x] Server Actions for dummy data generation (Hedgehogs, Records, Visits).
- [x] **Bug Fixes**:
    - [x] Corrected `date` vs `record_date` mismatch in Actions.
    - [x] Fixed table name `physical_condition_records` -> `environment_records`.

---

### 🦔 Phase 8: マップ・設定・通知 (Other Features)

#### 8.1 病院マップ (M10)
- [ ] Google My Map 埋め込み実装

#### 8.2 設定 (S00 - S15)
- [ ] プロフィール編集、通知設定、規約確認、退会処理

#### 8.3 通知 (I10)
- [ ] お知らせとアラートの統合表示

---

### 🦔 Phase 9: 管理者機能 (Admin) - *P1*
- [ ] 管理者権限チェック (Middleware)
- [ ] ダッシュボード (ADM00)、CSVエクスポート (ADM10)、お知らせ管理 (ADM20)

### 🦔 Phase 10: 仕上げ・最適化 (Polish)
- [ ] メタデータ(SEO)設定
- [ ] PWA対応 (manifest.json, Service Worker)
- [ ] エラーハンドリング強化 (`error.tsx`)
- [ ] 最終動作検証
