'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

export async function login(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION,
        message: 'メールアドレスとパスワードを入力してください。',
      },
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login Error:', error.message);
    return {
      success: false,
      error: {
        code: ErrorCode.AUTH_FAILED,
        message: 'ログインに失敗しました。メールアドレスかパスワードが間違っています。',
      },
    };
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
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: '必須項目が未入力です。' },
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: 'パスワードは8文字以上で入力してください。' },
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: 'パスワードが一致しません。' },
    };
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
    if (error.message.includes('rate limit')) {
      return {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER,
          message: '送信制限に達しました。しばらく時間をおいてから再度お試しください。',
        },
      };
    }
    // Supabase returns generic error, but could be conflict. Default to internal or auth failure.
    // Spec says E006 for conflict. But we might not distinction easily without parsing message.
    // For safety/generic:
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '登録に失敗しました。' + error.message },
    };
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
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインしてください。' },
    };
  }

  // 2. バリデーション
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: parsed.error.issues[0].message },
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
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: 'プロフィールの更新に失敗しました。' },
    };
  }

  // 4. キャッシュ更新
  revalidatePath('/', 'layout');
  return { success: true, message: 'プロフィールを更新しました。' };
}

import { createAdminClient } from '@/lib/supabase/admin';

export async function deleteAccount(reason: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です。' },
    };

  try {
    // 1. ユーザー情報を取得（退会ログ用）
    const { data: profile } = await supabase
      .from('users')
      .select('email, age_group, gender, prefecture, created_at')
      .eq('id', user.id)
      .single();

    // 2. ハリネズミの頭数を取得
    const { count: hedgehogCount } = await supabase
      .from('hedgehogs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 3. 利用日数を計算
    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const daysUsed = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // 4. メールアドレスのハッシュ化（SHA-256）
    const emailHash = await hashEmail(profile?.email || user.email || '');

    // 5. 退会ログを保存
    const { error: logError } = await supabase.from('withdrawal_logs').insert({
      user_id: user.id,
      email_hash: emailHash,
      reason: reason,
      age_group: profile?.age_group || null,
      gender: profile?.gender || null,
      prefecture: profile?.prefecture || null,
      hedgehog_count: hedgehogCount || 0,
      days_used: daysUsed,
      withdrawn_at: new Date().toISOString(),
    });

    if (logError) {
      console.error('Withdrawal Log Error:', logError.message);
      // ログ保存に失敗しても退会処理は続行
    }

    // 5.5 ストレージ上の画像を削除（user_idフォルダごと削除）
    // Admin Clientを使用（RLSバイパス、DB削除前に実行する必要がある）
    try {
      const adminSupabase = createAdminClient();
      
      // user_id配下のサブフォルダ（hedgehog_id）一覧を取得
      const { data: hedgehogFolders, error: listFoldersError } = await adminSupabase.storage
        .from('hedgehog-images')
        .list(user.id, { limit: 1000 });

      if (!listFoldersError && hedgehogFolders && hedgehogFolders.length > 0) {
        // 各サブフォルダ内のファイルを削除
        for (const folder of hedgehogFolders) {
          if (folder.name) {
            // サブフォルダ内のファイル一覧を取得
            const { data: files } = await adminSupabase.storage
              .from('hedgehog-images')
              .list(`${user.id}/${folder.name}`, { limit: 1000 });

            if (files && files.length > 0) {
              const filePaths = files.map(f => `${user.id}/${folder.name}/${f.name}`);
              const { error: removeError } = await adminSupabase.storage
                .from('hedgehog-images')
                .remove(filePaths);

              if (removeError) {
                console.warn(`Failed to remove images in ${folder.name}:`, removeError.message);
                // 画像削除に失敗しても退会処理は続行
              }
            }
          }
        }
        console.log(`Storage cleanup completed for user: ${user.id}`);
      }
    } catch (storageError) {
      const errorMessage = storageError instanceof Error ? storageError.message : 'Unknown error';
      console.error('Storage cleanup error:', errorMessage);
      // ストレージ削除に失敗しても退会処理は続行（孤立ファイルより退会処理を優先）
    }

    // 6. public.users 削除 (Cascadeで関連データも消える)
    const { error: deleteError } = await supabase.from('users').delete().eq('id', user.id);
    if (deleteError) {
      console.error('Failed to delete user from public.users:', deleteError);
      throw new Error('ユーザーデータの削除に失敗しました。');
    }

    // 7. Admin ClientでAuthユーザーを完全削除
    // セキュリティ: user.idは認証済みユーザーのIDのみ（自分自身のみ削除可能）
    // Service Role Keyはサーバー側（Server Action）でのみ使用され、フロントエンドに露出しない
    try {
      const adminSupabase = createAdminClient();
      // 自分自身のIDのみ削除（user.idは認証済みユーザーのID）
      const { error: adminDeleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

      if (adminDeleteError) {
        console.error('Failed to delete auth user:', adminDeleteError);
        // Authユーザーの削除に失敗しても、public.usersは既に削除されているので続行
        // ただし、ログには記録しておく
        console.warn('Authユーザーの削除に失敗しましたが、データは削除済みです。');
      }
    } catch (adminClientError) {
      // Admin Clientの作成に失敗した場合（環境変数未設定など）
      const errorMessage =
        adminClientError instanceof Error ? adminClientError.message : 'Unknown error';
      console.error('Failed to create admin client:', errorMessage);
      throw new Error(
        '退会処理に必要な設定が不足しています。管理者にお問い合わせください。\n' +
          '（詳細: ' +
          errorMessage +
          '）'
      );
    }

    // 8. Authからサインアウト (セッションクリア)
    await supabase.auth.signOut();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Account Deletion Error:', message);
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '退会処理に失敗しました。' + message },
    };
  }

  revalidatePath('/', 'layout');
  return { success: true, message: '退会が完了しました。' };
}

// メールアドレスのハッシュ化関数
async function hashEmail(email: string): Promise<string> {
  const salt = 'hariness_withdrawal_salt_2025'; // 固定のソルト
  const data = new TextEncoder().encode(email + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// パスワードリセットメール送信
export async function resetPasswordAction(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  if (!email) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: 'メールアドレスを入力してください。' },
    };
  }

  // サイトのURLを取得（Vercel環境変数 or ローカル）
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    console.error('Reset Password Error:', error.message);
    // セキュリティ: メールアドレスの存在有無は明かさない
    // エラーでも成功メッセージを返す（アカウント列挙対策）
  }

  // 常に成功を返す（アカウント列挙対策）
  return {
    success: true,
    message: 'パスワードリセット用のメールを送信しました。メールをご確認ください。',
  };
}

// 新しいパスワードを設定
export async function updatePasswordAction(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: 'パスワードを入力してください。' },
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: 'パスワードは8文字以上で入力してください。' },
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: 'パスワードが一致しません。' },
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Update Password Error:', error.message);
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: 'パスワードの更新に失敗しました。' },
    };
  }

  return { success: true, message: 'パスワードを更新しました。ログインしてください。' };
}
