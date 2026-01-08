'use client';

import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Edit3,
  FileText,
  PawPrint,
  Pill,
  Plus,
  Scale,
  Thermometer,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { saveDailyBatch } from '@/app/(main)/records/actions';
import { type DailyBatchInput } from '@/app/(main)/records/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorCode } from '@/types/errors';

type Props = {
  hedgehogId: string;
  date: string;
  initialData: {
    weight: { weight: number | null };
    meals: { foodType?: string; content?: string; amount?: number; unit?: string }[];
    excretions: { condition: string; details?: string; notes?: string }[];
    condition?: { temperature?: number; humidity?: number };
    medications?: { medicine_name?: string; name?: string }[];
    memo?: { content: string } | null;
  };
  hedgehogs: { id: string; name: string }[];
};

type MealState = {
  id: string;
  time?: string;
  content?: string;
  amount?: number | string;
  unit?: string;
  foodType?: string; // DB mapping
};

type ExcretionState = {
  id: string;
  type?: string; // 'stool' | 'urine'
  time?: string;
  isNormal?: boolean;
  notes?: string;
  condition?: string; // DB mapping
  details?: string; // DB mapping
};

type MedicationState = {
  id: string;
  time?: string;
  name?: string;
  medicine_name?: string; // DB mapping
};

