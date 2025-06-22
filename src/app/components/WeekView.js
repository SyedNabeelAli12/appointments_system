"use client";
import React, { useMemo } from "react";
import WeekCard from "./WeekCard";

// Get Monday as the start of the week
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Format weekday for header
function formatDay(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    timeZone: "Europe/Berlin",
  });
}

// Get Berlin-localized date
function getBerlinDate(dateStr) {
  return new Date(
    new Date(dateStr).toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
    })
  );
}

// Check if two dates are the same day in Berlin time
function isSameBerlinDay(date1, date2) {
  const d1 = getBerlinDate(date1);
  const d2 = getBerlinDate(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper for a stable day key (year-month-day)
function getDayKey(date) {
  return `day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function WeeklyCalendarGrid({ appointments, selectedDate }) {
  const startOfWeek = useMemo(
    () => getStartOfWeek(selectedDate ?? new Date()),
    [selectedDate]
  );

  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0); // zero out time for stability
      return d;
    });
  }, [startOfWeek]);

  // Hours from 8 to 18 inclusive (11 hours)
  const hours = useMemo(() => Array.from({ length: 11 }, (_, i) => 8 + i), []);
  const startHour = 8;
  const hourHeight = 96;

  const now = new Date();
  const nowBerlin = getBerlinDate(now);
  const todayBerlin = getBerlinDate(new Date());

  const isTodayVisible = daysOfWeek.some((d) => isSameBerlinDay(d, nowBerlin));

  const currentHour = nowBerlin.getHours();
  const currentMinutes = nowBerlin.getMinutes();
  const offsetY = (currentHour + currentMinutes / 60 - startHour) * hourHeight;

  const totalGridHeight = hours.length * hourHeight;

  // Constant for minus 2 hours in milliseconds
  const minusTwoHoursMs = 2 * 60 * 60 * 1000;

  return (
    <div className="relative border border-gray-300" style={{ height: totalGridHeight }}>
      {/* Time now line (red) */}
      {isTodayVisible && offsetY >= 0 && offsetY <= totalGridHeight && (
        <div
          className="absolute left-[60px] right-0 z-10 pointer-events-none"
          style={{ top: `${offsetY}px` }}
        >
          <div
            className="absolute -left-[38px] text-xs text-red-500 bg-white px-1 border border-red-500 rounded select-none"
            style={{ transform: "translateY(-50%)" }}
          >
            {nowBerlin.toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Berlin",
              hour12: false, // force 24-hour
            })}
          </div>
          <div className="h-px w-full bg-red-500" />
        </div>
      )}

      {/* Calendar grid */}
      <div className="grid grid-cols-8 border-t text-sm">
        {/* Time header */}
        <div className="bg-gray-50 p-2 font-medium sticky top-0 z-20 border-b border-gray-300">
          Zeit
        </div>

        {/* Day headers */}
        {daysOfWeek.map((day) => {
          const isToday = isSameBerlinDay(day, todayBerlin);
          return (
            <div
              key={getDayKey(day)}
              className={`p-2 font-medium text-center sticky top-0 z-10 border-b border-gray-300 ${
                isToday ? "bg-green-100" : "bg-gray-50"
              }`}
            >
              {formatDay(day)}
            </div>
          );
        })}

        {/* Time rows */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* Hour label — 12-hour format */}
            <div className="border p-2 text-right">
              {new Date(2020, 0, 1, hour).toLocaleTimeString("de-DE", {
                hour: "numeric", // numeric hour without leading zero
                minute: "2-digit",
                hour12: true, // 12-hour format
              })}
            </div>

            {/* Time slots */}
            {daysOfWeek.map((day) => {
              const isToday = isSameBerlinDay(day, todayBerlin);

              // Filter appointments with start time minus 2 hours
              const filteredApps = appointments.filter((app) => {
                const originalStart = new Date(app.start);
                const adjustedStart = new Date(originalStart.getTime() - minusTwoHoursMs);

                return (
                  adjustedStart.getFullYear() === day.getFullYear() &&
                  adjustedStart.getMonth() === day.getMonth() &&
                  adjustedStart.getDate() === day.getDate() &&
                  adjustedStart.getHours() === hour
                );
              });

              return (
                <div
                  key={`${getDayKey(day)}-${hour}`}
                  className={`border h-24 relative ${isToday ? "bg-green-50" : ""}`}
                >
                  {filteredApps.map((app) => (
                    <div key={app.id} className="absolute inset-1">
                      {/* Pass appointment normally; WeekCard handles its own offset if needed */}
                      <WeekCard appointment={app} />
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
