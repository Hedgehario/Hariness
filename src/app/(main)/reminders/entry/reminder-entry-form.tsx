'use client';

import { AlertTriangle, Calendar, Check, Clock } from 'lucide-react';
import { useActionState, useState } from 'react';

import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ActionResponse } from '@/types/actions';

import { ReminderDisplay, saveReminder } from '../actions';

const initialState: ActionResponse = {
  success: false,
  message: '',
  error: undefined,
};

const SUGGESTED_TITLES = [
  '朝ごはん',
  '夜ごはん',
  'お水交換',
  'おやつ',
  '掃除',
  'お薬',
  '体重測定',
  '運動',
];

// 曜日の定義（表示用と値用）
const DAYS_OF_WEEK = [
  { label: '月', value: 'Mon' },
  { label: '火', value: 'Tue' },
  { label: '水', value: 'Wed' },
  { label: '木', value: 'Thu' },
  { label: '金', value: 'Fri' },
  { label: '土', value: 'Sat' },
  { label: '日', value: 'Sun' },
];

type Props = {
  initialData?: ReminderDisplay | null;
};

export function ReminderEntryForm({ initialData }: Props) {
  const isEditMode = !!initialData?.id;
  const [isRepeat, setIsRepeat] = useState(initialData?.isRepeat ?? true);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(initialData?.frequency || 'daily');
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.daysOfWeek || []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await saveReminder(prevState, formData);
  }, initialState);

  // 曜日の選択をトグル
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // 繰り返し説明文
  const getRepeatDescription = () => {
    if (!isRepeat) return '1回限りのリマインダーです';
    if (frequency === 'daily') return '毎日この時間に通知します';
    if (selectedDays.length === 0) return '曜日を選択してください';
    const dayLabels = selectedDays
      .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
      .filter(Boolean)
      .join('・');
    return `${dayLabels}曜日に通知します`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="safe-area-top sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <BackButton className="-ml-2 text-stone-500" />
          <h1 className="text-lg font-bold text-stone-700">
            {isEditMode ? 'リマインダー編集' : 'リマインダー登録'}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-md p-4">
        <form action={action}>
          {/* Hidden ID for edit mode */}
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

          <div className="space-y-6">
            {/* Title Selection */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-stone-700">タイトル</Label>
              {!isEditMode && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  {SUGGESTED_TITLES.slice(0, 4).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant="outline"
                      className="justify-start bg-white font-normal text-stone-600"
                      onClick={() => {
                        const input = document.getElementById('title') as HTMLInputElement;
                        if (input) input.value = t;
                      }}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              )}
              <Input
                id="title"
                name="title"
                placeholder="例: お薬の時間"
                required
                maxLength={50}
                className="bg-white text-lg"
                defaultValue={initialData?.title || ''}
              />
            </div>

            {/* Time (Optional) */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-stone-700">
                時間 <span className="font-normal text-stone-400">(任意)</span>
              </Label>
              <div className="flex items-center gap-2 rounded-xl border bg-white p-4 shadow-sm">
                <Clock className="h-6 w-6 text-[var(--color-primary)]" />
                <Input
                  type="time"
                  name="targetTime"
                  className="h-auto border-none p-0 text-2xl shadow-none focus-visible:ring-0"
                  placeholder="--:--"
                  defaultValue={initialData?.time || ''}
                />
              </div>
              <p className="text-xs text-stone-400">
                時間を設定しない場合は「終日」のタスクとして表示されます。
              </p>
            </div>

            {/* Repeat Settings */}
            <Card className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-0">
                {/* 繰り返しON/OFFトグル */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
                    <Label className="text-base font-bold text-stone-700">繰り返し</Label>
                  </div>
                  <Switch checked={isRepeat} onCheckedChange={setIsRepeat} />
                  <input type="hidden" name="isRepeat" value={isRepeat ? 'on' : 'off'} />
                </div>

                {/* 繰り返しON時のオプション */}
                {isRepeat && (
                  <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                    {/* 毎日 / 曜日指定 の切り替え */}
                    <div className="mb-4 flex overflow-hidden rounded-lg border border-stone-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setFrequency('daily')}
                        className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                          frequency === 'daily'
                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                            : 'text-stone-400 hover:bg-stone-50'
                        }`}
                      >
                        毎日
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrequency('weekly')}
                        className={`flex-1 border-l border-stone-200 py-2.5 text-sm font-bold transition-colors ${
                          frequency === 'weekly'
                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                            : 'text-stone-400 hover:bg-stone-50'
                        }`}
                      >
                        曜日指定
                      </button>
                    </div>
                    <input type="hidden" name="frequency" value={frequency} />

                    {/* 曜日選択ボタン（曜日指定の場合のみ） */}
                    {frequency === 'weekly' && (
                      <div className="flex justify-center gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = selectedDays.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleDay(day.value)}
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                                isSelected
                                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                                  : 'bg-white text-stone-400 hover:bg-stone-100'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                        {/* Hidden inputs for selected days */}
                        {selectedDays.map((day) => (
                          <input key={day} type="hidden" name="daysOfWeek" value={day} />
                        ))}
                      </div>
                    )}

                    {/* 説明文 */}
                    <p className="mt-3 text-center text-xs text-stone-500">
                      {getRepeatDescription()}
                    </p>
                  </div>
                )}

                {/* 繰り返しOFF時の説明 */}
                {!isRepeat && (
                  <div className="border-t border-stone-100 px-4 py-3">
                    <p className="text-center text-xs text-stone-500">{getRepeatDescription()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {state.error?.message && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {state.error.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB370] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#FFB370]/80 disabled:opacity-50"
            >
              {isPending ? '保存中...' : isEditMode ? '変更を保存' : '保存する'}
              {!isPending && <Check className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
