'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';

export async function login(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'メールアドレスとパスワードを入力してください。' } };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login Error:', error.message);
    return { success: false, error: { code: 'AUTH_ERROR', message: 'ログインに失敗しました。メールアドレスかパスワードが間違っています。' } };
  }

  revalidatePath('/', 'layout');
  redirect('/home');
}

export async function signup(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !password || !confirmPassword) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: '必須項目が未入力です。' } };
  }

  if (password !== confirmPassword) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'パスワードが一致しません。' } };
  }

  // サイトのURLを取得（Vercel環境変数 or ローカル）
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Signup Error:', error.message);
    return { success: false, error: { code: 'AUTH_ERROR', message: '登録に失敗しました。' + error.message } };
  }

  return {
    success: true,
    message: '確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。',
  };
}

import { z } from 'zod';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

// Validation Schema
const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'ニックネームを入力してください')
    .max(50, 'ニックネームは50文字以内で入力してください'),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  ageGroup: z.enum(['10s', '20s', '30s', '40s', '50s', '60_over']).optional(),
  prefecture: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

  return profile;
}

export async function updateProfile(data: UpdateProfileInput): Promise<ActionResponse> {
  const supabase = await createClient();

  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'ログインしてください。' } };
  }

  // 2. バリデーション
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0].message },
    };
  }

  // 3. DB更新
  const { error } = await supabase
    .from('users')
    .update({
      display_name: parsed.data.displayName,
      gender: parsed.data.gender,
      age_group: parsed.data.ageGroup,
      prefecture: parsed.data.prefecture,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Update Profile Error:', error.message);
    return { success: false, error: { code: 'DB_ERROR', message: 'プロフィールの更新に失敗しました。' } };
  }

  // 4. キャッシュ更新
  revalidatePath('/', 'layout');
  return { success: true, message: 'プロフィールを更新しました。' };
}

export async function deleteAccount(): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: { code: 'UNAUTHORIZED', message: 'ログインが必要です。' } };

  try {
    // 関連データの削除 (Hedgehogs, Records などは users の Cascade Delete に任せるか、手動削除)
    // ここでは users テーブルの該当レコードを削除
    const { error } = await supabase.from('users').delete().eq('id', user.id);

    if (error) throw error;

    // Authからもサインアウト
    await supabase.auth.signOut();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('Account Deletion Error:', e.message);
    return { success: false, error: { code: 'DELETE_ERROR', message: '退会処理に失敗しました。' } };
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}
