-- Migration: Add dosage column to medication_records
-- Description: Add dosage/dosage instructions field for better medication tracking

ALTER TABLE public.medication_records
ADD COLUMN dosage TEXT;

COMMENT ON COLUMN public.medication_records.dosage IS 'Dosage amount and instructions (e.g., "1錠", "0.5ml", "1日2回")';
