'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
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

// 遅延ロード: recharts を使う重いコンポーネント
const WeightChart = dynamic(() => import('./weight-chart').then((mod) => mod.WeightChart), {
  loading: () => (
    <div className="flex h-[200px] items-center justify-center rounded-lg bg-stone-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-[var(--color-primary)]" />
    </div>
  ),
  ssr: false,
});

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
    title: string | null;
    diagnosis: string | null;
    treatment: string | null;
    medicine_prescription: { name: string; note?: string }[] | null;
    next_visit_date: string | null;
  }[];
  initialTab?: string;
};

export function RecordsContainer({
  hedgehogId,
  hedgehogs,
  initialWeightHistory,
  recentRecords,
  hospitalVisits,
  initialTab = 'list',
}: RecordsContainerProps) {
  const router = useRouter();
  const [range, setRange] = useState<'30d' | '90d' | '180d' | 'all'>('30d');
  const [graphData, setGraphData] = useState(initialWeightHistory);

  const handleRangeChange = async (newRange: string) => {
    const r = newRange as '30d' | '90d' | '180d' | 'all';
    setRange(r);
    try {
      const data = await getWeightHistory(hedgehogId, r);
      setGraphData(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const [activeTab, setActiveTab] = useState(initialTab);

  // Dynamic button based on active tab
  const getAddButtonConfig = () => {
    if (activeTab === 'hospital') {
      return { href: `/hospital/entry?hedgehogId=${hedgehogId}`, label: '通院記録' };
    }
    return { href: `/records/${hedgehogId}/entry`, label: '日々の記録' };
  };
  const addButtonConfig = getAddButtonConfig();

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
          <SelectTrigger className="w-[180px] border-none bg-transparent p-0 text-lg font-bold shadow-none focus:ring-0 [&_svg]:h-10 [&_svg]:w-10 [&_svg]:opacity-50">
            <SelectValue placeholder="選んでください" />
          </SelectTrigger>
          <SelectContent>
            {hedgehogs.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab !== 'graph' && (
          <Link href={addButtonConfig.href}>
            <Button
              size="sm"
              className={`gap-1 rounded-full px-4 text-white shadow-md ${
                activeTab === 'hospital'
                  ? 'bg-[#4DB6AC] hover:bg-[#4DB6AC]/80'
                  : 'bg-[var(--color-primary)] hover:bg-orange-600'
              }`}
            >
              <Plus className="h-4 w-4" />
              {addButtonConfig.label}
            </Button>
          </Link>
        )}
      </div>

      <Tabs
        defaultValue={initialTab}
        value={activeTab}
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4 grid w-full grid-cols-3 rounded-full bg-stone-100 p-1">
          <TabsTrigger
            value="list"
            className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm"
          >
            日々の記録
          </TabsTrigger>
          <TabsTrigger
            value="graph"
            className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm"
          >
            グラフ
          </TabsTrigger>
          <TabsTrigger
            value="hospital"
            className="rounded-full text-xs data-[state=active]:bg-white data-[state=active]:text-[#4DB6AC] data-[state=active]:shadow-sm"
          >
            通院記録
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0 space-y-4">
          {/* List View */}
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
              {(['30d', '90d', '180d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangeChange(r)}
                  className={`rounded-md px-3 py-1 text-xs transition-colors ${range === r ? 'bg-white font-bold text-[var(--color-primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {r === 'all' ? '全期間' : r.replace('d', '日')}
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
          <HospitalVisitList visits={hospitalVisits} />

          <div className="mt-6 text-center">
            <Link
              href={`/hospital/history?hedgehogId=${hedgehogId}`}
              className="text-sm text-[#4DB6AC] underline underline-offset-4"
            >
              すべての履歴を見る
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
