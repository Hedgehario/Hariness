import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getRecentRecords } from '@/app/(main)/records/actions';

import { HistoryClient } from './history-client';

const PAGE_SIZE = 30;

export default async function RecordsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const hedgehogs = await getMyHedgehogs();
  const { hedgehogId } = await searchParams;

  if (hedgehogs.length === 0) {
    return <div className="p-8 text-center text-gray-500">個体が登録されていません</div>;
  }

  const activeHedgehogId = (hedgehogId as string) || hedgehogs[0].id;

  // 初期表示は1ページ分（20件）のみ取得
  const initialRecords = await getRecentRecords(activeHedgehogId, PAGE_SIZE);

  return (
    <HistoryClient
      hedgehogs={hedgehogs.map((h) => ({ id: h.id, name: h.name }))}
      initialRecords={initialRecords}
      initialHedgehogId={activeHedgehogId}
    />
  );
}
