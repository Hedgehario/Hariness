'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';

// Create Hedgehog Validation Schema
const createHedgehogSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  birthDate: z.string().optional(), // YYYY-MM-DD
  welcomeDate: z.string().optional(), // YYYY-MM-DD
  features: z.string().max(200, '特徴は200文字以内で入力してください').optional(),
  insuranceNumber: z.string().max(50, '保険番号は50文字以内で入力してください').optional(),
});

export type CreateHedgehogInput = z.infer<typeof createHedgehogSchema>;

export async function createHedgehog(data: CreateHedgehogInput): Promise<ActionResponse<{ hedgehogId: string }>> {
  const supabase = await createClient();

  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'ログインしてください。' } };
  }

  // 2. バリデーション
  const parsed = createHedgehogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message },
    };
  }

  // 画像アップロード処理（今回はスキップ、後日実装）
  // const imageFile = formData?.get('image') as File;
  // let imageUrl = null;

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
    return { success: false, error: { code: 'DB_ERROR', message: '登録に失敗しました。' } };
  }

  // 4. キャッシュ更新 & リダイレクト
  revalidatePath('/home');
  return { success: true, data: { hedgehogId: hedgehog.id } }; // message is optional, data carries ID
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
    .order('created_at', { ascending: true });

  return data || [];
}

export async function updateHedgehog(id: string, data: CreateHedgehogInput): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: { code: 'UNAUTHORIZED', message: 'ログインが必要です。' } };

  // Validation
  const parsed = createHedgehogSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message } };
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
    return { success: false, error: { code: 'DB_ERROR', message: '更新に失敗しました。' } };
  }

  revalidatePath('/home');
  return { success: true, message: '個体情報を更新しました。' };
}

export async function deleteHedgehog(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: { code: 'UNAUTHORIZED', message: 'ログインが必要です。' } };

  const { error } = await supabase.from('hedgehogs').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    console.error('Delete Hedgehog Error:', error.message);
    return { success: false, error: { code: 'DB_ERROR', message: '削除に失敗しました。' } };
  }

  revalidatePath('/home');
  return { success: true, message: '個体を削除しました。' };
}
