import { getDailyRecords } from "@/app/(main)/records/actions";
import RecordEntryForm from "./record-entry-form";

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
  const date = searchParams.date || today.toISOString().split("T")[0];

  // データ取得
  const initialData = await getDailyRecords(hedgehogId, date);

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4">
      <h1 className="text-xl font-bold text-center mb-6 text-[var(--color-primary)]">
        記録をつける
      </h1>
      
      <RecordEntryForm 
        hedgehogId={hedgehogId}
        date={date}
        initialData={initialData}
      />
    </div>
  );
}
