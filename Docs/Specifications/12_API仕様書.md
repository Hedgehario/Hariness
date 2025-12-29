# API仕様書（Server Actions）

プロジェクト名: Hariness（ハリネス）  
作成日: 2025年12月18日  
作成者: 城田 航  
最終更新日: 2025年12月18日

---

## 1. 概要と目的

### 1.1 概要

本ドキュメントは、Hariness アプリケーションにおけるバックエンド機能（Server Actions）のインターフェース仕様を定義したものである。  
Next.js App Router と Supabase を採用し、REST API ではなく Server Actions として実装される各関数の仕様を網羅する。

### 1.2 目的

- フロントエンドとバックエンドの実装境界を明確にする。
- 各機能に必要なパラメータと戻り値を定義し、開発時の手戻りを防ぐ。
- 認証要件やデータ処理の責任範囲を明確化し、セキュリティと保守性を担保する。

---

## 2. 仕様書の読み方と共通ルール

### 2.1 関連ドキュメント

- `07_画面構成リスト.md`: 画面IDと画面名の対応、各画面のUI要素とアクション
- `12-1_API仕様書_型定義.md`: リクエスト・レスポンスの詳細な型定義
- `13_例外仕様書.md`: エラー発生時の挙動とコード定義
- `11_ER図、テーブル定義書.md`: データベース構造

### 2.2 表の見方

| 項目           | 説明                    | 具体例                                      |
| :------------- | :---------------------- | :------------------------------------------ |
| **関数名**     | 呼び出す関数の名前      | `updateProfile`                             |
| **認証**       | 実行に必要な権限        | **必須** (ログイン要), **不要**, **管理者** |
| **関連画面**   | このAPIを使用する画面ID | `A09, S10`                                  |
| **パラメータ** | 関数に渡すデータ        | `data: UpdateProfileInput`                  |
| **戻り値**     | 成功時の返却データ      | `User`                                      |

### 2.3 共通レスポンス型

全ての Server Actions は、必ず以下の `ActionResponse` 型を返す。

```typescript
type ActionResponse<T = null> = {
  success: boolean; // 成功: true, 失敗: false
  message?: string; // ユーザー向けメッセージ (例: "保存しました")
  data?: T; // 成功時のデータ (戻り値なしの場合は null)
  error?: {
    // 失敗時の詳細
    code: string; // エラーコード (例: "VALIDATION_ERROR")
    details?: any; // 詳細情報
  };
};
```

---

## 3. 認証・ユーザー管理 (Auth/User)

### 3.1 認証・パスワード (A01~A08, S00, S15)

| 関数名                 | 概要                   |   認証   | 関連画面 | パラメータ            | 戻り値 |
| :--------------------- | :--------------------- | :------: | :------- | :-------------------- | :----- |
| `signUpAction`         | 新規会員登録           |   不要   | A02      | `input: SignUpInput`  | `null` |
| `signInAction`         | ログイン               |   不要   | A01      | `input: SignInInput`  | `null` |
| `signOutAction`        | ログアウト             |   不要   | S00, S15 | なし                  | `null` |
| `resetPasswordAction`  | パスワードリセット送信 |   不要   | A05      | `email: string`       | `null` |
| `updatePasswordAction` | パスワード更新         | **必須** | A07      | `newPassword: string` | `null` |

### 3.2 飼い主プロフィール (A09, S10)

| 関数名                       | 概要             |   認証   | 関連画面 | パラメータ                            | 戻り値          |
| :--------------------------- | :--------------- | :------: | :------- | :------------------------------------ | :-------------- |
| `getProfile`                 | プロフィール取得 | **必須** | A09, S10 | `userId?: string` (省略時は自身)      | `User`          |
| `updateProfile`              | プロフィール更新 | **必須** | A09, S10 | `data: UpdateProfileInput`            | `User` (更新後) |
| `deleteAccount`              | 退会処理         | **必須** | S13      | `reason: string`                      | `null`          |
| `updateNotificationSettings` | 通知設定更新     | **必須** | S11      | `settings: NotificationSettingsInput` | `null`          |

---

## 4. 個体管理 (Hedgehogs)

### 4.1 個体データ操作 (A10, P10, H10)

| 関数名            | 概要             |   認証   | 関連画面        | パラメータ                                                                | 戻り値       |
| :---------------- | :--------------- | :------: | :-------------- | :------------------------------------------------------------------------ | :----------- |
| `getMyHedgehogs`  | 自分の全個体取得 | **必須** | H10             | なし                                                                      | `Hedgehog[]` |
| `getHedgehogById` | 個体詳細取得     | **必須** | A10, P10, H10   | `hedgehogId: string`                                                      | `Hedgehog`   |
| `createHedgehog`  | 個体新規登録     | **必須** | A10, P10, H10-1 | `data: CreateHedgehogInput`<br>`imageFile?: File`                         | `Hedgehog`   |
| `updateHedgehog`  | 個体情報編集     | **必須** | A10, P10, H10-1 | `hedgehogId: string`<br>`data: UpdateHedgehogInput`<br>`imageFile?: File` | `Hedgehog`   |
| `deleteHedgehog`  | 個体削除         | **必須** | P10             | `hedgehogId: string`                                                      | `null`       |

> **📝 注意事項**  
> `imageFile` を指定する場合は `FormData` 経由で渡す必要がある（Next.js Server Actions の制約）。

### 4.2 ホーム/リマインダー (H10, H11, H12)

