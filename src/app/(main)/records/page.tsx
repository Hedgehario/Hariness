import type { Metadata } from 'next';
import Link from 'next/link';

import { getMyHedgehogs } from '@/app/(main)/hedgehogs/actions';
import {
  getHospitalHistory,
  getRecentRecords,
  getWeightHistory,
} from '@/app/(main)/records/actions';
import { RecordsContainer } from '@/components/records/records-container';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '健康記録',
};

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const hedgehogs = await getMyHedgehogs();

  if (hedgehogs.length === 0) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-gray-500">個体が登録されていません</p>
        <Link href="/hedgehogs/new">
          <Button>個体を登録する</Button>
        </Link>
      </div>
    );
  }

  const { hedgehogId, tab } = await searchParams;
  const requestedId = typeof hedgehogId === 'string' ? hedgehogId : undefined;
  const initialTab = typeof tab === 'string' ? tab : 'list';

  // Validate that the requested ID belongs to the user
  const validHedgehog = hedgehogs.find((h) => h.id === requestedId);
  const activeHedgehogId = validHedgehog ? validHedgehog.id : hedgehogs[0].id;

  // Parallel Fetch
  const [weightHistory, recentRecords, hospitalVisits] = await Promise.all([
    getWeightHistory(activeHedgehogId, '30d'),
    getRecentRecords(activeHedgehogId, 7),
    getHospitalHistory(activeHedgehogId),
  ]);

  return (
    <div className="p-4 pb-20">
      <RecordsContainer
        hedgehogId={activeHedgehogId}
        hedgehogs={hedgehogs}
        initialWeightHistory={weightHistory || []}
        recentRecords={recentRecords || []}
        hospitalVisits={hospitalVisits || []}
        initialTab={initialTab}
      />
    </div>
  );
}
