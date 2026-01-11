'use client';

import { useRouter } from 'next/navigation';

import { createHedgehog } from '@/app/(main)/hedgehogs/actions';
import { HedgehogForm } from '@/components/hedgehogs/hedgehog-form';
import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

export default function NewHedgehogPage() {
  const router = useRouter();

  async function action(
    prevState: ActionResponse | undefined,
    formData: FormData
  ): Promise<ActionResponse> {
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
        return {
          success: false,
          error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です' },
        };
      }
      return {
        success: false,
        error: {
          code: result.error?.code || 'UNKNOWN',
          message: result.error?.message || '登録に失敗しました',
        },
      };
    }
    return { success: true };
  }

  return (
    <div className="flex items-center justify-center bg-[var(--color-background)] p-4">
      <HedgehogForm
        action={action}
        title="新しい家族を登録"
        description="ハリネズミちゃんの情報を入力してください。"
        submitLabel="登録してはじめる"
      />
    </div>
  );
}
