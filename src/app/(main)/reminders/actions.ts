"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyReminders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // 今日の日付 (Timezone考慮が必要だが一旦UTC/JST簡易扱い)
  const today = new Date().toISOString().split("T")[0];

  // 未完了のリマインダーを取得
  // (注: 繰り返し設定などのロジックは複雑なため、フェーズ5.4で詳細実装。
  //  ここではシンプルに reminders テーブルから取得)
  const { data } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .order("time", { ascending: true });

  return data || [];
}
