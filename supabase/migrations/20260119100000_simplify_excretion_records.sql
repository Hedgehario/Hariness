-- Migration: Simplify excretion_records
-- Description: Change from multiple records per day to single record with stool/urine status
-- 
-- Before: Multiple records with type (stool/urine), time, condition
-- After: Single record per day with stool_condition, urine_condition, notes

-- Step 1: Add new columns
ALTER TABLE public.excretion_records
ADD COLUMN stool_condition TEXT,
ADD COLUMN urine_condition TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.excretion_records.stool_condition IS 'Stool condition: none, normal, abnormal';
COMMENT ON COLUMN public.excretion_records.urine_condition IS 'Urine condition: none, normal, abnormal';

-- Step 2: Migrate existing data
-- For each hedgehog_id + record_date combination, consolidate into single record
WITH consolidated AS (
  SELECT 
    hedgehog_id,
    record_date,
    -- Get stool condition (prefer abnormal if exists, then normal, then none)
    COALESCE(
      MAX(CASE WHEN type = 'stool' AND condition = 'abnormal' THEN 'abnormal' END),
      MAX(CASE WHEN type = 'stool' AND condition = 'normal' THEN 'normal' END),
      'none'
    ) as stool_cond,
    -- Get urine condition (prefer abnormal if exists, then normal, then none)
    COALESCE(
      MAX(CASE WHEN type = 'urine' AND condition = 'abnormal' THEN 'abnormal' END),
      MAX(CASE WHEN type = 'urine' AND condition = 'normal' THEN 'normal' END),
      'none'
    ) as urine_cond,
    -- Combine all details/notes into one
    STRING_AGG(COALESCE(details, ''), ' ' ORDER BY record_time) as combined_notes
  FROM public.excretion_records
  GROUP BY hedgehog_id, record_date
),
-- Get the first record ID for each combination (to keep)
first_records AS (
  SELECT DISTINCT ON (hedgehog_id, record_date) 
    id, hedgehog_id, record_date
  FROM public.excretion_records
  ORDER BY hedgehog_id, record_date, created_at
)
UPDATE public.excretion_records er
SET 
  stool_condition = c.stool_cond,
  urine_condition = c.urine_cond,
  details = NULLIF(TRIM(c.combined_notes), '')
FROM consolidated c
WHERE er.hedgehog_id = c.hedgehog_id 
  AND er.record_date = c.record_date
  AND er.id IN (SELECT id FROM first_records);

-- Step 3: Delete duplicate records (keep only first per day)
DELETE FROM public.excretion_records
WHERE id NOT IN (
  SELECT DISTINCT ON (hedgehog_id, record_date) id
  FROM public.excretion_records
  ORDER BY hedgehog_id, record_date, created_at
);

-- Step 4: Drop old columns that are no longer needed
ALTER TABLE public.excretion_records
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS condition,
DROP COLUMN IF EXISTS record_time;

-- Step 5: Add unique constraint (1 record per hedgehog per day)
ALTER TABLE public.excretion_records
ADD CONSTRAINT excretion_records_hedgehog_date_unique 
UNIQUE (hedgehog_id, record_date);

-- Step 6: Set defaults for new columns
ALTER TABLE public.excretion_records
ALTER COLUMN stool_condition SET DEFAULT 'none',
ALTER COLUMN urine_condition SET DEFAULT 'none';
