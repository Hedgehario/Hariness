import { endOfMonth, getMonth,getYear, startOfMonth } from 'date-fns';

import { CalendarContainer } from '@/components/calendar/calendar-container';

import { getMonthlyEvents } from './actions';

export default async function HospitalPage() {
  const now = new Date();
  const year = getYear(now);
  const month = getMonth(now) + 1; // 1-indexed for action

  const initialEvents = await getMonthlyEvents(year, month);

  return (
    <main className="min-h-screen bg-[#F8F8F0] pb-24">
      <div className="p-4">
        <CalendarContainer initialEvents={initialEvents} initialYear={year} initialMonth={month} />
      </div>
    </main>
  );
}
