"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, Trash2, Edit2, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { CalendarEventDisplay, deleteEvent } from "@/app/(main)/hospital/actions";

type Props = {
  date: Date | undefined;
  events: CalendarEventDisplay[];
};

export function DayEventsSheet({ date, events }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!date) return <div className="text-center text-[#5D5D5D]/60 py-10">日付を選択してください</div>;

  const dateStr = format(date, "yyyy-MM-dd");
  const displayDate = format(date, "M月d日 (E)", { locale: ja });

  const handleDelete = (id: string) => {
      if (!confirm("この予定を削除しますか？")) return;
      startTransition(async () => {
          const res = await deleteEvent(id);
          if (res.success) {
              router.refresh();
          } else {
              alert(res.error || "削除に失敗しました");
          }
      });
  };

  const handleEdit = (id: string, type: string) => {
      if (type === 'event') {
          router.push(`/hospital/events/entry?id=${id}`);
      } else {
          // Hospital visit edit flow (V10) - not implemented fully yet, maybe just generic edit for now?
          // Spec says V10 is for input form, V11 for confirm.
          // For now, prevent editing hospital records here or route to V10 if implemented
          alert("通院記録の編集は現在開発中です");
      }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#5D5D5D]/10">
        <h3 className="font-bold text-lg text-[#5D5D5D] flex items-center gap-2">
           <CalendarIcon size={20} className="text-[#FFB370]" />
           {displayDate}
        </h3>
        <button 
           onClick={() => router.push(`/hospital/events/entry?date=${dateStr}`)}
           className="bg-[#FFB370]/10 text-[#FFB370] hover:bg-[#FFB370]/20 p-2 rounded-full transition-colors flex items-center gap-1 px-3 text-xs font-bold"
        >
            <Plus size={16} />
            予定を追加
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
         {events.length === 0 ? (
             <div className="text-center text-[#5D5D5D]/40 py-8 text-sm">
                 予定はありません
             </div>
         ) : (
             events.map(event => (
                 <div key={event.id} className="bg-white border border-[#5D5D5D]/10 rounded-lg p-3 flex items-start gap-3 shadow-sm">
                     <div className={`mt-1 min-w-[4px] h-[30px] rounded-full ${event.type === 'hospital' ? 'bg-[#FF7070]' : 'bg-[#B0D67A]'}`} />
                     <div className="flex-1">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#5D5D5D]/60 mb-0.5 block">
                                {event.type === 'hospital' ? '通院記録' : 'イベント'}
                            </span>
                         </div>
                         <h4 className="font-bold text-[#5D5D5D] text-sm md:text-base leading-tight">
                             {event.title}
                         </h4>
                     </div>
                     <div className="flex gap-1">
                         <button 
                           onClick={() => handleEdit(event.id, event.type)}
                           className="p-2 text-[#5D5D5D]/40 hover:text-[#FFB370] hover:bg-[#FFB370]/5 rounded transition-colors"
                         >
                            <Edit2 size={16} />
                         </button>
                         {event.type === 'event' && (
                             <button 
                               onClick={() => handleDelete(event.id)}
                               className="p-2 text-[#5D5D5D]/40 hover:text-[#FF7070] hover:bg-[#FF7070]/5 rounded transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                         )}
                     </div>
                 </div>
             ))
         )}
      </div>
    </div>
  );
}
