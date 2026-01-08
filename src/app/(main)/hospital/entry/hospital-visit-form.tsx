'use client';

import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Pill,
  Plus,
  Save,
  Stethoscope,
  Syringe,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { type HospitalVisitInput, saveHospitalVisit } from '@/app/(main)/hospital/actions';
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
  const [isPending, startTransition] = useTransition();

  // Basic Info
  const [hedgehogId, setHedgehogId] = useState(
    initialData?.hedgehog_id || (hedgehogs.length > 0 ? hedgehogs[0].id : '')
  );
  const [visitDate, setVisitDate] = useState(
    initialData?.visit_date || selectedDate || format(new Date(), 'yyyy-MM-dd')
  );

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
        diagnosis: diagnosis,
        treatment: treatment,
        medications: medications
          .map((m) => ({ name: m.name, note: m.note }))
          .filter((m) => m.name.trim() !== ''),
        next_visit_date: nextVisitDate || null,
      };

      const res = await saveHospitalVisit(payload);
      if (res.success) {
        router.push('/calendar');
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

  // Date Navigation (Matches Daily Record)
  const handleDateChange = (diff: number) => {
    const d = new Date(visitDate);
    d.setDate(d.getDate() + diff);
    setVisitDate(format(d, 'yyyy-MM-dd'));
  };

  const displayDate = format(parseISO(visitDate), 'yyyy/MM/dd (E)', { locale: ja });

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col bg-[#F8F8F0]">
      {/* Top Header */}
      <header className="relative z-20 flex flex-none items-center border-b border-[#FFB370]/20 bg-[#F8F8F0] px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-2 -ml-2 rounded-full p-2 text-[#5D5D5D]/60 transition-colors hover:bg-white"
        >
          <div className="flex items-center gap-1">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold">戻る</span>
          </div>
        </button>
        <h1 className="w-full text-center font-bold text-[#5D5D5D]">通院記録</h1>
      </header>

      {/* Sticky Date Header (Matches Daily Record) */}
      {/* Sticky Date Header (Matches Daily Record) */}
      <div className="sticky top-[53px] z-10 border-b border-[#5D5D5D]/10 bg-[#F8F8F0] p-3 shadow-sm">
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
                  setVisitDate(e.target.value);
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
        {/* 1. Hedgehog Selection (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
              <PawPrint size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">対象の個体</h3>
          </div>
          <div className="p-4">
            <Select value={hedgehogId} onValueChange={setHedgehogId}>
              <SelectTrigger className="w-full border-none bg-[#F8F8F0] font-bold text-[#5D5D5D]">
                <SelectValue placeholder="個体を選択" />
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
            <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
              <Stethoscope size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">診断</h3>
          </div>
          <div className="p-4">
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="診断名や症状を入力"
              className="h-24 w-full resize-none rounded-lg border-none bg-[#F8F8F0] p-3 text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] focus:outline-none"
            />
          </div>
        </section>

        {/* 3. Treatment (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#B0D67A]/10 p-1.5 text-[#B0D67A]">
              <Syringe size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">治療内容</h3>
          </div>
          <div className="p-4">
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="処置や注射などの内容"
              className="h-24 w-full resize-none rounded-lg border-none bg-[#F8F8F0] p-3 text-[#5D5D5D] focus:ring-1 focus:ring-[#B0D67A] focus:outline-none"
            />
          </div>
        </section>

        {/* 4. Medications (Unified Style) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
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
                    className="flex-1 rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370]"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedication(med.id)}
                    className="p-2 text-stone-400 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <input
                  type="text"
                  value={med.note}
                  onChange={(e) => updateMedicationNote(med.id, e.target.value)}
                  placeholder="メモ（回数や量など）"
                  className="w-full rounded-lg border-none bg-white px-3 py-1 text-xs text-[#5D5D5D]/80 outline-none focus:ring-1 focus:ring-[#FFB370]"
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
            <div className="rounded-lg bg-[#5D5D5D]/10 p-1.5 text-[#5D5D5D]">
              <CalendarIcon size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">次回診察</h3>
          </div>
          <div className="p-4">
            <input
              type="date"
              value={nextVisitDate}
              onChange={(e) => setNextVisitDate(e.target.value)}
              className="w-full rounded-lg border-none bg-[#F8F8F0] px-3 py-2 font-mono font-bold text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370]"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB370] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#FFB370]/80 disabled:opacity-50"
        >
          {isPending ? (
            '保存中...'
          ) : (
            <>
              <Save size={20} /> 記録を保存
            </>
          )}
        </button>
      </div>
    </form>
  );
}
