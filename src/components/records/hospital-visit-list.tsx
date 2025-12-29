'use client';

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, ChevronRight, Pill, Stethoscope } from 'lucide-react';
import Link from 'next/link';

type HospitalVisit = {
  id: string;
  visit_date: string;
  diagnosis: string | null;
  treatment: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicine_prescription: any; // JSON
  next_visit_date: string | null;
};

type Props = {
  visits: HospitalVisit[];
};

export function HospitalVisitList({ visits }: Props) {
  if (visits.length === 0) {
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

  return (
    <div className="space-y-3">
      {visits.map((visit) => {
        const date = format(parseISO(visit.visit_date), 'yyyy年M月d日 (E)', { locale: ja });
        // Handle medications potentially being an array or JSON string if not typed strictly
        const meds = Array.isArray(visit.medicine_prescription) ? visit.medicine_prescription : [];

        return (
          <Link href={`/hospital/entry?id=${visit.id}`} key={visit.id} className="block">
            <div className="relative rounded-xl border border-stone-100 bg-white p-4 shadow-sm transition-colors hover:border-orange-200">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-stone-100 px-2 py-1 font-mono text-sm font-bold text-stone-600">
                    {date}
                  </span>
                  {visit.diagnosis && (
                    <span className="line-clamp-1 font-bold text-stone-700">{visit.diagnosis}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-stone-500">
                {visit.treatment && (
                  <div className="flex items-start gap-2">
                    <Stethoscope size={14} className="mt-0.5 shrink-0 text-stone-400" />
                    <span className="line-clamp-2">{visit.treatment}</span>
                  </div>
                )}

                {meds.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Pill size={14} className="mt-0.5 shrink-0 text-stone-400" />
                    <div className="flex flex-wrap gap-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {meds.map((m: any, i: number) => (
                        <span
                          key={i}
                          className="rounded bg-orange-50 px-1.5 py-0.5 text-xs text-orange-700"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {visit.next_visit_date && (
                  <div className="mt-2 flex items-center gap-2 border-t border-stone-50 pt-2 text-xs">
                    <Calendar size={12} className="text-stone-400" />
                    <span>次回: {format(parseISO(visit.next_visit_date), 'M月d日')}</span>
                  </div>
                )}
              </div>

              <ChevronRight
                size={16}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-stone-300"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
