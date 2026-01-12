import { createClient } from '@supabase/supabase-js';

/**
 * Admin client for privileged operations.
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable.
 * Do NOT use this on the client side.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL環境変数が設定されていません。.env.localファイルを確認してください。'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY環境変数が設定されていません。Supabaseダッシュボードの「Settings」→「API」からService Role Keyを取得し、.env.localファイルに設定してください。'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
