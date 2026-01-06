'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';

// Schema Verification
const reminderSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(50, 'タイトルは50文字以内で入力してください'),
  targetTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '有効な時間を入力してください'),
  isRepeat: z.boolean().default(true),
  frequency: z.enum(['daily', 'weekly']).optional(),
  daysOfWeek: z.array(z.string()).optional(), // "Mon", "Tue" etc.
});

export type ReminderInput = z.infer<typeof reminderSchema>;

export type ReminderDisplay = {
  id: string;
  title: string;
  time: string;
  isCompleted: boolean;
  isEnabled: boolean | null;
  isRepeat: boolean;
  frequency: 'daily' | 'weekly' | null;
  daysOfWeek: string[];
};

// Helper: Get today's date string YYYY-MM-DD (JST approx used for comparison)
function getTodayString() {
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jstNow.toISOString().split('T')[0];
}

export async function getMyReminders(): Promise<ReminderDisplay[]> {
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

  // 自動メンテ: 「繰り返しなし」かつ「過去に完了」したリマインダーを無効化
  const updatesToDisable_Ids: string[] = [];

  const reminders = data.map((r) => {
    let isEnabled = r.is_enabled;
    const isCompletedToday = r.last_completed_date === today;

    // Check if one-time and completed in past
    if (!r.is_repeat && r.last_completed_date && r.last_completed_date < today && r.is_enabled) {
      isEnabled = false;
      updatesToDisable_Ids.push(r.id);
    }

    return {
      id: r.id,
      title: r.title,
      time: r.target_time.slice(0, 5), // "HH:MM:SS" -> "HH:MM"
      isCompleted: isCompletedToday,
      isEnabled: isEnabled,
      isRepeat: r.is_repeat,
      frequency: r.frequency,
      daysOfWeek: r.days_of_week ? r.days_of_week.split(',') : [],
    };
  });

  // 非同期でDB更新（ユーザーを待たせない）
  if (updatesToDisable_Ids.length > 0) {
    (async () => {
      await supabase
        .from('care_reminders')
        .update({ is_enabled: false })
        .in('id', updatesToDisable_Ids);
    })();
  }

  return reminders;
}

export async function saveReminder(
  prevState: unknown,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      success: false,
      error: { code: ErrorCode.AUTH_REQUIRED, message: 'ログインが必要です' },
    };

  const id = formData.get('id') as string | null;

  // Handle checkbox and multiple selects
  const isRepeat = formData.get('isRepeat') === 'on';
  const frequency =
    (formData.get('frequency') as 'daily' | 'weekly') || (isRepeat ? 'daily' : undefined);

  // daysOfWeek might come as multiple input fields with same name or a JSON string?
  // Assuming multiple inputs for now (standard form submission)
  // But wait, standard FormData.getAll returns string[] if multiple inputs exist.
  // We need to parse valid days.
  const daysOfWeekRaw = formData.getAll('daysOfWeek');
  const daysOfWeek = daysOfWeekRaw.map((d) => d.toString()).filter((d) => d.length > 0);

  const rawData = {
    title: formData.get('title') as string,
    targetTime: formData.get('targetTime') as string,
    isRepeat,
    frequency,
    daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
  };

  const parsed = reminderSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: ErrorCode.VALIDATION,
        message: parsed.error.issues[0].message,
      },
    };
  }

  const payload = {
    user_id: user.id,
    title: parsed.data.title,
    target_time: parsed.data.targetTime,
    is_repeat: parsed.data.isRepeat,
    frequency: parsed.data.frequency || 'daily',
    days_of_week: parsed.data.daysOfWeek ? parsed.data.daysOfWeek.join(',') : null,
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
    return {
      success: false,
      error: { code: ErrorCode.INTERNAL_SERVER, message: '保存に失敗しました' },
    };
  }

  revalidatePath('/reminders');
  revalidatePath('/home');
  redirect('/reminders');
}

export async function toggleReminderComplete(
  id: string,
  isCompleted: boolean
): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'Unauthorized' } };

  const today = getTodayString();

  const { error } = await supabase
    .from('care_reminders')
    .update({
      last_completed_date: isCompleted ? today : null,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error)
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: error.message } };

  revalidatePath('/reminders');
  revalidatePath('/home');
  return { success: true };
}

export async function deleteReminder(id: string): Promise<ActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return { success: false, error: { code: ErrorCode.AUTH_REQUIRED, message: 'Unauthorized' } };

  const { error } = await supabase
    .from('care_reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error)
    return { success: false, error: { code: ErrorCode.INTERNAL_SERVER, message: error.message } };

  revalidatePath('/reminders');
  revalidatePath('/home');
  return { success: true };
}
