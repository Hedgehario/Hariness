import { getMonth, getYear } from 'date-fns';

import { CalendarContainer } from '@/components/calendar/calendar-container';

import { getMonthlyEvents } from './actions';

export default async function HospitalPage() {
  const now = new Date();
  const year = getYear(now);
  const month = getMonth(now) + 1; // 1-indexed for action

  const initialEvents = await getMonthlyEvents(year, month);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F8F8F0]">
      <div className="mx-auto max-w-full p-4">
        <CalendarContainer initialEvents={initialEvents} initialYear={year} initialMonth={month} />
      </div>
    </main>
  );
}
