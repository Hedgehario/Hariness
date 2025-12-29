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

export function WeightChart({ data, range }: WeightChartProps) {
  // Filter out null weights for the chart
  const chartData = useMemo(() => {
    return data
      .filter((d) => d.weight !== null)
      .map((d) => ({
        ...d,
        displayDate: format(parseISO(d.date), 'M/d', { locale: ja }),
      }));
  }, [data]);

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
            interval="preserveStartEnd"
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
            formatter={(value: number) => [`${value} g`, '体重']}
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
