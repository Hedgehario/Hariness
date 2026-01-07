'use client';

import 'react-day-picker/dist/style.css';

import { format, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, useTransition } from 'react';
import { DayPicker } from 'react-day-picker';

import { CalendarEventDisplay, getMonthlyEvents } from '@/app/(main)/calendar/actions';
import { cn } from '@/lib/utils';

import { DayEventsSheet } from './day-events-sheet';

type Props = {
  initialEvents: CalendarEventDisplay[];
  initialYear: number;
  initialMonth: number;
};

export function CalendarContainer({ initialEvents, initialYear, initialMonth }: Props) {
  const [events, setEvents] = useState<CalendarEventDisplay[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(initialYear, initialMonth - 1));
  const [, startTransition] = useTransition();

  // Fetch events when month changes
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    startTransition(async () => {
      const newEvents = await getMonthlyEvents(getYear(month), getMonth(month) + 1);
      setEvents(newEvents);
    });
  };

  // Custom Day Render to show dots
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomDay = (props: any) => {
    const { date, activeModifiers } = props;
    const dayEvents = events.filter((e) => isSameDay(parseISO(e.date), date));
    const hasHospital = dayEvents.some((e) => e.type === 'hospital');
    const hasGeneric = dayEvents.some((e) => e.type === 'event');

    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center py-1">
        <span className={cn('text-sm', activeModifiers.selected && 'font-bold text-white')}>
          {format(date, 'd')}
        </span>
        <div className="mt-1 flex gap-0.5">
          {hasHospital && <div className="h-1.5 w-1.5 rounded-full bg-[#FF7070]" />}
          {hasGeneric && <div className="h-1.5 w-1.5 rounded-full bg-[#B0D67A]" />}
        </div>
      </div>
    );
  };

  const selectedEvents = selectedDate
    ? events.filter((e) => isSameDay(parseISO(e.date), selectedDate))
    : [];

  return (
    <div className="flex flex-col gap-4 lg:grid lg:h-[calc(100vh-100px)] lg:grid-cols-[1fr_350px] lg:grid-rows-1 lg:gap-6 xl:grid-cols-[1fr_400px]">
      {/* Calendar Section */}
      <div className="flex w-full flex-col gap-4 overflow-hidden lg:h-full">
        <div className="flex-1 rounded-xl border border-[#5D5D5D]/10 bg-white p-2 shadow-sm sm:p-4 lg:flex lg:flex-col lg:justify-center">
          <style>{`
            .rdp { --rdp-cell-size: 35px; --rdp-accent-color: #FFB370; margin: 0; }
            .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #F8F8F0; }
            @media (min-width: 380px) {
              .rdp { --rdp-cell-size: 40px; }
            }
            @media (min-width: 1024px) {
              .rdp { --rdp-cell-size: 50px; } 
            }
            /* Custom navigation spacing */
            .rdp-nav_button { width: 30px; height: 30px; }
          `}</style>

          <div className="flex w-full justify-center overflow-x-auto">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={handleMonthChange}
              locale={ja}
              components={{
                DayContent: CustomDay,
              } as any}
              className="mx-auto"
              modifiersClassNames={{
                selected: 'bg-[#FFB370] text-white rounded-full',
                today: 'font-bold text-[#FFB370]',
              }}
              styles={{
                head_cell: { color: '#5D5D5D', opacity: 0.6, fontSize: '0.8rem' },
                caption: { color: '#5D5D5D', fontWeight: 'bold' },
              }}
            />
          </div>

          <div className="mt-6 border-t border-[#5D5D5D]/10 pt-4 text-center lg:mt-auto">
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF7070]" />
                <span className="text-sm text-[#5D5D5D]">通院</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#B0D67A]" />
                <span className="text-sm text-[#5D5D5D]">イベント</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#5D5D5D]/60 lg:hidden">
              日付をタップすると予定が表示されます
            </p>
          </div>
        </div>
      </div>

      {/* Events Panel (Bottom Sheet on Mobile, Side Panel on Desktop) */}
      <div className="animate-in slide-in-from-bottom min-h-[300px] flex-1 rounded-t-xl border-t border-[#5D5D5D]/10 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] duration-300 lg:h-full lg:animate-none lg:rounded-xl lg:border lg:shadow-sm">
        <DayEventsSheet date={selectedDate} events={selectedEvents} />
      </div>
    </div>
  );
}
