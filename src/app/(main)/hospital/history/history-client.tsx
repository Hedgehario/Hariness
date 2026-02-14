'use client';

import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { getHospitalVisits } from '@/app/(main)/hospital/actions';
import { HospitalVisitList } from '@/components/records/hospital-visit-list';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const router = useRouter();
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
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F8F8F0]">
      {/* Simplified back navigation */}
      <div className="flex items-center px-4 py-2">
        <Link
          href="/records?tab=hospital"
          className="animate-press flex items-center gap-1.5 rounded-full p-2 text-stone-500 hover:bg-stone-50"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-bold">戻る</span>
        </Link>
      </div>

      <div className="w-full max-w-[100vw] px-4 py-2">
        <div className="mb-4 w-full max-w-full overflow-hidden">
          {/* 個体選択（プルダウン方式） */}
          <Select
            defaultValue={hedgehogId}
            disabled={hedgehogs.length <= 1}
            onValueChange={(value) => {
              router.push(`/hospital/history?hedgehogId=${value}`);
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
        </div>

        <HospitalVisitList visits={visits} />

        {/* もっと見るボタン */}
        {hasMore && visits.length > 0 && (
          <div className="mt-4 text-center">
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
