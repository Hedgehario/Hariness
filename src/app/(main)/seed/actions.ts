'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const DUMMY_HEDGEHOG_NAMES = ['ダミー丸', 'テスト之助', 'モック', 'スタブ郎'];

export async function seedData() {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  log('Starting seed...');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated', logs };
  }
  const userId = user.id;
  log(`User ID: ${userId}`);

  // 2. Insert 4 Dummy Hedgehogs
  log('creating 4 dummy hedgehogs...');
  const newHedgehogs = [];
  for (const name of DUMMY_HEDGEHOG_NAMES) {
    const { data, error } = await supabase
      .from('hedgehogs')
      .insert({
        user_id: userId,
        name: name,
        birth_date: '2023-01-01',
        gender: 'male',
        // color: 'salt_pepper', // Removed based on schema
        // weight: 300, // Removed based on schema
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) log(`Error creating hedgehog ${name}: ${JSON.stringify(error)}`);
    else {
      log(`Created hedgehog: ${data.name} (${data.id})`);
      newHedgehogs.push(data);
    }
  }

  // Use the first new hedgehog for records (or existing one)
  const targetHedgehogId = newHedgehogs.length > 0 ? newHedgehogs[0].id : null;

  // If we couldn't create new ones, try to find an existing one
  let finalTargetId = targetHedgehogId;
  if (!finalTargetId) {
    const { data: existing } = await supabase
      .from('hedgehogs')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();
    if (existing) {
      finalTargetId = existing.id;
      log('Using existing hedgehog: ' + finalTargetId);
    }
  }

  if (!finalTargetId) return { success: false, error: 'No hedgehog to attach records to', logs };

  // Inspect schema for weight_records
  const { data: wSample, error: wSampleError } = await supabase
    .from('weight_records')
    .select('*')
    .limit(1);
  if (wSampleError) {
    log('Error checking weight_records schema: ' + JSON.stringify(wSampleError));
    // If error is code 42703 (undefined column), it might be on select(*) if a column is dropped? No select * works usually.
    // Wait, if I do select('*'), I get all columns.
  } else if (wSample && wSample.length > 0) {
    log('weight_records columns: ' + Object.keys(wSample[0]).join(', '));
  } else {
    log('weight_records is empty, cannot infer columns.');
  }

  // 3. Insert 5 Dummy Daily Records (Weight, Meals, etc.)
  log('Creating 5 daily records...');
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 10); // Start 10 days ago

  for (let i = 0; i < 5; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    // Weight
    await supabase.from('weight_records').insert({
      hedgehog_id: finalTargetId,
      record_date: dateStr,
      weight: 300 + (Math.random() * 20 - 10),
    });

    // Meal
    await supabase.from('meal_records').insert({
      hedgehog_id: finalTargetId,
      record_date: dateStr,
      record_time: '20:00',
      content: 'いつもの',
      amount: 15,
      amount_unit: 'g',
    });
  }
  log('Daily records created.');

  // 4. Clean up Hospital Visits
  log('Cleaning up duplicate hospital visits...');
  const { data: allVisits } = await supabase
    .from('hospital_visits')
    .select('*')
    .eq('hedgehog_id', finalTargetId);

  if (allVisits) {
    const seenDates = new Set();
    const toDelete = [];

    allVisits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    for (const v of allVisits) {
      if (seenDates.has(v.visit_date)) {
        toDelete.push(v.id);
      } else {
        seenDates.add(v.visit_date);
      }
    }

    if (toDelete.length > 0) {
      log(`Deleting ${toDelete.length} duplicate visits...`);
      await supabase.from('hospital_visits').delete().in('id', toDelete);
    }
  }

  // 5. Insert 5 Unique Hospital Visits
  log('Creating 5 hospital visits...');

  const visitBaseDate = new Date();
  visitBaseDate.setDate(visitBaseDate.getDate() - 20);

  for (let i = 0; i < 5; i++) {
    const d = new Date(visitBaseDate);
    d.setDate(d.getDate() + i * 2);
    const dateStr = d.toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('hospital_visits')
      .select('id')
      .eq('hedgehog_id', finalTargetId)
      .eq('visit_date', dateStr)
      .single();

    if (!existing) {
      const { error: visitError } = await supabase.from('hospital_visits').insert({
        hedgehog_id: finalTargetId,
        visit_date: dateStr,
        diagnosis: `定期検診 ${i + 1}`,
        treatment: '触診',
        created_at: new Date().toISOString(),
      });
      if (visitError) log(`Error creating visit on ${dateStr}: ` + JSON.stringify(visitError));
    }
  }

  // 6. Insert 5 Dummy Reminders
  log('Creating 5 dummy reminders...');

  // Clear existing reminders to avoid clutter during dev
  await supabase.from('care_reminders').delete().eq('user_id', userId);

  const REMINDERS = [
    { title: '朝ごはん', time: '07:30:00' },
    { title: 'お水交換', time: '08:00:00' },
    { title: 'おやつ', time: '15:00:00' },
    { title: '部屋んぽ', time: '20:00:00' },
    { title: '夜ごはん', time: '21:00:00' },
  ];

  for (const r of REMINDERS) {
    await supabase.from('care_reminders').insert({
      user_id: userId,
      title: r.title,
      target_time: r.time,
      is_repeat: true,
      frequency: 'daily',
      is_enabled: true,
      created_at: new Date().toISOString(),
    });
  }
  log('Reminders created.');

  log('Seed completed!');
  revalidatePath('/records');
  return { success: true, logs };
}
