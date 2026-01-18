'use client';

import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    if (value === 'add_new') {
      router.push('/hedgehogs/new');
    } else {
      router.push(`/?hedgehogId=${value}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeId} onValueChange={handleValueChange}>
        <SelectTrigger className="h-8 w-[80px] rounded-xl border-stone-200 bg-white/50 px-2 text-[10px] shadow-sm backdrop-blur-sm">
          <SelectValue placeholder="選んで" />
        </SelectTrigger>
        <SelectContent>
          {hedgehogs.map((hedgehog) => (
            <SelectItem key={hedgehog.id} value={hedgehog.id}>
              {hedgehog.name}
            </SelectItem>
          ))}
          <div className="my-1 border-t border-stone-100 pt-1">
            <SelectItem value="add_new" className="font-medium text-[var(--color-primary)]">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>新しい子を追加</span>
              </div>
            </SelectItem>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
