-- Migration: Add type column to excretion_records
-- Description: Add excretion type (stool/urine) column to track the type of excretion

ALTER TABLE public.excretion_records
ADD COLUMN type TEXT NOT NULL DEFAULT 'stool';

-- Add comment for clarity
COMMENT ON COLUMN public.excretion_records.type IS 'Type of excretion: stool, urine, or other';
