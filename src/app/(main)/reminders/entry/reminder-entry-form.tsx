'use client';

import { ArrowLeft, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ActionResponse } from '@/types/actions';

import { saveReminder, ReminderDisplay } from '../actions';

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

type Props = {
  initialData?: ReminderDisplay | null;
};

export function ReminderEntryForm({ initialData }: Props) {
  const isEditMode = !!initialData?.id;
  const [isRepeat, setIsRepeat] = useState(initialData?.isRepeat ?? true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await saveReminder(prevState, formData);
  }, initialState);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="safe-area-top sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link href="/reminders">
            <Button variant="ghost" size="icon" className="-ml-2 text-stone-500">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
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
              <p className="text-xs text-stone-400">時間を設定しない場合は「終日」のタスクとして表示されます。</p>
            </div>

            {/* Repeat Settings */}
            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <Label className="mb-1 text-base font-bold text-stone-700">繰り返し</Label>
                  <span className="text-xs text-stone-500">
                    {isRepeat ? '毎日この時間に通知します' : '1回限りのリマインダーです'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${isRepeat ? 'text-[var(--color-primary)]' : 'text-stone-400'}`}>
                    {isRepeat ? '毎日' : '1回'}
                  </span>
                  <Switch
                    checked={isRepeat}
                    onCheckedChange={setIsRepeat}
                  />
                  <input type="hidden" name="isRepeat" value={isRepeat ? 'on' : 'off'} />
                </div>
              </CardContent>
            </Card>

            {state.error?.message && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                ⚠️ {state.error.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFB370] py-3 font-bold text-white shadow-md transition-colors hover:bg-[#FFB370]/80 disabled:opacity-50"
            >
              {isPending ? '保存中...' : (isEditMode ? '変更を保存' : '保存する')}
              {!isPending && <Check className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
