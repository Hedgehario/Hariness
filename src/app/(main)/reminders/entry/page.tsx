import { getReminder } from '../actions';
import { ReminderEntryForm } from './reminder-entry-form';

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ReminderEntryPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id;
  
  // 編集モードの場合は既存データを取得
  const initialData = id ? await getReminder(id) : null;

  return <ReminderEntryForm initialData={initialData} />;
}
