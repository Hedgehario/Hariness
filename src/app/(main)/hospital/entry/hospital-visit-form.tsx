"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, Save, Plus, Trash2, Pill, Stethoscope, Syringe, Calendar as CalendarIcon, PawPrint } from "lucide-react";
import { saveHospitalVisit, type HospitalVisitInput } from "@/app/(main)/hospital/actions";
import { cn } from "@/lib/utils";

type Props = {
  initialData?: Partial<HospitalVisitInput> & { id?: string };
  hedgehogs: { id: string, name: string }[];
  selectedDate?: string; // Optional pre-selected date
};

export default function HospitalVisitForm({ initialData, hedgehogs, selectedDate }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Basic Info
  const [hedgehogId, setHedgehogId] = useState(initialData?.hedgehog_id || (hedgehogs.length > 0 ? hedgehogs[0].id : ""));
  const [visitDate, setVisitDate] = useState(initialData?.visit_date || selectedDate || format(new Date(), "yyyy-MM-dd"));
  
  // Medical Info
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || "");
  const [treatment, setTreatment] = useState(initialData?.treatment || "");
  
  // Next Visit
  const [nextVisitDate, setNextVisitDate] = useState(initialData?.next_visit_date || "");

  // Medications
  const [medications, setMedications] = useState<{ id: string, name: string }[]>(
     initialData?.medications?.map((m, i) => ({ id: m.id || `init-${i}`, name: m.name })) || []
  );

  const addMedication = () => {
    setMedications([...medications, { id: crypto.randomUUID(), name: "" }]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const updateMedication = (id: string, value: string) => {
    setMedications(medications.map(m => m.id === id ? { ...m, name: value } : m));
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
            medications: medications.map(m => ({ name: m.name })).filter(m => m.name.trim() !== ""),
            next_visit_date: nextVisitDate || null
        };

        const res = await saveHospitalVisit(payload);
        if (res.success) {
            router.push("/calendar"); // Go to calendar after saving? Or back to history? Spec says "Confirm Screen" in V11, implementing direct save for now as V10/V11 MVP.
            router.refresh();
        } else {
            alert(res.error || "保存に失敗しました");
        }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-[#F8F8F0]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md px-4 h-14 border-b border-[#5D5D5D]/10 flex items-center justify-between sticky top-0 z-10">
            <button type="button" onClick={() => router.back()} className="p-2 -ml-2 text-[#5D5D5D]">
                <ChevronLeft size={24} />
            </button>
            <h1 className="font-bold text-[#5D5D5D]">通院記録</h1>
            <div className="w-10" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
            
            {/* 1. Date & Hedgehog */}
            <section className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-[#5D5D5D]/10 shadow-sm space-y-4">
                     {/* Hedgehog Select */}
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FFB370]/10 text-[#FFB370] rounded-lg">
                            <PawPrint size={20} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#5D5D5D]/70 mb-1">とげどげちゃん</label>
                            <select 
                                value={hedgehogId} 
                                onChange={(e) => setHedgehogId(e.target.value)}
                                className="w-full bg-[#F8F8F0] border-none rounded-lg py-2 px-3 text-[#5D5D5D] font-bold focus:ring-1 focus:ring-[#FFB370]"
                            >
                                {hedgehogs.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                     </div>

                     {/* Date */}
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FFB370]/10 text-[#FFB370] rounded-lg">
                            <CalendarIcon size={20} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-[#5D5D5D]/70 mb-1">受診日</label>
                            <input 
                                type="date" 
                                value={visitDate} 
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="w-full bg-[#F8F8F0] border-none rounded-lg py-2 px-3 text-[#5D5D5D] font-mono font-bold focus:ring-1 focus:ring-[#FFB370]"
                            />
                        </div>
                     </div>
                </div>
            </section>

            {/* 2. Diagnosis */}
            <section className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <Stethoscope size={18} className="text-[#5D5D5D]" />
                    <h3 className="font-bold text-[#5D5D5D]">診断</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#5D5D5D]/10 shadow-sm">
                    <textarea 
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="診断名や症状を入力"
                        className="w-full h-24 bg-[#F8F8F0] border-none rounded-lg p-3 text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] resize-none"
                    />
                </div>
            </section>

             {/* 3. Treatment */}
             <section className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <Syringe size={18} className="text-[#5D5D5D]" />
                    <h3 className="font-bold text-[#5D5D5D]">治療内容</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#5D5D5D]/10 shadow-sm">
                    <textarea 
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        placeholder="処置や注射などの内容"
                        className="w-full h-24 bg-[#F8F8F0] border-none rounded-lg p-3 text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] resize-none"
                    />
                </div>
            </section>

             {/* 4. Medications */}
             <section className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <Pill size={18} className="text-[#5D5D5D]" />
                    <h3 className="font-bold text-[#5D5D5D]">処方された薬</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#5D5D5D]/10 shadow-sm space-y-3">
                    {medications.map((med) => (
                        <div key={med.id} className="flex gap-2">
                            <input 
                                type="text" 
                                value={med.name}
                                onChange={(e) => updateMedication(med.id, e.target.value)}
                                placeholder="薬の名前"
                                className="flex-1 bg-[#F8F8F0] border-none rounded-lg px-3 py-2 text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370]"
                            />
                            <button 
                                type="button"
                                onClick={() => removeMedication(med.id)}
                                className="p-2 text-stone-400 hover:text-red-400 bg-[#F8F8F0] rounded-lg"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button" 
                        onClick={addMedication}
                        className="w-full py-3 border-2 border-dashed border-[#FFB370]/30 rounded-lg text-[#FFB370] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FFB370]/5 transition-colors"
                    >
                        <Plus size={16} />
                        お薬を追加
                    </button>
                </div>
            </section>

            {/* 5. Next Visit */}
            <section className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <CalendarIcon size={18} className="text-[#5D5D5D]" />
                    <h3 className="font-bold text-[#5D5D5D]">次回診察</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#5D5D5D]/10 shadow-sm">
                    <input 
                        type="date" 
                        value={nextVisitDate} 
                        onChange={(e) => setNextVisitDate(e.target.value)}
                        className="w-full bg-[#F8F8F0] border-none rounded-lg py-2 px-3 text-[#5D5D5D] font-mono font-bold focus:ring-1 focus:ring-[#FFB370]"
                    />
                    <p className="text-xs text-[#5D5D5D]/60 mt-2 ml-1">
                        ※設定するとカレンダーに予定が追加されます
                    </p>
                </div>
            </section>
        </div>

        {/* Footer Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-[#5D5D5D]/10">
            <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#FFB370] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#FFB370]/30 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isPending ? "保存中..." : <><Save size={20} /> 通院記録を保存</>}
            </button>
        </div>
    </form>
  );
}
