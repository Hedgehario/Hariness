import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getRecentRecords } from '@/app/(main)/records/actions';
import { getActiveHedgehogIdFromServer } from '@/lib/hedgehog-cookie-server';

import { HistoryClient } from './history-client';

const PAGE_SIZE = 30;

export default async function RecordsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [hedgehogs, params, cookieHedgehogId] = await Promise.all([
    getMyHedgehogs(),
    searchParams,
    getActiveHedgehogIdFromServer(),
  ]);

  if (hedgehogs.length === 0) {
    return <div className="p-8 text-center text-gray-500">ハリネズミが登録されていません</div>;
  }

  // URLパラメータ優先、なければCookie、それもなければ最初の子
  const activeHedgehogId = (params.hedgehogId as string) || cookieHedgehogId || hedgehogs[0].id;

  // 初期表示は1ページ分（20件）のみ取得
  const initialRecords = await getRecentRecords(activeHedgehogId, PAGE_SIZE);

  return (
    <HistoryClient
      key={activeHedgehogId}
      hedgehogs={hedgehogs.map((h) => ({ id: h.id, name: h.name }))}
      initialRecords={initialRecords}
      initialHedgehogId={activeHedgehogId}
    />
  );
}
