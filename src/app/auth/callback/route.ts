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
    console.error('Auth callback error (code exchange):', error.message);
  }

  // Token Hash フロー: メール確認リンクからのトークン検証
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery',
    });
    if (!error) {
      // パスワードリセットの場合はリセットページへ
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth callback error (token_hash):', error.message);
  }

  // エラー時は認証エラーページへ
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
