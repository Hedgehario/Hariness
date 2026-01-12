import { FileDown, Home, LayoutDashboard, Newspaper, Shield } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Check Admin Role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

  if (!profile || profile.role !== 'admin') {
    redirect('/home');
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-stone-900 p-4 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">Hariness Admin</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/home">
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-300 hover:bg-stone-800 hover:text-white"
              >
                <Home className="mr-2 h-4 w-4" />
                アプリに戻る
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Admin Content Layout */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 p-4">
        {/* Sidebar Nav */}
        <aside className="hidden w-64 flex-shrink-0 md:block">
          <nav className="sticky top-24 space-y-2">
            <Link href="/admin">
              <Button
                variant="ghost"
                className="w-full justify-start font-bold text-stone-700 hover:bg-stone-200"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                ダッシュボード
              </Button>
            </Link>
            <Link href="/admin/export">
              <Button
                variant="ghost"
                className="w-full justify-start text-stone-600 hover:bg-stone-200"
              >
                <FileDown className="mr-2 h-4 w-4" />
                データエクスポート
              </Button>
            </Link>
            <Link href="/admin/news">
              <Button
                variant="ghost"
                className="w-full justify-start text-stone-600 hover:bg-stone-200"
              >
                <Newspaper className="mr-2 h-4 w-4" />
                お知らせ管理
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
