import { getMyHedgehogsDropdown, getHospitalVisit } from '@/app/(main)/hospital/actions';
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

  const hedgehogs = await getMyHedgehogsDropdown();

  let initialData = undefined;
  if (id) {
    try {
      initialData = await getHospitalVisit(id);
    } catch (e) {
      // Handle error or redirect
      console.error(e);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-[#F8F8F0]">
      <HospitalVisitForm
        initialData={initialData}
        hedgehogs={hedgehogs || []}
        selectedDate={date}
      />
    </main>
  );
}
