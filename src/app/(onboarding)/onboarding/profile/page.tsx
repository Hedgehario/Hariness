import { redirect } from 'next/navigation';

import { ProfileForm } from '@/app/(main)/settings/profile/profile-form';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // プロフィール取得
  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

  // 既に表示名があるなら次のステップへ
  if (profile && profile.display_name) {
    redirect('/onboarding/hedgehog');
  }

  // プロフィールデータがない場合のデフォルト
  const defaultProfile = profile || {
    // メールアドレスからデフォルト名を生成などのロジックがあればここで
    display_name: user.email?.split('@')[0],
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-800">飼い主プロフィール設定</h1>
        <p className="mt-2 text-stone-500">
          まずはあなたのことを教えてください。
          <br />
          あとからいつでも変更できます。
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <ProfileForm profile={defaultProfile} mode="onboarding" redirectTo="/onboarding/hedgehog" />
      </div>
    </div>
  );
}
