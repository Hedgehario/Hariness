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

  console.log('[getMonthlyEvents] Request:', { year, month });
  const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
  console.log('[getMonthlyEvents] Range:', { startDate, endDate });

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let visits: any[] = [];
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
      hedgehogs.forEach(h => {
          if (h.birth_date) {
            const bDate = new Date(h.birth_date);
            // JS months 0-11
            const bMonth = bDate.getMonth() + 1;
            console.log(`[getMonthlyEvents] Checking birthday for ${h.name}:`, { birthDate: h.birth_date, bMonth, targetMonth: month });
            if (bMonth === month) {
                // It's their birthday month!
                // Construct date string for THIS year
                const thisYearBirthday = `${year}-${String(month).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
                
                birthdays.push({
                    id: `birthday-${h.id}-${year}`,
                    date: thisYearBirthday,
                    title: `🎂 ${h.name}の誕生日`,
                    type: 'event', // Use event type or new type? keeping event for generic styling or adjust component later 
                    // Actually, let's use type='event' but title has emoji.
                    hedgehogId: h.id
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
  birthdays.forEach(b => merged.push(b));

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
