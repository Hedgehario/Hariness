import { getEvent } from '@/app/(main)/calendar/actions';
import EventForm from './event-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function EventEntryPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const date =
    typeof searchParams.date === 'string'
      ? searchParams.date
      : new Date().toISOString().split('T')[0];
  const id = typeof searchParams.id === 'string' ? searchParams.id : undefined;

  let initialData = null;
  if (id) {
    initialData = await getEvent(id);
  }

  return <EventForm initialDate={date} initialData={initialData} />;
}
