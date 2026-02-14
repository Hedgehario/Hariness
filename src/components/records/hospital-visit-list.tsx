'use client';

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Stethoscope, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';

import { deleteHospitalVisit } from '@/app/(main)/hospital/actions';

type HospitalVisit = {
  id: string;
  visit_date: string;
  title: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medicine_prescription: { name: string; note?: string }[] | null;
  next_visit_date: string | null;
  cost: number | null;
};

type Props = {
  visits: HospitalVisit[];
};

export function HospitalVisitList({ visits }: Props) {
  const [isPending, startTransition] = useTransition();
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);
  // 楽観的更新用のローカルステート
  const [localVisits, setLocalVisits] = useState(visits);

  const handleDeleteClick = (e: React.MouseEvent, visitId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setVisitToDelete(visitId);
  };

  const handleConfirmDelete = () => {
    if (!visitToDelete) return;

    // 楽観的にリストから削除（即時UI更新）
    setLocalVisits((prev) => prev.filter((v) => v.id !== visitToDelete));
    const deletingId = visitToDelete;
    setVisitToDelete(null);

    startTransition(async () => {
      const result = await deleteHospitalVisit(deletingId);
      if (!result.success) {
        // エラー時は元に戻す
        setLocalVisits(visits);
        alert('削除に失敗しました: ' + (result.error?.message || '不明なエラー'));
      }
      // 成功時はUI更新済みなのでrouter.refresh()不要
    });
  };

  const handleCancelDelete = () => {
    setVisitToDelete(null);
  };

  if (localVisits.length === 0) {
    return (
      <div className="rounded-xl border border-stone-100 bg-white py-12 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <Stethoscope size={24} />
        </div>
        <p className="mb-1 font-bold text-stone-500">通院記録がありません</p>
        <p className="text-xs text-stone-400">病院に行ったら記録しましょう</p>
      </div>
    );
  }

  // 削除対象の通院記録を取得
  const targetVisit = visitToDelete ? localVisits.find((v) => v.id === visitToDelete) : null;
  const targetDate = targetVisit ? parseISO(targetVisit.visit_date) : null;

  return (
    <div className="space-y-3">
      {localVisits.map((visit) => {
        const dateObj = parseISO(visit.visit_date);
        const dayOfWeek = format(dateObj, 'E', { locale: ja });
        const meds = Array.isArray(visit.medicine_prescription) ? visit.medicine_prescription : [];

        return (
          <Link
            href={`/hospital/entry?id=${visit.id}`}
            key={visit.id}
            className="group relative block w-full"
          >
            <div className="animate-press-card w-full rounded-xl border border-l-4 border-stone-100 border-l-[#4DB6AC] bg-white p-3 shadow-sm hover:bg-stone-50">
              {/* Header: Date & Delete */}
              <div className="mb-3 flex w-full items-center justify-between">
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="text-lg font-bold text-stone-700">
                    {format(dateObj, 'M/d', { locale: ja })}
                  </span>
                  <span className="text-sm text-gray-400">({dayOfWeek})</span>
                  {visit.title && (
                    <span className="ml-2 line-clamp-1 max-w-[120px] text-sm font-bold text-stone-600 sm:max-w-none">
                      {visit.title}
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  disabled={isPending}
                  onClick={(e) => handleDeleteClick(e, visit.id)}
                  className="rounded-full p-2 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Data Grid: 4 Columns (Single Row) */}
              <div className="grid grid-cols-5 gap-2 text-sm">
                {/* Diagnosis */}
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">診断</span>
                  <span className="w-full text-center font-medium text-stone-600">
                    {visit.diagnosis ? (
                      <span className="block truncate">{visit.diagnosis}</span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Treatment */}
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">治療</span>
                  <span className="w-full text-center font-medium text-stone-600">
                    {visit.treatment ? (
                      <span className="block truncate">{visit.treatment}</span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Medications */}
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">処方薬</span>
                  <span className="w-full text-center font-medium text-stone-600">
                    {meds.length > 0 ? (
                      <span className="text-xs">{meds.length}種</span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Next Visit */}
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">次回</span>
                  <span className="w-full text-center font-medium text-stone-600">
                    {visit.next_visit_date ? (
                      <span className="text-xs">
                        {format(parseISO(visit.next_visit_date), 'M/d')}
                      </span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </span>
                </div>

                {/* Cost */}
                <div className="flex flex-col items-center">
                  <span className="mb-1 text-[10px] font-bold text-stone-400">費用</span>
                  <span className="w-full text-center font-medium text-stone-600">
                    {visit.cost ? (
                      <span className="text-xs">¥{visit.cost.toLocaleString()}</span>
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
      {visitToDelete && (
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
                {targetDate ? format(targetDate, 'M/d', { locale: ja }) : ''}
                の通院記録を削除しますか？
              </h3>
              <p className="text-sm text-stone-500">この通院記録を削除します。元に戻せません。</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="animate-press rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="animate-press rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 active:bg-red-700 disabled:opacity-50"
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
