-- リマインダー時間フィールドのNULL許可マイグレーション
-- 目的: 「終日」(null) と「深夜0時」(00:00) を明確に区別する

-- 1. target_time カラムを NULL 許可に変更
ALTER TABLE care_reminders ALTER COLUMN target_time DROP NOT NULL;

-- 2. 既存の 00:00 データを NULL に変換（終日として扱われていたもの）
-- 注意: この変換は既存データが「終日」の意図で 00:00 に設定されていた場合のみ実行
-- 新規で0時に設定したリマインダーがある場合は、この UPDATE を実行しないでください
-- UPDATE care_reminders SET target_time = NULL WHERE target_time = '00:00:00';

-- 確認用クエリ
-- SELECT id, title, target_time FROM care_reminders;
