'use client';

import 'react-day-picker/dist/style.css';

import { format, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, useTransition } from 'react';
import { DayPicker } from 'react-day-picker';

import { CalendarEventDisplay, getMonthlyEvents } from '@/app/(main)/calendar/actions';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { DayEventsSheet } from './day-events-sheet';

type Props = {
  initialEvents: CalendarEventDisplay[];
  initialYear: number;
  initialMonth: number;
};

export function CalendarContainer({ initialEvents, initialYear, initialMonth }: Props) {
  const [events, setEvents] = useState<CalendarEventDisplay[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(initialYear, initialMonth - 1));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [, startTransition] = useTransition();

  // 月変更時にイベントを取得
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    startTransition(async () => {
      const newEvents = await getMonthlyEvents(getYear(month), getMonth(month) + 1);
      setEvents(newEvents);
    });
  };

  // 日付選択時にシートを開く
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsSheetOpen(true);
    }
  };

  // カスタム日付レンダリング（ドット表示）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomDay = (props: any) => {
    const { date, activeModifiers } = props;
    const dayEvents = events.filter((e) => isSameDay(parseISO(e.date), date));
    const hasHospital = dayEvents.some((e) => e.type === 'hospital');
    const hasGeneric = dayEvents.some((e) => e.type === 'event');

    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center py-1">
        <span className={cn('text-base', activeModifiers.selected && 'font-bold text-white')}>
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
    <>
      {/* フルスクリーンカレンダー */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col rounded-xl border border-[#5D5D5D]/10 bg-white p-3 shadow-sm sm:p-4">
          <style>{`
            /* react-day-picker v8+ クラス名を使用 */
            .rdp-root { 
              --rdp-accent-color: #FFB370; 
              width: 100% !important;
              max-width: 600px;
              margin: 0 auto;
            }
            .rdp-months {
              width: 100% !important;
            }
            .rdp-month { 
              width: 100% !important; 
            }
            .rdp-month_caption {
              margin-bottom: 16px;
              font-weight: bold;
              font-size: 1.125rem;
              color: #5D5D5D;
              text-align: center;
            }
            .rdp-month_grid { 
              width: 100% !important; 
              table-layout: fixed;
            }
            .rdp-weekdays {
              display: grid !important;
              grid-template-columns: repeat(7, 1fr);
              margin-bottom: 8px;
            }
            .rdp-weekday {
              text-align: center;
              font-size: 0.875rem;
              font-weight: bold;
              color: #5D5D5D;
              opacity: 0.6;
              padding: 8px 0;
            }
            .rdp-weeks {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .rdp-week {
              display: grid !important;
              grid-template-columns: repeat(7, 1fr);
              gap: 4px;
            }
            .rdp-day {
              display: flex;
              align-items: center;
              justify-content: center;
              aspect-ratio: 1;
              min-height: 52px;
            }
            .rdp-day_button { 
              width: 100% !important; 
              height: 100% !important;
              min-width: 44px;
              min-height: 44px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background-color 0.15s;
              font-size: 1rem;
            }
            .rdp-day_button:hover:not([disabled]) { 
              background-color: #F8F8F0; 
            }
            .rdp-selected .rdp-day_button {
              background-color: #FFB370 !important;
              color: white;
            }
            .rdp-today:not(.rdp-selected) .rdp-day_button {
              font-weight: bold;
              color: #FFB370;
            }
            .rdp-outside .rdp-day_button {
              opacity: 0.4;
            }
            @media (min-width: 640px) {
              .rdp-day { min-height: 56px; }
              .rdp-day_button { min-width: 50px; min-height: 50px; font-size: 1.0625rem; }
            }
            @media (min-width: 768px) {
              .rdp-root { max-width: 500px; }
              .rdp-day { min-height: 60px; }
            }
            .rdp-nav { 
              gap: 8px; 
            }
            .rdp-button_previous,
            .rdp-button_next { 
              width: 36px; 
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .rdp-button_previous:hover,
            .rdp-button_next:hover {
              background-color: #F8F8F0;
            }
          `}</style>

          <div className="flex flex-col overflow-hidden">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={handleMonthChange}
              locale={ja}
              components={{
                DayContent: CustomDay,
              } as any}
              className="w-full"
              modifiersClassNames={{
                selected: 'bg-[#FFB370] text-white rounded-full',
                today: 'font-bold text-[#FFB370]',
              }}
              styles={{
                head_cell: { color: '#5D5D5D', opacity: 0.6, fontSize: '0.875rem', fontWeight: 'bold' },
                caption: { color: '#5D5D5D', fontWeight: 'bold', fontSize: '1.125rem', paddingBottom: '8px' },
              }}
            />
          </div>

          {/* 凡例 */}
          <div className="mt-4 border-t border-[#5D5D5D]/10 pt-4">
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
            <p className="mt-2 text-center text-xs text-[#5D5D5D]/60">
              日付をタップすると予定が表示されます
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-0"
        >
          <SheetTitle className="sr-only">イベント一覧</SheetTitle>
          <SheetDescription className="sr-only">
            選択した日付のイベントを表示します
          </SheetDescription>
          <div className="p-4">
            <DayEventsSheet date={selectedDate} events={selectedEvents} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
