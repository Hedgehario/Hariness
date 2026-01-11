'use client';

import { ChevronLeft, History, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { getHospitalVisits } from '@/app/(main)/hospital/actions';
import { HospitalVisitList } from '@/components/records/hospital-visit-list';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 30;

type VisitData = Awaited<ReturnType<typeof getHospitalVisits>>;

interface HospitalHistoryClientProps {
  hedgehogs: { id: string; name: string }[];
  initialVisits: VisitData;
  initialHedgehogId: string;
}

export function HospitalHistoryClient({
  hedgehogs,
  initialVisits,
  initialHedgehogId,
}: HospitalHistoryClientProps) {
  const searchParams = useSearchParams();
  const hedgehogId = searchParams.get('hedgehogId') || initialHedgehogId;

  const [visits, setVisits] = useState<VisitData>(initialVisits);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialVisits.length >= PAGE_SIZE);
  const [isPending, startTransition] = useTransition();

  // もっと見るを押したとき
  const loadMore = useCallback(() => {
    startTransition(async () => {
      const nextPage = page + 1;
      const offset = nextPage * PAGE_SIZE;
      const moreVisits = await getHospitalVisits(hedgehogId, offset);

      if (moreVisits.length <= visits.length) {
        setHasMore(false);
      } else {
        setVisits(moreVisits);
        setPage(nextPage);
        setHasMore(moreVisits.length >= offset);
      }
    });
  }, [hedgehogId, page, visits.length]);

  return (
    <div className="flex w-full max-w-[100vw] flex-col overflow-x-hidden bg-[#F8F8F0]">
      {/* Header - 通院記録のテーマカラー */}
      <header className="sticky top-0 z-10 flex items-center border-b border-[#4DB6AC]/30 bg-[#4DB6AC]/10 px-4 py-3 shadow-sm">
        <Link
          href="/records?tab=hospital"
          className="mr-2 rounded-full p-2 text-[#5D5D5D] hover:bg-[#4DB6AC]/20"
        >
          <ChevronLeft size={24} />
        </Link>
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#4DB6AC]/20 text-[#4DB6AC]">
          <History size={16} />
        </div>
        <h1 className="flex flex-col text-lg leading-tight font-bold text-[#5D5D5D]">
          <span>記録履歴</span>
          <span className="text-[10px] font-normal text-[#5D5D5D]/60">通院の記録</span>
        </h1>
      </header>

      <div className="w-full min-w-0 p-4">
        <div className="mb-6 w-full min-w-0">
          {/* 個体選択 */}
          <p className="mb-2 text-sm font-bold text-stone-500">記録するハリネズミ</p>
          <div className="flex w-full gap-2 overflow-x-auto pb-2">
            {hedgehogs.map((h) => (
              <Link key={h.id} href={`/hospital/history?hedgehogId=${h.id}`}>
                <Button
                  variant={h.id === hedgehogId ? 'default' : 'outline'}
                  size="sm"
                  className={`max-w-[150px] truncate rounded-full ${h.id === hedgehogId ? 'bg-[#4DB6AC] hover:bg-[#4DB6AC]/80' : ''}`}
                >
                  <span className="truncate">{h.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <HospitalVisitList visits={visits} />

        {visits.length === 0 && (
          <div className="mt-8 text-center text-gray-500">通院記録がありません</div>
        )}

        {/* もっと見るボタン */}
        {hasMore && visits.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isPending}
              className="rounded-full border-[#4DB6AC]/40 px-8 text-[#4DB6AC] hover:bg-[#4DB6AC]/10"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  読み込み中...
                </>
              ) : (
                'もっと見る'
              )}
            </Button>
          </div>
        )}

        {!hasMore && visits.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-400">
            すべての通院記録を表示しました
          </div>
        )}
      </div>
    </div>
  );
}
