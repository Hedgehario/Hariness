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
  meals: z.array(mealSchema).optional(),
  excretions: z.array(excretionSchema).optional(),
  memo: z.string().max(1000).optional(), // 汎用メモ（今回は暫定的に扱わないか、weight_recordsのnotesに入れる）
});

export type DailyBatchInput = z.infer<typeof dailyBatchSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type ExcretionInput = z.infer<typeof excretionSchema>;

export async function getDailyRecords(hedgehogId: string, date: string) {
  const supabase = await createClient();
  
  // 並列でデータ取得
  const [weightRes, mealsRes, excretionsRes] = await Promise.all([
    supabase.from("weight_records").select("*").eq("hedgehog_id", hedgehogId).eq("date", date).single(),
    supabase.from("meal_records").select("*").eq("hedgehog_id", hedgehogId).eq("date", date),
    supabase.from("excretion_records").select("*").eq("hedgehog_id", hedgehogId).eq("date", date),
  ]);

  return {
    weight: weightRes.data,
    meals: mealsRes.data || [],
    excretions: excretionsRes.data || [],
  };
}

export async function saveDailyBatch(data: DailyBatchInput) {
  const supabase = await createClient();
  
  const { hedgehogId, date, weight, meals, excretions } = data;

  // 1. 体重の保存 (Upsert: dateとhedgehog_idがUniqueであることを前提)
  // 注: Unique制約がない場合はInsertになるが、通常日次レコードはUnique推奨。
  // 今回の設計では weight_records に date, hedgehog_id の複合ユニーク制約があると仮定、なければInsert連打になるので注意。
  // schema.sqlを確認できていないが、アプリ側で既存チェックを入れてupdate or insertする。
  
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

  // 2. 食事記録の保存
  // 簡易実装: その日の既存レコードを全削除してInsertしなおす（順序保持などのため）
  // ※IDが変わるためログ的には微妙だが、編集UIの複雑さを避けるためと一旦する。
  if (meals) {
      // Delete old
      await supabase.from("meal_records").delete().eq("hedgehog_id", hedgehogId).eq("date", date);
      
      // Insert new
      if (meals.length > 0) {
          const mealsToInsert = meals.map(m => ({
              hedgehog_id: hedgehogId,
              date: date,
              time: m.time, // time column type should be valid (HH:mm:ss or similar)
              food_type: m.foodType,
              amount: m.amount,
              unit: m.unit,
          }));
          const { error } = await supabase.from("meal_records").insert(mealsToInsert);
          if (error) console.error("Error saving meals:", error);
      }
  }

  // 3. 排泄記録の保存 (食事と同様)
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
