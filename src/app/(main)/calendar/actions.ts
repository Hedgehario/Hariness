'use server';

import { endOfMonth, format,startOfMonth } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

// --- Types ---

export type CalendarEventDisplay = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'hospital' | 'event';
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

  // 1. Fetch Generic Events
  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('event_date', startDate)
    .lte('event_date', endDate);

  // 2. Fetch Hospital Visits
  // Need to get hedgehogs first to join? Or just fetch visits for user's hedgehogs?
  // RLS ensures we only see our hedgehogs' visits if we query generically,
  // but hospital_visits doesn't have user_id directly, it has hedgehog_id.

  // Fetch user's hedgehogs to get IDs (and maybe colors later)
  const { data: hedgehogs } = await supabase
    .from('hedgehogs')
    .select('id, name')
    .eq('user_id', user.id);

  let visits: any[] = [];
  if (hedgehogs && hedgehogs.length > 0) {
    const hedgehogIds = hedgehogs.map((h) => h.id);
    const { data: v } = await supabase
      .from('hospital_visits')
      .select('*')
      .in('hedgehog_id', hedgehogIds)
      .gte('visit_date', startDate)
      .lte('visit_date', endDate);
    if (v) visits = v;
  }

  // 3. Merge and Normalize
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

  // Sort by date
  return merged.sort((a, b) => a.date.localeCompare(b.date));
}

export async function saveEvent(input: EventInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
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
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to save event' };
  }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/calendar');
  return { success: true };
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
