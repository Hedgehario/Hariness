'use client';

import { ArrowLeft, Clock, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { saveReminder } from '../actions';

const initialState = {
  error: '',
  success: false as boolean | string,
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

export default function ReminderEntryPage() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    // Wrap to prevent error
    return await saveReminder(formData);
  }, initialState);

  // Focus mode style (hide bottom nav usually handled by BottomNav component check)

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
          <h1 className="text-lg font-bold text-stone-700">リマインダー登録</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md p-4">
        <form action={action}>
          <div className="space-y-6">
            {/* Title Selection */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-stone-700">タイトル</Label>
              <div className="mb-2 grid grid-cols-2 gap-2">
                {SUGGESTED_TITLES.slice(0, 4).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant="outline"
                    className="justify-start bg-white font-normal text-stone-600"
                    onClick={(e) => {
                      const input = document.getElementById('title') as HTMLInputElement;
                      if (input) input.value = t;
                    }}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <Input
                id="title"
                name="title"
                placeholder="例: お薬の時間"
                required
                maxLength={50}
                className="bg-white text-lg"
              />
            </div>

            {/* Time */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-stone-700">時間</Label>
              <div className="flex items-center gap-2 rounded-xl border bg-white p-4 shadow-sm">
                <Clock className="h-6 w-6 text-[var(--color-primary)]" />
                <Input
                  type="time"
                  name="targetTime"
                  required
                  className="h-auto border-none p-0 text-2xl shadow-none focus-visible:ring-0"
                  defaultValue="08:00"
                />
              </div>
            </div>

            {/* Repeat Settings (Simplified for MVP) */}
            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col">
                  <Label className="mb-1 text-base font-bold text-stone-700">繰り返し</Label>
                  <span className="text-xs text-stone-500">毎日この時間に通知します</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--color-primary)]">毎日</span>
                  <input type="hidden" name="isRepeat" value="on" />
                  {/* Toggle UI could go here, stuck to true for MVP */}
                </div>
              </CardContent>
            </Card>

            {state.error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                ⚠️ {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="mt-4 w-full rounded-full bg-[var(--color-primary)] py-6 text-lg font-bold text-white shadow-lg hover:bg-[var(--color-primary)]/90"
              disabled={isPending}
            >
              <Save className="mr-2 h-5 w-5" />
              {isPending ? '保存中...' : '保存する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
