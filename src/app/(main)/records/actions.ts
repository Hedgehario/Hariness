'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

import { DailyBatchInput, dailyBatchSchema } from './schema';

// Types are imported directly from schema.ts in client components

// 履歴取得用アクション
type DailyData = {
  weight: { weight: number | null } | null;
  meals: { record_time: string; content: string; amount?: number; amount_unit?: string; unit?: string }[];
  excretions: { record_time: string; condition: string; details?: string; notes?: string }[];
  condition: { temperature?: number; humidity?: number } | null;
  medications: { record_time: string; medicine_name: string; name?: string }[];
  memo: { content: string } | null;
};
export async function getDailyRecords(hedgehogId: string, date: string): Promise<DailyData> {
  const supabase = await createClient();

  // 並列でデータ取得
  const [weightRes, mealsRes, excretionsRes, conditionRes, medicationRes, memoRes] =
    await Promise.all([
      supabase
        .from('weight_records')
        .select('*')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date)
        .single(),
      supabase
        .from('meal_records')
        .select('*')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date),
      supabase
        .from('excretion_records')
        .select('*')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date),
      supabase
        .from('environment_records')
        .select('*')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date)
        .single(),
      supabase
        .from('medication_records')
        .select('*')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date),
      supabase
        .from('memo_records')
        .select('*')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date)
        .single(),
    ]);

  return {
    weight: weightRes.data,
    meals: (mealsRes.data || []).map((m) => ({
      ...m,
      time: m.record_time,
      unit: m.amount_unit,
    })),
    excretions: (excretionsRes.data || []).map((e) => ({
      ...e,
      time: e.record_time,
      type: 'stool', // Default or derived if needed
      notes: e.details,
    })),
    condition: conditionRes.data,
    medications: (medicationRes.data || []).map((m) => ({
      ...m,
      time: m.record_time,
      name: m.medicine_name,
    })),
    memo: memoRes.data, // Single object or null
  };
}

import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

// ... (existing helper function dailyRecords ... )

