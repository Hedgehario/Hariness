"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar as CalendarIcon, Save } from "lucide-react";
import { saveEvent } from "@/app/(main)/hospital/actions";

type Props = {
  initialDate: string;
  initialData?: {
    id?: string;
    title: string;
    date: string;
  } | null;
};

export default function EventForm({ initialDate, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [date, setDate] = useState(initialData?.date || initialDate);
  const [title, setTitle] = useState(initialData?.title || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
       const res = await saveEvent({
           id: initialData?.id,
           date,
           title
       });
       
       if (res.success) {
           router.push("/hospital");
           router.refresh(); 
       } else {
           alert(res.error || "保存に失敗しました");
       }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] flex flex-col">
       {/* Header */}
       <header className="px-4 py-3 bg-[#F8F8F0] border-b border-[#FFB370]/20 flex items-center relative shadow-sm z-20">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-[#5D5D5D]/60 hover:bg-white rounded-full absolute left-2 transition-colors">
              <div className="flex items-center gap-1">
                <ChevronLeft size={20} />
                <span className="text-sm font-bold">戻る</span>
              </div>
            </button>
            <h1 className="w-full text-center font-bold text-[#5D5D5D]">
                {initialData?.id ? 'イベント編集' : 'イベント追加'}
            </h1>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 p-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 p-6 space-y-6">
                
                {/* Date Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5D5D5D]/60 flex items-center gap-1">
                        <CalendarIcon size={14} /> 日付
                    </label>
                    <input 
                      type="date" 
                      required
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#F8F8F0] border border-[#5D5D5D]/20 rounded-lg px-3 py-3 text-lg font-bold text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] outline-none"
                    />
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#5D5D5D]/60">
                        イベント名
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="例: フード購入、床材交換など"
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#F8F8F0] border border-[#5D5D5D]/20 rounded-lg px-3 py-3 text-base text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] outline-none placeholder:text-[#5D5D5D]/30"
                    />
                </div>

            </div>

            <div className="mt-auto pb-8">
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full py-3.5 bg-[#FFB370] text-white font-bold rounded-xl shadow-md hover:bg-[#FFB370]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isPending ? '保存中...' : '保存する'}
                    {!isPending && <Save size={18} />}
                </button>
            </div>
        </form>
    </div>
  );
}
