'use client';

import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Edit3,
  FileText,
  Minus,
  PawPrint,
  Pill,
  Plus,
  Scale,
  Thermometer,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  getPreviousMeals,
  getPreviousMedications,
  saveDailyBatch,
} from '@/app/(main)/records/actions';
import { type DailyBatchInput } from '@/app/(main)/records/schema';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorCode } from '@/types/errors';

type ExcretionConditionType = 'none' | 'normal' | 'abnormal';

type Props = {
  hedgehogId: string;
  date: string;
  initialData: {
    weight: { weight: number | null };
    meals: { foodType?: string; content?: string; amount?: number; unit?: string }[];
    excretion?: {
      stool_condition?: string;
      urine_condition?: string;
      details?: string;
    } | null;
    condition?: { temperature?: number; humidity?: number };
    medications?: { medicine_name?: string; name?: string; dosage?: string }[];
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

// 排泄状態（シンプル化: うんち・おしっこの状態を1レコードで管理）
type ExcretionState = {
  stoolCondition: ExcretionConditionType;
  urineCondition: ExcretionConditionType;
  notes: string;
};

type MedicationState = {
  id: string;
  time?: string;
  name?: string;
  dosage?: string;
  dosageAmount?: string;
  dosageUnit?: string;
  medicine_name?: string; // DB mapping
};

export default function RecordEntryForm({ hedgehogId, date, initialData, hedgehogs }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- Handlers ---

  // Note: handleHedgehogChange is defined after isDirty below

  // --- State Initialization ---
  // Meals
  const [meals, setMeals] = useState<MealState[]>(
    initialData.meals.length > 0
      ? initialData.meals.map((m, i) => ({
          ...m,
          id: `init-${i}`,
          content: m.content || m.foodType || '', // Map DB 'content' to form 'content'
        }))
      : [] // 初期状態では空の食事欄を表示しない
  );

  // Excretion (シンプル化: 1日1レコード)
  const [excretion, setExcretion] = useState<ExcretionState>({
    stoolCondition: (initialData.excretion?.stool_condition as ExcretionConditionType) || 'none',
    urineCondition: (initialData.excretion?.urine_condition as ExcretionConditionType) || 'none',
    notes: initialData.excretion?.details || '',
  });

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
      ? initialData.medications!.map((m, i) => {
          // dosageを量と単位に分解（例: "1錠" → "1" と "錠"）
          const dosageMatch = m.dosage?.match(/^([\d.]+)\s*(.*)$/);
          return {
            ...m,
            id: `init-${i}`,
            name: m.medicine_name || m.name || '',
            dosageAmount: dosageMatch?.[1] || '',
            dosageUnit: dosageMatch?.[2] || '錠',
          };
        })
      : []
  );

  // Memo
  const [memo, setMemo] = useState(initialData.memo?.content || '');

  // Accordion State - 初期データがあるセクションは自動展開
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initialOpen = new Set<string>();
    // 既存データがあるセクションは開いた状態で表示
    if (initialData.meals.length > 0) initialOpen.add('meals');
    // 排泄: 明示的に 'normal' か 'abnormal' が設定されている場合のみ開く
    if (
      initialData.excretion &&
      (initialData.excretion.stool_condition === 'normal' ||
        initialData.excretion.stool_condition === 'abnormal' ||
        initialData.excretion.urine_condition === 'normal' ||
        initialData.excretion.urine_condition === 'abnormal')
    )
      initialOpen.add('excretion');
    if (initialData.weight?.weight) initialOpen.add('weight');
    if (initialData.condition?.temperature || initialData.condition?.humidity)
      initialOpen.add('environment');
    if (initialData.medications && initialData.medications.length > 0) initialOpen.add('medication');
    if (initialData.memo?.content) initialOpen.add('memo');
    return initialOpen;
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // UI Error State
  const [error, setError] = useState<string | null>(null);

  // Confirm dialog state for navigation
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // --- Handlers ---

  // Dirty check function - returns true if user has entered any data
  const isDirty = (): boolean => {
    // Compare current state with initial data
    const hasNewWeight = weight !== (initialData.weight?.weight?.toString() || '');
    const hasNewMeals =
      meals.length !== initialData.meals.length ||
      meals.some((m, i) => {
        const initial = initialData.meals[i];
        return !initial || m.content !== (initial.content || initial.foodType || '');
      });
    const hasNewExcretion =
      excretion.stoolCondition !== ((initialData.excretion?.stool_condition as ExcretionConditionType) || 'none') ||
      excretion.urineCondition !== ((initialData.excretion?.urine_condition as ExcretionConditionType) || 'none') ||
      excretion.notes !== (initialData.excretion?.details || '');
    const hasNewMedications = medications.length !== (initialData.medications?.length || 0);
    const hasNewMemo = memo !== (initialData.memo?.content || '');
    const hasNewTemp = temperature !== (initialData.condition?.temperature?.toString() || '');
    const hasNewHumidity = humidity !== (initialData.condition?.humidity?.toString() || '');

    return (
      hasNewWeight ||
      hasNewMeals ||
      hasNewExcretion ||
      hasNewMedications ||
      hasNewMemo ||
      hasNewTemp ||
      hasNewHumidity
    );
  };

  // Hedgehog Switching (must be after isDirty definition)
  const handleHedgehogChange = (newId: string) => {
    if (isDirty()) {
      setPendingNavigation(() => () => router.push(`/records/${newId}/entry?date=${date}`));
      setConfirmDialogOpen(true);
    } else {
      router.push(`/records/${newId}/entry?date=${date}`);
    }
  };

  // Date Navigation
  const handleDateChange = (diff: number) => {
    const currentDate = parseISO(date);
    const nextDate = addDays(currentDate, diff);
    const navigateTo = () => router.push(`?date=${format(nextDate, 'yyyy-MM-dd')}`);

    if (isDirty()) {
      setPendingNavigation(() => navigateTo);
      setConfirmDialogOpen(true);
    } else {
      navigateTo();
    }
  };

  // Handle confirm navigation
  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  // Back Navigation
  const handleBack = () => {
    router.back();
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

  // 前日の食事をコピー
  const [isCopyingMeals, setIsCopyingMeals] = useState(false);
  const copyPreviousMeals = async () => {
    setIsCopyingMeals(true);
    try {
      const previousMeals = await getPreviousMeals(hedgehogId, date);
      if (previousMeals.length === 0) {
        setError('前日の食事記録が見つかりませんでした');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // 前日の食事データをフォームにセット
      const newMeals = previousMeals.map((m) => ({
        id: crypto.randomUUID(),
        time: m.time,
        content: m.content,
        amount: m.amount ?? '',
        unit: m.unit || 'g',
      }));
      setMeals(newMeals);
      // 食事セクションを開く
      setOpenSections((prev) => new Set(prev).add('meals'));
    } catch (e) {
      console.error(e);
      setError('食事データの取得に失敗しました');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsCopyingMeals(false);
    }
  };

  // Excretion（シンプル化: 配列ではなく単一オブジェクト）
  const updateExcretion = <K extends keyof ExcretionState>(field: K, value: ExcretionState[K]) => {
    setExcretion((prev) => ({ ...prev, [field]: value }));
  };

  // Medications
  const addMedication = () => {
    setMedications([...medications, { id: crypto.randomUUID(), time: '08:00', name: '', dosageAmount: '', dosageUnit: '錠' }]);
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

  // 前日の投薬をコピー
  const [isCopyingMeds, setIsCopyingMeds] = useState(false);
  const copyPreviousMedications = async () => {
    setIsCopyingMeds(true);
    try {
      const previousMeds = await getPreviousMedications(hedgehogId, date);
      if (previousMeds.length === 0) {
        setError('前日の投薬記録が見つかりませんでした');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // 前日の投薬データをフォームにセット
      const newMeds = previousMeds.map((m) => {
        // dosageを量と単位に分解
        const dosageMatch = m.dosage?.match(/^([\d.]+)\s*(.*)$/);
        return {
          id: crypto.randomUUID(),
          time: m.time,
          name: m.name,
          dosageAmount: dosageMatch?.[1] || '',
          dosageUnit: dosageMatch?.[2] || '錠',
        };
      });
      setMedications(newMeds);
      // 投薬セクションを開く
      setOpenSections((prev) => new Set(prev).add('medication'));
    } catch (e) {
      console.error(e);
      setError('投薬データの取得に失敗しました');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsCopyingMeds(false);
    }
  };

  // Submit
  const handleSubmit = () => {
    // Basic Validation
    if (!hedgehogId) {
      setError('ハリネズミが選択されていません');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    startTransition(async () => {
      // Validate Meals client-side
      // 部分的に入力された食事があるがcontentが空の場合のみエラー
      const invalidMeals = meals.some((m) => (m.amount || m.time) && !m.content);
      if (invalidMeals) {
        setError('食事の内容（フードの種類）が入力されていない項目があります');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 少なくとも1つの項目が入力されているか確認
      const hasWeight = weight && !isNaN(parseFloat(weight));
      const hasMeals = meals.some((m) => m.content);
      const hasExcretion =
        excretion.stoolCondition !== 'none' || excretion.urineCondition !== 'none';
      const hasMedications = medications.some((m) => m.name);
      const hasMemo = memo.trim().length > 0;

      if (!hasWeight && !hasMeals && !hasExcretion && !hasMedications && !hasMemo) {
        setError('少なくとも1つの項目（体重・食事・排泄・投薬・メモ）を入力してください');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 排泄が異常の場合は備考が必要
      const hasAbnormal =
        excretion.stoolCondition === 'abnormal' || excretion.urineCondition === 'abnormal';
      if (hasAbnormal && !excretion.notes.trim()) {
        setError('排泄に異常がある場合は備考を入力してください');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const payload: DailyBatchInput = {
        hedgehogId,
        date,
        weight: weight && !isNaN(parseFloat(weight)) ? parseFloat(weight) : null,
        temperature:
          temperature && !isNaN(parseFloat(temperature)) ? parseFloat(temperature) : null,
        humidity: humidity && !isNaN(parseFloat(humidity)) ? parseFloat(humidity) : null,
        meals: meals
          .filter((m) => m.content) // 空の食事は除外
          .map((m) => ({
            time: m.time || '12:00',
            content: m.content || 'フード',
            amount: m.amount && !isNaN(Number(m.amount)) ? Number(m.amount) : 0,
            unit: m.unit || 'g',
          })),
        excretion:
          excretion.stoolCondition !== 'none' || excretion.urineCondition !== 'none'
            ? {
                stoolCondition: excretion.stoolCondition,
                urineCondition: excretion.urineCondition,
                notes: excretion.notes || undefined,
              }
            : undefined,
        medications: medications.map((m) => ({
          time: m.time || '08:00',
          name: m.name || '薬',
          dosage: m.dosageAmount ? `${m.dosageAmount}${m.dosageUnit || '錠'}` : undefined,
        })),
        memo: memo || undefined,
      };

      try {
        const result = await saveDailyBatch(payload);
        if (result.success) {
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

  // Determine if this is a registered record (Edit mode) or new (Create mode)
  // Check if any significant data exists in initialData
  const isRegistered =
    initialData.weight?.weight != null ||
    initialData.meals.length > 0 ||
    (initialData.excretion &&
      (initialData.excretion.stool_condition !== 'none' ||
        initialData.excretion.urine_condition !== 'none')) ||
    (initialData.medications && initialData.medications.length > 0) ||
    !!initialData.memo?.content;

  return (
    <div className="flex h-full flex-col bg-[#F8F8F0]">
      {/* Combined Sticky Header Container - prevents gap bleeding on scroll */}
      <div className="sticky top-0 z-20 bg-[#F8F8F0]">
        {/* Top Header - L3 専用ヘッダー */}
        <header className="flex flex-none items-center border-b border-[#FFB370]/20 px-4 py-3 shadow-sm">
          <button
            onClick={handleBack}
            className="absolute left-2 -ml-2 rounded-full p-2 text-[#5D5D5D]/60 transition-colors hover:bg-white"
          >
            <div className="flex items-center gap-1">
              <ChevronLeft size={20} />
              <span className="text-sm font-bold">戻る</span>
            </div>
          </button>
          <h1 className="w-full text-center font-bold text-[#5D5D5D]">
            {isRegistered ? '記録の編集' : '新しい記録'}
          </h1>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 text-center text-sm font-bold text-red-500">{error}</div>
        )}

        {/* Date Header */}
        <div className="border-b border-[#5D5D5D]/10 p-3 shadow-sm">
          <div className="relative flex items-center justify-center rounded-lg border border-[#5D5D5D]/10 bg-white p-1">
            <button
              onClick={() => handleDateChange(-1)}
              className="z-20 rounded-md p-2 text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="relative flex items-center justify-center px-4">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  if (e.target.value) {
                    router.push(`?date=${e.target.value}`);
                  }
                }}
                onClick={(e) => {
                  // Force picker to open on click (fixes desktop behavior where only icon triggers it)
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {
                    // Fallback or ignore if not supported
                    console.debug('showPicker not supported', err);
                  }
                }}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <div className="flex items-center gap-2 font-bold text-[#5D5D5D]">
                {displayDate}
                <Calendar size={16} className="text-[#5D5D5D]/40" />
                {isRegistered ? (
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
              onClick={() => handleDateChange(1)}
              className="z-20 rounded-md p-2 text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 pb-28">
        {/* 対象の個体 (Unified Selection) */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#5D5D5D]/10 bg-[#F8F8F0]/50 px-4 py-3">
            <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
              <PawPrint size={16} />
            </div>
            <h3 className="font-bold text-[#5D5D5D]">記録するハリネズミ</h3>
          </div>
          <div className="p-4">
            <Select value={hedgehogId} onValueChange={handleHedgehogChange}>
              <SelectTrigger className="w-full border-none bg-[#F8F8F0] font-bold text-[#5D5D5D]">
                <SelectValue placeholder="選んでください">
                  {(() => {
                    const selected = hedgehogs.find((h) => h.id === hedgehogId);
                    if (!selected) return null;
                    return selected.name.length > 15
                      ? `${selected.name.slice(0, 15)}...`
                      : selected.name;
                  })()}
                </SelectValue>
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
          <button
            type="button"
            onClick={() => toggleSection('meals')}
            className="flex w-full items-center justify-between gap-2 bg-[#F8F8F0]/50 px-4 py-3 transition-colors hover:bg-[#F8F8F0]"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
                <Edit3 size={16} />
              </div>
              <h3 className="font-bold text-[#5D5D5D]">食事</h3>
              {meals.length > 0 && !openSections.has('meals') && (
                <span className="rounded-full bg-[#FFB370]/20 px-2 py-0.5 text-xs font-bold text-[#FFB370]">
                  {meals.length}件
                </span>
              )}
            </div>
            <div className="text-[#5D5D5D]/40">
              {openSections.has('meals') ? <Minus size={18} /> : <Plus size={18} />}
            </div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSections.has('meals') ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4 border-t border-[#5D5D5D]/10 p-4">
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
            {/* 前日の食事をコピーボタン */}
            <button
              type="button"
              onClick={copyPreviousMeals}
              disabled={isCopyingMeals}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#FFB370]/50 bg-[#FFB370]/5 py-3 text-sm font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/10 disabled:opacity-50"
            >
              <Copy size={16} />
              {isCopyingMeals ? '取得中...' : '前日の食事をコピー'}
            </button>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={duplicateMeal}
                disabled={meals.length === 0}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#5D5D5D]/20 py-2 text-xs font-bold text-[#5D5D5D]/60 transition-colors hover:bg-[#F8F8F0] disabled:opacity-30"
              >
                <Copy size={14} /> 最後の食事を複製
              </button>
              <button
                type="button"
                onClick={addMeal}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#FFB370]/30 bg-[#FFB370]/10 py-2 text-xs font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/20"
              >
                <Plus size={14} /> 空の食事を追加
              </button>
            </div>
            </div>
          </div>
        </section>

        {/* 排泄セクション（シンプル化） */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('excretion')}
            className="flex w-full items-center justify-between gap-2 bg-[#F8F8F0]/50 px-4 py-3 transition-colors hover:bg-[#F8F8F0]"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
                <Droplets size={16} />
              </div>
              <h3 className="font-bold text-[#5D5D5D]">排泄</h3>
              {(excretion.stoolCondition !== 'none' || excretion.urineCondition !== 'none') &&
                !openSections.has('excretion') && (
                  <span className="rounded-full bg-[#FFB370]/20 px-2 py-0.5 text-xs font-bold text-[#FFB370]">
                    記録あり
                  </span>
                )}
            </div>
            <div className="text-[#5D5D5D]/40">
              {openSections.has('excretion') ? <Minus size={18} /> : <Plus size={18} />}
            </div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSections.has('excretion') ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4 border-t border-[#5D5D5D]/10 p-4">
            {/* うんちの状態 */}
            <div className="rounded-lg border border-[#5D5D5D]/10 bg-[#F8F8F0] p-3">
              <div className="mb-2 text-sm font-bold text-[#5D5D5D]">うんち</div>
              <div className="flex gap-3">
                {(['none', 'normal', 'abnormal'] as const).map((condition) => (
                  <label key={condition} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="stool-condition"
                      checked={excretion.stoolCondition === condition}
                      onChange={() => updateExcretion('stoolCondition', condition)}
                      className="h-4 w-4 accent-[#FFB370]"
                    />
                    <span
                      className={`text-sm ${
                        condition === 'abnormal'
                          ? 'font-bold text-[#FFB370]'
                          : 'text-[#5D5D5D]'
                      }`}
                    >
                      {condition === 'none' ? 'なし' : condition === 'normal' ? '普通' : '異常'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* おしっこの状態 */}
            <div className="rounded-lg border border-[#5D5D5D]/10 bg-[#F8F8F0] p-3">
              <div className="mb-2 text-sm font-bold text-[#5D5D5D]">おしっこ</div>
              <div className="flex gap-3">
                {(['none', 'normal', 'abnormal'] as const).map((condition) => (
                  <label key={condition} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      name="urine-condition"
                      checked={excretion.urineCondition === condition}
                      onChange={() => updateExcretion('urineCondition', condition)}
                      className="h-4 w-4 accent-[#FFB370]"
                    />
                    <span
                      className={`text-sm ${
                        condition === 'abnormal'
                          ? 'font-bold text-[#FFB370]'
                          : 'text-[#5D5D5D]'
                      }`}
                    >
                      {condition === 'none' ? 'なし' : condition === 'normal' ? '普通' : '異常'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 備考（異常時などに入力） */}
            <div>
              <label className="mb-1 block text-xs font-bold text-[#5D5D5D]/60">
                備考
                {(excretion.stoolCondition === 'abnormal' ||
                  excretion.urineCondition === 'abnormal') && (
                  <span className="ml-1 text-[#FFB370]">（異常の場合は必須）</span>
                )}
              </label>
              <input
                type="text"
                value={excretion.notes}
                onChange={(e) => updateExcretion('notes', e.target.value)}
                placeholder="色や形、気になったことなど"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370] ${
                  excretion.stoolCondition === 'abnormal' ||
                  excretion.urineCondition === 'abnormal'
                    ? 'border-[#FFB370]/50 bg-[#FFB370]/5'
                    : 'border-[#5D5D5D]/20 bg-white'
                }`}
              />
            </div>
            </div>
          </div>
        </section>

        {/* 体重セクション */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('weight')}
            className="flex w-full items-center justify-between gap-2 bg-[#F8F8F0]/50 px-4 py-3 transition-colors hover:bg-[#F8F8F0]"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
                <Scale size={16} />
              </div>
              <h3 className="font-bold text-[#5D5D5D]">体重</h3>
              {weight && !openSections.has('weight') && (
                <span className="rounded-full bg-[#FFB370]/20 px-2 py-0.5 text-xs font-bold text-[#FFB370]">
                  {weight}g
                </span>
              )}
            </div>
            <div className="text-[#5D5D5D]/40">
              {openSections.has('weight') ? <Minus size={18} /> : <Plus size={18} />}
            </div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSections.has('weight') ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-[#5D5D5D]/10 p-4">
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                  className="flex-1 rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 text-right font-mono text-lg text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370]"
                />
                <span className="text-sm font-bold text-[#5D5D5D]">g</span>
              </div>
            </div>
          </div>
        </section>

        {/* 気温・湿度セクション */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('environment')}
            className="flex w-full items-center justify-between gap-2 bg-[#F8F8F0]/50 px-4 py-3 transition-colors hover:bg-[#F8F8F0]"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
                <Thermometer size={16} />
              </div>
              <h3 className="font-bold text-[#5D5D5D]">気温・湿度</h3>
              {(temperature || humidity) && !openSections.has('environment') && (
                <span className="rounded-full bg-[#FFB370]/20 px-2 py-0.5 text-xs font-bold text-[#FFB370]">
                  {temperature && `${temperature}℃`}
                  {temperature && humidity && ' / '}
                  {humidity && `${humidity}%`}
                </span>
              )}
            </div>
            <div className="text-[#5D5D5D]/40">
              {openSections.has('environment') ? <Minus size={18} /> : <Plus size={18} />}
            </div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSections.has('environment') ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-2 gap-4 border-t border-[#5D5D5D]/10 p-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#5D5D5D]/60">気温 (℃)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="26.0"
                  className="w-full rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 font-mono text-lg text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370]"
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
                  className="w-full rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 font-mono text-lg text-[#5D5D5D] outline-none focus:ring-1 focus:ring-[#FFB370]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 投薬セクション */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('medication')}
            className="flex w-full items-center justify-between gap-2 bg-[#F8F8F0]/50 px-4 py-3 transition-colors hover:bg-[#F8F8F0]"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
                <Pill size={16} />
              </div>
              <h3 className="font-bold text-[#5D5D5D]">投薬</h3>
              {medications.length > 0 && !openSections.has('medication') && (
                <span className="rounded-full bg-[#FFB370]/20 px-2 py-0.5 text-xs font-bold text-[#FFB370]">
                  {medications.length}件
                </span>
              )}
            </div>
            <div className="text-[#5D5D5D]/40">
              {openSections.has('medication') ? <Minus size={18} /> : <Plus size={18} />}
            </div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSections.has('medication') ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-4 border-t border-[#5D5D5D]/10 p-4">
              {/* 前日の投薬をコピーボタン */}
              <button
                type="button"
                onClick={copyPreviousMedications}
                disabled={isCopyingMeds}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#FFB370]/50 bg-[#FFB370]/5 py-3 text-sm font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/10 disabled:opacity-50"
              >
                <Copy size={16} />
                {isCopyingMeds ? '取得中...' : '前日の投薬をコピー'}
              </button>

              {medications.map((medication) => (
                <div
                  key={medication.id}
                  className="relative rounded-lg border border-[#5D5D5D]/20 bg-[#F8F8F0] p-3 pt-8"
                >
                  <button
                    type="button"
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
                    <div className="flex items-center gap-3">
                      <label className="w-8 text-xs font-bold text-[#5D5D5D]/60">量</label>
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="number"
                          value={medication.dosageAmount || ''}
                          onChange={(e) => updateMedication(medication.id, 'dosageAmount', e.target.value)}
                          className="w-20 rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 text-right text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                        />
                        <select
                          value={medication.dosageUnit || '錠'}
                          onChange={(e) => updateMedication(medication.id, 'dosageUnit', e.target.value)}
                          className="rounded border border-[#5D5D5D]/20 bg-white px-2 py-1 text-sm text-[#5D5D5D] outline-none focus:border-[#FFB370] focus:ring-1 focus:ring-[#FFB370]"
                        >
                          <option value="錠">錠</option>
                          <option value="ml">ml</option>
                          <option value="g">g</option>
                          <option value="滴">滴</option>
                          <option value="包">包</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#FFB370]/30 bg-[#FFB370]/10 py-2 text-xs font-bold text-[#FFB370] transition-colors hover:bg-[#FFB370]/20"
                >
                  <Plus size={14} /> 投薬を追加
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ひとことメモ */}
        <section className="overflow-hidden rounded-xl border border-[#5D5D5D]/10 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('memo')}
            className="flex w-full items-center justify-between gap-2 bg-[#F8F8F0]/50 px-4 py-3 transition-colors hover:bg-[#F8F8F0]"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#FFB370]/10 p-1.5 text-[#FFB370]">
                <FileText size={16} />
              </div>
              <h3 className="font-bold text-[#5D5D5D]">ひとことメモ</h3>
              {memo && !openSections.has('memo') && (
                <span className="rounded-full bg-[#FFB370]/20 px-2 py-0.5 text-xs font-bold text-[#FFB370]">
                  記録あり
                </span>
              )}
            </div>
            <div className="text-[#5D5D5D]/40">
              {openSections.has('memo') ? <Minus size={18} /> : <Plus size={18} />}
            </div>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSections.has('memo') ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-[#5D5D5D]/10 p-4">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="今日の様子や気づいたこと..."
                className="h-24 w-full rounded-lg border border-[#5D5D5D]/20 bg-white px-3 py-2 text-sm text-[#5D5D5D] focus:border-[#FFB370] focus:outline-none"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Floating Save Button */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#5D5D5D]/10 bg-white/90 shadow-lg backdrop-blur">
        <div className="p-4">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB370] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#FFB370]/80 disabled:opacity-50"
          >
            {isPending ? '保存中...' : isRegistered ? '変更を保存' : '記録を作成'}
            {!isPending && <Check size={18} />}
          </button>
        </div>
        {/* Safe area spacer for iPhone home indicator */}
        <div className="safe-area-bottom bg-white" />
      </div>

      {/* Confirm Navigation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        variant="warning"
        title="保存されていない変更があります"
        description="変更を破棄して移動しますか？"
        confirmLabel="破棄して移動"
        onConfirm={handleConfirmNavigation}
        onCancel={() => setPendingNavigation(null)}
      />
    </div>
  );
}
