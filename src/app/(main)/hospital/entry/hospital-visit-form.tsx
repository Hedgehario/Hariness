'use client';

import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Pill,
  Plus,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { checkVisitExists, saveHospitalVisit } from '@/app/(main)/hospital/actions';
import { type HospitalVisitInput } from '@/app/(main)/hospital/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  initialData?: Partial<HospitalVisitInput> & { id?: string };
  hedgehogs: { id: string; name: string }[];
  selectedDate?: string; // Optional pre-selected date
};

export default function HospitalVisitForm({ initialData, hedgehogs, selectedDate }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlHedgehogId = searchParams.get('hedgehogId');
  const urlDate = searchParams.get('date');

  const [isPending, startTransition] = useTransition();

  // Basic Info
  const [hedgehogId, setHedgehogId] = useState(
    initialData?.hedgehog_id ||
      urlHedgehogId ||
      (hedgehogs.length > 0 ? hedgehogs[0].id : '')
  );

  const [visitDate, setVisitDate] = useState(
    initialData?.visit_date || selectedDate || urlDate || format(new Date(), 'yyyy-MM-dd')
  );

  const [title, setTitle] = useState(initialData?.title || '');

  // Determine mode
  // If we have an ID in initialData, it's Edit mode.
  // But if we navigated here with a date that has data, initialData is set by server.
  const isEditMode = !!initialData?.id;
  const originalVisitDate = initialData?.visit_date;

  // No client-side duplicate check needed anymore (Server does it)
  // We rely on router.push to reload page with new params, triggering Server logic.

  // Medical Info
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || '');
  const [treatment, setTreatment] = useState(initialData?.treatment || '');

  // Next Visit
  const [nextVisitDate, setNextVisitDate] = useState(initialData?.next_visit_date || '');

  // Medications
  const [medications, setMedications] = useState<{ id: string; name: string; note: string }[]>(
    initialData?.medications?.map((m, i) => ({
      id: m.id || `init-${i}`,
      name: m.name,
      note: m.note || '',
    })) || []
  );

  const addMedication = () => {
    setMedications([...medications, { id: crypto.randomUUID(), name: '', note: '' }]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const updateMedicationName = (id: string, value: string) => {
    setMedications(medications.map((m) => (m.id === id ? { ...m, name: value } : m)));
  };

  const updateMedicationNote = (id: string, value: string) => {
    setMedications(medications.map((m) => (m.id === id ? { ...m, note: value } : m)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const payload: HospitalVisitInput = {
        id: initialData?.id,
        hedgehog_id: hedgehogId,
        visit_date: visitDate,
        title: title,
        diagnosis: diagnosis,
        treatment: treatment,
        medications: medications
          .map((m) => ({ name: m.name, note: m.note }))
          .filter((m) => m.name.trim() !== ''),
        next_visit_date: nextVisitDate || null,
      };

      const res = await saveHospitalVisit(payload);
      if (res.success) {
        router.push('/records?tab=hospital');
        router.refresh();
      } else {
        alert(res.error || '保存に失敗しました');
      }
    });
  };
  // ...
  // Render part logic update (can't do multi-chunk easily if contiguous logic changes, but UI is separate)
  // I will split this Tool Call if needed or verify line numbers.
  // Lines 33-71 cover State & Submit.
  // Lines 165-182 cover Render.

  // Date Navigation (Fixed: Use date-fns addDays like daily record form)
  // Date Navigation (Use router.push to trigger SSR check)
  const handleDateChange = (diff: number) => {
    const currentDate = parseISO(visitDate);
    const nextDate = addDays(currentDate, diff);
    const nextDateStr = format(nextDate, 'yyyy-MM-dd');

    // Navigate. If we are editing, we drop the ID to switch to new date context (new or edit duplicate)
    // Keep hedgehogId
    router.push(`/hospital/entry?date=${nextDateStr}&hedgehogId=${hedgehogId}`);
  };

  const displayDate = format(parseISO(visitDate), 'yyyy/MM/dd (E)', { locale: ja });

  // Determine if current date has an existing record
  // For edit mode: only show "記録済" if current date matches the original visit date
  // For new mode: always show "未記録"
  const hasRecordForDate = isEditMode && visitDate === originalVisitDate;

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col bg-[#F8F8F0]">
      {/* Top Header - Teal theme for hospital records */}
      <header className="relative z-20 flex flex-none items-center border-b border-[#4DB6AC]/20 bg-[#F8F8F0] px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => router.push('/records?tab=hospital')}
          className="absolute left-2 -ml-2 rounded-full p-2 text-[#5D5D5D]/60 transition-colors hover:bg-white"
        >
          <div className="flex items-center gap-1">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold">戻る</span>
          </div>
        </button>
        <h1 className="w-full text-center font-bold text-[#4DB6AC]">
          {isEditMode ? '通院記録の編集' : '新しい通院記録'}
        </h1>
      </header>

      {/* Sticky Date Header */}
      <div className="sticky top-[53px] z-10 border-b border-[#4DB6AC]/20 bg-[#F8F8F0] p-3 shadow-sm">
          <div className="relative flex items-center justify-center rounded-lg border border-[#5D5D5D]/10 bg-white p-1">
            <button
              type="button"
              onClick={() => handleDateChange(-1)}
              className="z-20 rounded-md p-2 text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="relative flex items-center justify-center px-4">
              <input
                type="date"
                value={visitDate}
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = e.target.value;
                    router.push(`/hospital/entry?date=${newDate}&hedgehogId=${hedgehogId}`);
                  }
                }}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {
                    console.debug('showPicker not supported', err);
                  }
                }}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <div className="flex items-center gap-2 font-bold text-[#5D5D5D]">
                {displayDate}
                <CalendarIcon size={16} className="text-[#5D5D5D]/40" />
                {hasRecordForDate ? (
                  <span className="ml-1 rounded bg-[#B0D67A] px-1.5 py-0.5 text-[10px] text-white">
                    記録済
                  </span>
                ) : (
                  <span className="ml-1 rounded border border-[#5D5D5D]/20 bg-[#F8F8F0] px-1.5 py-0.5 text-[10px] text-[#5D5D5D]/60">
                    未記録
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDateChange(1)}
              className="z-20 rounded-md p-2 text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
      </div>



      <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-28">
        
        {/* Title Input (New) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
             <h3 className="font-bold text-[#5D5D5D]">タイトル <span className="text-xs font-normal text-gray-400">(任意)</span></h3>
          </div>
          <div className="p-4">
             <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 定期検診、ワクチン接種"
                className="w-full rounded-md border border-[#5D5D5D]/20 p-2 font-bold text-[#5D5D5D] placeholder:font-normal placeholder:text-gray-300 focus:border-[#4DB6AC] focus:outline-none"
             />
          </div>
        </section>

        {/* 1. Hedgehog Selection (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#4DB6AC]/10 p-1.5 text-[#4DB6AC]">
              <PawPrint size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">記録するハリネズミ</h3>
          </div>
          <div className="p-4">
            <Select
              value={hedgehogId}
              onValueChange={(val) => {
                // Navigate on hedgehog change
                router.push(`/hospital/entry?date=${visitDate}&hedgehogId=${val}`);
              }}
            >
              <SelectTrigger className="w-full border border-[#5D5D5D]/20 bg-white font-bold text-[#5D5D5D]">
                <SelectValue placeholder="選んでください" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                {hedgehogs.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* 2. Diagnosis (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#4DB6AC]/10 p-1.5 text-[#4DB6AC]">
              <Stethoscope size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">診断</h3>
          </div>
          <div className="p-4">
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="診断名や症状を入力"
              className="h-24 w-full resize-none rounded-lg border border-[#5D5D5D]/20 bg-white p-3 text-[#5D5D5D] focus:ring-1 focus:ring-[#4DB6AC] focus:outline-none"
            />
          </div>
        </section>

        {/* 3. Treatment (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#4DB6AC]/10 p-1.5 text-[#4DB6AC]">
              <Syringe size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">治療内容</h3>
          </div>
          <div className="p-4">
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="処置や注射などの内容"
              className="h-24 w-full resize-none rounded-lg border border-[#5D5D5D]/20 bg-white p-3 text-[#5D5D5D] focus:ring-1 focus:ring-[#4DB6AC] focus:outline-none"
            />
          </div>
        </section>

        {/* 4. Medications (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#4DB6AC]/10 p-1.5 text-[#4DB6AC]">
              <Pill size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">処方された薬</h3>
          </div>
          <div className="space-y-3 p-4">
            {medications.length === 0 && (
              <p className="py-2 text-center text-xs text-[#5D5D5D]/40">記録がありません</p>
            )}
            {medications.map((med) => (
              <div
                key={med.id}
                className="flex flex-col gap-2 rounded-lg border border-[#5D5D5D]/20 bg-[#F8F8F0] p-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => updateMedicationName(med.id, e.target.value)}
                    placeholder="薬の名前"
                    className="flex-1 rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#4DB6AC]"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedication(med.id)}
                    className="rounded-lg border border-[#4DB6AC]/50 px-2 py-1 text-xs font-bold text-[#4DB6AC] hover:bg-[#4DB6AC]/10 transition-colors"
                  >
                    削除
                  </button>
                </div>
                <input
                  type="text"
                  value={med.note}
                  onChange={(e) => updateMedicationNote(med.id, e.target.value)}
                  placeholder="メモ（回数や量など）"
                  className="w-full rounded-lg border-none bg-white px-3 py-1 text-xs text-[#5D5D5D]/80 outline-none focus:ring-1 focus:ring-[#4DB6AC]"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addMedication}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-[#5D5D5D]/20 bg-white py-2 text-xs font-bold text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
            >
              <Plus size={14} /> お薬を追加
            </button>
          </div>
        </section>

        {/* 5. Next Visit (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#4DB6AC]/10 p-1.5 text-[#4DB6AC]">
              <CalendarIcon size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">次回診察</h3>
          </div>
          <div className="p-4">
            <input
              type="date"
              value={nextVisitDate}
              onChange={(e) => setNextVisitDate(e.target.value)}
              className="w-full rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 font-mono font-bold text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#4DB6AC]"
            />
            <p className="mt-2 ml-1 text-xs text-[#5D5D5D]/60">
              ※設定するとカレンダーに予定が追加されます
            </p>
          </div>
        </section>
      </div>

      {/* Footer Button */}
      <div className="safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-[#5D5D5D]/10 bg-white/90 p-4 shadow-lg backdrop-blur">
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4DB6AC] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#4DB6AC]/80 disabled:opacity-50"
        >
          {isPending ? (
            '保存中...'
          ) : (
            <>
              {isEditMode ? '変更を保存' : '記録を作成'}
              <Check size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
