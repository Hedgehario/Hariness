import { redirect } from 'next/navigation';

import { createHedgehog } from '@/app/(main)/hedgehogs/actions';
import { HedgehogForm } from '@/components/hedgehogs/hedgehog-form';
import { BackButton } from '@/components/ui/back-button';
import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

export default async function NewHedgehogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  async function createAction(
    prevState: ActionResponse | undefined,
    formData: FormData
  ): Promise<ActionResponse> {
    'use server';
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
    <div className="flex h-full min-h-screen flex-col bg-[var(--color-background)]">
      {/* L3 専用ヘッダー */}
      {/* L3 専用ヘッダー */}
      <header className="relative sticky top-0 z-20 flex flex-none items-center justify-center border-b border-[#FFB370]/20 bg-[#F8F8F0] px-4 py-3 shadow-sm">
        <BackButton className="absolute left-4" />
        <h1 className="text-center font-bold text-[#5D5D5D]">新しい家族を登録</h1>
      </header>

      <div className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center gap-8">
          <HedgehogForm
            action={createAction}
            title=""
            description="ハリネズミちゃんの情報を入力してください。"
            submitLabel="登録してはじめる"
            redirectTo="/home"
          />
        </div>
      </div>
    </div>
  );
}
