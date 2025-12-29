'use server';

import { format } from 'date-fns';

import { createClient } from '@/lib/supabase/server';

type ExportType = 'users' | 'hedgehogs' | 'all_records';

export async function exportData(exportType: ExportType, startDate?: string, endDate?: string) {
  const supabase = await createClient();

  // 1. Permission Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Forbidden' };
  }

  // 2. Fetch Data
  let csvContent = '';
  let fileName = '';

  try {
    if (exportType === 'users') {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, gender, age_group, prefecture, created_at, last_login_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const header = 'USER_ID,DISPLAY_NAME,GENDER,AGE_GROUP,PREFECTURE,CREATED_AT,LAST_LOGIN_AT\n';
      const rows = data
        .map(
          (row) =>
            `"${row.id}","${row.display_name}","${row.gender || ''}","${row.age_group || ''}","${row.prefecture || ''}","${row.created_at}","${row.last_login_at || ''}"`
        )
        .join('\n');

      csvContent = header + rows;
      fileName = `users_${format(new Date(), 'yyyyMMddHHmmss')}.csv`;
    } else if (exportType === 'hedgehogs') {
      const { data, error } = await supabase
        .from('hedgehogs')
        .select('id, user_id, name, gender, birth_date, welcome_date, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const header = 'HEDGEHOG_ID,USER_ID,NAME,GENDER,BIRTH_DATE,WELCOME_DATE,CREATED_AT\n';
      const rows = data
        .map(
          (row) =>
            `"${row.id}","${row.user_id}","${row.name}","${row.gender || ''}","${row.birth_date || ''}","${row.welcome_date || ''}","${row.created_at}"`
        )
        .join('\n');

      csvContent = header + rows;
      fileName = `hedgehogs_${format(new Date(), 'yyyyMMddHHmmss')}.csv`;
    } else if (exportType === 'all_records') {
      // Fetching weight records as a sample of "daily records"
      // Ideally we join tables, but for simplicity let's export weight records first
      const query = supabase
        .from('weight_records')
        .select('id, hedgehog_id, weight, record_date, created_at')
        .order('record_date', { ascending: false });

      if (startDate) query.gte('record_date', startDate);
      if (endDate) query.lte('record_date', endDate);

      const { data, error } = await query;
      if (error) throw error;

      const header = 'RECORD_ID,HEDGEHOG_ID,WEIGHT_GRAMS,RECORD_DATE,CREATED_AT\n';
      const rows = data
        .map(
          (row) =>
            `"${row.id}","${row.hedgehog_id}",${row.weight},"${row.record_date}","${row.created_at}"`
        )
        .join('\n');

      csvContent = header + rows;
      fileName = `weight_records_${format(new Date(), 'yyyyMMddHHmmss')}.csv`;
    }

    return { csvContent, fileName };
  } catch (e: any) {
    console.error('Export Error:', e.message);
    return { error: 'Export failed: ' + e.message };
  }
}

// --- News Management Actions ---

export async function getNewsList() {
  const supabase = await createClient();
  // Admin check not strictly required for listing if we filter by published for users,
  // but this is admin function so we fetch all.
  // For safety, let's just fetch all. Authentication is handled by layout/middleware for the page.

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get News Error:', error.message);
    return [];
  }
  return data;
}

export async function getNews(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('news').select('*').eq('id', id).single();

  if (error) return null;
  return data;
}

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const newsSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100),
  content: z.string().min(1, '本文は必須です'),
  isPublished: z.boolean(),
});

export async function saveNews(formData: FormData, id?: string) {
  const supabase = await createClient();

  // Admin Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    isPublished: formData.get('isPublished') === 'on',
  };

  const parsed = newsSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const newsData = {
    title: parsed.data.title,
    content: parsed.data.content,
    is_published: parsed.data.isPublished,
    published_at: parsed.data.isPublished ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
    created_by: user.id, // Only for insert, but okay to set on update? Schema types implies generic update object.
  };

  let error;
  if (id) {
    // Update
    const { error: e } = await supabase
      .from('news')
      .update({
        title: newsData.title,
        content: newsData.content,
        is_published: newsData.is_published,
        published_at: newsData.published_at,
        updated_at: newsData.updated_at,
      })
      .eq('id', id);
    error = e;
  } else {
    // Create
    const { error: e } = await supabase.from('news').insert({
      title: newsData.title,
      content: newsData.content,
      is_published: newsData.is_published,
      published_at: newsData.published_at,
      created_by: user.id,
    });
    error = e;
  }

  if (error) {
    console.error('Save News Error:', error.message);
    return { error: '保存に失敗しました。' };
  }

  revalidatePath('/admin/news');
  return { success: true };
}

export async function deleteNews(id: string) {
  const supabase = await createClient();

  // Admin Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Forbidden' };

  const { error } = await supabase.from('news').delete().eq('id', id);

  if (error) {
    console.error('Delete News Error:', error.message);
    return { error: '削除に失敗しました。' };
  }

  revalidatePath('/admin/news');
  return { success: true };
}
