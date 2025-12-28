"use client";

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Stethoscope, Pill, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

type HospitalVisit = {
  id: string;
  visit_date: string;
  diagnosis: string | null;
  treatment: string | null;
  medicine_prescription: any; // JSON
  next_visit_date: string | null;
};

type Props = {
  visits: HospitalVisit[];
};

export function HospitalVisitList({ visits }: Props) {
  if (visits.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-stone-100">
        <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-stone-100 text-stone-400 mb-3">
            <Stethoscope size={24} />
        </div>
        <p className="text-stone-500 font-bold mb-1">通院記録がありません</p>
        <p className="text-xs text-stone-400">病院に行ったら記録しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visits.map((visit) => {
        const date = format(parseISO(visit.visit_date), "yyyy年M月d日 (E)", { locale: ja });
        // Handle medications potentially being an array or JSON string if not typed strictly
        const meds = Array.isArray(visit.medicine_prescription) ? visit.medicine_prescription : [];
        
        return (
          <Link href={`/hospital/entry?id=${visit.id}`} key={visit.id} className="block">
              <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 hover:border-orange-200 transition-colors relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded text-sm">{date}</span>
                        {visit.diagnosis && (
                            <span className="font-bold text-stone-700 line-clamp-1">{visit.diagnosis}</span>
                        )}
                    </div>
                </div>

                <div className="space-y-2 text-sm text-stone-500">
                    {visit.treatment && (
                        <div className="flex items-start gap-2">
                             <Stethoscope size={14} className="mt-0.5 text-stone-400 shrink-0" />
                             <span className="line-clamp-2">{visit.treatment}</span>
                        </div>
                    )}
                    
                    {meds.length > 0 && (
                        <div className="flex items-start gap-2">
                             <Pill size={14} className="mt-0.5 text-stone-400 shrink-0" />
                             <div className="flex flex-wrap gap-1">
                                {meds.map((m: any, i: number) => (
                                    <span key={i} className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs">{m.name}</span>
                                ))}
                             </div>
                        </div>
                    )}

                    {visit.next_visit_date && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-50 text-xs">
                            <Calendar size={12} className="text-stone-400" />
                            <span>次回: {format(parseISO(visit.next_visit_date), "M月d日")}</span>
                        </div>
                    )}
                </div>

                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300" />
              </div>
          </Link>
        );
      })}
    </div>
  );
}
