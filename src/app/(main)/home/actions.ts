'use server';

import { subDays } from 'date-fns';

import { createClient } from '@/lib/supabase/server';

export type HealthAlert = {
  type: 'weight_loss' | 'food_loss' | 'no_record';
  level: 'warning' | 'info';
  message: string;
};

export async function getHealthAlerts(hedgehogId: string): Promise<HealthAlert[]> {
  const supabase = await createClient();
  const alerts: HealthAlert[] = [];

  // 1. Fetch recent weight records (last 2 entries) to compare
  const { data: weights } = await supabase
    .from('weight_records')
    .select('weight, record_date')
    .eq('hedgehog_id', hedgehogId)
    .order('record_date', { ascending: false })
    .limit(2);

  if (weights && weights.length >= 2) {
    const latest = weights[0].weight;
    const prev = weights[1].weight;
    const diff = activeWeightDiff(prev, latest);
    
    // Alert if weight dropped by more than 5%
    if (diff.percent <= -5) {
      alerts.push({
        type: 'weight_loss',
        level: 'warning',
        message: `体重が前回(${weights[1].record_date})から ${Math.abs(diff.val).toFixed(0)}g (${Math.abs(diff.percent).toFixed(1)}%) 減少しています。`,
      });
    }
  }

  // 2. Simple check for "No records for 3 days"
  const threeDaysAgo = subDays(new Date(), 3).toISOString().split('T')[0];
  const { count } = await supabase
    .from('weight_records')
    .select('*', { count: 'exact', head: true })
    .eq('hedgehog_id', hedgehogId)
    .gte('record_date', threeDaysAgo);

  if (count === 0) {
      alerts.push({
          type: 'no_record',
          level: 'info',
          message: '最近の記録がありません。元気かな？'
      });
  }

  return alerts;
}

function activeWeightDiff(prev: number, current: number) {
  const val = current - prev;
  const percent = prev !== 0 ? (val / prev) * 100 : 0;
  return { val, percent };
}