export async function saveDailyBatch(inputData: DailyBatchInput): Promise<ActionResponse> {
  const supabase = await createClient();

  // Validate input
  const parseResult = dailyBatchSchema.safeParse(inputData);
  if (!parseResult.success) {
    console.error('Validation Error:', parseResult.error);
    const details = parseResult.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join(' / ');
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION,
        message: `入力内容に誤りがあります: ${details}`,
        meta: parseResult.error.format(),
      },
    };
  }

  const data = parseResult.data;
  console.log('[saveDailyBatch] Input:', JSON.stringify(data, null, 2));
  const { hedgehogId, date, weight, temperature, humidity, meals, excretions, medications, memo } =
    data;

  try {
    // 1. 体重の保存
    if (weight !== undefined && weight !== null) {
      const { data: existing } = await supabase
        .from('weight_records')
        .select('id')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('weight_records')
          .update({ weight })
          .eq('id', existing.id);
        if (error) throw new Error('Weight update failed: ' + error.message);
      } else {
        const { error } = await supabase.from('weight_records').insert({
          hedgehog_id: hedgehogId,
          record_date: date,
          weight: weight,
        });
        if (error) throw new Error('Weight insert failed: ' + error.message);
      }
    }

    // 1.5. 体調(気温・湿度)の保存
    if (
      (temperature !== undefined && temperature !== null) ||
      (humidity !== undefined && humidity !== null)
    ) {
      const { data: existing } = await supabase
        .from('environment_records')
        .select('id')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date)
        .maybeSingle();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { hedgehog_id: hedgehogId, record_date: date };
      if (temperature !== undefined && temperature !== null) payload.temperature = temperature;
      if (humidity !== undefined && humidity !== null) payload.humidity = humidity;

      if (existing) {
        const { error } = await supabase
          .from('environment_records')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw new Error('Environment update failed: ' + error.message);
      } else {
        const { error } = await supabase.from('environment_records').insert(payload);
        if (error) throw new Error('Environment insert failed: ' + error.message);
      }
    }

    // 2. 食事記録の保存
    if (meals) {
      const { error: deleteError } = await supabase
        .from('meal_records')
        .delete()
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date);

      if (deleteError) throw new Error('Failed to delete old meals: ' + deleteError.message);

      if (meals.length > 0) {
        const mealsToInsert = meals.map((m) => ({
          hedgehog_id: hedgehogId,
          record_date: date,
          record_time: m.time,
          content: m.content, // Changed from foodType
          amount: m.amount,
          amount_unit: m.unit,
        }));
        const { error: insertError } = await supabase.from('meal_records').insert(mealsToInsert);
        if (insertError) throw new Error('Failed to insert meals: ' + insertError.message);
      }
    }

    // 3. 排泄記録の保存
    if (excretions) {
      const { error: deleteError } = await supabase
        .from('excretion_records')
        .delete()
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date);

      if (deleteError) throw new Error('Failed to delete old excretions: ' + deleteError.message);

      if (excretions.length > 0) {
        const excretionsToInsert = excretions.map((e) => ({
          hedgehog_id: hedgehogId,
          record_date: date,
          record_time: e.time,
          condition: e.condition || 'normal', // DB column is 'condition' (normal/abnormal)
          details: e.notes,
        }));
        const { error: insertError } = await supabase
          .from('excretion_records')
          .insert(excretionsToInsert);
        if (insertError) throw new Error('Failed to insert excretions: ' + insertError.message);
      }
    }

    // 4. 投薬記録の保存
    if (medications) {
      const { error: deleteError } = await supabase
        .from('medication_records')
        .delete()
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date);

      if (deleteError) throw new Error('Failed to delete old medications: ' + deleteError.message);

      if (medications.length > 0) {
        const medsToInsert = medications.map((m) => ({
          hedgehog_id: hedgehogId,
          record_date: date,
          record_time: m.time,
          medicine_name: m.name || '', // Changed from content to name (Schema change)
        }));
        const { error: insertError } = await supabase
          .from('medication_records')
          .insert(medsToInsert);
        if (insertError) throw new Error('Failed to insert medications: ' + insertError.message);
      }
    }

    // 5. メモ (memo_records)
    if (memo !== undefined) {
      const { data: existing } = await supabase
        .from('memo_records')
        .select('id')
        .eq('hedgehog_id', hedgehogId)
        .eq('record_date', date)
        .single();

      if (existing) {
        await supabase.from('memo_records').update({ content: memo }).eq('id', existing.id);
      } else {
        await supabase.from('memo_records').insert({
          hedgehog_id: hedgehogId,
          record_date: date,
          content: memo,
        });
      }
    }

    revalidatePath(`/records/${hedgehogId}`);
    revalidatePath('/home');
    revalidatePath('/home');
    return { success: true };
  } catch (error: unknown) {
    console.error('Save Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message } };
  }
}

// 履歴取得用アクション

export async function getWeightHistory(hedgehogId: string, range: '30d' | '90d' | '180d' = '30d') {
  const supabase = await createClient();
  const today = new Date();
  const startDate = new Date();

  if (range === '30d') startDate.setDate(today.getDate() - 30);
  else if (range === '90d') startDate.setDate(today.getDate() - 90);
  else if (range === '180d') startDate.setDate(today.getDate() - 180);

  // Use local date string logic to match DB 'YYYY-MM-DD'
  const offset = startDate.getTimezoneOffset();
  const localStartDate = new Date(startDate.getTime() - offset * 60 * 1000);
  const startDateStr = localStartDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('weight_records')
    .select('record_date, weight')
    .eq('hedgehog_id', hedgehogId)
    .gte('record_date', startDateStr)
    .order('record_date', { ascending: true });

  if (error) {
    console.error('Error fetching weight history:', error);
    return [];
  }
  // UI expects 'date' not 'record_date'
  return data.map((d) => ({ date: d.record_date, weight: d.weight }));
}

