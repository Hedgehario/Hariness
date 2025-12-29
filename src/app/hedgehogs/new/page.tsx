'use client';

import { createHedgehog } from '@/app/(main)/hedgehogs/actions';
import { HedgehogForm } from '@/components/hedgehogs/hedgehog-form';

export default function NewHedgehogPage() {
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
    if (result.error) return { error: result.error, success: false };
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
