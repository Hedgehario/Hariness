'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

type ActionData = {
  hedgehogId?: string;
  nextStep?: 'home' | 'next';
};

// Validation Schema
const createHedgehogSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(20, '名前は20文字以内で入力してください'),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  birthDate: z
    .string()
    .nullable()
    .optional()
    .refine((date) => !date || new Date(date) <= new Date(), {
      message: '未来の日付は設定できません',
    }),
  welcomeDate: z
    .string()
    .nullable()
    .optional()
    .refine((date) => !date || new Date(date) <= new Date(), {
      message: '未来の日付は設定できません',
    }),
  features: z.string().max(200, '特徴は200文字以内で入力してください').optional(),
  insuranceNumber: z.string().max(50, '保険証番号は50文字以内で入力してください').optional(),
});

export type CreateHedgehogInput = z.infer<typeof createHedgehogSchema>;

// DI interface (simplified for what we use)
// DI interface (simplified for what we use)
interface SupabaseClientLike {
  auth: { getUser: () => Promise<any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
  from: (table: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function createHedgehog(
  data: CreateHedgehogInput,
  injectedClient?: SupabaseClientLike // For testing
): Promise<ActionResponse<ActionData>> {
  const supabase = injectedClient || (await createClient());

  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインしてください。' },
    };
  }

  // 2. バリデーション
  const parsed = createHedgehogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: parsed.error.issues[0].message },
    };
  }

  // 2.5 登録数上限チェック (TC-HH-01)
  const { count, error: countError } = await supabase
    .from('hedgehogs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (countError) {
    console.error('Count Check Error:', countError.message);
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '登録数の確認に失敗しました' },
    };
  }

  if (count !== null && count >= 10) {
    return {
      success: false,
      error: {
        code: ErrorCode.LIMIT_EXCEEDED || 'E007',
        message: '登録できる上限（10匹）に達しています',
      },
    };
  }

  // ... (skip image upload logic) ...

  // 3. データ登録
  const { data: hedgehog, error } = await supabase
    .from('hedgehogs')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      gender: parsed.data.gender,
      birth_date: parsed.data.birthDate || null,
      welcome_date: parsed.data.welcomeDate || null,
      features: parsed.data.features,
      insurance_number: parsed.data.insuranceNumber,
    })
    .select()
    .single();

  if (error) {
    console.error('Create Hedgehog Error:', error.message);
    // Could check for LIMIT_EXCEEDED (E007) here if we had custom trigger or distinct error
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '登録に失敗しました。' },
    };
  }

  // 4. キャッシュ更新 & リダイレクト
  revalidatePath('/home');
  return { success: true, data: { hedgehogId: hedgehog.id } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createHedgehogAction(
  prevState: ActionResponse | undefined,
  formData: FormData
): Promise<any> {
  const rawData: CreateHedgehogInput = {
    name: formData.get('name') as string,
    gender: formData.get('gender') as 'male' | 'female' | 'unknown' | undefined,
    birthDate: (formData.get('birthDate') as string) || undefined,
    welcomeDate: (formData.get('welcomeDate') as string) || undefined,
    features: (formData.get('features') as string) || undefined,
    insuranceNumber: (formData.get('insuranceNumber') as string) || undefined,
  };

  const actionType = formData.get('actionType') as string; // 'complete' or 'next'

  const result = await createHedgehog(rawData);

  // 画像アップロード処理
  if (result.success && result.data?.hedgehogId) {
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);
      await uploadHedgehogImage(result.data.hedgehogId, uploadFormData);
    }
  }

  // サーバーアクションの結果にネクストステップを含める
  if (result.success) {
    return {
      success: true,
      data: {
        hedgehogId: result.data?.hedgehogId,
        nextStep: actionType === 'next' ? 'next' : 'home',
      },
    } as unknown as ActionResponse;
  }

  return result;
}

export async function getMyHedgehogs() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('hedgehogs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true }); // 表示順は作成順などで

  if (!data) return [];

  // DB Schema (snake_case) -> App Model (camelCase) mapping might be needed if types differ
  // But usually we just return what we have or map it.
  // Assuming the UI expects the DB columns or mapped ones.
  // Checking `hedgehog.ts` types would be ideal, but for now let's return mapped objects as per common pattern
  return data.map((h) => ({
    id: h.id,
    userId: h.user_id,
    name: h.name,
    gender: h.gender,
    birthDate: h.birth_date,
    welcomeDate: h.welcome_date,
    features: h.features,
    imageUrl: h.image_url,
    insuranceNumber: h.insurance_number,
    createdAt: h.created_at,
  }));
}

// ... (skip getMyHedgehogs) ...

