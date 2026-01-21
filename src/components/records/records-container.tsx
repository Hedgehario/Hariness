'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getWeightHistory } from '@/app/(main)/records/actions';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

// タブ設定
const TABS = [
  { id: 'list', label: '日々の記録' },
  { id: 'graph', label: 'グラフ' },
  { id: 'hospital', label: '通院記録' },
] as const;

type RecordsContainerProps = {
  hedgehogId: string;
  hedgehogs: { id: string; name: string }[];
  initialWeightHistory: { date: string; weight: number }[];
  recentRecords: {
    date: string;
    weight?: { weight: number | null };
    meals: { foodType?: string; content?: string }[];
    excretion?: { stool_condition: string; urine_condition: string; details?: string };
    hasMedication?: boolean;
    hasMemo?: boolean;
    condition?: { temperature?: number; humidity?: number };
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
  const searchParams = useSearchParams();
  const [range, setRange] = useState<'30d' | '90d' | '180d' | 'all'>('30d');
  const [graphData, setGraphData] = useState(initialWeightHistory);

  // タブ管理
  const initialIndex = TABS.findIndex((t) => t.id === initialTab);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const activeTab = TABS[activeIndex];

  // URLパラメータの変更を監視（ブラウザの戻る/進むボタン対応）
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const newIndex = TABS.findIndex((t) => t.id === tabParam);
      if (newIndex >= 0 && newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  }, [searchParams, activeIndex]);

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

  const getAddButtonConfig = () => {
    if (activeTab.id === 'hospital') {
      return { href: `/hospital/entry?hedgehogId=${hedgehogId}`, label: '通院記録' };
    }
    return { href: `/records/${hedgehogId}/entry`, label: '日々の記録' };
  };
  const addButtonConfig = getAddButtonConfig();

  // タブ切り替え処理
  const handleTabChange = (index: number) => {
    setActiveIndex(index);
    const newTab = TABS[index].id;
    // 即時にURL更新（スクロール位置制御などは不要）
    router.push(`/records?hedgehogId=${hedgehogId}&tab=${newTab}`, { scroll: false });
  };

  return (
    <div className="w-full space-y-4">
      {/* Hedgehog Selector */}
      <div className="flex items-center justify-between px-1">
        <Select
          defaultValue={hedgehogId}
          disabled={hedgehogs.length <= 1}
          onValueChange={(value) => {
            router.push(`/records?hedgehogId=${value}&tab=${activeTab.id}`);
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

        {activeTab.id !== 'graph' && (
          <div className="transition-transform active:scale-95 duration-100">
            <Link href={addButtonConfig.href}>
              <Button
                size="sm"
                className={`gap-1 rounded-full px-4 text-white shadow-md ${
                  activeTab.id === 'hospital'
                    ? 'bg-[#4DB6AC] hover:bg-[#4DB6AC]/80'
                    : 'bg-[var(--color-primary)] hover:bg-orange-600'
                }`}
              >
                <Plus className="h-4 w-4" />
                {addButtonConfig.label}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* カスタムタブヘッダー（インジケータ連動） */}
      <div className="relative">
        <div className="grid grid-cols-3 rounded-full bg-stone-100 p-1">
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(index)}
              className={`relative z-10 rounded-full py-2 text-xs font-medium transition-all duration-200 active:scale-95 ${
                activeIndex === index
                  ? 'text-stone-900 font-bold'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* アニメーションするインジケータ */}
          <motion.div
            className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-white shadow-sm"
            style={{ width: `calc(${100 / TABS.length}% - 4px)` }}
            animate={{ x: `calc(${activeIndex * 100}% + ${activeIndex * 4}px)` }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </div>
      </div>

      {/* タブコンテンツ（条件付きレンダリング） */}
      <div className="mt-4 min-h-[50vh]">
        {activeTab.id === 'list' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <RecordList records={recentRecords} hedgehogId={hedgehogId} />
              <div className="mt-6 pb-8 text-center">
                <Link
                  href={`/records/history?hedgehogId=${hedgehogId}`}
                  className="text-sm text-[var(--color-primary)] underline underline-offset-4 transition-opacity active:opacity-70"
                >
                  すべての履歴を見る
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab.id === 'graph' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <div className="mb-2 flex justify-end">
                <div className="flex rounded-lg bg-stone-100 p-0.5">
                  {(['30d', '90d', '180d', 'all'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRangeChange(r)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-100 active:scale-95 ${
                        range === r
                          ? 'bg-white text-[var(--color-primary)] shadow-sm'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {r === 'all' ? '全期間' : r.replace('d', '日')}
                    </button>
                  ))}
                </div>
              </div>

              <WeightChart data={graphData} range={range} />

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
            </div>
          </div>
        )}

        {activeTab.id === 'hospital' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <HospitalVisitList visits={hospitalVisits} />
              <div className="mt-6 pb-8 text-center">
                <Link
                  href={`/hospital/history?hedgehogId=${hedgehogId}`}
                  className="text-sm text-[#4DB6AC] underline underline-offset-4 transition-opacity active:opacity-70"
                >
                  通院記録の履歴を見る
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
