"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDailyBatch, type DailyBatchInput } from "@/app/(main)/records/actions";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Edit3, 
  Plus, 
  Copy, 
  Droplets, 
  Scale, 
  Thermometer,
  Pill,
  FileText, 
  Trash2,
  Check
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
  hedgehogId: string;
  date: string;
  initialData: {
    weight: any;
    meals: any[];
    excretions: any[];
    condition?: any;
    medications?: any[];
  };
};

export default function RecordEntryForm({ hedgehogId, date, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- State Initialization ---
  // Meals
  const [meals, setMeals] = useState(
    initialData.meals.length > 0
      ? initialData.meals.map((m, i) => ({ ...m, id: `init-${i}` }))
      : [{ id: 'init-0', time: '08:00', foodType: 'いつものフード', amount: 20, unit: 'g' }]
  );

  // Excretions
  const [excretions, setExcretions] = useState(
    initialData.excretions.length > 0
      ? initialData.excretions.map((e, i) => ({ 
          ...e, 
          id: `init-${i}`, 
          isNormal: e.condition !== 'abnormal' // Map back from DB
        }))
      : [] 
  );

  // Weight
  const [weight, setWeight] = useState(initialData.weight?.weight?.toString() || "");

  // Environment (Temperature/Humidity)
  const [temperature, setTemperature] = useState(initialData.condition?.temperature?.toString() || "");
  const [humidity, setHumidity] = useState(initialData.condition?.humidity?.toString() || "");

  // Medications
  const [medications, setMedications] = useState(
    (initialData.medications || []).length > 0
      ? initialData.medications!.map((m, i) => ({ ...m, id: `init-${i}` }))
      : []
  );
  
  // Memo
  const [memo, setMemo] = useState("");

  // --- Handlers ---

  // Date Navigation
  const handleDateChange = (diff: number) => {
      const d = new Date(date);
      d.setDate(d.getDate() + diff);
      router.push(`?date=${format(d, "yyyy-MM-dd")}`);
  };

  // Meals
  const addMeal = () => {
      setMeals([...meals, { id: crypto.randomUUID(), time: '12:00', foodType: '', amount: '', unit: 'g' }]);
  };
  const removeMeal = (id: string) => {
      setMeals(meals.filter(m => m.id !== id));
  };
  const updateMeal = (id: string, field: string, value: any) => {
      setMeals(meals.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  const duplicateMeal = () => {
      if (meals.length === 0) return;
      const last = meals[meals.length - 1];
      setMeals([...meals, { ...last, id: crypto.randomUUID() }]);
  };

  // Excretions
  const addExcretion = () => {
      setExcretions([...excretions, { id: crypto.randomUUID(), time: '08:00', type: 'stool', isNormal: true, notes: '' }]);
  };
  const removeExcretion = (id: string) => {
      setExcretions(excretions.filter(e => e.id !== id));
  };
  const updateExcretion = (id: string, field: string, value: any) => {
      setExcretions(excretions.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Medications
  const addMedication = () => {
      setMedications([...medications, { id: crypto.randomUUID(), time: '08:00', content: '' }]);
  };
  const removeMedication = (id: string) => {
      setMedications(medications.filter(m => m.id !== id));
  };
  const updateMedication = (id: string, field: string, value: any) => {
      setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Submit
  const handleSubmit = () => {
    startTransition(async () => {
      const payload: DailyBatchInput = {
        hedgehogId,
        date,
        weight: weight ? parseFloat(weight) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        humidity: humidity ? parseFloat(humidity) : null,
        meals: meals.map(m => ({
            time: m.time,
            foodType: m.foodType || m.food_type,
            amount: Number(m.amount) || 0,
            unit: m.unit
        })),
        excretions: excretions.map(e => ({
            time: e.time,
            type: e.type || 'stool',
            condition: e.isNormal ? 'normal' : 'abnormal',
            notes: e.notes
        })),
        medications: medications.map(m => ({
            time: m.time,
            content: m.content
        })),
        memo: memo,
      };

      const result = await saveDailyBatch(payload);
      if (result.success) {
        alert("記録を保存しました！");
        router.refresh();
      } else {
        alert("保存に失敗しました");
      }
    });
  };
  
  const displayDate = format(parseISO(date), "yyyy/MM/dd (E)", { locale: ja });

  return (
    <div className="flex flex-col h-full bg-[#F8F8F0]">
        
        {/* Top Header */}
        <header className="flex-none px-4 py-3 bg-[#F8F8F0] border-b border-[#FFB370]/20 flex items-center relative shadow-sm z-20">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-[#5D5D5D]/60 hover:bg-white rounded-full absolute left-2 transition-colors">
              <div className="flex items-center gap-1">
                <ChevronLeft size={20} />
                <span className="text-sm font-bold">戻る</span>
              </div>
            </button>
            <h1 className="w-full text-center font-bold text-[#5D5D5D]">今日の記録</h1>
        </header>

        {/* Sticky Date Header */}
        <div className="bg-[#F8F8F0] p-3 border-b border-[#5D5D5D]/10 sticky top-[53px] z-10 shadow-sm">
          <div className="flex items-center justify-between bg-white border border-[#5D5D5D]/10 rounded-lg p-1">
            <button onClick={() => handleDateChange(-1)} className="p-2 text-[#5D5D5D]/60 hover:bg-[#F8F8F0] rounded-md transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="font-bold text-[#5D5D5D] flex items-center gap-2">
              {displayDate}
              <Calendar size={16} className="text-[#5D5D5D]/40" />
            </div>
            <button onClick={() => handleDateChange(1)} className="p-2 text-[#5D5D5D]/60 hover:bg-[#F8F8F0] rounded-md transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6 pb-28">
           
           {/* 食事セクション */}
           <section className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 overflow-hidden">
            <div className="bg-[#F8F8F0]/50 px-4 py-3 border-b border-[#5D5D5D]/10 flex items-center gap-2">
              <div className="p-1.5 bg-[#FFB370]/10 text-[#FFB370] rounded-lg"><Edit3 size={16} /></div>
              <h3 className="font-bold text-[#5D5D5D]">食事</h3>
            </div>
            <div className="p-4 space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="relative border border-[#5D5D5D]/20 rounded-lg p-3 pt-8 bg-[#F8F8F0]">
                  <button onClick={() => removeMeal(meal.id)} className="absolute top-2 right-2 text-xs font-bold text-[#FFB370] border border-[#FFB370]/30 bg-white px-2 py-1 rounded hover:bg-[#FFB370]/5 transition-colors">削除</button>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-[#5D5D5D]/60 w-8">時間</label>
                      <input type="time" value={meal.time} onChange={(e) => updateMeal(meal.id, 'time', e.target.value)} className="bg-white border border-[#5D5D5D]/20 rounded px-2 py-1 text-sm font-mono text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] focus:border-[#FFB370] outline-none" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-[#5D5D5D]/60 w-8">内容</label>
                      <input type="text" value={meal.foodType || meal.food_type} onChange={(e) => updateMeal(meal.id, 'foodType', e.target.value)} placeholder="フードの種類など" className="flex-1 bg-white border border-[#5D5D5D]/20 rounded px-2 py-1 text-sm text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] focus:border-[#FFB370] outline-none" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-[#5D5D5D]/60 w-8">量</label>
                      <div className="flex items-center gap-2 flex-1">
                        <input type="number" value={meal.amount} onChange={(e) => updateMeal(meal.id, 'amount', e.target.value)} className="w-20 bg-white border border-[#5D5D5D]/20 rounded px-2 py-1 text-sm text-right text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] focus:border-[#FFB370] outline-none" />
                        <select value={meal.unit} onChange={(e) => updateMeal(meal.id, 'unit', e.target.value)} className="bg-white border border-[#5D5D5D]/20 rounded px-2 py-1 text-sm text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] focus:border-[#FFB370] outline-none">
                          <option value="g">g</option>
                          <option value="粒">粒</option>
                          <option value="匹">匹</option>
                          <option value="ml">ml</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={duplicateMeal} className="flex-1 py-2 border border-[#5D5D5D]/20 text-[#5D5D5D]/60 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#F8F8F0] transition-colors"><Copy size={14} /> 前回の食事を複製</button>
                <button onClick={addMeal} className="flex-1 py-2 bg-[#FFB370]/10 text-[#FFB370] border border-[#FFB370]/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#FFB370]/20 transition-colors"><Plus size={14} /> 食事を追加</button>
              </div>
            </div>
          </section>

          {/* 排泄セクション */}
          <section className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 overflow-hidden">
            <div className="bg-[#F8F8F0]/50 px-4 py-3 border-b border-[#5D5D5D]/10 flex items-center gap-2">
              <div className="p-1.5 bg-[#B0D67A]/10 text-[#B0D67A] rounded-lg"><Droplets size={16} /></div>
              <h3 className="font-bold text-[#5D5D5D]">排泄</h3>
            </div>
            <div className="p-4 space-y-4">
              {excretions.length === 0 && <p className="text-xs text-[#5D5D5D]/40 text-center py-2">記録がありません</p>}
              {excretions.map((excretion) => (
                <div key={excretion.id} className="relative border border-[#5D5D5D]/20 rounded-lg p-3 pt-8 bg-[#F8F8F0]">
                  <button onClick={() => removeExcretion(excretion.id)} className="absolute top-2 right-2 text-xs font-bold text-[#FFB370] border border-[#FFB370]/30 bg-white px-2 py-1 rounded hover:bg-[#FFB370]/5 transition-colors">削除</button>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                       <label className="text-xs font-bold text-[#5D5D5D]/60 w-10">種別</label>
                       <div className="flex gap-2 text-sm">
                           <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={excretion.type === 'stool'} onChange={() => updateExcretion(excretion.id, 'type', 'stool')} className="text-[#B0D67A]" /><span className="text-[#5D5D5D]">うんち</span></label>
                           <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={excretion.type === 'urine'} onChange={() => updateExcretion(excretion.id, 'type', 'urine')} className="text-[#B0D67A]" /><span className="text-[#5D5D5D]">おしっこ</span></label>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-[#5D5D5D]/60 w-10">時間</label>
                      <input type="time" value={excretion.time} onChange={(e) => updateExcretion(excretion.id, 'time', e.target.value)} className="bg-white border border-[#5D5D5D]/20 rounded px-2 py-1 text-sm font-mono text-[#5D5D5D] focus:ring-1 focus:ring-[#B0D67A] outline-none" />
                    </div>
                    <div className="flex items-center gap-3">
                       <label className="text-xs font-bold text-[#5D5D5D]/60 w-10">状態</label>
                       <div className="flex gap-2">
                          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={excretion.isNormal} onChange={() => updateExcretion(excretion.id, 'isNormal', true)} className="text-[#B0D67A]" /><span className="text-sm text-[#5D5D5D]">正常</span></label>
                          <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={!excretion.isNormal} onChange={() => updateExcretion(excretion.id, 'isNormal', false)} className="text-[#FFB370]" /><span className="text-sm text-[#FFB370]">異常</span></label>
                       </div>
                    </div>
                    {!excretion.isNormal && (
                       <div className="flex flex-col gap-1"><label className="text-xs font-bold text-[#5D5D5D]/60">異常の内容</label><input type="text" value={excretion.notes || ""} onChange={(e) => updateExcretion(excretion.id, 'notes', e.target.value)} placeholder="色や形など" className="w-full bg-white border border-[#FFB370]/30 rounded px-2 py-1 text-sm text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] outline-none" /></div>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addExcretion} className="w-full py-2 bg-white border border-[#5D5D5D]/20 text-[#5D5D5D]/60 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#F8F8F0] transition-colors"><Plus size={14} /> 排泄を追加</button>
            </div>
          </section>

          {/* 体重セクション (新規分離) */}
          <section className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 overflow-hidden">
             <div className="bg-[#F8F8F0]/50 px-4 py-3 border-b border-[#5D5D5D]/10 flex items-center gap-2">
              <div className="p-1.5 bg-[#B0D67A]/10 text-[#B0D67A] rounded-lg"><Scale size={16} /></div>
              <h3 className="font-bold text-[#5D5D5D]">体重</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" className="flex-1 bg-white border border-[#5D5D5D]/20 rounded-lg px-3 py-2 text-lg font-mono text-[#5D5D5D] text-right focus:ring-1 focus:ring-[#B0D67A] outline-none" />
                  <span className="text-sm font-bold text-[#5D5D5D]">g</span>
              </div>
            </div>
          </section>

          {/* 気温・湿度セクション (新規分離) */}
          <section className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 overflow-hidden">
             <div className="bg-[#F8F8F0]/50 px-4 py-3 border-b border-[#5D5D5D]/10 flex items-center gap-2">
              <div className="p-1.5 bg-[#B0D67A]/10 text-[#B0D67A] rounded-lg"><Thermometer size={16} /></div>
              <h3 className="font-bold text-[#5D5D5D]">気温・湿度</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-[#5D5D5D]/60 mb-1">気温 (℃)</label>
                  <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="26.0" className="w-full bg-white border border-[#5D5D5D]/20 rounded-lg px-3 py-2 text-lg font-mono text-[#5D5D5D] focus:ring-1 focus:ring-[#B0D67A] outline-none" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-[#5D5D5D]/60 mb-1">湿度 (%)</label>
                  <input type="number" step="1" value={humidity} onChange={(e) => setHumidity(e.target.value)} placeholder="50" className="w-full bg-white border border-[#5D5D5D]/20 rounded-lg px-3 py-2 text-lg font-mono text-[#5D5D5D] focus:ring-1 focus:ring-[#B0D67A] outline-none" />
              </div>
            </div>
          </section>

          {/* 投薬セクション (新規追加 - Spec R12) */}
          <section className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 overflow-hidden">
            <div className="bg-[#F8F8F0]/50 px-4 py-3 border-b border-[#5D5D5D]/10 flex items-center gap-2">
              <div className="p-1.5 bg-[#FFB370]/10 text-[#FFB370] rounded-lg"><Pill size={16} /></div>
              <h3 className="font-bold text-[#5D5D5D]">投薬</h3>
            </div>
            <div className="p-4 space-y-4">
               {medications.length === 0 && <p className="text-xs text-[#5D5D5D]/40 text-center py-2">記録がありません</p>}
               {medications.map((medication) => (
                <div key={medication.id} className="relative border border-[#5D5D5D]/20 rounded-lg p-3 pt-8 bg-[#F8F8F0]">
                  <button onClick={() => removeMedication(medication.id)} className="absolute top-2 right-2 text-xs font-bold text-[#FFB370] border border-[#FFB370]/30 bg-white px-2 py-1 rounded hover:bg-[#FFB370]/5 transition-colors">削除</button>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-[#5D5D5D]/60 w-8">時間</label>
                      <input type="time" value={medication.time} onChange={(e) => updateMedication(medication.id, 'time', e.target.value)} className="bg-white border border-[#5D5D5D]/20 rounded px-2 py-1 text-sm font-mono text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] focus:border-[#FFB370] outline-none" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-[#5D5D5D]/60 w-8">薬名</label>
                      <input type="text" value={medication.content} onChange={(e) => updateMedication(medication.id, 'content', e.target.value)} placeholder="抗生剤など" className="flex-1 bg-white border border-[#5D5D5D]/20 rounded px-2 py-1 text-sm text-[#5D5D5D] focus:ring-1 focus:ring-[#FFB370] focus:border-[#FFB370] outline-none" />
                    </div>
                  </div>
                </div>
              ))}
               <button onClick={addMedication} className="w-full py-2 bg-white border border-[#5D5D5D]/20 text-[#5D5D5D]/60 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#F8F8F0] transition-colors"><Plus size={14} /> 投薬を追加</button>
            </div>
          </section>

           {/* ひとことメモ */}
           <section className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 overflow-hidden">
             <div className="bg-[#F8F8F0]/50 px-4 py-3 border-b border-[#5D5D5D]/10 flex items-center gap-2">
              <div className="p-1.5 bg-[#5D5D5D]/10 text-[#5D5D5D] rounded-lg"><FileText size={16} /></div>
              <h3 className="font-bold text-[#5D5D5D]">ひとことメモ</h3>
            </div>
            <div className="p-4">
               <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="今日の様子や気づいたこと..." className="w-full h-24 bg-white border border-[#5D5D5D]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFB370] text-[#5D5D5D]" />
            </div>
          </section>

        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8F8F0] border-t border-[#FFB370]/20 safe-area-bottom z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <button 
             onClick={handleSubmit} 
             disabled={isPending}
             className="w-full py-3 bg-[#FFB370] text-white font-bold rounded-xl shadow-md hover:bg-[#FFB370]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
           >
             {isPending ? '保存中...' : '記録を保存'}
             {!isPending && <Check size={18} />}
           </button>
        </div>
    </div>
  );
}
