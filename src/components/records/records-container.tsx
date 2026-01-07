'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getWeightHistory } from '@/app/(main)/records/actions';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { HospitalVisitList } from './hospital-visit-list';
import { RecordList } from './record-list';
import { WeightChart } from './weight-chart';

type RecordsContainerProps = {
  hedgehogId: string;
  hedgehogs: { id: string; name: string }[];
  initialWeightHistory: { date: string; weight: number }[];
  recentRecords: {
    date: string;
    weight?: { weight: number | null };
    meals: { foodType?: string; content?: string }[];
    excretions: { condition: string }[];
    medications?: { medicine_name?: string }[];
  }[];
  hospitalVisits: {
    id: string;
    visit_date: string;
    diagnosis: string | null;
    treatment: string | null;
    medicine_prescription: { name: string; note?: string }[] | null;
    next_visit_date: string | null;
  }[];
};

export function RecordsContainer({
  hedgehogId,
  hedgehogs,
  initialWeightHistory,
  recentRecords,
  hospitalVisits,
}: RecordsContainerProps) {
  const router = useRouter();
  const [range, setRange] = useState<'30d' | '90d' | '180d'>('30d');
  const [graphData, setGraphData] = useState(initialWeightHistory);

  const handleRangeChange = async (newRange: string) => {
    const r = newRange as '30d' | '90d' | '180d';
    setRange(r);
    try {
      const data = await getWeightHistory(hedgehogId, r);
      setGraphData(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hedgehog Selector (Simple Dropdown for MVP) */}
      <div className="flex items-center justify-between px-1">
        <Select
          defaultValue={hedgehogId}
          disabled={hedgehogs.length <= 1}
          onValueChange={(value) => {
            router.push(`/records?hedgehogId=${value}`);
          }}
        >
          <SelectTrigger className="w-[180px] border-none bg-transparent p-0 text-lg font-bold shadow-none focus:ring-0">
            <SelectValue placeholder="個体を選択" />
          </SelectTrigger>
          <SelectContent>
            {hedgehogs.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Link href={`/records/${hedgehogId}/entry`}>
          <Button
            size="sm"
            className="gap-1 rounded-full bg-[var(--color-primary)] px-4 text-white shadow-md hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            記録する
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 rounded-full bg-stone-100 p-1">
          <TabsTrigger
            value="list"
            className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm"
          >
            履歴リスト
          </TabsTrigger>
          <TabsTrigger
            value="graph"
            className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm"
          >
            グラフ
          </TabsTrigger>
          <TabsTrigger
            value="hospital"
            className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm"
          >
            通院履歴
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0 space-y-4">
          {/* List View */}
          <div className="mb-2 px-1 text-sm text-gray-500">直近の記録</div>
          <RecordList records={recentRecords} hedgehogId={hedgehogId} />

          <div className="mt-6 text-center">
            <Link
              href={`/records/history?hedgehogId=${hedgehogId}`}
              className="text-sm text-[var(--color-primary)] underline underline-offset-4"
            >
              すべての履歴を見る
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="graph" className="mt-0 space-y-4">
          {/* Graph View */}
          <div className="mb-2 flex justify-end">
            <div className="flex rounded-lg bg-stone-100 p-0.5">
              {(['30d', '90d', '180d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangeChange(r)}
                  className={`rounded-md px-3 py-1 text-xs transition-colors ${range === r ? 'bg-white font-bold text-[var(--color-primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {r.replace('d', '日')}
                </button>
              ))}
            </div>
          </div>

          <WeightChart data={graphData} range={range} />

          {/* Stats Summary (P1 idea) */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
              <div className="mb-1 text-xs text-orange-600">最高体重 (期間内)</div>
              <div className="text-lg font-bold text-orange-800">
                {graphData.length > 0 ? Math.max(...graphData.map((d) => d.weight || 0)) : '-'}{' '}
                <span className="text-xs font-normal">g</span>
              </div>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="mb-1 text-xs text-blue-600">最低体重 (期間内)</div>
              <div className="text-lg font-bold text-blue-800">
                {graphData.length > 0
                  ? Math.min(...graphData.map((d) => d.weight || 9999).filter((w) => w !== 9999))
                  : '-'}{' '}
                <span className="text-xs font-normal">g</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hospital" className="mt-0 space-y-4">
          <div className="mb-2 px-1 text-sm text-gray-500">通院の記録</div>
          <HospitalVisitList visits={hospitalVisits} />

          <div className="mt-6 flex justify-center">
            <Link href="/hospital/entry">
              <Button
                variant="outline"
                className="border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-orange-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                通院記録を追加
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
