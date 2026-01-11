-- Migration: Make display_name nullable and update trigger
-- Description: Allow display_name to be NULL for onboarding detection

-- 1. Make display_name column nullable
ALTER TABLE public.users ALTER COLUMN display_name DROP NOT NULL;

-- 2. Update the trigger function to set display_name as NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (new.id, new.email, NULL);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
