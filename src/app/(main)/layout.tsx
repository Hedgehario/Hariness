import { redirect } from 'next/navigation';

import { BottomNav } from '@/components/layout/bottom-nav';
import { AppHeader } from '@/components/layout/header';
import { MainContent } from '@/components/layout/main-content';
import { SideNav } from '@/components/layout/side-nav';
import { createClient } from '@/lib/supabase/server';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. プロフィールチェック (display_nameがあるか)
  const { data: profile } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.display_name) {
    redirect('/onboarding/profile');
  }

  // 2. ハリネズミ登録チェック (1匹以上いるか)
  const { count } = await supabase
    .from('hedgehogs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (count === 0 || count === null) {
    redirect('/onboarding/hedgehog');
  }

  return (
    <div className="flex min-h-dvh overflow-x-hidden bg-[var(--color-background)]">
      {/* Side Navigation (Desktop) */}
      <div className="hidden lg:block">
        <SideNav />
      </div>

      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Header (Mobile/Desktop) */}
        {/* On desktop (lg+), header creates top bar. On mobile, it's sticky top. */}
        <AppHeader />

        {/* Main Content */}
        <MainContent>{children}</MainContent>

        {/* Bottom Navigation (Mobile/Tablet Only) */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
