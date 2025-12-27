"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveDailyBatch, type DailyBatchInput } from "@/app/(main)/records/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";

type Props = {
  hedgehogId: string;
  date: string;
  initialData: {
    weight: any;
    meals: any[];
    excretions: any[];
  };
};

export default function RecordEntryForm({ hedgehogId, date, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState<string>(initialData.weight?.weight?.toString() || "");
  
  // Meals State
  const [meals, setMeals] = useState<any[]>(
    initialData.meals.length > 0 
      ? initialData.meals 
      : [{ time: "08:00", foodType: "専用フード", amount: 0, unit: "g" }]
  );

  // Excretions State
  const [excretions, setExcretions] = useState<any[]>(
    initialData.excretions.length > 0 
      ? initialData.excretions 
      : [] // 排泄はデフォルト空
  );

  // Handlers
  const handleAddMeal = () => {
    setMeals([...meals, { time: "20:00", foodType: "専用フード", amount: 0, unit: "g" }]);
  };

  const handleRemoveMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleMealChange = (index: number, field: string, value: any) => {
    const newMeals = [...meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setMeals(newMeals);
  };

  const handleAddExcretion = () => {
    setExcretions([...excretions, { time: "08:00", type: "urine", condition: "normal", notes: "" }]);
  };

  const handleRemoveExcretion = (index: number) => {
    setExcretions(excretions.filter((_, i) => i !== index));
  };

  const handleExcretionChange = (index: number, field: string, value: any) => {
    const newExcretions = [...excretions];
    newExcretions[index] = { ...newExcretions[index], [field]: value };
    setExcretions(newExcretions);
  };

  const handleSubmit = async () => {
    startTransition(async () => {
      const payload: DailyBatchInput = {
        hedgehogId,
        date,
        weight: weight ? parseFloat(weight) : null,
        meals: meals.map(m => ({
            time: m.time,
            foodType: m.food_type || m.foodType, // DB has snake_case, local state might vary, normalizing
            amount: parseFloat(m.amount),
            unit: m.unit
        })),
        excretions: excretions.map(e => ({
            time: e.time,
            type: e.type,
            condition: e.condition,
            notes: e.notes
        })),
      };

      const result = await saveDailyBatch(payload);
      if (result.success) {
        alert("保存しました！");
        router.refresh(); // データ再取得
      } else {
        alert("保存に失敗しました");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 日付ナビゲーション */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <Button variant="ghost" onClick={() => {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            router.push(`?date=${d.toISOString().split("T")[0]}`);
        }}>← 前日</Button>
        <div className="font-bold text-lg">{date}</div>
        <Button variant="ghost" onClick={() => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            router.push(`?date=${d.toISOString().split("T")[0]}`);
        }}>翌日 →</Button>
      </div>

      {/* 体重 */}
      <Card>
        <CardHeader>
          <CardTitle>体重</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                className="text-lg w-32"
                placeholder="0"
            />
            <span className="text-gray-500 font-bold">g</span>
          </div>
        </CardContent>
      </Card>

      {/* 食事 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>食事</CardTitle>
          <Button size="sm" variant="outline" onClick={handleAddMeal}>
            <Plus className="w-4 h-4 mr-1" /> 追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {meals.map((meal, index) => (
            <div key={index} className="bg-stone-50 p-3 rounded-lg flex flex-col gap-2 relative">
               {meals.length > 1 && (
                   <button onClick={() => handleRemoveMeal(index)} className="absolute top-2 right-2 text-red-400">
                       <Trash2 className="w-4 h-4" />
                   </button>
               )}
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <Label className="text-xs">時間</Label>
                    <Input type="time" value={meal.time} onChange={(e) => handleMealChange(index, 'time', e.target.value)} className="bg-white" />
                 </div>
                 <div>
                    <Label className="text-xs">種類</Label>
                    <Input value={meal.foodType || meal.food_type} onChange={(e) => handleMealChange(index, 'foodType', e.target.value)} className="bg-white" />
                 </div>
               </div>
               <div className="flex gap-2 items-end">
                   <div className="flex-1">
                      <Label className="text-xs">量</Label>
                      <Input type="number" value={meal.amount} onChange={(e) => handleMealChange(index, 'amount', e.target.value)} className="bg-white" />
                   </div>
                   <div className="w-20">
                      <Label className="text-xs">単位</Label>
                      <Select value={meal.unit} onValueChange={(val) => handleMealChange(index, 'unit', val)}>
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="粒">粒</SelectItem>
                            <SelectItem value="匹">匹</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
               </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 排泄 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>排泄</CardTitle>
          <Button size="sm" variant="outline" onClick={handleAddExcretion}>
            <Plus className="w-4 h-4 mr-1" /> 追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {excretions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">記録なし</p>}
          {excretions.map((excretion, index) => (
            <div key={index} className="bg-stone-50 p-3 rounded-lg flex flex-col gap-2 relative">
               <button onClick={() => handleRemoveExcretion(index)} className="absolute top-2 right-2 text-red-400">
                   <Trash2 className="w-4 h-4" />
               </button>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                    <Label className="text-xs">時間</Label>
                    <Input type="time" value={excretion.time} onChange={(e) => handleExcretionChange(index, 'time', e.target.value)} className="bg-white" />
                 </div>
                 <div>
                    <Label className="text-xs">種類</Label>
                    <Select value={excretion.type} onValueChange={(val) => handleExcretionChange(index, 'type', val)}>
                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="urine">おしっこ</SelectItem>
                            <SelectItem value="stool">うんち</SelectItem>
                            <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>
               </div>
               <div>
                   <Label className="text-xs">状態・メモ</Label>
                   <Input value={excretion.notes || ""} onChange={(e) => handleExcretionChange(index, 'notes', e.target.value)} placeholder="色は？硬さは？" className="bg-white" />
               </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="pb-10">
        <Button 
            className="w-full py-6 text-lg font-bold shadow-lg" 
            onClick={handleSubmit} 
            disabled={isPending}
        >
            {isPending ? <Loader2 className="animate-spin mr-2" /> : "記録を保存"}
        </Button>
      </div>
    </div>
  );
}
