-- hospital_visitsテーブルにcost（診察費用）カラムを追加
-- 円単位の整数、任意入力（NULL許可）
ALTER TABLE hospital_visits ADD COLUMN cost integer;
