"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";

interface AvailabilityCalendarProps {
  productName?: string;
  bookedDates?: string[]; // e.g. ["2026-08-14", "2026-08-15"]
  onDateSelect?: (startDate: string, endDate: string) => void;
}

export default function AvailabilityCalendar({ productName = "Camera Equipment", bookedDates = ["2026-08-14", "2026-08-15", "2026-08-20"], onDateSelect }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedStart, setSelectedStart] = useState<string | null>("2026-08-18");
  const [selectedEnd, setSelectedEnd] = useState<string | null>("2026-08-21");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handleDateClick = (dayStr: string) => {
    if (bookedDates.includes(dayStr)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dayStr);
      setSelectedEnd(null);
    } else {
      if (new Date(dayStr) >= new Date(selectedStart)) {
        setSelectedEnd(dayStr);
        if (onDateSelect) onDateSelect(selectedStart, dayStr);
      } else {
        setSelectedStart(dayStr);
        setSelectedEnd(null);
      }
    }
  };

  const isSelected = (dayStr: string) => {
    if (dayStr === selectedStart || dayStr === selectedEnd) return true;
    if (selectedStart && selectedEnd) {
      const d = new Date(dayStr).getTime();
      return d >= new Date(selectedStart).getTime() && d <= new Date(selectedEnd).getTime();
    }
    return false;
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-[#D8B36A]" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Live Availability Grid
            </h4>
            <p className="text-[10px] text-gray-400 font-sans">
              Select dates to check vault availability for {productName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-[#D8B36A] font-mono uppercase tracking-widest px-2">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[10px] uppercase font-mono tracking-wider pt-1 text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D8B36A]"></span>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
          <span>Booked</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-[9px] uppercase tracking-widest text-gray-500 font-bold py-1">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const isBooked = bookedDates.includes(dayStr);
          const active = isSelected(dayStr);

          return (
            <button
              key={dayStr}
              disabled={isBooked}
              onClick={() => handleDateClick(dayStr)}
              className={`h-9 rounded-lg font-mono text-xs flex flex-col items-center justify-center transition relative ${
                isBooked
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-not-allowed line-through"
                  : active
                  ? "bg-[#D8B36A] text-black font-bold border border-[#D8B36A] shadow-lg shadow-[#D8B36A]/20"
                  : "bg-white/[0.03] text-gray-200 border border-white/5 hover:border-[#D8B36A]/50 hover:bg-[#D8B36A]/10"
              }`}
            >
              <span>{dayNum}</span>
              {active && <span className="h-1 w-1 bg-black rounded-full absolute bottom-1"></span>}
            </button>
          );
        })}
      </div>

      {selectedStart && (
        <div className="p-3 bg-[#D8B36A]/10 border border-[#D8B36A]/20 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white">
            <CheckCircle size={14} className="text-[#D8B36A]" />
            <span>Selected Range: <strong>{selectedStart}</strong> {selectedEnd ? `→ ${selectedEnd}` : "(Select End Date)"}</span>
          </div>
          <span className="text-[10px] text-[#D8B36A] font-mono uppercase font-bold">Available</span>
        </div>
      )}
    </div>
  );
}
