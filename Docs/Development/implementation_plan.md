# 🦔 Hariness 実装計画書 (Implementation Plan)

## 📝 ドキュメントステータス

- **最終更新日**: 2026-01-05
- **基準ドキュメント**:
  - `05_要件定義書.md`, `14_バリデーション設計書.md`, `12_API仕様書.md`
  - `nextjs_best_practices.md`

## 🚀 フェーズサマリー

| フェーズ     | 機能グループ                          | ステータス | 優先度 |
| :----------- | :------------------------------------ | :--------- | :----- |
| **Phase 1**  | 初期設定 & 環境構築                   | ✅ 完了    | 必須   |
| **Phase 2**  | データベース & スキーマ               | ✅ 完了    | 必須   |
| **Phase 3**  | UIコンポーネント (デザインシステム)   | ✅ 完了    | 必須   |
| **Phase 4**  | 認証機能 (Auth)                       | ✅ 完了    | 必須   |
| **Phase 5**  | 主要機能 (ホーム & 個体管理)          | ✅ 完了    | 必須   |
| **Phase 6**  | 健康記録 (グラフ & 入力)              | ✅ 完了    | 必須   |
| **Phase 7**  | 通院 & カレンダー                     | ✅ 完了    | 必須   |
| **Phase 8**  | マップ・設定・通知                    | ✅ 完了    | 必須   |
| **Phase 9**  | 管理者機能                            | ✅ 完了    | P1     |
| **Phase 10** | 仕上げ・SEO・PWA                      | ✅ 完了    | 必須   |
| **Phase 11** | レスポンシブ対応                      | ✅ 完了    | 必須   |
| **Phase 12** | UIリデザイン                          | ✅ 完了    | 必須   |
| **Phase 13** | 必須機能 (P0) の追加実装              | ✅ 完了    | 必須   |
| **Phase 14** | API標準化 & 最適化                    | ✅ 完了    | 必須   |
| **Phase 15** | 仕様整合性検証 (バリデーション・例外) | ✅ 完了    | 必須   |
| **Phase 16** | コード品質改善 (Lint修正)             | ✅ 完了    | 必須   |

---

## 🛠 詳細タスク

### 🦔 Phase 1: 初期設定 (Project Setup) - ✅ 完了

- [x] Next.js 16+ App Router プロジェクト初期化
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
  - [x] `signUp` (新規登録)
  - [x] `signIn` (ログイン)
  - [x] `logout` (ログアウト)
- [x] **画面実装**:
  - [x] ログイン画面 (A01) - エラー処理含む
  - [x] 新規登録画面 (A02) - バリデーション含む
  - [x] Authコールバック (`/auth/callback`)
- [x] **ミドルウェア**:
  - [x] セッション管理 (Supabase SSR)
  - [x] 保護ルートのリダイレクト (`/home` 等)

---

### 🦔 Phase 5: 主要機能実装 - ホーム & 個体管理 (Core Features) - ✅ 完了

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
  - [x] **個体削除機能 (UI & Action 連携)**

#### 5.3 ホーム画面 (H10)

- [x] **Server Actions**: `getHedgehogById(id)`, `getMyReminders()`
- [x] **UIコンポーネント**:
  - [x] **ヘッダー**: 設定アイコン、通知アイコン
  - [x] **個体切替**: 複数飼育時の切替タブ/ドロップダウン
  - [x] **個体カード**: 写真、名前、年齢(月齢計算)、特徴表示
  - [x] **クイックアクション**: 「今日の記録」(H10-2), 「通院記録」(H10-3)
  - [x] **リマインダー/アラート**: 当日の予定表示
  - [x] **フッター**: 協会リンク (Instagram, Web, Mailto)

#### 5.4 お世話リマインダー (H11, H12)

- [x] **Server Actions**: `saveReminder`, `toggleReminder`, `completeReminder`, `deleteReminder`
  - _一部 `getMyReminders` 実装済み_
  - _不足分のActionsを追加実装_
