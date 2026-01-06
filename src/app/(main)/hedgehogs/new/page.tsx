'use client';

import { useRouter } from 'next/navigation';

import { createHedgehog } from '@/app/(main)/hedgehogs/actions';
import { HedgehogForm } from '@/components/hedgehogs/hedgehog-form';
import { ErrorCode } from '@/types/errors';

export default function NewHedgehogPage() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function action(prevState: any, formData: FormData) {
    const data = {
      name: formData.get('name') as string,
      gender: (formData.get('gender') as 'male' | 'female' | 'unknown') || undefined,
      birthDate: (formData.get('birthDate') as string) || undefined,
      welcomeDate: (formData.get('welcomeDate') as string) || undefined,
      features: (formData.get('features') as string) || undefined,
      insuranceNumber: (formData.get('insuranceNumber') as string) || undefined,
    };

    const result = await createHedgehog(data);
    if (!result.success) {
        if (result.error?.code === ErrorCode.AUTH_REQUIRED) {
            router.push('/login');
            return { success: false, error: 'ログインが必要です' };
        }
        return { success: false, error: result.error?.message || '登録に失敗しました' };
    }
    return { success: true };
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <HedgehogForm
        action={action}
        title="新しい家族を登録"
        description="ハリネズミちゃんの情報を入力してください。"
        submitLabel="登録してはじめる"
      />
    </div>
  );
}
