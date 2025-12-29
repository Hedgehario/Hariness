'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

// Schema Verification
const reminderSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(50, 'タイトルは50文字以内で入力してください'),
  targetTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '有効な時間を入力してください'),
  isRepeat: z.boolean().default(true),
  frequency: z.enum(['daily', 'weekly']).optional(),
  daysOfWeek: z.array(z.string()).optional(), // "Mon", "Tue" etc. Stored as comma separated string or JSON? DB is string.
});

export type ReminderInput = z.infer<typeof reminderSchema>;

// Helper: Get today's date string YYYY-MM-DD (JST approx used for comparison)
function getTodayString() {
  // 簡易的なJST日付取得 (サーバーのTZに関わらず日本時間を意識)
  // 厳密には date-fns-tz などを使うべきだが、MVPでは UTC+9 加算で対応
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jstNow.toISOString().split('T')[0];
}

export async function getMyReminders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('care_reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('target_time', { ascending: true });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }

  const today = getTodayString();

  // フロントエンド用に整形
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    time: r.target_time.slice(0, 5), // "HH:MM:SS" -> "HH:MM"
    isCompleted: r.last_completed_date === today,
    isEnabled: r.is_enabled,
    isRepeat: r.is_repeat,
    frequency: r.frequency,
    daysOfWeek: r.days_of_week ? r.days_of_week.split(',') : [],
  }));
}

export async function saveReminder(formData: FormData, id?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'ログインが必要です' };

  const rawData = {
    title: formData.get('title') as string,
    targetTime: formData.get('targetTime') as string,
    isRepeat: formData.get('isRepeat') === 'on',
    frequency: 'daily' as const, // MVP: Simple daily repeat
  };

  const parsed = reminderSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const payload = {
    user_id: user.id,
    title: parsed.data.title,
    target_time: parsed.data.targetTime,
    is_repeat: parsed.data.isRepeat,
    frequency: parsed.data.frequency || 'daily',
    is_enabled: true,
  };

  let error;
  if (id) {
    // Update
    const res = await supabase
      .from('care_reminders')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id);
    error = res.error;
  } else {
    // Create
    const res = await supabase.from('care_reminders').insert(payload);
    error = res.error;
  }

  if (error) {
    console.error('Error saving reminder:', error);
    return { error: '保存に失敗しました' };
  }

  revalidatePath('/reminders');
  revalidatePath('/home');
  redirect('/reminders');
}

export async function toggleReminderComplete(id: string, isCompleted: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const today = getTodayString();

  const { error } = await supabase
    .from('care_reminders')
    .update({
      last_completed_date: isCompleted ? today : null, // 今日にセット or クリア (過去の履歴は持たない簡易仕様)
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/reminders');
  revalidatePath('/home');
  return { success: true };
}

export async function deleteReminder(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('care_reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/reminders');
  revalidatePath('/home');
  return { success: true };
}
