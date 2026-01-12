'use client';

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type WeightData = {
  date: string;
  weight: number | null;
};

type WeightChartProps = {
  data: WeightData[];
  range: '30d' | '90d' | '180d';
};

export function WeightChart({ data }: WeightChartProps) {
  // Filter out null weights for the chart
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data
      .filter((d) => d && d.weight !== null && d.weight !== undefined && d.date)
      .map((d) => {
        const dateStr = d.date;
        try {
          return {
            ...d,
            displayDate: format(parseISO(dateStr), 'M/d', { locale: ja }),
          };
        } catch (e) {
          console.error('Date parsing error', dateStr, e);
          return {
            ...d,
            displayDate: dateStr, // Fallback
          };
        }
      });
  }, [data]);

  // Calculate custom ticks to ensure readablity and inclusion of start/end
  const customTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // If data points are few (e.g. <= 7), show all
    if (chartData.length <= 7) {
      return chartData.map((d) => d.displayDate);
    }

    // If many points, pick ~6 ticks including first and last
    const targetCount = 6;
    const ticks: string[] = [];
    const step = (chartData.length - 1) / (targetCount - 1);

    for (let i = 0; i < targetCount; i++) {
      const index = Math.round(i * step);
      if (index < chartData.length) {
        ticks.push(chartData[index].displayDate);
      }
    }

    // Deduplicate just in case
    return Array.from(new Set(ticks));
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-stone-50 text-sm text-gray-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-lg border border-stone-100 bg-white p-2 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="displayDate"
            stroke="#9CA3AF"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            ticks={customTicks}
            interval={0} // Force display of calculated ticks
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#6B7280', marginBottom: '0.25rem', fontSize: '12px' }}
            itemStyle={{ color: '#F97316', fontWeight: 'bold', fontSize: '14px' }}
            formatter={(value: number | undefined) => [`${value} g`, '体重']}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--color-primary)" // orange-500 equivalent
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
