"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

type Hedgehog = {
  id: string;
  name: string;
};

export function HedgehogSwitcher({
  hedgehogs,
  activeId,
}: {
  hedgehogs: Hedgehog[];
  activeId: string;
}) {
  const router = useRouter();

  const handleValueChange = (value: string) => {
    if (value === "add_new") {
      router.push("/hedgehogs/new");
    } else {
      router.push(`/?hedgehogId=${value}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeId} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px] bg-white/50 backdrop-blur-sm border-stone-200 shadow-sm rounded-full h-10">
          <SelectValue placeholder="個体を選択" />
        </SelectTrigger>
        <SelectContent>
          {hedgehogs.map((hedgehog) => (
            <SelectItem key={hedgehog.id} value={hedgehog.id}>
              {hedgehog.name}
            </SelectItem>
          ))}
          <div className="border-t border-stone-100 my-1 pt-1">
             <SelectItem value="add_new" className="text-[var(--color-primary)] font-medium">
               <div className="flex items-center gap-2">
                 <PlusCircle className="w-4 h-4" />
                 <span>新しい子を追加</span>
               </div>
             </SelectItem>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