- [x] **画面実装**:
  - [x] **一覧画面 (`/reminders`)**:
    - [x] 時間順ソート表示
    - [x] 完了/未完了のトグル操作
    - [x] 削除機能
  - [x] **登録・編集UI**:
    - [x] モーダルまたは別ページでの入力フォーム
    - [x] 入力項目: タイトル、時間、繰り返し設定(毎日/曜日)、有効/無効
  - [x] **ホーム画面連携**:
    - [x] クイック追加ボタンの設置

#### 5.5 共通レイアウト (ヘッダー/フッター)

- [x] **レイアウト実装 (`src/app/(main)/layout.tsx`)**:
  - [x] 共通ヘッダー（タイトル、ログアウト⇒設定へ移動、通知/設定アイコン）
        ※ボトムナビゲーションとは別に、ホーム画面最下部（スクロールエリア内）に配置。

---

### 🦔 Phase 6: 健康記録機能 (Vital Records) - ✅ 完了

**目標**: グラフによる健康管理と、日々の効率的な記録入力。

#### 6.1 日次記録一括入力フォーム (R12)

- [x] **記録履歴機能**
  - [x] 体重グラフ (Recharts)
  - [x] 記録リスト (サマリー表示)
  - [x] 日付ナビゲーション & タブ切り替え
- [x] **UI改善 (仕様準拠)**
  - [x] 体重/環境カードの分離
  - [x] 投薬セクションの追加
  - [x] 固定ヘッダー & 固定ボトムボタン
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

### 🦔 Phase 7: カレンダー & 通院記録 - ✅ 完了

#### 7.1 データベース & Server Actions

- [x] **スキーマ確認**: `calendar_events` と `hospital_visits` を検証済み。
- [x] **Server Actions**:
  - `getMonthlyEvents`: マージされたイベントを取得。
  - `saveEvent`, `deleteEvent`: 実装済み。

#### 7.2 カレンダーUI (C10)

- [x] **ページ**: `src/app/(main)/calendar/page.tsx` (/hospital から名称変更)
- [x] **コンポーネント**: `CalendarContainer` (react-day-picker).
- [x] **コンポーネント**: `DayEventsSheet` (ボトムシート).
- [x] **機能**: ドットインジケーター, 通院/イベントのマージ表示.

#### 7.3 イベント管理 (C11) - ✅ 完了

- [x] **ページ**: `src/app/(main)/calendar/events/entry/page.tsx`.
- [x] **フォーム**: タイトル, 日付入力, バリデーション.
- [x] **リファクタ**: ルートを `/calendar` に更新.

#### 7.4 通院記録 (V10) - ✅ 完了

- [x] **ディレクトリ**: `src/app/(main)/hospital` (通院記録専用).
  - Note: `/calendar` (閲覧) とは分離.
- [x] **ページ**: `src/app/(main)/hospital/entry/page.tsx` (または類似).
- [x] **機能**:
  - 診断, 処置, 薬 (名前 + メモ), 次回通院日.
  - ホーム (H10-3) からリンク.
- [x] **UX改善**: フォームUIの統一 & フォーカスモード (ボトムナビ非表示).

#### 7.5 UI統一 & データメンテナンス (最終仕上げ) - ✅ 完了

- [x] **UI統一**:
  - [x] 日次記録 / 通院記録フォームの一貫性 (フッター, ヘッダー, 日付ナビ).
  - [x] 統一された個体セレクター (Radix UI).
- [x] **データシード**:
  - [x] `/seed` ページ作成.
  - [x] ダミーデータ生成用 Server Actions (個体, 記録, 通院).
- [x] **バグ修正**:
  - [x] Actions における `date` vs `record_date` の不一致を修正.
  - [x] テーブル名修正 `physical_condition_records` -> `environment_records`.

---

### 🦔 Phase 8: マップ・設定・通知 (Other Features)

#### 8.1 病院マップ (M10) - ✅ 完了

- [x] **マップ画面実装** (`src/app/(main)/map/page.tsx`)
  - [x] Google My Map (またはGoogle Maps埋め込み) を `iframe` で表示。
  - [x] レスポンシブ対応 (高さ調整)。
  - [x] プレースホルダーIDでの実装完了。

#### 8.2 設定 (S00 - S15) - ✅ 完了

