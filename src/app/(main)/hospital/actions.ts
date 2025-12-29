'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schema for validation
const MedicineSchema = z.object({
  id: z.string().optional(), // For UI key, internal use
  name: z.string().min(1, '薬名は必須です'),
  note: z.string().optional(),
});
// ...
const HospitalVisitSchema = z.object({
  id: z.string().optional(),
  hedgehog_id: z.string().min(1, '個体の選択は必須です'), // In future multi-hedgehog support
  visit_date: z.string().min(1, '受診日は必須です'),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  medications: z.array(MedicineSchema).optional(),
  next_visit_date: z.string().optional().nullable(),
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

// Get user's hedgehogs for selection (needed for 'hedgehog_id')
// Reusing getMyHedgehogs from hedgehogs/actions might be circular or messy?
// Let's just do a quick fetch here or import if clean.
// Given hedgehogs/actions.ts is safe, let's duplicate logic slightly or trust client passes it?
// Client usually needs to select hedgehog.
// I'll fetch first hedgehog ID if not provided, or better, fetch all hedgehogs for the select UI.
export async function getMyHedgehogsDropdown() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('hedgehogs')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return data || [];
}

// Save Visit
export async function saveHospitalVisit(input: HospitalVisitInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = HospitalVisitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { id, hedgehog_id, visit_date, diagnosis, treatment, medications, next_visit_date } =
    parsed.data;

  // Prepare payload
  // medicine_prescription is stored as JSON
  const medicinePayload = medications?.map((m) => ({ name: m.name, note: m.note || '' })) || [];

  try {
    if (id) {
      // Update
      const { error } = await supabase
        .from('hospital_visits')
        .update({
          hedgehog_id,
          visit_date,
          diagnosis,
          treatment,
          medicine_prescription: medicinePayload,
          next_visit_date: next_visit_date || null,
        })
        .eq('id', id);

      if (error) throw error;
    } else {
      // Create
      const { error } = await supabase.from('hospital_visits').insert({
        hedgehog_id,
        visit_date,
        diagnosis,
        treatment,
        medicine_prescription: medicinePayload,
        next_visit_date: next_visit_date || null,
      });

      if (error) throw error;
    }

    revalidatePath('/calendar');
    revalidatePath('/hospital/entry');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Delete Visit
export async function deleteHospitalVisit(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('hospital_visits').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/calendar');
  return { success: true };
}