export async function getRecentRecords(hedgehogId: string, limit: number = 7) {
  const supabase = await createClient();

  // 記録がある日をN件取得する
  // まず広い範囲（90日）からデータを取得し、最終的にlimit件数に制限
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 90); // 90日分の範囲から取得

  // Use local date string logic
  const offset = pastDate.getTimezoneOffset();
  const localPastDate = new Date(pastDate.getTime() - offset * 60 * 1000);
  const startDateStr = localPastDate.toISOString().split('T')[0];

  const [wRes, mRes, eRes, medRes, memoRes] = await Promise.all([
    supabase
      .from('weight_records')
      .select('record_date, weight')
      .eq('hedgehog_id', hedgehogId)
      .gte('record_date', startDateStr)
      .order('record_date', { ascending: false }),
    supabase
      .from('meal_records')
      .select('record_date, record_time, content, amount, amount_unit')
      .eq('hedgehog_id', hedgehogId)
      .gte('record_date', startDateStr)
      .order('record_date', { ascending: false }),
    supabase
      .from('excretion_records')
      .select('record_date, record_time, condition, details')
      .eq('hedgehog_id', hedgehogId)
      .gte('record_date', startDateStr)
      .order('record_date', { ascending: false }),
    supabase
      .from('medication_records')
      .select('record_date')
      .eq('hedgehog_id', hedgehogId)
      .gte('record_date', startDateStr),
    supabase
      .from('memo_records')
      .select('record_date, content')
      .eq('hedgehog_id', hedgehogId)
      .gte('record_date', startDateStr),
  ]);

  // 日付ごとにグルーピング
  type GroupedRecord = {
    weight?: { weight: number | null };
    meals: { foodType?: string; content?: string; amount?: number; amount_unit?: string }[];
    excretions: { condition: string; details?: string }[];
    hasMedication: boolean;
    hasMemo: boolean;
  };
  const grouped: Record<string, GroupedRecord> = {};

  // データが存在する日付のみリスト化
  const addToGroup = (date: string) => {
    if (!grouped[date]) grouped[date] = { meals: [], excretions: [], hasMedication: false, hasMemo: false };
  };

  wRes.data?.forEach((r) => {
    addToGroup(r.record_date);
    grouped[r.record_date].weight = r;
  });
  mRes.data?.forEach((r) => {
    addToGroup(r.record_date);
    grouped[r.record_date].meals.push(r);
  });
  eRes.data?.forEach((r) => {
    addToGroup(r.record_date);
    grouped[r.record_date].excretions.push(r);
  });
  medRes.data?.forEach((r) => {
    addToGroup(r.record_date);
    grouped[r.record_date].hasMedication = true;
  });
  memoRes.data?.forEach((r) => {
    addToGroup(r.record_date);
    // メモが空文字でない場合のみtrue
    if (r.content && r.content.trim() !== '') {
      grouped[r.record_date].hasMemo = true;
    }
  });

  // 配列に変換してソート、limit件数に制限
  return Object.entries(grouped)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit); // 記録がある日をlimit件に制限
}

export async function deleteDailyRecord(hedgehogId: string, date: string): Promise<ActionResponse> {
  const supabase = await createClient();

  try {
    // 全ての関連テーブルから削除
    await Promise.all([
      supabase.from('weight_records').delete().eq('hedgehog_id', hedgehogId).eq('record_date', date),
      supabase.from('meal_records').delete().eq('hedgehog_id', hedgehogId).eq('record_date', date),
      supabase.from('excretion_records').delete().eq('hedgehog_id', hedgehogId).eq('record_date', date),
      supabase.from('medication_records').delete().eq('hedgehog_id', hedgehogId).eq('record_date', date),
      supabase.from('memo_records').delete().eq('hedgehog_id', hedgehogId).eq('record_date', date),
      supabase.from('environment_records').delete().eq('hedgehog_id', hedgehogId).eq('record_date', date),
    ]);

    revalidatePath(`/records/${hedgehogId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: '削除に失敗しました' } };
  }
}

export async function getHospitalHistory(hedgehogId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('hospital_visits')
    .select('id, visit_date, diagnosis, treatment, next_visit_date, medicine_prescription')
    .eq('hedgehog_id', hedgehogId)
    .order('visit_date', { ascending: false });

  return data || [];
}