- [x] プロフィール編集、通知設定、規約確認、退会処理

#### 8.3 通知 (I10) - ✅ 完了

- [x] お知らせとアラートの統合表示 (お知らせ管理機能により実装済み, 通知ページへの統合)

---

### 🦔 Phase 9: 管理者機能 (Admin) - ✅ 完了

- [x] **管理者権限チェック & ダッシュボード**
  - [x] `/admin` レイアウト作成: `users.role` をチェックし、権限がない場合はリダイレクト。
  - [x] ダッシュボード画面: 機能メニュー（エクスポート、お知らせ管理）を表示。
- [x] **データエクスポート機能 (ADM10)**
  - [x] エクスポート画面: 対象期間、データ種別（ユーザー/個体/記録）を選択。
  - [x] CSV生成アクション: 選択されたデータをCSV形式で出力。
- [x] **お知らせ管理機能 (ADM20)**
  - [x] 一覧画面、編集・作成機能実装。
- [x] **管理者アカウント作成について**
  - [x] 手順: 一般ユーザーとしてサインアップ後、SQLで `role` を `admin` に更新する（管理画面からの作成は非対応）。

### 🦔 Phase 10: 仕上げ・最適化 (Polish) - ✅ 完了

- [x] メタデータ(SEO)設定
- [x] PWA対応 (manifest.json)
- [x] エラーハンドリング強化 (`error.tsx`, `not-found.tsx`)
- [x] 最終動作検証

---

### 🦔 Phase 11: レスポンシブ対応 & レイアウト修正 (Responsive Fixes) - ✅ 完了

**目標**: デバイスの画面サイズに合わせて最適化されたレイアウトを提供する（"True Responsive"）。
スマートフォンでは「ボトムナビゲーション・縦積みレイアウト」、PC/タブレットでは「サイドバー・2カラムレイアウト」を採用し、大画面のメリットを活かす。

- [x] **グローバルレイアウト修正 (`src/app/(main)/layout.tsx`)**
  - [x] コンテンツエリアの `max-w-md` 制限を解除し、レスポンシブなグリッド/Flexレイアウトへ変更。
  - [x] **ナビゲーション分岐**:
    - [x] Mobile: `BottomNav` (既存, `md:hidden`)
    - [x] Desktop: `SideNav` (新規, `hidden lg:flex`) ※Breakpoint変更含む
- [x] **カレンダー画面のレスポンシブ化 (`src/components/calendar/calendar-container.tsx`)**
  - [x] Desktop (`lg`以上): 2カラムレイアウト（左：カレンダー、右：予定リスト/詳細）。
  - [x] Mobile: 既存の縦積みレイアウト維持。
- [x] **その他ページの確認**
  - [x] ホーム画面や記録画面の表示確認 (`lg` ブレークポイント基準)。

---

### 🎨 Phase 12: UIリデザイン (Pro Design Guide Implementation) - ✅ 完了

**目標**: デザインガイド (`Docs/Design/ui_design_guide.md`) に基づき、プロフェッショナルな品質、ハリネズミへの安全性、ユーザーの愛着喚起を実現する。

#### 12.1 デザインシステム刷新

- [x] **タイポグラフィ**: `Zen Maru Gothic` を全面適用。数値や見出しのカーニング調整。
- [x] **Hedgehog Safe Mode (Dark Mode)**:
  - [x] 完全な黒 (`#000`) を撤廃し、目に優しい `Deep Cocoa` / `Deep Warm Gray` を採用。
  - [x] ブルーライトを低減した配色ルールを `globals.css` に実装。

#### 12.2 コンポーネントリファクタリング

- [x] **Button**: `rounded-full` (ピル型) を基本とし、クリック時の `scale-95` アニメーションを追加。
- [x] **Card**: 濃い影を廃止し、`shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]` で「置かれた」質感を表現。
- [x] **Input**: 背景色を `bg-stone-50` に変更し、視認性と入力体験を向上。

#### 12.3 アイコン & ビジュアル

