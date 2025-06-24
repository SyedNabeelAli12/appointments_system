"use client";
import React, { useMemo, useState, useEffect } from "react";
import WeekCard from "./WeekCard";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getBerlinDate(dateStr) {
  return new Date(
    new Date(dateStr).toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
    })
  );
}

function isSameBerlinDay(date1, date2) {
  const d1 = getBerlinDate(date1);
  const d2 = getBerlinDate(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getDayKey(date) {
  return `day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Client-only component to format the day string
function FormattedDay({ date }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(
      date.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "numeric",
        timeZone: "Europe/Berlin",
      })
    );
  }, [date]);

  return <>{formatted || "..."}</>;
}

// Client-only component to format hour labels
function FormattedHour({ hour }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    const d = new Date(2020, 0, 1, hour);
    setFormatted(
      d.toLocaleTimeString("de-DE", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }, [hour]);

  return <>{formatted || "..."}</>;
}

export default function WeeklyCalendarGrid({
  appointments,
  selectedDate,
  newAppointment,
  setNewAppointment,
}) {
  const startOfWeek = useMemo(
    () => getStartOfWeek(selectedDate ?? new Date()),
    [selectedDate]
  );

  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [startOfWeek]);

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

  return (
    <div
      className="relative border border-gray-300"
      style={{ height: totalGridHeight }}
    >
      {isTodayVisible && offsetY >= 0 && offsetY <= totalGridHeight && (
        <div
          className="absolute left-[60px] right-0 z-10 pointer-events-none"
          style={{ top: `${offsetY}px` }}
        >
          <div
            className="absolute -left-[38px] text-xs text-red-500 bg-white px-1 border border-red-500 rounded select-none"
            style={{ transform: "translateY(-50%)" }}
          >
            {/* Format time client-side */}
            <FormattedTime date={nowBerlin} />
          </div>
          <div className="h-px w-full bg-red-500" />
        </div>
      )}

      <div className="grid grid-cols-8 border-t text-sm">
        <div className="bg-gray-50 p-2 font-medium sticky top-0 z-20 border-b border-gray-300">
          Zeit
        </div>
        {daysOfWeek.map((day) => {
          const isToday = isSameBerlinDay(day, todayBerlin);
          return (
            <div
              key={getDayKey(day)}
              className={`p-2 font-medium text-center sticky top-0 z-10 border-b border-gray-300 ${
                isToday ? "bg-green-100" : "bg-gray-50"
              }`}
            >
              <FormattedDay date={day} />
            </div>
          );
        })}

        {/* Time rows */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="border p-2 text-right">
              <FormattedHour hour={hour} />
            </div>

            {/* Time slots */}
            {daysOfWeek.map((day) => {
              const isToday = isSameBerlinDay(day, todayBerlin);

              const filteredApps = appointments.filter((app) => {
                const originalStart = new Date(app.start);
                const adjustedStart = new Date(originalStart.getTime());

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
                  className={`border h-24 relative ${
                    isToday ? "bg-green-50" : ""
                  }`}
                >
                  {filteredApps.map((app) => (
                    <div key={app.id} className="absolute inset-1">
                      <div className="text-xs">
                        {" "}
                        <WeekCard
                          appointment={app}
                          newAppointment={newAppointment}
                          setNewAppointment={setNewAppointment}
                        />
                      </div>
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

// Client-only component to format the time string
function FormattedTime({ date }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(
      date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Berlin",
        hour12: false,
      })
    );
  }, [date]);

  return <>{formatted || "..."}</>;
}
