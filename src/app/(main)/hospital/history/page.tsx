import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getHospitalVisits } from '@/app/(main)/hospital/actions';

import { HospitalHistoryClient } from './history-client';

const PAGE_SIZE = 30;

export default async function HospitalHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const hedgehogs = await getMyHedgehogs();
  const { hedgehogId } = await searchParams;

  if (hedgehogs.length === 0) {
    return <div className="p-8 text-center text-gray-500">ハリネズミが登録されていません</div>;
  }

  const activeHedgehogId = (hedgehogId as string) || hedgehogs[0].id;

  // 初期表示は1ページ分のみ取得
  const initialVisits = await getHospitalVisits(activeHedgehogId, PAGE_SIZE);

  return (
    <HospitalHistoryClient
      key={activeHedgehogId}
      hedgehogs={hedgehogs.map((h) => ({ id: h.id, name: h.name }))}
      initialVisits={initialVisits}
      initialHedgehogId={activeHedgehogId}
    />
  );
}
