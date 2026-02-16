'use client';

import { Calendar as CalendarIcon, Check, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { saveEvent } from '@/app/(main)/calendar/actions';

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
  const [title, setTitle] = useState(initialData?.title || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveEvent({
        id: initialData?.id,
        date,
        title,
      });

      if (res.success) {
        // リダイレクト先は新たにサーバーレンダリングされるのでrefresh不要
        router.push('/calendar');
      } else {
        alert(res.error || '保存に失敗しました');
      }
    });
  };

  return (
    <div className="flex flex-col bg-[#F8F8F0]">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-center border-b border-[#FFB370]/20 bg-[#F8F8F0] px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="animate-press absolute left-4 flex items-center gap-1 rounded-full p-2 text-stone-500 hover:bg-stone-100"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-bold">戻る</span>
        </button>
        <h1 className="text-center font-bold text-[#5D5D5D]">
          {initialData?.id ? 'イベント編集' : 'イベント追加'}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 p-4">
        <div className="space-y-6 rounded-xl border border-[#5D5D5D]/10 bg-white p-6 shadow-sm">
          {/* Date Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-xs font-bold text-[#5D5D5D]/60">
              <CalendarIcon size={14} /> 日付
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block min-w-full w-full appearance-none rounded-lg border border-[#5D5D5D]/20 bg-[#F8F8F0] px-3 py-3 text-lg font-bold text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370]"
            />
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5D5D5D]/60">イベント名</label>
            <input
              type="text"
              required
              placeholder="例: フード購入、床材交換など"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#5D5D5D]/20 bg-[#F8F8F0] px-3 py-3 text-base text-[#5D5D5D] outline-none placeholder:text-[#5D5D5D]/30 focus:ring-1 focus:ring-[#FFB370]"
            />
          </div>
        </div>

        <div className="mt-auto pb-8">
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB370] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#FFB370]/80 disabled:opacity-50"
          >
            {isPending ? '保存中...' : '保存する'}
            {!isPending && <Check size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
