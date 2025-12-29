import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 重要: getUserを使ってセッションを検証する（getSessionはキャッシュされるためセキュリティ上非推奨）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // 1. 未ログイン状態で保護されたルート（/home, /settings など）にアクセスしたら /login へ
  // ここでは /home 以下、/records 以下などを保護対象とする
  // 単純化のため、(auth) 以外のページかつLP('/')以外は保護する方針、あるいは特定のパスを保護
  // 今回はLPもないので、'/' はリダイレクトさせてもいいかもしれないが、とりあえず明示的なパスを保護

  const protectedPaths = [
    '/home',
    '/hedgehogs',
    '/records',
    '/calendar',
    '/hospital',
    '/reminders',
    '/map',
    '/settings',
  ];
  const isProtectedPath = protectedPaths.some((path) => url.pathname.startsWith(path));

  if (!user && isProtectedPath) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. ログイン状態で認証ページ（/login, /signup）にアクセスしたら /home へ
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) => url.pathname.startsWith(path));

  if (user && isAuthPath) {
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  // 3. ルート('/') へのアクセスを /home または /login に振り分け
  if (url.pathname === '/') {
    if (user) {
      url.pathname = '/home';
      return NextResponse.redirect(url);
    } else {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes - handled separately usually, or protect them too)
     * - design-system (development page)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|design-system|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
