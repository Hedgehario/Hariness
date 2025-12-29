'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type DailyRecordSummary = {
  date: string;
  weight: { weight: number } | null;
  meals: { food_type: string; amount: number; unit: string }[];
  excretions: { type: string; condition?: string }[];
};

type RecordListProps = {
  records: DailyRecordSummary[];
  hedgehogId: string;
};

export function RecordList({ records, hedgehogId }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        <p>記録がありません</p>
        <p className="mt-2 text-sm">「今日の記録」から記録をつけてみましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const dateObj = parseISO(record.date);
        const dayOfWeek = format(dateObj, 'E', { locale: ja });
        const isToday = record.date === format(new Date(), 'yyyy-MM-dd');

        return (
          <Link
            key={record.date}
            href={`/records/${hedgehogId}/entry?date=${record.date}`}
            className="block"
          >
            <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-white p-4 shadow-sm transition-transform active:scale-[0.99]">
              {/* Date & Vital */}
              <div className="flex-1">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-stone-700">
                    {format(dateObj, 'M/d', { locale: ja })}
                  </span>
                  <span className="text-sm text-gray-400">({dayOfWeek})</span>
                  {isToday && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-[10px] text-orange-700 hover:bg-orange-100"
                    >
                      今日
                    </Badge>
                  )}
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400">体重</span>
                    <span className="font-medium text-stone-600">
                      {record.weight ? `${record.weight.weight}g` : '---'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400">食事</span>
                    <span className="font-medium text-stone-600">
                      {record.meals.length > 0 ? `${record.meals.length}回` : '---'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400">うんち/おしっこ</span>
                    <span className="font-medium text-stone-600">
                      {record.excretions.length > 0 ? `${record.excretions.length}回` : '---'}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-gray-300" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
