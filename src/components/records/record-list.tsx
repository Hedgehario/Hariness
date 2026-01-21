'use client';

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AlertTriangle, FileText, Pill, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { FaPoop, FaTint } from 'react-icons/fa';

import { deleteDailyRecord } from '@/app/(main)/records/actions';
import { Badge } from '@/components/ui/badge';

type DailyRecordSummary = {
  date: string;
  weight?: { weight: number | null } | null;
  meals: { content?: string; amount?: number; amount_unit?: string }[];
  excretion?: { stool_condition: string; urine_condition: string; details?: string };
  condition?: { temperature?: number; humidity?: number };
  hasMedication?: boolean;
  hasMemo?: boolean;
};

type RecordListProps = {
  records: DailyRecordSummary[];
  hedgehogId: string;
};

export function RecordList({ records, hedgehogId }: RecordListProps) {
  const [isPending, startTransition] = useTransition();
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  // 楽観的更新用のローカルステート
  const [localRecords, setLocalRecords] = useState(records);

  const handleDeleteClick = (e: React.MouseEvent, date: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDateToDelete(date);
  };

  const handleConfirmDelete = () => {
    if (!dateToDelete) return;

    // 楽観的にリストから削除（即時UI更新）
    setLocalRecords((prev) => prev.filter((r) => r.date !== dateToDelete));
    const deletingDate = dateToDelete;
    setDateToDelete(null); // Close modal

    startTransition(async () => {
      const result = await deleteDailyRecord(hedgehogId, deletingDate);
      if (!result.success) {
        // エラー時は元に戻す
        setLocalRecords(records);
        alert('削除に失敗しました: ' + (result.error?.message || '不明なエラー'));
      }
      // 成功時はUI更新済みなのでrouter.refresh()不要
    });
  };

  const handleCancelDelete = () => {
    setDateToDelete(null);
  };

  if (localRecords.length === 0) {
    return (
      <div className="rounded-xl border border-stone-100 bg-white py-12 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <FileText size={24} />
        </div>
        <p className="mb-1 font-bold text-stone-500">記録がありません</p>
        <p className="text-xs text-stone-400">「今日の記録」から記録をつけてみましょう</p>
      </div>
    );
  }

  // Find record name for modal if needed, or just use date
  const targetRecordDate = dateToDelete ? parseISO(dateToDelete) : null;

  return (
    <div className="space-y-3">
      {localRecords.map((record) => {
        const dateObj = parseISO(record.date);
        const dayOfWeek = format(dateObj, 'E', { locale: ja });
        const isToday = record.date === format(new Date(), 'yyyy-MM-dd');

        return (
          <Link
            key={record.date}
            href={`/records/${hedgehogId}/entry?date=${record.date}`}
            className="group relative block"
          >
            <div className="rounded-xl border border-l-4 border-stone-100 border-l-[#FFB370] bg-white p-4 shadow-sm transition-transform duration-100 hover:bg-stone-50 active:scale-[0.98]">
              {/* Header: Date & Delete */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex flex-wrap items-baseline gap-2">
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
                  {/* Temp/Humidity Display */}
                  {(record.condition?.temperature !== undefined ||
                    record.condition?.humidity !== undefined) && (
                    <div className="ml-2 flex items-center gap-2 text-xs text-stone-500">
                      {record.condition.temperature !== undefined && (
                        <span>{record.condition.temperature}℃</span>
                      )}
                      {record.condition.humidity !== undefined && (
                        <span>{record.condition.humidity}%</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Delete Button (Visible but subtle) */}
                <button
                  disabled={isPending}
                  onClick={(e) => handleDeleteClick(e, record.date)}
                  className="rounded-full p-2 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
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
                  <span className="mb-1 flex items-center gap-0.5 text-[10px] font-bold text-stone-400">
                    排泄
                    {record.excretion &&
                      (record.excretion.stool_condition === 'abnormal' ||
                        record.excretion.urine_condition === 'abnormal') && (
                        <AlertTriangle size={10} className="text-[#EF5350]" />
                      )}
                  </span>
                  <span className="font-medium text-stone-600">
                    {record.excretion &&
                    (record.excretion.stool_condition !== 'none' ||
                      record.excretion.urine_condition !== 'none') ? (
                      <span className="flex items-center gap-1.5">
                        {record.excretion.stool_condition !== 'none' && (
                          <FaPoop
                            size={14}
                            className={
                              record.excretion.stool_condition === 'abnormal'
                                ? 'text-[#EF5350]'
                                : 'text-stone-600'
                            }
                            title="便"
                          />
                        )}
                        {record.excretion.urine_condition !== 'none' && (
                          <FaTint
                            size={14}
                            className={
                              record.excretion.urine_condition === 'abnormal'
                                ? 'text-[#EF5350]'
                                : 'text-stone-600'
                            }
                            title="尿"
                          />
                        )}
                      </span>
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
                      <Pill size={16} className="text-stone-600" />
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
                      <FileText size={16} className="text-stone-600" />
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
        <div
          className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="animate-in zoom-in-95 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-stone-900">
                {targetRecordDate ? format(targetRecordDate, 'M/d', { locale: ja }) : ''}
                の記録を削除しますか？
              </h3>
              <p className="text-sm text-stone-500">
                この日の記録をすべて削除します。元に戻せません。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 transition-transform duration-100 hover:bg-stone-50 active:scale-95 active:bg-stone-100"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm transition-transform duration-100 hover:bg-red-500 active:scale-95 active:bg-red-700 disabled:opacity-50"
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
