'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

// ... (schema definition remains same) ...

export async function createHedgehog(data: CreateHedgehogInput): Promise<ActionResponse<{ hedgehogId: string }>> {
  const supabase = await createClient();

  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインしてください。' } };
  }

  // 2. バリデーション
  const parsed = createHedgehogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: parsed.error.issues[0].message },
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
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: '登録に失敗しました。' } };
  }

  // 4. キャッシュ更新 & リダイレクト
  revalidatePath('/home');
  return { success: true, data: { hedgehogId: hedgehog.id } };
}

// ... (skip getMyHedgehogs) ...

export async function updateHedgehog(id: string, data: CreateHedgehogInput): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です。' } };

  // Validation
  const parsed = createHedgehogSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: { code: ErrorCode.VALIDATION, message: parsed.error.issues[0].message } };
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
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: '更新に失敗しました。' } };
  }

  revalidatePath('/home');
  return { success: true, message: '個体情報を更新しました。' };
}

export async function deleteHedgehog(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です。' } };

  const { error } = await supabase.from('hedgehogs').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    console.error('Delete Hedgehog Error:', error.message);
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: '削除に失敗しました。' } };
  }

  revalidatePath('/home');
  return { success: true, message: '個体を削除しました。' };
}
