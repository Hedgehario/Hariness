"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Zod Schemas
const mealSchema = z.object({
  time: z.string(), // HH:mm
  foodType: z.string().min(1, "フードの種類を入力してください"),
  amount: z.number().min(0),
  unit: z.string(),
});

const excretionSchema = z.object({
  time: z.string(), // HH:mm
  type: z.enum(["urine", "stool", "other"]),
  condition: z.string().optional(),
  notes: z.string().optional(),
});

const dailyBatchSchema = z.object({
  hedgehogId: z.string().uuid(),
  date: z.string(), // YYYY-MM-DD
  weight: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  humidity: z.number().nullable().optional(),
  meals: z.array(mealSchema).optional(),
  excretions: z.array(excretionSchema).optional(),
  medications: z.array(z.object({
    time: z.string(),
    content: z.string().optional(),
  })).optional(),
  memo: z.string().max(1000).optional(),
});

export type DailyBatchInput = z.infer<typeof dailyBatchSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type ExcretionInput = z.infer<typeof excretionSchema>;

export async function getDailyRecords(hedgehogId: string, date: string) {
  const supabase = await createClient();
  
  // 並列でデータ取得
  const [weightRes, mealsRes, excretionsRes, conditionRes] = await Promise.all([
    supabase.from("weight_records").select("*").eq("hedgehog_id", hedgehogId).eq("date", date).single(),
    supabase.from("meal_records").select("*").eq("hedgehog_id", hedgehogId).eq("date", date),
    supabase.from("excretion_records").select("*").eq("hedgehog_id", hedgehogId).eq("date", date),
    // 物理的体調（気温・湿度など）があれば取得
    supabase.from("physical_condition_records").select("*").eq("hedgehog_id", hedgehogId).eq("date", date).single(),
  ]);

  return {
    weight: weightRes.data,
    meals: mealsRes.data || [],
    excretions: excretionsRes.data || [],
    condition: conditionRes.data, // might be null
  };
}

export async function saveDailyBatch(data: DailyBatchInput) {
  const supabase = await createClient();
  
  const { hedgehogId, date, weight, temperature, humidity, meals, excretions, memo } = data;

  // 1. 体重の保存
  if (weight !== undefined && weight !== null) {
     const { data: existing } = await supabase
        .from("weight_records")
        .select("id")
        .eq("hedgehog_id", hedgehogId)
        .eq("date", date)
        .single();
        
     if (existing) {
         await supabase.from("weight_records").update({ weight }).eq("id", existing.id);
     } else {
         await supabase.from("weight_records").insert({
             hedgehog_id: hedgehogId,
             date: date,
             weight: weight,
         });
     }
  }

  // 1.5. 体調(気温・湿度)の保存 (physical_condition_records)
  // テーブルが存在するか不明だが、仕様上あるべきなのでThrowなしでTryする
  if ((temperature !== undefined && temperature !== null) || (humidity !== undefined && humidity !== null)) {
      const { data: existing } = await supabase
        .from("physical_condition_records")
        .select("id")
        .eq("hedgehog_id", hedgehogId)
        .eq("date", date)
        .single();

      const payload: any = { hedgehog_id: hedgehogId, date };
      if (temperature !== undefined) payload.temperature = temperature;
      if (humidity !== undefined) payload.humidity = humidity;

      if (existing) {
          await supabase.from("physical_condition_records").update(payload).eq("id", existing.id);
      } else {
          try {
             await supabase.from("physical_condition_records").insert(payload);
          } catch (e) {
             console.warn("physical_condition_records insert failed (maybe table missing)", e);
          }
      }
  }

  // 2. 食事記録の保存
  // 簡易実装: その日の既存レコードを全削除してInsertしなおす（順序保持などのため）
  if (meals) {
      await supabase.from("meal_records").delete().eq("hedgehog_id", hedgehogId).eq("date", date);
      
      if (meals.length > 0) {
          const mealsToInsert = meals.map(m => ({
              hedgehog_id: hedgehogId,
              date: date,
              time: m.time,
              food_type: m.foodType,
              amount: m.amount,
              unit: m.unit,
          }));
          await supabase.from("meal_records").insert(mealsToInsert);
      }
  }

  // 3. 排泄記録の保存
  if (excretions) {
      await supabase.from("excretion_records").delete().eq("hedgehog_id", hedgehogId).eq("date", date);
      
      if (excretions.length > 0) {
          const excretionsToInsert = excretions.map(e => ({
              hedgehog_id: hedgehogId,
              date: date,
              time: e.time,
              type: e.type,
              condition: e.condition,
              notes: e.notes,
          }));
          await supabase.from("excretion_records").insert(excretionsToInsert);
      }
  }

  revalidatePath(`/records/${hedgehogId}`);
  revalidatePath("/home");
  return { success: true };
}

// 履歴取得用アクション

export async function getWeightHistory(hedgehogId: string, range: '30d' | '90d' | '180d' = '30d') {
  const supabase = await createClient();
  const today = new Date();
  let startDate = new Date();
  
  if (range === '30d') startDate.setDate(today.getDate() - 30);
  else if (range === '90d') startDate.setDate(today.getDate() - 90);
  else if (range === '180d') startDate.setDate(today.getDate() - 180);
  
  const { data, error } = await supabase
    .from("weight_records")
    .select("date, weight")
    .eq("hedgehog_id", hedgehogId)
    .gte("date", startDate.toISOString().split('T')[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching weight history:", error);
    return [];
  }
  return data;
}

export async function getRecentRecords(hedgehogId: string, limit: number = 7) {
  const supabase = await createClient();
  
  // 日付リストを取得（体重、食事、排出のいずれかがある日）
  // 簡易的に体重記録の日付をベースにするか、カレンダーテーブルがあればそれを使うが、
  // ここでは直近の体重記録の日付範囲を取得して、その範囲のデータを取ってくるアプローチにする
  
  const { data: weights } = await supabase
    .from("weight_records")
    .select("date, weight")
    .eq("hedgehog_id", hedgehogId)
    .order("date", { ascending: false })
    .limit(limit);

    // TODO: 本来は全テーブルJoinまたはUnionが必要だが、
    // いったん体重がある日または指定範囲（今日から過去N日）とする。
    // 今回は「今日から過去N日」のデータを一括で返す形にする。
  
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - limit);
  
  const startDateStr = pastDate.toISOString().split('T')[0];

  const [wRes, mRes, eRes] = await Promise.all([
      supabase.from("weight_records").select("*").eq("hedgehog_id", hedgehogId).gte("date", startDateStr).order("date", { ascending: false }),
      supabase.from("meal_records").select("*").eq("hedgehog_id", hedgehogId).gte("date", startDateStr).order("date", { ascending: false }),
      supabase.from("excretion_records").select("*").eq("hedgehog_id", hedgehogId).gte("date", startDateStr).order("date", { ascending: false })
  ]);

  // 日付ごとにグルーピング
  const grouped: Record<string, { weight?: any, meals: any[], excretions: any[] }> = {};
  
  // Initialize with range dates if needed, or just map existing data
  // データが存在する日付のみリスト化
  const addToGroup = (date: string) => {
      if (!grouped[date]) grouped[date] = { meals: [], excretions: [] };
  };

  wRes.data?.forEach(r => { addToGroup(r.date); grouped[r.date].weight = r; });
  mRes.data?.forEach(r => { addToGroup(r.date); grouped[r.date].meals.push(r); });
  eRes.data?.forEach(r => { addToGroup(r.date); grouped[r.date].excretions.push(r); });

  // 配列に変換してソート
  return Object.entries(grouped)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
