import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  // リダイレクト先（デフォルトは /home）
  const next = searchParams.get('next') ?? '/home';

  const supabase = await createClient();

  // PKCE フロー: codeパラメータでセッション交換
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // セッション交換成功 → 指定されたnextページへリダイレクト
      // パスワードリセット時は next=/reset-password となっている
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
    // セッション交換失敗 → メール認証自体は成功している可能性が高い
    // （別ブラウザ/端末でリンクを開いた場合、code_verifierが無いため失敗する）
    console.error('Auth callback: code exchange failed:', error.message);
    // ログインページへ誘導（認証完了メッセージ付き）
    return NextResponse.redirect(`${origin}/login?verified=true`);
  }

  // Token Hash フロー: メール確認リンクからのトークン検証
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery',
    });
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth callback: token_hash verification failed:', error.message);
    return NextResponse.redirect(`${origin}/login?verified=true`);
  }

  // パラメータなし → エラーページ
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
