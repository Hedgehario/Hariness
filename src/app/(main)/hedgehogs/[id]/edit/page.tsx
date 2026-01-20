import { notFound } from 'next/navigation';

import { HedgehogForm } from '@/components/hedgehogs/hedgehog-form';
import { ImageUpload } from '@/components/hedgehogs/image-upload';
import { BackButton } from '@/components/ui/back-button';
import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';

import { deleteHedgehogImage, updateHedgehog, uploadHedgehogImage } from '../../actions';

export default async function EditHedgehogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: hedgehog } = await supabase.from('hedgehogs').select('*').eq('id', id).single();

  if (!hedgehog) {
    notFound();
  }

  async function updateAction(prevState: ActionResponse | undefined, formData: FormData) {
    'use server';
    const data = {
      name: formData.get('name') as string,
      gender: (formData.get('gender') as 'male' | 'female' | 'unknown') || undefined,
      birthDate: (formData.get('birthDate') as string) || undefined,
      welcomeDate: (formData.get('welcomeDate') as string) || undefined,
      features: (formData.get('features') as string) || undefined,
      insuranceNumber: (formData.get('insuranceNumber') as string) || undefined,
    };
    return await updateHedgehog(id, data);
  }

  // 画像アップロード用Server Action
  async function uploadImageAction(formData: FormData) {
    'use server';
    return await uploadHedgehogImage(id, formData);
  }

  // 画像削除用Server Action
  async function deleteImageAction() {
    'use server';
    return await deleteHedgehogImage(id);
  }

  return (
    <div className="flex h-full min-h-screen flex-col bg-[var(--color-background)]">
      {/* L3 専用ヘッダー */}
      <header className="sticky top-0 z-20 flex flex-none items-center border-b border-[#FFB370]/20 bg-[#F8F8F0] px-4 py-3 shadow-sm">
        <BackButton />
        <h1 className="flex-1 text-center font-bold text-[#5D5D5D]">プロフィールを編集</h1>
        {/* 右側のスペーサー（中央揃えのため、BackButtonと同じ幅） */}
        <div className="w-[72px]" />
      </header>

      <div className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center gap-8">
          <HedgehogForm
            initialData={{
              id: hedgehog.id,
              name: hedgehog.name,
              gender: hedgehog.gender,
              birth_date: hedgehog.birth_date,
              welcome_date: hedgehog.welcome_date,
              features: hedgehog.features,
              insurance_number: hedgehog.insurance_number,
              image_url: hedgehog.image_url,
            }}
            action={updateAction}
            title=""
            description=""
            submitLabel="変更を保存"
            redirectTo={`/home?hedgehogId=${id}`}
            imageUploadSlot={
              <ImageUpload
                hedgehogId={id}
                currentImageUrl={hedgehog.image_url}
                onUpload={uploadImageAction}
                onDelete={deleteImageAction}
              />
            }
          />

          <div className="mt-8 w-full max-w-md border-t border-dashed border-stone-300 px-4 pt-8">
            <p className="mb-4 text-center text-sm text-stone-500">
              この子のデータを削除する場合は、フォーム内の削除ボタンを使用してください。
              <br />
              この操作は取り消せません。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
