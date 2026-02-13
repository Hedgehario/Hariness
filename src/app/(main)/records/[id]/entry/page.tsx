import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getDailyRecords, getPreviousEnvironmentData } from '@/app/(main)/records/actions';

import RecordEntryForm from './record-entry-form';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
};

export default async function RecordEntryPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const hedgehogId = params.id;

  // 日付の決定 (指定がなければ今日) (JST考慮: ここではサーバー時間のISO日付を使用、本番ではTimezone注意)
  const today = new Date();
  const date = searchParams.date || today.toISOString().split('T')[0];

  // データ取得（当日のデータ + 前日の参考データ）
  const [initialData, hedgehogs, previousData] = await Promise.all([
    getDailyRecords(hedgehogId, date),
    getMyHedgehogs(),
    getPreviousEnvironmentData(hedgehogId, date),
  ]);

  return (
    <main className="bg-[#F8F8F0]">
      <RecordEntryForm
        key={`${hedgehogId}-${date}`}
        hedgehogId={hedgehogId}
        date={date}
        initialData={{
          ...initialData,
          weight: (initialData.weight ?? { weight: null }) as { weight: number | null },
          condition: initialData.condition ?? undefined,
        }}
        previousData={previousData}
        hedgehogs={hedgehogs}
      />
    </main>
  );
}
