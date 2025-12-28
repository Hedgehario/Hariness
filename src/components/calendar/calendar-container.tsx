"use client";

import { useState, useEffect, useTransition } from "react";
import { format, getYear, getMonth, isSameDay, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarEventDisplay, getMonthlyEvents } from "@/app/(main)/calendar/actions";
import { DayEventsSheet } from "./day-events-sheet";
import { cn } from "@/lib/utils";

import "react-day-picker/dist/style.css"; 

type Props = {
  initialEvents: CalendarEventDisplay[];
  initialYear: number;
  initialMonth: number;
};

export function CalendarContainer({ initialEvents, initialYear, initialMonth }: Props) {
  const [events, setEvents] = useState<CalendarEventDisplay[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(initialYear, initialMonth - 1));
  const [isPending, startTransition] = useTransition();

  // Fetch events when month changes
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    startTransition(async () => {
        const newEvents = await getMonthlyEvents(getYear(month), getMonth(month) + 1);
        setEvents(newEvents);
    });
  };

  const handleDayClick = (day: Date) => {
      setSelectedDate(day);
  };

  // Custom Day Render to show dots
  const CustomDay = (props: any) => {
    const { date, activeModifiers } = props;
    const dayEvents = events.filter(e => isSameDay(parseISO(e.date), date));
    const hasHospital = dayEvents.some(e => e.type === 'hospital');
    const hasGeneric = dayEvents.some(e => e.type === 'event');

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center py-1">
        <span className={cn("text-sm", activeModifiers.selected && "font-bold text-white")}>
           {format(date, "d")}
        </span>
        <div className="flex gap-0.5 mt-1">
            {hasHospital && <div className="w-1.5 h-1.5 rounded-full bg-[#FF7070]" />}
            {hasGeneric && <div className="w-1.5 h-1.5 rounded-full bg-[#B0D67A]" />}
        </div>
      </div>
    );
  };

  const selectedEvents = selectedDate 
    ? events.filter(e => isSameDay(parseISO(e.date), selectedDate))
    : [];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Calendar Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#5D5D5D]/10 p-4">
        <style>{`
          .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #FFB370; margin: 0; }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #F8F8F0; }
        `}</style>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          locale={ja}
          components={{
             DayContent: CustomDay as any
          }}
          className="mx-auto"
          modifiersClassNames={{
            selected: "bg-[#FFB370] text-white rounded-full",
            today: "font-bold text-[#FFB370]"
          }}
          styles={{
             head_cell: { color: '#5D5D5D', opacity: 0.6, fontSize: '0.8rem' },
             caption: { color: '#5D5D5D', fontWeight: 'bold' }
          }}
        />
      </div>

      <div className="border-t border-[#5D5D5D]/10 bg-white/50 -mx-4 px-4 pt-2">
         <p className="text-xs text-center text-[#5D5D5D]/60">日付をタップすると予定が表示されます</p>
         <div className="flex justify-center gap-4 mt-2 mb-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF7070]" /><span className="text-xs text-[#5D5D5D]">通院</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#B0D67A]" /><span className="text-xs text-[#5D5D5D]">イベント</span></div>
         </div>
      </div>

      {/* Bottom Sheet for Events */}
      <div className="bg-white rounded-t-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-[#5D5D5D]/10 flex-1 min-h-[300px] p-4 animate-in slide-in-from-bottom duration-300">
         <DayEventsSheet 
           date={selectedDate} 
           events={selectedEvents} 
         />
      </div>
    </div>
  );
}
