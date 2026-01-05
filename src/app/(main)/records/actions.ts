'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

import {
  dailyBatchSchema,
  DailyBatchInput,
  MealInput,
  ExcretionInput,
} from './schema';

// Types are imported directly from schema.ts in client components


// 履歴取得用アクション
export async function getDailyRecords(hedgehogId: string, date: string) {
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
      supabase.from('meal_records').select('*').eq('hedgehog_id', hedgehogId).eq('record_date', date),
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
    meals: mealsRes.data || [],
    excretions: excretionsRes.data || [],
    condition: conditionRes.data,
    medications: medicationRes.data || [],
    memo: memoRes.data, // Single object or null
  };
}

export async function saveDailyBatch(inputData: DailyBatchInput) {
  const supabase = await createClient();

  // Validate input
  const parseResult = dailyBatchSchema.safeParse(inputData);
  if (!parseResult.success) {
    console.error('Validation Error:', parseResult.error);
    return { success: false, error: 'Validation Error', details: parseResult.error.format() };
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
        const { error } = await supabase.from('weight_records').update({ weight }).eq('id', existing.id);
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
        const { error } = await supabase.from('environment_records').update(payload).eq('id', existing.id);
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
          content: m.foodType,
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
          medicine_name: m.content || '',
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
        await supabase
          .from('memo_records')
          .update({ content: memo })
          .eq('id', existing.id);
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
    return { success: true };
  } catch (error: any) {
    console.error('Save Error:', error);
    return { success: false, error: error.message };
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
  return data;
}

export async function getRecentRecords(hedgehogId: string, limit: number = 7) {
  const supabase = await createClient();

  // TODO: 本来は全テーブルJoinまたはUnionが必要だが、
  // いったん体重がある日または指定範囲（今日から過去N日）とする。
  // 今回は「今日から過去N日」のデータを一括で返す形にする。

  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - limit);

  // Use local date string logic
  const offset = pastDate.getTimezoneOffset();
  const localPastDate = new Date(pastDate.getTime() - offset * 60 * 1000);
  const startDateStr = localPastDate.toISOString().split('T')[0];

  const [wRes, mRes, eRes] = await Promise.all([
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
  ]);

  // 日付ごとにグルーピング
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped: Record<string, { weight?: any; meals: any[]; excretions: any[] }> = {};

  // Initialize with range dates if needed, or just map existing data
  // データが存在する日付のみリスト化
  const addToGroup = (date: string) => {
    if (!grouped[date]) grouped[date] = { meals: [], excretions: [] };
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

  // 配列に変換してソート
  return Object.entries(grouped)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));
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
