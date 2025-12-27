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
