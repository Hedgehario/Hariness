'use client';

import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { getRecentRecords } from '@/app/(main)/records/actions';
import { RecordList } from '@/components/records/record-list';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const router = useRouter();
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
    <div className="flex w-full flex-col overflow-x-hidden bg-[#F8F8F0]">
      {/* Simplified back navigation */}
      <div className="flex items-center px-4 py-2">
        <Link
          href="/records"
          className="animate-press flex items-center gap-1.5 rounded-full p-2 text-stone-500 hover:bg-stone-50"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-bold">戻る</span>
        </Link>
      </div>

      {/* Main content container with max-width constraint */}
      <div className="w-full max-w-[100vw] px-4 py-2">
        <div className="mb-4 w-full max-w-full overflow-hidden">
          {/* 個体選択（プルダウン方式） */}
          <Select
            defaultValue={hedgehogId}
            disabled={hedgehogs.length <= 1}
            onValueChange={(value) => {
              router.push(`/records/history?hedgehogId=${value}`);
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

        <RecordList records={records} hedgehogId={hedgehogId} />

        {/* もっと見るボタン */}
        {hasMore && records.length > 0 && (
          <div className="mt-4 text-center">
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
