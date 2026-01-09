'use server';

import { endOfMonth, format, startOfMonth } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

// --- Types ---

export type CalendarEventDisplay = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'hospital' | 'event' | 'birthday';
  hedgehogId?: string;
  borderColor?: string; // For specific hedgehog color
};

// --- Schemas ---

const eventSchema = z.object({
  id: z.string().optional(),
  date: z.string(), // YYYY-MM-DD
  title: z.string().min(1, 'タイトルを入力してください'),
});

export type EventInput = z.infer<typeof eventSchema>;

// --- Actions ---

export async function getMonthlyEvents(
  year: number,
  month: number
): Promise<CalendarEventDisplay[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

  // Fetch user's hedgehogs to get IDs (and maybe colors later)
  const { data: hedgehogs } = await supabase
    .from('hedgehogs')
    .select('id, name, birth_date')
    .eq('user_id', user.id);

  // 1. Fetch Generic Events
  const { data: events } = await supabase
    .from('calendar_events')
    .select('id, event_date, title')
    .eq('user_id', user.id)
    .gte('event_date', startDate)
    .lte('event_date', endDate);

  // 2. Fetch Hospital Visits
  type HospitalVisit = { id: string; visit_date: string; diagnosis: string | null; hedgehog_id: string };
  let visits: HospitalVisit[] = [];
  if (hedgehogs && hedgehogs.length > 0) {
    const hedgehogIds = hedgehogs.map((h) => h.id);
    const { data: v } = await supabase
      .from('hospital_visits')
      .select('id, visit_date, diagnosis, hedgehog_id')
      .in('hedgehog_id', hedgehogIds)
      .gte('visit_date', startDate)
      .lte('visit_date', endDate);
    if (v) visits = v;
  }

  // 3. Simple Birthday Check (Target month in requested Year)
  // Logic: Check if birth_date month matches target month.
  // Then create an event for "YYYY-MM-DD" where YYYY is the *requested* year.
  const birthdays: CalendarEventDisplay[] = [];
  if (hedgehogs && hedgehogs.length > 0) {
    hedgehogs.forEach((h) => {
      if (h.birth_date) {
        // Fix: Use string splitting to avoid timezone issues with new Date()
        const [_, mStr, dStr] = h.birth_date.split('-');
        const bMonth = parseInt(mStr, 10);
        
        if (bMonth === month) {
          // It's their birthday month!
          // Construct date string for THIS year
          const thisYearBirthday = `${year}-${String(month).padStart(2, '0')}-${dStr}`;

          birthdays.push({
            id: `birthday-${h.id}-${year}`,
            date: thisYearBirthday,
            title: `🎂 ${h.name}の誕生日`,
            type: 'birthday',
            hedgehogId: h.id,
          });
        }
      }
    });
  }

  // 4. Merge and Normalize
  const merged: CalendarEventDisplay[] = [];

  // Generic Events
  events?.forEach((e) => {
    merged.push({
      id: e.id,
      date: e.event_date,
      title: e.title,
      type: 'event',
    });
  });

  // Hospital Visits
  visits?.forEach((v) => {
    // Find hedgehog name for title
    const hh = hedgehogs?.find((h) => h.id === v.hedgehog_id);
    const hhName = hh ? hh.name : 'ハリネズミ';

    merged.push({
      id: v.id,
      date: v.visit_date,
      title: `🏥 ${hhName}: ${v.diagnosis || '通院'}`,
      type: 'hospital',
      hedgehogId: v.hedgehog_id,
    });
  });

  // Birthdays
  birthdays.forEach((b) => merged.push(b));

  // Sort by date
  return merged.sort((a, b) => a.date.localeCompare(b.date));
}

import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

// ... (existing code getMonthlyEvents) ...

export async function saveEvent(input: EventInput): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'Unauthorized' } };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: ErrorCode.VALIDATION, message: parsed.error.message } };
  }

  const { id, date, title } = parsed.data;

  try {
    if (id) {
      // Update
      const { error } = await supabase
        .from('calendar_events')
        .update({ event_date: date, title })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    } else {
      // Create
      const { error } = await supabase.from('calendar_events').insert({
        user_id: user.id,
        event_date: date,
        title,
      });
      if (error) throw error;
    }

    revalidatePath('/calendar');
    return { success: true, message: '予定を保存しました' };
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: 'Failed to save event: ' + message },
    };
  }
}

export async function deleteEvent(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'Unauthorized' } };

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error)
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: error.message } };

  revalidatePath('/calendar');
  return { success: true, message: '削除しました' };
}

export async function getEvent(id: string): Promise<EventInput | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('calendar_events')
    .select('id, event_date, title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    date: data.event_date,
    title: data.title,
  };
}
