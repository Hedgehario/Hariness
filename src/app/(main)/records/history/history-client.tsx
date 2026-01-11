'use client';

import { ChevronLeft, History, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { getRecentRecords } from '@/app/(main)/records/actions';
import { RecordList } from '@/components/records/record-list';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 30; // 1ページあたり30日分（1ヶ月単位）

type RecordData = Awaited<ReturnType<typeof getRecentRecords>>;

interface HistoryClientProps {
  hedgehogs: { id: string; name: string }[];
  initialRecords: RecordData;
  initialHedgehogId: string;
}

export function HistoryClient({
  hedgehogs,
  initialRecords,
  initialHedgehogId,
}: HistoryClientProps) {
  const searchParams = useSearchParams();
  const hedgehogId = searchParams.get('hedgehogId') || initialHedgehogId;

  const [records, setRecords] = useState<RecordData>(initialRecords);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialRecords.length >= PAGE_SIZE);
  const [isPending, startTransition] = useTransition();

  // もっと見るを押したとき
  const loadMore = useCallback(() => {
    startTransition(async () => {
      const nextPage = page + 1;
      const offset = nextPage * PAGE_SIZE;
      // 広い範囲から取得し、offset分をスキップ
      const moreRecords = await getRecentRecords(hedgehogId, offset);

      if (moreRecords.length <= records.length) {
        // これ以上データがない
        setHasMore(false);
      } else {
        setRecords(moreRecords);
        setPage(nextPage);
        setHasMore(moreRecords.length >= offset);
      }
    });
  }, [hedgehogId, page, records.length]);

  return (
    <div className="flex w-full max-w-[100vw] flex-col overflow-x-hidden bg-[#F8F8F0]">
      {/* Header - 背景色を変えて健康記録ページと差別化 */}
      <header className="sticky top-0 z-10 flex items-center border-b border-[#FFB370]/30 bg-[#FFB370]/10 px-4 py-3 shadow-sm">
        <Link
          href="/records"
          className="mr-2 rounded-full p-2 text-[#5D5D5D] hover:bg-[#FFB370]/20"
        >
          <ChevronLeft size={24} />
        </Link>
        <History className="mr-2 h-5 w-5 text-[#FFB370]" />
        <h1 className="text-lg font-bold text-[#5D5D5D]">記録履歴</h1>
      </header>

      <div className="w-full min-w-0 p-4">
        <div className="mb-6 w-full min-w-0">
          {/* 個体選択 */}
          <p className="mb-2 text-sm font-bold text-stone-500">記録するハリネズミ</p>
          <div className="flex w-full gap-2 overflow-x-auto pb-2">
            {hedgehogs.map((h) => (
              <Link key={h.id} href={`/records/history?hedgehogId=${h.id}`}>
                <Button
                  variant={h.id === hedgehogId ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                >
                  {h.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <RecordList records={records} hedgehogId={hedgehogId} />

        {records.length === 0 && (
          <div className="mt-8 text-center text-gray-500">記録がありません</div>
        )}

        {/* もっと見るボタン */}
        {hasMore && records.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isPending}
              className="rounded-full px-8"
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

        {!hasMore && records.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-400">すべての記録を表示しました</div>
        )}
      </div>
    </div>
  );
}
