"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveReminder } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Save } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState = {
  error: "",
  success: false as boolean | string,
};

const SUGGESTED_TITLES = [
  "朝ごはん", "夜ごはん", "お水交換", "おやつ", "掃除", "お薬", "体重測定", "運動"
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
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-2">
          <Link href="/reminders">
            <Button variant="ghost" size="icon" className="-ml-2 text-stone-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg text-stone-700">リマインダー登録</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <form action={action}>
          <div className="space-y-6">
            
            {/* Title Selection */}
            <div className="space-y-3">
                <Label className="text-base font-bold text-stone-700">タイトル</Label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    {SUGGESTED_TITLES.slice(0, 4).map(t => (
                        <Button 
                            key={t} 
                            type="button" 
                            variant="outline" 
                            className="justify-start font-normal text-stone-600 bg-white"
                            onClick={(e) => {
                                const input = document.getElementById('title') as HTMLInputElement;
                                if(input) input.value = t;
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
                <div className="flex items-center gap-2 bg-white border rounded-xl p-4 shadow-sm">
                    <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                    <Input 
                        type="time" 
                        name="targetTime" 
                        required 
                        className="border-none shadow-none text-2xl p-0 h-auto focus-visible:ring-0" 
                        defaultValue="08:00"
                    />
                </div>
            </div>

            {/* Repeat Settings (Simplified for MVP) */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <Label className="text-base font-bold text-stone-700 mb-1">繰り返し</Label>
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
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    ⚠️ {state.error}
                </div>
            )}

            <Button 
                type="submit" 
                className="w-full py-6 text-lg font-bold rounded-full shadow-lg mt-4 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                disabled={isPending}
            >
                <Save className="w-5 h-5 mr-2" />
                {isPending ? "保存中..." : "保存する"}
            </Button>

          </div>
        </form>
      </div>
    </div>
  );
}
