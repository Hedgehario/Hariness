import { startOfMonth, endOfMonth, getYear, getMonth } from "date-fns";
import { getMonthlyEvents } from "./actions";
import { CalendarContainer } from "@/components/calendar/calendar-container";

export default async function HospitalPage() {
  const now = new Date();
  const year = getYear(now);
  const month = getMonth(now) + 1; // 1-indexed for action

  const initialEvents = await getMonthlyEvents(year, month);

  return (
    <main className="min-h-screen bg-[#F8F8F0] pb-24">
      <header className="px-4 py-3 bg-[#F8F8F0] border-b border-[#FFB370]/20 flex items-center shadow-sm sticky top-0 z-20">
         <h1 className="w-full text-center font-bold text-[#5D5D5D]">カレンダー</h1>
      </header>
      
      <div className="p-4">
        <CalendarContainer 
          initialEvents={initialEvents} 
          initialYear={year}
          initialMonth={month}
        />
      </div>
    </main>
  );
}
