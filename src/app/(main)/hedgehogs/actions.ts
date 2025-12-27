"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Create Hedgehog Validation Schema
const createHedgehogSchema = z.object({
  name: z
    .string()
    .min(1, "名前を入力してください")
    .max(50, "名前は50文字以内で入力してください"),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  birthDate: z.string().optional(), // YYYY-MM-DD
  welcomeDate: z.string().optional(), // YYYY-MM-DD
  features: z.string().max(200, "特徴は200文字以内で入力してください").optional(),
  insuranceNumber: z.string().max(50, "保険番号は50文字以内で入力してください").optional(),
});

export type CreateHedgehogInput = z.infer<typeof createHedgehogSchema>;

export async function createHedgehog(data: CreateHedgehogInput, formData?: FormData) {
  const supabase = await createClient();
  
  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインしてください。" };
  }

  // 2. バリデーション
  const parsed = createHedgehogSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
    };
  }

  // 画像アップロード処理（今回はスキップ、後日実装）
  // const imageFile = formData?.get('image') as File;
  // let imageUrl = null;
  
  // 3. データ登録
  const { data: hedgehog, error } = await supabase
    .from("hedgehogs")
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
    console.error("Create Hedgehog Error:", error.message);
    return { error: "登録に失敗しました。" };
  }

  // 4. キャッシュ更新 & リダイレクト
  revalidatePath("/home");
  return { success: true, hedgehogId: hedgehog.id };
}

export async function getMyHedgehogs() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("hedgehogs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return data || [];
}