| 関数名             | 概要                      |   認証   | 関連画面 | パラメータ                                          | 戻り値           |
| :----------------- | :------------------------ | :------: | :------- | :-------------------------------------------------- | :--------------- |
| `getMyReminders`   | リマインダー一覧取得      | **必須** | H10, H11 | なし                                                | `CareReminder[]` |
| `saveReminder`     | リマインダー設定登録/更新 | **必須** | H12      | `data: CareReminderInput`                           | `null`           |
| `toggleReminder`   | リマインダー有効/無効切替 | **必須** | H11      | `reminderId: string`<br>`isEnabled: boolean`        | `null`           |
| `completeReminder` | リマインダー完了チェック  | **必須** | H11      | `reminderId: string`<br>`date: string` (YYYY-MM-DD) | `null`           |
| `deleteReminder`   | リマインダー設定削除      | **必須** | H12      | `reminderId: string`                                | `null`           |

---

## 5. 健康記録 (Vital Records)

### 5.1 記録一覧・グラフ (R10, R11, R13)

| 関数名                          | 概要                     |   認証   | 関連画面 | パラメータ                                                                                  | 戻り値                |
| :------------------------------ | :----------------------- | :------: | :------- | :------------------------------------------------------------------------------------------ | :-------------------- |
| `getDailyRecords`               | 指定日の全記録取得       | **必須** | R10, R11 | `hedgehogId: string`<br>`date: string` (YYYY-MM-DD)                                         | `DailyRecords`        |
| `getWeightHistory`              | 体重推移データ取得       | **必須** | R13      | `hedgehogId: string`<br>`range: HistoryRange`<br>`startDate?: string`<br>`endDate?: string` | `WeightRecord[]`      |
| `getTemperatureHumidityHistory` | 気温・湿度推移データ取得 | **必須** | R13      | `hedgehogId: string`<br>`range: HistoryRange`<br>`startDate?: string`<br>`endDate?: string` | `EnvironmentRecord[]` |

> **📝 期間指定 (`range`) の仕様**
>
> - `'30d'`, `'90d'`, `'180d'` の場合: `startDate`, `endDate` は不要
> - `'range'` の場合: `startDate`, `endDate` (YYYY-MM-DD) が必須

### 5.2 記録登録・編集 (R12, H10-2)

| 関数名           | 概要                 |   認証   | 関連画面   | パラメータ                                                                           | 戻り値 |
| :--------------- | :------------------- | :------: | :--------- | :----------------------------------------------------------------------------------- | :----- |
| `saveDailyBatch` | **日次記録一括保存** | **必須** | R12, H10-2 | `hedgehogId: string`<br>`date: string` (YYYY-MM-DD)<br>`data: DailyRecordBatchInput` | `null` |

> **⚠️ 削除ロジック**  
> 指定日の既存記録のうち、`data` の各配列に含まれない ID のレコードは**自動的に削除**される（完全同期仕様）。

---

## 6. 通院・カレンダー・通知

### 6.1 通院記録 (V10, V11, H10-3)

| 関数名              | 概要              |   認証   | 関連画面        | パラメータ                 | 戻り値 |
| :------------------ | :---------------- | :------: | :-------------- | :------------------------- | :----- |
| `saveHospitalVisit` | 通院記録登録/更新 | **必須** | V10, V11, H10-3 | `data: HospitalVisitInput` | `null` |

### 6.2 カレンダー・イベント (C10, C11, C12)

| 関数名                | 概要                     |   認証   | 関連画面 | パラメータ                               | 戻り値            |
| :-------------------- | :----------------------- | :------: | :------- | :--------------------------------------- | :---------------- |
| `getEvents`           | イベント取得（範囲指定） | **必須** | C10      | `startDate: string`<br>`endDate: string` | `CalendarEvent[]` |
| `saveCalendarEvent`   | イベント登録/更新        | **必須** | C11      | `data: CalendarEventInput`               | `null`            |
| `deleteCalendarEvent` | イベント削除             | **必須** | C10      | `eventId: string`                        | `null`            |

### 6.3 通知・お知らせ (I10, S11, ホーム🔔)

| 関数名                   | 概要         |   認証   | 関連画面 | パラメータ                                            | 戻り値               |
| :----------------------- | :----------- | :------: | :------- | :---------------------------------------------------- | :------------------- |
| `getNotifications`       | 通知一覧取得 | **必須** | I10, H10 | `limit?: number` (デフォルト: 10)                     | `NotificationItem[]` |
| `markNotificationAsRead` | 通知既読化   | **必須** | I10      | `notificationId: string`<br>`type: 'news' \| 'alert'` | `null`               |

---

## 7. 管理者機能 (ADM00, ADM10, ADM20)

| 関数名                   | 概要                           |    認証    | 関連画面 | パラメータ                                                                              | 戻り値                     |
| :----------------------- | :----------------------------- | :--------: | :------- | :-------------------------------------------------------------------------------------- | :------------------------- |
| `getAdminDashboardStats` | 管理ダッシュボード統計情報取得 | **管理者** | ADM00    | なし                                                                                    | `AdminDashboardStats`      |
| `exportDataAsCsv`        | CSVデータ出力                  | **管理者** | ADM10    | `types: ExportType[]`<br>`startDate: string` (YYYYMMDD)<br>`endDate: string` (YYYYMMDD) | `string` (ダウンロードURL) |
| `createNews`             | お知らせ作成                   | **管理者** | ADM20    | `data: CreateNewsInput`                                                                 | `News`                     |

> **📝 エクスポート機能の注意**
>
> - `exportDataAsCsv` の日付パラメータは **`YYYYMMDD` 形式（ハイフンなし）** です。他のAPI（`YYYY-MM-DD`）とは異なるため注意してください。
> - 直接 Blob を返さず、署名付きURL等を返却する想定。

---