export async function updateHedgehog(
  id: string,
  data: CreateHedgehogInput
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です。' },
    };

  // Validation
  const parsed = createHedgehogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: parsed.error.issues[0].message },
    };
  }

  const { error } = await supabase
    .from('hedgehogs')
    .update({
      name: parsed.data.name,
      gender: parsed.data.gender,
      birth_date: parsed.data.birthDate || null,
      welcome_date: parsed.data.welcomeDate || null,
      features: parsed.data.features,
      insurance_number: parsed.data.insuranceNumber,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Update Hedgehog Error:', error.message);
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '更新に失敗しました。' },
    };
  }

  revalidatePath('/home');
  return { success: true, message: 'プロフィールを更新しました。' };
}

export async function deleteHedgehog(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です。' },
    };

  const { error } = await supabase.from('hedgehogs').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    console.error('Delete Hedgehog Error:', error.message);
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '削除に失敗しました。' },
    };
  }

  revalidatePath('/home');
  return { success: true, message: '削除しました。' };
}

// 画像アップロード用の定数
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * TC-HH-04: 個体画像アップロード
 * Supabase Storageに画像をアップロードし、hedgehogs.image_urlを更新
 */
export async function uploadHedgehogImage(
  hedgehogId: string,
  formData: FormData
): Promise<ActionResponse<{ imageUrl: string }>> {
  const supabase = await createClient();

  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインしてください。' },
    };
  }

  // 2. ファイル取得
  const file = formData.get('image') as File | null;
  if (!file || file.size === 0) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: '画像ファイルを選択してください。' },
    };
  }

  // 3. ファイルサイズチェック（TC-HH-05対応）
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: { code: ErrorCode.STORAGE_UPLOAD, message: 'ファイルサイズは5MB以下にしてください。' },
    };
  }

  // 4. ファイル形式チェック（TC-HH-05対応）
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: {
        code: ErrorCode.STORAGE_UPLOAD,
        message: 'JPEG、PNG、WebP形式の画像をアップロードしてください。',
      },
    };
  }

  // 5. 個体の所有権確認
  const { data: hedgehog, error: fetchError } = await supabase
    .from('hedgehogs')
    .select('id, user_id')
    .eq('id', hedgehogId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !hedgehog) {
    return {
      success: false,
      error: { code: ErrorCode.FORBIDDEN, message: 'この子を編集する権限がありません。' },
    };
  }

  // 6. ファイル名を生成（ユーザーID/個体ID/タイムスタンプ）
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${user.id}/${hedgehogId}/${Date.now()}.${ext}`;

  // 7. Supabase Storageにアップロード
  const { error: uploadError } = await supabase.storage
    .from('hedgehog-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload Error:', uploadError.message);
    return {
      success: false,
      error: { code: ErrorCode.STORAGE_UPLOAD, message: '画像のアップロードに失敗しました。' },
    };
  }

  // 8. 公開URLを取得
  const { data: publicUrlData } = supabase.storage.from('hedgehog-images').getPublicUrl(filePath);

  const imageUrl = publicUrlData.publicUrl;

  // 9. hedgehogs.image_url を更新
  const { error: updateError } = await supabase
    .from('hedgehogs')
    .update({ image_url: imageUrl })
    .eq('id', hedgehogId)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Update image_url Error:', updateError.message);
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '画像URLの保存に失敗しました。' },
    };
  }

  // 10. キャッシュ更新
  revalidatePath('/home');
  return { success: true, data: { imageUrl } };
}

export async function deleteHedgehogImage(hedgehogId: string): Promise<ActionResponse> {
  const supabase = await createClient();

  // 1. ユーザー認証
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です。' },
    };
  }

  // 2. 現在の画像URLを取得
  const { data: hedgehog, error: fetchError } = await supabase
    .from('hedgehogs')
    .select('image_url')
    .eq('id', hedgehogId)
    .eq('user_id', user.id) // 権限チェック
    .single();

  if (fetchError || !hedgehog) {
    return {
      success: false,
      error: { code: ErrorCode.NOT_FOUND, message: 'データの取得に失敗しました。' },
    };
  }

  if (hedgehog.image_url) {
    // 3. Storageから画像を削除
    // URL形式: .../storage/v1/object/public/hedgehog-images/USER_ID/HEDGEHOG_ID/FILENAME
    // ここから "USER_ID/HEDGEHOG_ID/FILENAME" を取り出す
    const urlParts = hedgehog.image_url.split('/hedgehog-images/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1]; // "USER_ID/HEDGEHOG_ID/FILENAME"

      const { error: deleteError } = await supabase.storage
        .from('hedgehog-images')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage deletion error:', deleteError);
        // エラーでもDB更新は続行（もしファイルが既に無くてもURLは消すべき）
      }
    }
  }

  // 4. DBのimage_urlをクリア
  const { error: updateError } = await supabase
    .from('hedgehogs')
    .update({ image_url: null })
    .eq('id', hedgehogId)
    .eq('user_id', user.id);

  if (updateError) {
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: 'データベースの更新に失敗しました。' },
    };
  }

  revalidatePath('/home');
  return { success: true, message: '画像を削除しました。' };
}
