"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      <div className="text-center py-10 text-gray-500">
        <p>記録がありません</p>
        <p className="text-sm mt-2">「今日の記録」から記録をつけてみましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const dateObj = parseISO(record.date);
        const dayOfWeek = format(dateObj, "E", { locale: ja });
        const isToday = record.date === format(new Date(), "yyyy-MM-dd");

        return (
          <Link 
            key={record.date} 
            href={`/records/${hedgehogId}/entry?date=${record.date}`}
            className="block"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex items-center justify-between active:scale-[0.99] transition-transform">
              
              {/* Date & Vital */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="font-bold text-lg text-stone-700">
                     {format(dateObj, "M/d", { locale: ja })}
                   </span>
                   <span className="text-sm text-gray-400">({dayOfWeek})</span>
                   {isToday && <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-700 hover:bg-orange-100">今日</Badge>}
                </div>
                
                <div className="flex gap-4 text-sm">
                   <div className="flex flex-col">
                       <span className="text-xs text-stone-400">体重</span>
                       <span className="font-medium text-stone-600">
                           {record.weight ? `${record.weight.weight}g` : "---"}
                       </span>
                   </div>
                   <div className="flex flex-col">
                       <span className="text-xs text-stone-400">食事</span>
                       <span className="font-medium text-stone-600">
                           {record.meals.length > 0 ? `${record.meals.length}回` : "---"}
                       </span>
                   </div>
                   <div className="flex flex-col">
                       <span className="text-xs text-stone-400">うんち/おしっこ</span>
                       <span className="font-medium text-stone-600">
                           {record.excretions.length > 0 ? `${record.excretions.length}回` : "---"}
                       </span>
                   </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
