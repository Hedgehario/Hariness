'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

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

  // 1. Clean up existing dummy data to prevent duplicates
  log('Cleaning up old dummy data...');
  // Find dummy hedgehogs by name pattern
  const { data: oldHedgehogs } = await supabase
    .from('hedgehogs')
    .select('id')
    .in('name', DUMMY_HEDGEHOG_NAMES);

  if (oldHedgehogs && oldHedgehogs.length > 0) {
    const ids = oldHedgehogs.map((h) => h.id);
    await supabase.from('hedgehogs').delete().in('id', ids);
    log(`Deleted ${ids.length} old dummy hedgehogs.`);
  }

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

  // 3. Insert 10 Dummy Daily Records (Weight, Meals, etc.) for EACH hedgehog
  log('Creating 10 daily records for each hedgehog...');
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 10); // Start 10 days ago

  for (const hedgehog of newHedgehogs) {
    const hedgehogId = hedgehog.id;
    // Vary weight base per hedgehog so graphs look different
    // Dummy Maru: ~300g, Test: ~400g, Mock: ~500g, Stub: ~250g
    let baseWeight = 300;
    if (hedgehog.name.includes('テスト')) baseWeight = 400;
    if (hedgehog.name.includes('モック')) baseWeight = 500;
    if (hedgehog.name.includes('スタブ')) baseWeight = 250;

    for (let i = 0; i <= 10; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      // Weight: Fluctuate slightly
      const fluctuatingWeight = baseWeight + Math.sin(i) * 10 + Math.random() * 5;
      await supabase.from('weight_records').insert({
        hedgehog_id: hedgehogId,
        record_date: dateStr,
        weight: parseFloat(fluctuatingWeight.toFixed(1)),
      });

      // Meal: Realistic patterns
      await supabase.from('meal_records').insert([
        {
          hedgehog_id: hedgehogId,
          record_date: dateStr,
          record_time: '20:00',
          content: 'マズリ',
          amount: 10 + Math.floor(Math.random() * 3),
          amount_unit: 'g',
        },
        {
          hedgehog_id: hedgehogId,
          record_date: dateStr,
          record_time: '23:00',
          content: 'ミルワーム',
          amount: 3 + Math.floor(Math.random() * 2),
          amount_unit: '匹',
        },
      ]);

      // Excretion (Randomly add abnormal for variety)
      const isAbnormal = Math.random() > 0.8;
      await supabase.from('excretion_records').insert({
        hedgehog_id: hedgehogId,
        record_date: dateStr,
        record_time: '21:00',
        type: 'stool',
        condition: isAbnormal ? 'abnormal' : 'normal',
        notes: isAbnormal ? '少し柔らかい' : '',
      });
    }
  }
  log('Daily records created for all hedgehogs.');

  // 4. Clean up Hospital Visits
  log('Cleaning up duplicate hospital visits...');
  // Check for all dummy hedgehogs
  const allIds = newHedgehogs.map((h) => h.id);
  const { data: allVisits } = await supabase
    .from('hospital_visits')
    .select('*')
    .in('hedgehog_id', allIds);

  if (allVisits) {
    const seenMap = new Map<string, Set<string>>(); // hedgehogId -> Set(dates)
    const toDelete = [];

    // sort newest first
    allVisits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    for (const v of allVisits) {
      if (!seenMap.has(v.hedgehog_id)) {
        seenMap.set(v.hedgehog_id, new Set());
      }
      const dates = seenMap.get(v.hedgehog_id)!;

      if (dates.has(v.visit_date)) {
        toDelete.push(v.id);
      } else {
        dates.add(v.visit_date);
      }
    }

    if (toDelete.length > 0) {
      log(`Deleting ${toDelete.length} duplicate visits...`);
      await supabase.from('hospital_visits').delete().in('id', toDelete);
    }
  }

  // 5. Insert Hospital Visits for EACH hedgehog
  log('Creating hospital visits for each hedgehog...');

  const visitBaseDate = new Date();
  visitBaseDate.setDate(visitBaseDate.getDate() - 60);

  const DIAGNOSES = [
    '定期検診',
    '爪切り',
    'ダニ検査',
    '定期検診',
    '皮膚の状態確認',
    '体重測定',
    '定期検診',
    '爪切り',
    '健康診断',
    '経過観察',
  ];

  for (const hedgehog of newHedgehogs) {
    // Only add varied number of visits
    // Dummy Maru: 10, others: 3-5
    const visitCount = hedgehog.name.includes('ダミー') ? 10 : 5;

    for (let i = 0; i < visitCount; i++) {
      const d = new Date(visitBaseDate);
      d.setDate(d.getDate() + i * 14); // Every 2 weeks
      const dateStr = d.toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('hospital_visits')
        .select('id')
        .eq('hedgehog_id', hedgehog.id)
        .eq('visit_date', dateStr)
        .single();

      if (!existing) {
        await supabase.from('hospital_visits').insert({
          hedgehog_id: hedgehog.id,
          visit_date: dateStr,
          diagnosis: DIAGNOSES[i % DIAGNOSES.length],
          treatment: '視診・触診',
          created_at: new Date().toISOString(),
        });
      }
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

  // Verify counts
  const { count: weightCount } = await supabase
    .from('weight_records')
    .select('*', { count: 'exact', head: true });
  const { count: visitCount } = await supabase
    .from('hospital_visits')
    .select('*', { count: 'exact', head: true });
  log(`VERIFICATION: Total Weight Records: ${weightCount}`);
  log(`VERIFICATION: Total Hospital Visits: ${visitCount}`);

  log('Seed completed!');
  revalidatePath('/records');
  return { success: true, logs };
}
