'use client';

import { Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';

import { updateProfile } from '@/app/(auth)/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PREFECTURES = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
  '海外（日本以外）',
];

// Server Action wrapper to match useActionState signature
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateProfileAction(prevState: any, formData: FormData) {
  const rawData = {
    displayName: formData.get('displayName') as string,
    gender: (formData.get('gender') as 'male' | 'female' | 'unknown') || undefined,
    ageGroup:
      (formData.get('ageGroup') as '10s' | '20s' | '30s' | '40s' | '50s' | '60_over') || undefined,
    prefecture: formData.get('prefecture') as string,
  };
  return await updateProfile(rawData);
}

type ProfileFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
  mode?: 'edit' | 'onboarding';
  redirectTo?: string;
};

export function ProfileForm({ profile, mode = 'edit', redirectTo }: ProfileFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateProfileAction, {
    success: false,
    // error: undefined, // default
  });

  useEffect(() => {
    if (state.success && redirectTo) {
      router.push(redirectTo);
    }
  }, [state.success, redirectTo, router]);

  const isOnboarding = mode === 'onboarding';

  return (
    <form action={formAction} className="space-y-6">
      {!isOnboarding && state.success && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          プロフィールを更新しました。
        </div>
      )}
      {state.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName">
          ニックネーム <span className="text-red-500">*</span>
        </Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile.display_name}
          required
          maxLength={50}
          className="bg-white"
          placeholder="例: ハリ飼い太郎"
        />
        <p className="text-xs text-gray-400">アプリ内で表示される名前です。</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">性別</Label>
        <Select name="gender" defaultValue={profile.gender || 'unknown'}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">男性</SelectItem>
            <SelectItem value="female">女性</SelectItem>
            <SelectItem value="unknown">回答しない</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageGroup">年代</Label>
        <Select name="ageGroup" defaultValue={profile.age_group || undefined}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10s">10代</SelectItem>
            <SelectItem value="20s">20代</SelectItem>
            <SelectItem value="30s">30代</SelectItem>
            <SelectItem value="40s">40代</SelectItem>
            <SelectItem value="50s">50代</SelectItem>
            <SelectItem value="60_over">60代以上</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prefecture">お住まい</Label>
        <Select name="prefecture" defaultValue={profile.prefecture || undefined}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="都道府県を選択" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {PREFECTURES.map((pref) => (
              <SelectItem key={pref} value={pref}>
                {pref}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-md transition-colors disabled:opacity-50 ${
            isOnboarding
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90'
              : 'bg-[#FFB370] hover:bg-[#FFB370]/80'
          }`}
        >
          {isPending ? '保存中...' : isOnboarding ? 'ハリネズミの登録へ' : '変更を保存'}
          {!isPending && (isOnboarding ? <ChevronRight size={20} /> : <Check size={18} />)}
        </button>
      </div>
    </form>
  );
}