- [x] **Lucide React 統一**:
  - [x] 絵文字 (`📝`, `🏥`, `🔔` 等) を排除し、線画アイコン (`NotepadText`, `Hospital`, `Bell`) に統一。
  - [x] 線幅 2px、非アクティブ時は Outline、アクティブ時は Fill のルールを徹底。
- [x] **ホーム画面**: クイックアクションボタン、フッターリンクのデザイン整合性確保。

### 🦔 Phase 13: 必須機能 (P0) の追加実装 - ✅ 完了

#### 13.1 アラート管理機能 (Function 5)

- [x] **ロジック実装**: `getAlerts(hedgehogId)`
  - [x] 体重減少検知: 直近の記録と比較し、一定割合以上減少でアラート。
- [x] **UI実装**: ホーム画面にアラート表示エリアを追加。

#### 13.2 カレンダー誕生日表示 (Function 7)

- [x] **Action改修**: `getMonthlyEvents` に誕生日取得ロジックを追加。
- [x] **UI改修**: カレンダー上で誕生日を特別アイコン（🎂）で表示。

#### 13.3 リマインダー自動リセット (Function 4)

- [x] **ロジック実装**: `last_completed_date` に基づくリセットロジックの実装。

---

### 🦔 Phase 14: API標準化 & 最適化 (API Standardization) - ✅ 完了

**目標**: API仕様書との整合性を確保し、エラーハンドリングとレスポンス型を統一して保守性を向上させる。

#### 14.1 共通レスポンス型の適用

- [x] **型定義**: `ActionResponse<T>` の定義 (`src/types/actions.ts`)。
- [x] **全Server Actionsへの適用**:
  - [x] Auth (`login`, `signup`, `...`)
  - [x] Hedgehogs (`create`, `update`, `delete`)
  - [x] Records (`saveDailyBatch`)
  - [x] Reminders (`saveReminder`)
  - [x] その他 (`calendar`, `hospital`, `admin`)
- [x] **UI連携**: 各フォーム (`useActionState` 等) のエラーハンドリング修正。

#### 14.2 実装不備・バグ修正

- [x] **リマインダー**: 曜日指定・頻度設定のロジック修正。
- [x] **記録**: スキーマフィールド名 (`foodType` → `content`) の仕様書準拠修正。
- [x] **エクスポート**: 管理者機能のデータ出力ロジック整備。

---

### 🦔 Phase 15: 仕様整合性検証 (Validation & Exceptions) - ✅ 完了

**目標**: バリデーション仕様書・例外仕様書に基づき、システムの信頼性とUXを向上させる。

#### 15.1 エラーコード標準化

- [x] **定義**: `ErrorCode` 定数 (`E001` - `E999`) の実装 (`src/types/errors.ts`)。
- [x] **適用**: 全 Server Actions で文字列リテラルの代わりに定数を使用。

#### 15.2 バリデーションスキーマ整合性

- [x] **スキーマ検証**: `src/**/schema.ts` の定義を `14_バリデーション設計書.md` に適合。
- [x] **不整合修正**:
  - [x] 食事内容 (`content`) の文字数制限追加。
  - [x] 投薬記録 (`medication`) のフィールド名修正 (`content` -> `name`)。

#### 15.3 UIエラーハンドリング強化

- [x] **認証ガード**: `AUTH_REQUIRED` (E003) 発生時のログイン画面リダイレクト処理。
- [x] **フィールドエラー**: Form UI での適切な場所へのエラーメッセージ表示。

---

### 🦔 Phase 16: コード品質改善 (Code Quality & Lint) - ✅ 完了

**目標**: 静的解析ツールによるコード品質の担保と、潜在的なバグの排除。

#### 16.1 Lintエラー解消

- [x] **自動修正**: `npm run lint:fix` によるフォーマット等の修正。
- [x] **手動修正**:
  - [x] `explicit-any` エラーの解消 (型ガード導入)。
  - [x] 未使用変数 (`unused-vars`) の削除。

#### 16.2 コード復元・補正

- [x] **実装漏れ対応**: 実装確認過程で一時的に無効化・削除されていたロジック (`logout`, `exportData` 等) の完全復元。
- [x] **最終確認**: `npm run lint` がエラーゼロで通過することを確認。

---
