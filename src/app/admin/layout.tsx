import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileDown, Newspaper, LayoutDashboard, Home } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Check Admin Role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Admin Header */}
      <header className="bg-stone-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-xl font-bold">Hariness Admin</h1>
          </div>
          <nav className="flex items-center gap-4">
             <Link href="/home">
                <Button variant="ghost" size="sm" className="text-stone-300 hover:text-white hover:bg-stone-800">
                    <Home className="w-4 h-4 mr-2" />
                    アプリに戻る
                </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Admin Content Layout */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full p-4 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-64 flex-shrink-0 hidden md:block">
            <nav className="space-y-2 sticky top-24">
                <Link href="/admin">
                    <Button variant="ghost" className="w-full justify-start font-bold text-stone-700 hover:bg-stone-200">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        ダッシュボード
                    </Button>
                </Link>
                <Link href="/admin/export">
                    <Button variant="ghost" className="w-full justify-start text-stone-600 hover:bg-stone-200">
                        <FileDown className="w-4 h-4 mr-2" />
                        データエクスポート
                    </Button>
                </Link>
                <Link href="/admin/news">
                    <Button variant="ghost" className="w-full justify-start text-stone-600 hover:bg-stone-200">
                        <Newspaper className="w-4 h-4 mr-2" />
                        お知らせ管理
                    </Button>
                </Link>
            </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