export default function RecordEntryForm({ hedgehogId, date, initialData, hedgehogs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- Handlers ---

  // Hedgehog Switching
  const handleHedgehogChange = (newId: string) => {
    // Navigate to the new hedgehog's entry page with the same date
    router.push(`/records/${newId}/entry?date=${date}`);
  };

  // --- State Initialization ---
  // Meals
  const [meals, setMeals] = useState<MealState[]>(
    initialData.meals.length > 0
      ? initialData.meals.map((m, i) => ({
          ...m,
          id: `init-${i}`,
          content: m.content || m.foodType || '', // Map DB 'content' to form 'content'
        }))
      : [{ id: 'init-0', time: '08:00', content: 'いつものフード', amount: 20, unit: 'g' }]
  );


  // Excretions
  const [excretions, setExcretions] = useState<ExcretionState[]>(
    initialData.excretions.length > 0
      ? initialData.excretions.map((e, i) => ({
          ...e,
          id: `init-${i}`,
          isNormal: e.condition !== 'abnormal', // Map back from DB
          // Ensure notes are mapped correctly if fetched differently
          notes: e.details || e.notes || '',
        }))
      : []
  );

  // Weight
  const [weight, setWeight] = useState(initialData.weight?.weight?.toString() || '');

  // Environment (Temperature/Humidity)
  const [temperature, setTemperature] = useState(
    initialData.condition?.temperature?.toString() || ''
  );
  const [humidity, setHumidity] = useState(initialData.condition?.humidity?.toString() || '');

  // Medications
  const [medications, setMedications] = useState<MedicationState[]>(
    (initialData.medications || []).length > 0
      ? initialData.medications!.map((m, i) => ({
          ...m,
          id: `init-${i}`,
          name: m.medicine_name || m.name || '',
        }))
      : []
  );

  // Memo
  const [memo, setMemo] = useState(initialData.memo?.content || '');

  // UI Error State
  const [error, setError] = useState<string | null>(null);

  // --- Handlers ---

  // Date Navigation (Fixed: Use date-fns addDays)
  const handleDateChange = (diff: number) => {
    const currentDate = parseISO(date);
    const nextDate = addDays(currentDate, diff);
    router.push(`?date=${format(nextDate, 'yyyy-MM-dd')}`);
  };

  // Back Navigation (Fixed: Go to list instead of pop)
  const handleBack = () => {
    router.push(`/records?hedgehogId=${hedgehogId}`);
  };

  // Meals
  const addMeal = () => {
    setMeals([
      ...meals,
      { id: crypto.randomUUID(), time: '12:00', content: '', amount: '', unit: 'g' },
    ]);
  };
  const removeMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id));
  };
  const updateMeal = <K extends keyof MealState>(id: string, field: K, value: MealState[K]) => {
    setMeals(meals.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };
  const duplicateMeal = () => {
    if (meals.length === 0) return;
    const last = meals[meals.length - 1];
    setMeals([...meals, { ...last, id: crypto.randomUUID() }]);
  };

  // Excretions
  const addExcretion = () => {
    setExcretions([
      ...excretions,
      { id: crypto.randomUUID(), time: '08:00', type: 'stool', isNormal: true, notes: '' },
    ]);
  };
  const removeExcretion = (id: string) => {
    setExcretions(excretions.filter((e) => e.id !== id));
  };
  const updateExcretion = <K extends keyof ExcretionState>(
    id: string,
    field: K,
    value: ExcretionState[K]
  ) => {
    setExcretions(excretions.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  // Medications
  const addMedication = () => {
    setMedications([...medications, { id: crypto.randomUUID(), time: '08:00', name: '' }]);
  };
  const removeMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };
  const updateMedication = <K extends keyof MedicationState>(
    id: string,
    field: K,
    value: MedicationState[K]
  ) => {
    setMedications(medications.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  // Submit
  const handleSubmit = () => {
    // Basic Validation
    if (!hedgehogId) {
      setError('個体が選択されていません');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    startTransition(async () => {
      // Validate Meals client-side
      const invalidMeals = meals.some((m) => !m.content);
      if (invalidMeals) {
        setError('食事の内容（フードの種類）が入力されていない項目があります');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const payload: DailyBatchInput = {
        hedgehogId,
        date,
        weight: weight && !isNaN(parseFloat(weight)) ? parseFloat(weight) : null,
        temperature: temperature && !isNaN(parseFloat(temperature)) ? parseFloat(temperature) : null,
        humidity: humidity && !isNaN(parseFloat(humidity)) ? parseFloat(humidity) : null,
        meals: meals.map((m) => ({
          time: m.time || '12:00',
          content: m.content || 'フード',
          amount: m.amount && !isNaN(Number(m.amount)) ? Number(m.amount) : 0,
          unit: m.unit || 'g',
        })),
        excretions: excretions.map((e) => ({
          time: e.time || '08:00',
          type: (e.type || 'stool') as 'urine' | 'stool' | 'other',
          condition: e.isNormal ? 'normal' : 'abnormal',
          notes: e.notes || undefined,
        })),
        medications: medications.map((m) => ({
          time: m.time || '08:00',
          name: m.name || '薬',
        })),
        memo: memo || undefined,
      };

      try {
        const result = await saveDailyBatch(payload);
        if (result.success) {
          alert('記録を保存しました！');
          router.refresh();
          router.push(`/records?hedgehogId=${hedgehogId}`); // Redirect to list for better flow
        } else {
          if (result.error?.code === ErrorCode.AUTH_REQUIRED) {
            setError('セッションが切れています。再度ログインしてください。');
            router.push('/login');
            return;
          }
          setError(result.error?.message || '保存に失敗しました');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (e) {
        console.error(e);
        setError('予期せぬエラーが発生しました');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const displayDate = format(parseISO(date), 'yyyy/MM/dd (E)', { locale: ja });

  return (
    <div className="flex h-full flex-col bg-[#F8F8F0]">
      {/* Top Header */}
      <header className="relative z-20 flex flex-none items-center border-b border-[#FFB370]/20 bg-[#F8F8F0] px-4 py-3 shadow-sm">
        <button
          onClick={handleBack}
          className="absolute left-2 -ml-2 rounded-full p-2 text-[#5D5D5D]/60 transition-colors hover:bg-white"
        >
          <div className="flex items-center gap-1">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold">戻る</span>
          </div>
        </button>
        <h1 className="w-full text-center font-bold text-[#5D5D5D]">今日の記録</h1>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 p-4 text-center text-sm font-bold text-red-500">{error}</div>
      )}

      {/* Sticky Date Header */}
      <div className="sticky top-[53px] z-10 border-b border-[#5D5D5D]/10 bg-[#F8F8F0] p-3 shadow-sm">
        <div className="flex items-center justify-between rounded-lg border border-[#5D5D5D]/10 bg-white p-1">
          <button
            onClick={() => handleDateChange(-1)}
            className="rounded-md p-2 text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 font-bold text-[#5D5D5D]">
            {displayDate}
            <Calendar size={16} className="text-[#5D5D5D]/40" />
          </div>
          <button
            onClick={() => handleDateChange(1)}
            className="rounded-md p-2 text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-6 p-4 pb-28">
        {/* 対象の個体 (Unified Selection) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
              <PawPrint size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">対象の個体</h3>
          </div>
          <div className="p-4">
            <Select value={hedgehogId} onValueChange={handleHedgehogChange}>
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

        {/* 食事セクション */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
              <Edit3 size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">食事</h3>
          </div>
          <div className="space-y-4 p-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="relative rounded-lg border border-[#5D5D5D]/20 bg-[#F8F8F0] p-3 pt-8"
              >
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="absolute top-2 right-2 rounded border border-[#FFB370]/30 bg-white px-2 py-1 text-xs font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/5"
                >
                  削除
                </button>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <label className="w-8 text-xs font-bold text-[#5D5D5D]/60">時間</label>
                    <input
                      type="time"
                      value={meal.time ?? '12:00'}
                      onChange={(e) => updateMeal(meal.id, 'time', e.target.value)}
                      className="rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 font-mono text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-8 text-xs font-bold text-[#5D5D5D]/60">内容</label>
                    <input
                      type="text"
                      value={meal.content ?? ''}
                      onChange={(e) => updateMeal(meal.id, 'content', e.target.value)}
                      placeholder="フードの種類など"
                      className="flex-1 rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-8 text-xs font-bold text-[#5D5D5D]/60">量</label>
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="number"
                        value={meal.amount ?? ''}
                        onChange={(e) => updateMeal(meal.id, 'amount', e.target.value)}
                        className="w-20 rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 text-right text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                      />
                      <select
                        value={meal.unit ?? 'g'}
                        onChange={(e) => updateMeal(meal.id, 'unit', e.target.value)}
                        className="rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                      >
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
              <button
                onClick={duplicateMeal}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#5D5D5D]/20 py-2 text-xs font-bold text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
              >
                <Copy size={14} /> 前回の食事を複製
              </button>
              <button
                onClick={addMeal}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#FFB370]/30 bg-[#FFB370]/10 py-2 text-xs font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/20"
              >
                <Plus size={14} /> 食事を追加
              </button>
            </div>
          </div>
        </section>

        {/* ... (Other sections kept the same, just appending them at the end of the previous replacement) ... */}
        {/* Actually I'll limit the replacement chunk to just the Props/Top Area to be safe and cleaner? No, I need to wrap the whole file to ensure closing tags are aligned since I'm inserting a Section before Meals */}

        {/* 排泄セクション */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#B0D67A]/10 p-1.5 text-[#B0D67A]">
              <Droplets size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">排泄</h3>
          </div>
          <div className="space-y-4 p-4">
            {excretions.length === 0 && (
              <p className="py-2 text-center text-xs text-[#5D5D5D]/40">記録がありません</p>
            )}
            {excretions.map((excretion) => (
              <div
                key={excretion.id}
                className="relative rounded-lg border border-[#5D5D5D]/20 bg-[#F8F8F0] p-3 pt-8"
              >
                <button
                  onClick={() => removeExcretion(excretion.id)}
                  className="absolute top-2 right-2 rounded border border-[#FFB370]/30 bg-white px-2 py-1 text-xs font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/5"
                >
                  削除
                </button>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <label className="w-10 text-xs font-bold text-[#5D5D5D]/60">種別</label>
                    <div className="flex gap-2 text-sm">
                      <label className="flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          checked={excretion.type === 'stool'}
                          onChange={() => updateExcretion(excretion.id, 'type', 'stool')}
                          className="text-[#B0D67A]"
                        />
                        <span className="text-[#5D5D5D]">うんち</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          checked={excretion.type === 'urine'}
                          onChange={() => updateExcretion(excretion.id, 'type', 'urine')}
                          className="text-[#B0D67A]"
                        />
                        <span className="text-[#5D5D5D]">おしっこ</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-10 text-xs font-bold text-[#5D5D5D]/60">時間</label>
                    <input
                      type="time"
                      value={excretion.time}
                      onChange={(e) => updateExcretion(excretion.id, 'time', e.target.value)}
                      className="rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 font-mono text-sm text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#B0D67A]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-10 text-xs font-bold text-[#5D5D5D]/60">状態</label>
                    <div className="flex gap-2">
                      <label className="flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          checked={excretion.isNormal}
                          onChange={() => updateExcretion(excretion.id, 'isNormal', true)}
                          className="text-[#B0D67A]"
                        />
                        <span className="text-sm text-[#5D5D5D]">正常</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          checked={!excretion.isNormal}
                          onChange={() => updateExcretion(excretion.id, 'isNormal', false)}
                          className="text-[#FFB370]"
                        />
                        <span className="text-sm text-[#FFB370]">異常</span>
                      </label>
                    </div>
                  </div>
                  {!excretion.isNormal && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#5D5D5D]/60">異常の内容</label>
                      <input
                        type="text"
                        value={excretion.notes || ''}
                        onChange={(e) => updateExcretion(excretion.id, 'notes', e.target.value)}
                        placeholder="色や形など"
                        className="w-full rounded border border-[#FFB370]/30 bg-white px-2 py-1 text-sm text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={addExcretion}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-[#5D5D5D]/20 bg-white py-2 text-xs font-bold text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
            >
              <Plus size={14} /> 排泄を追加
            </button>
          </div>
        </section>

        {/* 体重セクション (新規分離) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#B0D67A]/10 p-1.5 text-[#B0D67A]">
              <Scale size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">体重</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0"
                className="flex-1 rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 text-right font-mono text-lg text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#B0D67A]"
              />
              <span className="text-sm font-bold text-[#5D5D5D]">g</span>
            </div>
          </div>
        </section>

        {/* 気温・湿度セクション (新規分離) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#B0D67A]/10 p-1.5 text-[#B0D67A]">
              <Thermometer size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">気温・湿度</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#5D5D5D]/60">気温 (℃)</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="26.0"
                className="w-full rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 font-mono text-lg text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#B0D67A]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#5D5D5D]/60">湿度 (%)</label>
              <input
                type="number"
                step="1"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder="50"
                className="w-full rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 font-mono text-lg text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#B0D67A]"
              />
            </div>
          </div>
        </section>

        {/* 投薬セクション (新規追加 - Spec R12) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
              <Pill size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">投薬</h3>
          </div>
          <div className="space-y-4 p-4">
            {medications.length === 0 && (
              <p className="py-2 text-center text-xs text-[#5D5D5D]/40">記録がありません</p>
            )}
            {medications.map((medication) => (
              <div
                key={medication.id}
                className="relative rounded-lg border border-[#5D5D5D]/20 bg-[#F8F8F0] p-3 pt-8"
              >
                <button
                  onClick={() => removeMedication(medication.id)}
                  className="absolute top-2 right-2 rounded border border-[#FFB370]/30 bg-white px-2 py-1 text-xs font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/5"
                >
                  削除
                </button>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <label className="w-8 text-xs font-bold text-[#5D5D5D]/60">時間</label>
                    <input
                      type="time"
                      value={medication.time}
                      onChange={(e) => updateMedication(medication.id, 'time', e.target.value)}
                      className="rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 font-mono text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-8 text-xs font-bold text-[#5D5D5D]/60">薬名</label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                      placeholder="抗生剤など"
                      className="flex-1 rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addMedication}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-[#5D5D5D]/20 bg-white py-2 text-xs font-bold text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
            >
              <Plus size={14} /> 投薬を追加
            </button>
          </div>
        </section>

        {/* ひとことメモ */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#5D5D5D]/10 p-1.5 text-[#5D5D5D]">
              <FileText size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">ひとことメモ</h3>
          </div>
          <div className="p-4">
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="今日の様子や気づいたこと..."
              className="h-24 w-full rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 text-sm text-[#5D5D5D] focus:border-[#FFB370] focus:outline-none"
            />
          </div>
        </section>
      </div>

      {/* Floating Save Button */}
      <div className="safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-[#5D5D5D]/10 bg-white/90 p-4 shadow-lg backdrop-blur">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB370] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#FFB370]/80 disabled:opacity-50"
        >
          {isPending ? '保存中...' : '記録を保存'}
          {!isPending && <Check size={18} />}
        </button>
      </div>
    </div>
  );
}
