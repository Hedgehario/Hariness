'use client';

import 'react-day-picker/dist/style.css';

import { format, getMonth, getYear, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useEffect, useState, useTransition } from 'react';
import { DayPicker } from 'react-day-picker';
import { Cake } from 'lucide-react';

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
  const [isMounted, setIsMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // イベント種別ごとの日付リストを作成（modifiers用）
  const hospitalDates = events
    .filter((e) => e.type === 'hospital')
    .map((e) => parseISO(e.date));

  const eventDates = events
    .filter((e) => e.type === 'event')
    .map((e) => parseISO(e.date));

  const birthdayDates = events
    .filter((e) => e.type === 'birthday')
    .map((e) => parseISO(e.date));

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
              position: relative; 
              z-index: 1;
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

            /* --- イベントドット（Pseudo-element with box-shadow） --- */
            /* Using ::before for dots */
            
            .has-hospital .rdp-day_button::before,
            .has-event .rdp-day_button::before {
              content: '';
              position: absolute;
              bottom: 4px;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              left: 50%;
              transform: translateX(-50%);
              z-index: 2;
            }

            /* A. 通院のみ: Medical Teal (#4DB6AC) */
            .has-hospital:not(.has-event) .rdp-day_button::before {
              background-color: #4DB6AC;
            }

            /* B. イベントのみ: Soft Pink (#FF8FA3) */
            .has-event:not(.has-hospital) .rdp-day_button::before {
              background-color: #FF8FA3;
            }

            /* C. 両方あり */
            /* メイン(左)をイベント、サブ(右)を通院とする */
            .has-hospital.has-event .rdp-day_button::before {
              background-color: #FF8FA3; /* イベント(Pink) */
              margin-left: -5px; /* 中心から左へ */
              box-shadow: 10px 0 0 #4DB6AC; /* 中心から右へ (5+5=10px) */
            }


            /* --- 誕生日アイコン (::after) --- */
            /* 左上に変更して「バッジっぽさ」を軽減 */
            .has-birthday .rdp-day_button::after {
              content: '';
              position: absolute;
              top: 2px;
              left: 2px; /* 左上 */
              width: 14px;
              height: 14px;
              /* Lucide 'Cake' icon SVG (Stroke: #FFB370) */
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFB370' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8'/%3E%3Cpath d='M4 16s.5-1 2-1 2.5 1 4 1 2.5-1 4-1 2.5 1 4 1 2-1 2-1'/%3E%3Cpath d='M2 21h20'/%3E%3Cpath d='M7 8v2'/%3E%3Cpath d='M12 8v2'/%3E%3Cpath d='M17 8v2'/%3E%3Cpath d='M7 4h.01'/%3E%3Cpath d='M12 4h.01'/%3E%3Cpath d='M17 4h.01'/%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-size: contain;
              pointer-events: none;
              z-index: 3;
            }
            
            @media (max-width: 640px) {
              .has-birthday .rdp-day_button::after {
                 width: 10px;
                 height: 10px;
              }
            }


            @media (min-width: 640px) {
              .rdp-day { min-height: 56px; }
              .rdp-day_button { min-width: 50px; min-height: 50px; font-size: 1.0625rem; }
            }
            @media (min-width: 768px) {
              .rdp-root { max-width: 500px; }
              .rdp-day { min-height: 60px; }
            }
            
            .rdp-nav { gap: 8px; }
            .rdp-button_previous, .rdp-button_next { 
              width: 36px; height: 36px; border-radius: 50%; 
              display: flex; align-items: center; justify-content: center; 
            }
            .rdp-button_previous:hover, .rdp-button_next:hover { background-color: #F8F8F0; }
          `}</style>
          
          <div className="flex flex-col overflow-hidden">
            {isMounted ? (
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                locale={ja}
                modifiers={{
                  hasHospital: hospitalDates,
                  hasEvent: eventDates,
                  hasBirthday: birthdayDates,
                }}
                modifiersClassNames={{
                  selected: 'bg-[#FFB370] text-white rounded-full',
                  today: 'font-bold text-[#FFB370]',
                  hasHospital: 'has-hospital',
                  hasEvent: 'has-event',
                  hasBirthday: 'has-birthday',
                }}
                className="w-full"
                styles={{
                  head_cell: { color: '#5D5D5D', opacity: 0.6, fontSize: '0.875rem', fontWeight: 'bold' },
                  caption: { color: '#5D5D5D', fontWeight: 'bold', fontSize: '1.125rem', paddingBottom: '8px', position: 'relative' },
                }}
              />
            ) : (
              <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-stone-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-[#FFB370]" />
              </div>
            )}
          </div>

          {/* 凡例 */}
          <div className="mt-4 border-t border-[#5D5D5D]/10 pt-4">
            <div className="flex justify-center flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#4DB6AC]" />
                <span className="text-sm text-[#5D5D5D]">通院</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF8FA3]" />
                <span className="text-sm text-[#5D5D5D]">イベント</span>
              </div>
              <div className="flex items-center gap-2">
                <Cake className="h-3.5 w-3.5 text-[#FFB370]" />
                <span className="text-sm text-[#5D5D5D]">誕生日</span>
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
          className="h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-0 [&>button]:hidden"
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
