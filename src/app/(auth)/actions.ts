"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Provider } from "@supabase/supabase-js";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login Error:", error.message);
    return { error: "ログインに失敗しました。メールアドレスかパスワードが間違っています。" };
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return { error: "必須項目が未入力です。" };
  }

  if (password !== confirmPassword) {
    return { error: "パスワードが一致しません。" };
  }

  // サイトのURLを取得（Vercel環境変数 or ローカル）
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Signup Error:", error.message);
    return { error: "登録に失敗しました。" + error.message };
  }

  return { success: "確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。" };
}


import { z } from "zod";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// Validation Schema
const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "ニックネームを入力してください")
    .max(50, "ニックネームは50文字以内で入力してください"),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  ageGroup: z
    .enum(["10s", "20s", "30s", "40s", "50s", "60_over"])
    .optional(),
  prefecture: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function updateProfile(data: UpdateProfileInput) {
  const supabase = await createClient();
  
  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインしてください。" };
  }

  // 2. バリデーション
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
    };
  }

  // 3. DB更新
  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.displayName,
      gender: parsed.data.gender,
      age_group: parsed.data.ageGroup,
      prefecture: parsed.data.prefecture,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Update Profile Error:", error.message);
    return { error: "プロフィールの更新に失敗しました。" };
  }

  // 4. キャッシュ更新
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
      data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "ログインが必要です。" };

  // Note: Supabase Authのユーザー削除はService Role Keyが必要なケースが多いが、
  // ここではアプリ内のユーザーデータ(usersテーブルなど)の論理削除や、
  // 自己削除が許可されている場合のAuth削除を行う想定。
  // 今回は簡易的にSupabase RPCや、Edge Functionを呼ばずに、
  // CASCADE設定されている前提で users テーブル等のレコード削除を試みるか、
  // または Auth API を呼び出す。
  // ※標準の supabase-js クライアント(anon/authenticated)では admin.deleteUser は呼べない。
  // 代替案: RPCで削除機能を実装するか、"退会済み"フラグを立てる。
  // ここでは「退会済み」としてログアウトさせる処理とする (物理削除は管理画面から行う運用想定)。
  
  // 実装簡略化のため、usersテーブルのデータをクリアしてログアウトする
  // (本来は Edge Function で supabase.auth.admin.deleteUser(user.id) を呼ぶのがベスト)
  
  // 今回は、アプリ上のデータを全削除するシミュレーションを行う
  // (Cascade設定があれば users削除で連鎖するが、RLSでブロックされる可能性あり)
  
  try {
     // 関連データの削除 (Hedgehogs, Records などは users の Cascade Delete に任せるか、手動削除)
     // ここでは users テーブルの該当レコードを削除
     const { error } = await supabase.from('users').delete().eq('id', user.id);
     
     if (error) throw error;

     // Authからもサインアウト
     await supabase.auth.signOut();
     
  } catch (e: any) {
      console.error("Account Deletion Error:", e.message);
      return { error: "退会処理に失敗しました。" };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
