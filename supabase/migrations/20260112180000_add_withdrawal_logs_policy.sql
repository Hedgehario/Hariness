-- ============================================================
-- Add INSERT policy for withdrawal_logs table
-- Allows authenticated users to insert their own withdrawal log
-- ============================================================

-- Allow authenticated users to insert their own withdrawal log
DROP POLICY IF EXISTS "Users can insert own withdrawal log" ON public.withdrawal_logs;
CREATE POLICY "Users can insert own withdrawal log"
    ON public.withdrawal_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Note: SELECT, UPDATE, DELETE are intentionally not allowed for regular users
-- Admin access should be handled via service role or separate admin policies
