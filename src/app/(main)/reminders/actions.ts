'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';
import { ErrorCode } from '@/types/errors';

// Schema Verification
const reminderSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(50, 'タイトルは50文字以内で入力してください'),
  targetTime: z
    .union([
      z.literal(''),
      z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '有効な時間を入力してください'),
    ])
    .optional(),
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

// Helper: Get today's day of week in English abbreviated form
function getTodayDayOfWeek(): string {
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[jstNow.getUTCDay()];
}

/**
 * ホーム画面用: 今日表示すべきリマインダーのみ取得
 * - 有効 (is_enabled=true) のもののみ
 * - 繰り返しなし: 未完了または今日完了したもの
 * - 毎日: 常に表示
 * - 曜日指定: 今日がその曜日なら表示
 */
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
    .eq('is_enabled', true)
    .order('target_time', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }

  const today = getTodayString();
  const todayDayOfWeek = getTodayDayOfWeek();

  const reminders: ReminderDisplay[] = [];

  for (const r of data) {
    const isCompletedToday = r.last_completed_date === today;
    const daysOfWeek = r.days_of_week ? r.days_of_week.split(',') : [];

    // 表示すべきかどうか判定
    let shouldShow = false;

    if (!r.is_repeat) {
      // 1回限り: 未完了または今日完了したもののみ
      shouldShow = !r.last_completed_date || r.last_completed_date === today;
    } else if (r.frequency === 'weekly' && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
      // 曜日指定: 今日がその曜日か
      shouldShow = daysOfWeek.includes(todayDayOfWeek);
    } else {
      // 毎日 or 7曜日すべて選択: 常に表示
      shouldShow = true;
    }

    if (shouldShow) {
      reminders.push({
        id: r.id,
        title: r.title,
        time: r.target_time ? r.target_time.slice(0, 5) : '終日',
        isCompleted: isCompletedToday,
        isEnabled: r.is_enabled,
        isRepeat: r.is_repeat,
        frequency: r.frequency,
        daysOfWeek: daysOfWeek,
      });
    }
  }

  return reminders;
}

/**
 * 管理画面用: すべてのリマインダーを取得（編集・削除用）
 * - 有効/無効に関わらずすべて表示
 * - 完了済み1回限りも表示
 */
export async function getAllReminders(): Promise<ReminderDisplay[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('care_reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('target_time', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }

  const today = getTodayString();

  return data.map((r) => ({
    id: r.id,
    title: r.title,
    time: r.target_time ? r.target_time.slice(0, 5) : '終日',
    isCompleted: r.last_completed_date === today,
    isEnabled: r.is_enabled,
    isRepeat: r.is_repeat,
    frequency: r.frequency,
    daysOfWeek: r.days_of_week ? r.days_of_week.split(',') : [],
  }));
}

// 単一リマインダー取得（編集用）
export async function getReminder(id: string): Promise<ReminderDisplay | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('care_reminders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching reminder:', error);
    return null;
  }

  const today = getTodayString();

  return {
    id: data.id,
    title: data.title,
    time: data.target_time ? data.target_time.slice(0, 5) : '',
    isCompleted: data.last_completed_date === today,
    isEnabled: data.is_enabled,
    isRepeat: data.is_repeat,
    frequency: data.frequency,
    daysOfWeek: data.days_of_week ? data.days_of_week.split(',') : [],
  };
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
    // 空文字列の場合はnull（終日）、それ以外はそのまま保存（00:00も深夜0時として扱う）
    target_time: parsed.data.targetTime || null,
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
      error: { code: ErrorCode.INTERNAL_SERVER, message: `保存に失敗しました: ${error.message}` },
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
