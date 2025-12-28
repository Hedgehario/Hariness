"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { WeightChart } from "./weight-chart";
import { RecordList } from "./record-list";
import { getWeightHistory } from "@/app/(main)/records/actions";

type RecordsContainerProps = {
  hedgehogId: string;
  hedgehogs: any[]; // For switching hedgehog (P1 feature, but good to have UI placeholder)
  initialWeightHistory: any[];
  recentRecords: any[];
};

export function RecordsContainer({ 
  hedgehogId, 
  hedgehogs, 
  initialWeightHistory, 
  recentRecords 
}: RecordsContainerProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [range, setRange] = useState<'30d' | '90d' | '180d'>('30d');
  const [graphData, setGraphData] = useState(initialWeightHistory);
  const [isFetching, setIsFetching] = useState(false);

  const activeHedgehog = hedgehogs.find(h => h.id === hedgehogId) || hedgehogs[0];

  const handleRangeChange = async (newRange: string) => {
    const r = newRange as '30d' | '90d' | '180d';
    setRange(r);
    setIsFetching(true);
    try {
        const data = await getWeightHistory(hedgehogId, r);
        setGraphData(data || []);
    } catch (e) {
        console.error(e);
    } finally {
        setIsFetching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hedgehog Selector (Simple Dropdown for MVP) */}
      <div className="flex justify-between items-center px-1">
         <Select defaultValue={hedgehogId} disabled={hedgehogs.length <= 1}>
            <SelectTrigger className="w-[180px] font-bold border-none shadow-none bg-transparent p-0 text-lg focus:ring-0">
                <SelectValue placeholder="個体を選択" />
            </SelectTrigger>
            <SelectContent>
                {hedgehogs.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
            </SelectContent>
         </Select>
         
         <Link href={`/records/${hedgehogId}/entry`}>
            <Button size="sm" className="rounded-full bg-[var(--color-primary)] hover:bg-orange-600 text-white shadow-md gap-1 px-4">
                <Plus className="w-4 h-4" />
                記録する
            </Button>
         </Link>
      </div>

      <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-stone-100 p-1 rounded-full">
          <TabsTrigger value="list" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm">履歴リスト</TabsTrigger>
          <TabsTrigger value="graph" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm">グラフ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0 space-y-4">
             {/* List View */}
             <div className="px-1 mb-2 text-sm text-gray-500">
                直近の記録
             </div>
             <RecordList records={recentRecords} hedgehogId={hedgehogId} />
             
             <div className="text-center mt-6">
                <Link href={`/records/history?hedgehogId=${hedgehogId}`} className="text-sm text-[var(--color-primary)] underline underline-offset-4">
                    すべての履歴を見る
                </Link>
             </div>
        </TabsContent>
        
        <TabsContent value="graph" className="mt-0 space-y-4">
             {/* Graph View */}
             <div className="flex justify-end mb-2">
                 <div className="flex bg-stone-100 rounded-lg p-0.5">
                     {(['30d', '90d', '180d'] as const).map((r) => (
                         <button
                            key={r}
                            onClick={() => handleRangeChange(r)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${range === r ? 'bg-white text-[var(--color-primary)] shadow-sm font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                            {r.replace('d', '日')}
                         </button>
                     ))}
                 </div>
             </div>
             
             <WeightChart data={graphData} range={range} />
             
             {/* Stats Summary (P1 idea) */}
             <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <div className="text-xs text-orange-600 mb-1">最高体重 (期間内)</div>
                    <div className="font-bold text-lg text-orange-800">
                        {graphData.length > 0 ? Math.max(...graphData.map(d => d.weight || 0)) : '-'} <span className="text-xs font-normal">g</span>
                    </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <div className="text-xs text-blue-600 mb-1">最低体重 (期間内)</div>
                    <div className="font-bold text-lg text-blue-800">
                        {graphData.length > 0 ? Math.min(...graphData.map(d => d.weight || 9999).filter(w => w !== 9999)) : '-'} <span className="text-xs font-normal">g</span>
                    </div>
                </div>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
