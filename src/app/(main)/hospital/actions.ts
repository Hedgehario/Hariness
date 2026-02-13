'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

// Schema for validation
const MedicineSchema = z.object({
  id: z.string().optional(), // For UI key, internal use
  name: z.string().min(1, '薬名は必須です').max(50, '薬名は50文字以内で入力してください'),
  note: z.string().max(100, '備考は100文字以内で入力してください').optional(),
});
// ...
const HospitalVisitSchema = z.object({
  id: z.string().optional(),
  hedgehog_id: z.string().min(1, 'ハリネズミの選択は必須です'), // In future multi-hedgehog support
  visit_date: z.string().min(1, '受診日は必須です'),
  title: z.string().max(100, 'タイトルは100文字以内で入力してください').optional(),
  diagnosis: z.string().max(500, '診断名は500文字以内で入力してください').optional(),
  treatment: z.string().max(500, '治療内容は500文字以内で入力してください').optional(),
  medications: z.array(MedicineSchema).optional(),
  next_visit_date: z.string().optional().nullable(),
  cost: z.number().int('金額は整数で入力してください').min(0, '金額は0以上で入力してください').max(9999999, '金額は9,999,999円以下で入力してください').optional().nullable(),
});

export type HospitalVisitInput = z.infer<typeof HospitalVisitSchema>;

// Get single visit for editing
export async function getHospitalVisit(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase.from('hospital_visits').select('*').eq('id', id).single();

  if (error) throw new Error(error.message);

  // Transform Json to friendly array
  const medications = Array.isArray(data.medicine_prescription) ? data.medicine_prescription : [];

  return {
    ...data,
    medications: medications as { id: string; name: string; note: string }[],
  };
}

// Get all hospital visits for a hedgehog (for history page)
export async function getHospitalVisits(hedgehogId: string, limit?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let query = supabase
    .from('hospital_visits')
    .select('id, visit_date, title, diagnosis, treatment, medicine_prescription, next_visit_date, cost')
    .eq('hedgehog_id', hedgehogId)
    .order('visit_date', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Fetch hospital visits error:', error.message);
    return [];
  }

  return data || [];
}

// Get visit by date for checking/SSR
export async function getHospitalVisitByDate(hedgehogId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('hospital_visits')
    .select('*')
    .eq('hedgehog_id', hedgehogId)
    .eq('visit_date', date)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Fetch visit by date error:', error.message || JSON.stringify(error));
    return null;
  }
  if (!data || data.length === 0) return null;

  const record = data[0];

  // Transform Json to friendly array
  const medications = Array.isArray(record.medicine_prescription)
    ? record.medicine_prescription
    : [];

  return {
    ...record,
    medications: medications as { id: string; name: string; note: string }[],
  };
}

// Get user's hedgehogs for selection (needed for 'hedgehog_id')
// Reusing getMyHedgehogs from hedgehogs/actions might be circular or messy?
// Let's just do a quick fetch here or import if clean.
// Given hedgehogs/actions.ts is safe, let's duplicate logic slightly or trust client passes it?
// Client usually needs to select hedgehog.
// I'll fetch first hedgehog ID if not provided, or better, fetch all hedgehogs for the select UI.

import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

// ... (existing helper function getHospitalVisit, getMyHedgehogsDropdown ... )

// Check if visit exists for date
export async function checkVisitExists(
  hedgehogId: string,
  date: string
): Promise<{ exists: boolean; id?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('hospital_visits')
    .select('id')
    .eq('hedgehog_id', hedgehogId)
    .eq('visit_date', date)
    .maybeSingle();

  if (error) {
    console.error('Check visit error:', error);
    return { exists: false };
  }

  return { exists: !!data, id: data?.id };
}

// Save Visit
export async function saveHospitalVisit(input: HospitalVisitInput): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'Unauthorized' } };

  const parsed = HospitalVisitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: { code: ErrorCode.VALIDATION, message: parsed.error.issues[0].message },
    };
  }

  const { id, hedgehog_id, visit_date, title, diagnosis, treatment, medications, next_visit_date, cost } =
    parsed.data;

  // Prepare payload
  // medicine_prescription is stored as JSON
  const medicinePayload = medications?.map((m) => ({ name: m.name, note: m.note || '' })) || [];

  try {
    if (id) {
      // Update by ID
      const { error } = await supabase
        .from('hospital_visits')
        .update({
          hedgehog_id,
          visit_date,
          title,
          diagnosis,
          treatment,
          medicine_prescription: medicinePayload,
          next_visit_date: next_visit_date || null,
          cost: cost ?? null,
        })
        .eq('id', id);

      if (error) throw error;
    } else {
      // 新規作成前に同じ日付のレコードがあるかチェック
      const { data: existing } = await supabase
        .from('hospital_visits')
        .select('id')
        .eq('hedgehog_id', hedgehog_id)
        .eq('visit_date', visit_date)
        .limit(1);

      if (existing && existing.length > 0) {
        // 既存レコードがある場合は更新
        const { error } = await supabase
          .from('hospital_visits')
          .update({
            title,
            diagnosis,
            treatment,
            medicine_prescription: medicinePayload,
            next_visit_date: next_visit_date || null,
            cost: cost ?? null,
          })
          .eq('id', existing[0].id);

        if (error) throw error;
      } else {
        // 新規作成
        const { error } = await supabase.from('hospital_visits').insert({
          hedgehog_id,
          visit_date,
          title,
          diagnosis,
          treatment,
          medicine_prescription: medicinePayload,
          next_visit_date: next_visit_date || null,
          cost: cost ?? null,
        });

        if (error) throw error;
      }
    }

    revalidatePath('/calendar');
    revalidatePath('/hospital/entry');
    revalidatePath('/records');
    return { success: true, message: '通院履歴を保存しました' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(error);
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message } };
  }
}

// Delete Visit
export async function deleteHospitalVisit(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const { error } = await supabase.from('hospital_visits').delete().eq('id', id);
  if (error)
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: error.message } };

  revalidatePath('/calendar');
  revalidatePath('/records');
  return { success: true, message: '削除しました' };
}
