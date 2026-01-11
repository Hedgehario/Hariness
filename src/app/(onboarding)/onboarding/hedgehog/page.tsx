import { redirect } from 'next/navigation';

import { createHedgehogAction } from '@/app/(main)/hedgehogs/actions';
import { HedgehogForm } from '@/components/hedgehogs/hedgehog-form';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingHedgehogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // プロフィールが未完了なら先にプロフィール登録へ
  const { data: profile } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.display_name) {
    redirect('/onboarding/profile');
  }

  // ハリネズミの登録数を取得（「ホームへ」リンクの表示制御用）
  const { count } = await supabase
    .from('hedgehogs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const hasExistingHedgehogs = (count ?? 0) > 0;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-800">ハリネズミの登録</h1>
        <p className="mt-2 text-stone-500">
          一緒に暮らしているハリネズミちゃんの
          <br />
          情報を教えてください。
        </p>
      </div>

      <HedgehogForm
        action={createHedgehogAction}
        title=""
        description=""
        submitLabel="登録してはじめる"
        mode="onboarding"
        redirectTo="/home"
        hasExistingHedgehogs={hasExistingHedgehogs}
      />
    </div>
  );
}
