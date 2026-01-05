import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getRecentRecords } from '@/app/(main)/records/actions';
import { RecordList } from '@/components/records/record-list';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default async function RecordsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const hedgehogs = await getMyHedgehogs();
  const { hedgehogId } = await searchParams;

  if (hedgehogs.length === 0) {
    return <div>個体が登録されていません</div>;
  }

  const activeHedgehogId = (hedgehogId as string) || hedgehogs[0].id;
  
  // Fetch more records for history (e.g., last 90 days)
  const records = await getRecentRecords(activeHedgehogId, 90);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F0]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center border-b border-stone-100 bg-white/80 px-4 py-3 backdrop-blur-md">
        <Link href="/records" className="mr-2 rounded-full p-2 text-stone-500 hover:bg-stone-100">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold text-stone-700">記録履歴</h1>
      </header>

      <div className="p-4">
        <div className="mb-6">
             {/* Hedgehog Selector Reuse (simplified) */}
             {/* Note: Ideally this should be a client component or use router for query param */}
             {/* For now, just a list */}
             <p className="mb-2 text-sm font-bold text-stone-500">対象の個体</p>
             {/* We can't easily use client-side select here without client component wrapper, 
                 but let's just show who is active for now or use links. 
                 Or better, just reuse the pattern from RecordsPage but we need 'use client' for Select logic typically,
                 unless we make this a server component and use links for selection.
             */}
             <div className="flex gap-2 overflow-x-auto pb-2">
                {hedgehogs.map(h => (
                    <Link key={h.id} href={`/records/history?hedgehogId=${h.id}`}>
                        <Button 
                            variant={h.id === activeHedgehogId ? "default" : "outline"}
                            size="sm"
                            className="rounded-full"
                        >
                            {h.name}
                        </Button>
                    </Link>
                ))}
             </div>
        </div>

        <RecordList records={records} hedgehogId={activeHedgehogId} />
        
        {records.length === 0 && (
            <div className="mt-8 text-center text-gray-500">
                記録がありません
            </div>
        )}
      </div>
    </div>
  );
}
