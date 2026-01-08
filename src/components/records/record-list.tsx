'use client';

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, ChevronRight, FileText, Pill, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { deleteDailyRecord } from '@/app/(main)/records/actions';
import { Badge } from '@/components/ui/badge';

type DailyRecordSummary = {
  date: string;
  weight?: { weight: number | null } | null;
  meals: { content?: string; amount?: number; amount_unit?: string}[];
  excretions: { condition?: string }[];
  hasMedication?: boolean;
  hasMemo?: boolean;
};

type RecordListProps = {
  records: DailyRecordSummary[];
  hedgehogId: string;
};

export function RecordList({ records, hedgehogId }: RecordListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, date: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDateToDelete(date);
  };

  const handleConfirmDelete = () => {
    if (!dateToDelete) return;

    startTransition(async () => {
      const result = await deleteDailyRecord(hedgehogId, dateToDelete);
      setDateToDelete(null); // Close modal
      if (result.success) {
        router.refresh();
      } else {
        alert('削除に失敗しました: ' + (result.error?.message || '不明なエラー'));
      }
    });
  };

  const handleCancelDelete = () => {
    setDateToDelete(null);
  };

  if (records.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        <p>記録がありません</p>
        <p className="mt-2 text-sm">「今日の記録」から記録をつけてみましょう</p>
      </div>
    );
  }

  // Find record name for modal if needed, or just use date
  const targetRecordDate = dateToDelete ? parseISO(dateToDelete) : null;

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
            className="group block relative"
          >
            <div className="rounded-xl border border-stone-100 bg-white p-4 shadow-sm transition-all hover:bg-stone-50 active:scale-[0.99] group-active:scale-[0.99]">
              {/* Header: Date & Delete */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
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
                
                {/* Delete Button (Visible but subtle) */}
                <button
                  disabled={isPending}
                  onClick={(e) => handleDeleteClick(e, record.date)}
                  className="rounded-full p-2 text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Data Grid: 5 Columns to fill space */}
              <div className="grid grid-cols-5 gap-2 text-sm">
                
                {/* Weight */}
                <div className="flex flex-col items-center sm:items-start">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">体重</span>
                  <span className="font-medium text-stone-600">
                    {record.weight ? (
                      `${record.weight.weight}g`
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Meals */}
                <div className="flex flex-col items-center sm:items-start">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">食事</span>
                  <span className="font-medium text-stone-600">
                    {record.meals.length > 0 ? (
                      `${record.meals.length}回`
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Excretion */}
                <div className="flex flex-col items-center sm:items-start">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">排泄</span>
                  <span className="font-medium text-stone-600">
                    {record.excretions.length > 0 ? (
                      `${record.excretions.length}回`
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Medication */}
                <div className="flex flex-col items-center sm:items-start">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">投薬</span>
                  <span className="font-medium text-stone-600">
                    {record.hasMedication ? (
                      <Pill size={16} className="text-[#B0D67A]" />
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Memo */}
                <div className="flex flex-col items-center sm:items-start">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">メモ</span>
                  <span className="font-medium text-stone-600">
                    {record.hasMemo ? (
                      <FileText size={16} className="text-[#FFB370]" />
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

              </div>
            </div>
          </Link>
        );
      })}

      {/* Delete Confirmation Modal */}
      {dateToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900">
                {targetRecordDate ? format(targetRecordDate, 'M/d', { locale: ja }) : ''}の記録を削除しますか？
              </h3>
              <p className="text-sm text-stone-500">
                この日の記録をすべて削除します。元に戻せません。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 active:bg-stone-100"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-500 active:bg-red-700 disabled:opacity-50"
              >
                {isPending ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
