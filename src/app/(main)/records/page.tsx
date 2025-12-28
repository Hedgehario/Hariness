import { getMyHedgehogs } from "@/app/(main)/hedgehogs/actions";
import { getWeightHistory, getRecentRecords, getHospitalHistory } from "@/app/(main)/records/actions";
import { RecordsContainer } from "@/components/records/records-container";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RecordsPage() {
  const hedgehogs = await getMyHedgehogs();

  if (hedgehogs.length === 0) {
     return (
        <div className="p-8 text-center space-y-4">
             <p className="text-gray-500">個体が登録されていません</p>
             <Link href="/hedgehogs/new">
                <Button>個体を登録する</Button>
             </Link>
        </div>
     );
  }

  // Default to first hedgehog
  const activeHedgehogId = hedgehogs[0].id;

  // Parallel Fetch
  const [weightHistory, recentRecords, hospitalVisits] = await Promise.all([
      getWeightHistory(activeHedgehogId, '30d'),
      getRecentRecords(activeHedgehogId, 30),
      getHospitalHistory(activeHedgehogId)
  ]);

  return (
    <div className="p-4 pb-20">
      <RecordsContainer 
         hedgehogId={activeHedgehogId}
         hedgehogs={hedgehogs}
         initialWeightHistory={weightHistory || []}
         recentRecords={recentRecords || []}
         hospitalVisits={hospitalVisits || []}
      />
    </div>
  );
}
