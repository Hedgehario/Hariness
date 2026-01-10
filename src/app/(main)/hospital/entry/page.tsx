import { format } from 'date-fns';

import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import { getHospitalVisit, getHospitalVisitByDate } from '@/app/(main)/hospital/actions';

import HospitalVisitForm from './hospital-visit-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function HospitalVisitEntryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams.id as string | undefined;
  const date = resolvedSearchParams.date as string | undefined;
  const hedgehogIdParam = resolvedSearchParams.hedgehogId as string | undefined;

  const hedgehogs = await getMyHedgehogs();

  let initialData = undefined;
  if (id) {
    try {
      initialData = await getHospitalVisit(id);
    } catch (e) {
      // Handle error or redirect
      console.error(e);
    }
  } else if (hedgehogs.length > 0) {
    // Check for existing record for default hedgehog (first one) and date (today/selected)
    // to prevent double render/flicker on client
    // Use exact same date logic as Daily Records to match Server/Client behavior
    // Daily Records uses: const date = searchParams.date || today.toISOString().split('T')[0];
    const today = new Date();
    // JSTで正しい日付を取得（toISOStringはUTCなので夜はズレる）
    const checkDate = date || format(today, 'yyyy-MM-dd');

    // Use param hedgehogId or default to first one
    const targetHedgehogId = hedgehogIdParam || hedgehogs[0].id;

    // Direct SSR fetch without redirect (avoids flicker)
    const existingData = await getHospitalVisitByDate(targetHedgehogId, checkDate);
    if (existingData) {
      initialData = existingData;
    }
  }

  // Use targetHedgehogId for key to ensure re-mount on hedgehog change as well
  const currentHedgehogId = id
    ? initialData?.hedgehog_id
    : hedgehogs.length > 0
      ? hedgehogIdParam || hedgehogs[0].id
      : '';

  return (
    <main className="flex h-screen flex-col bg-[#F8F8F0]">
      <HospitalVisitForm
        key={`${currentHedgehogId}-${date || 'new'}`}
        initialData={initialData}
        hedgehogs={hedgehogs || []}
        selectedDate={date}
      />
    </main>
  );
}
