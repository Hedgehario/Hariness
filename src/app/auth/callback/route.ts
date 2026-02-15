import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

const DEFAULT_REDIRECT_PATH = '/home';
const EMAIL_VERIFIED_PATH = '/auth/verification-complete';

function resolveSafeNextPath(rawNext: string | null): string {
  if (!rawNext) return DEFAULT_REDIRECT_PATH;
  if (!rawNext.startsWith('/')) return DEFAULT_REDIRECT_PATH;
  if (rawNext.startsWith('//')) return DEFAULT_REDIRECT_PATH;
  return rawNext;
}

function buildOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');

  if (process.env.NODE_ENV !== 'development' && forwardedHost) {
    return `https://${forwardedHost}`;
  }

  return url.origin;
}

function redirectWithPath(request: Request, path: string): NextResponse {
  return NextResponse.redirect(`${buildOrigin(request)}${path}`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = resolveSafeNextPath(searchParams.get('next'));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectWithPath(request, next);
    }

    console.error('Auth callback: code exchange failed:', error.message);
    return redirectWithPath(request, '/auth/auth-code-error');
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery',
    });
    if (!error) {
      if (type === 'recovery') {
        return redirectWithPath(request, '/reset-password');
      }
      // Signup/email verification should land on guidance screen by default.
      const safeNext = next === DEFAULT_REDIRECT_PATH ? EMAIL_VERIFIED_PATH : next;
      return redirectWithPath(request, safeNext);
    }

    console.error('Auth callback: token_hash verification failed:', error.message);
    return redirectWithPath(request, '/auth/auth-code-error');
  }

  return redirectWithPath(request, '/auth/auth-code-error');
}
