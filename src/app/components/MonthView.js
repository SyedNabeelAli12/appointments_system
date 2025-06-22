"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import AppointmentCard from "./AppointmentCard";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const daysOfWeek = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

function getDaysInMonth(year, month) {
  const result = [];
  const date = new Date(year, month, 1);
  // Adjust so Monday = 0 ... Sunday = 6
  const firstDay = (date.getDay() + 6) % 7;

  for (let i = 0; i < firstDay; i++) result.push(null);

  while (date.getMonth() === month) {
    result.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return result;
}

export default function MonthView({ appointments, selectedDate }) {
  const baseDate = new Date(selectedDate);
  const [selectedInDate, setSelectedInDate] = useState(baseDate);
  const [today, setToday] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setToday(new Date());
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by rendering nothing before mount
    return null;
  }

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const days = getDaysInMonth(year, month);

  // Group appointments by date string
  const grouped = appointments.reduce((acc, app) => {
    const dateKey = new Date(app.start).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(app);
    return acc;
  }, {});

  const getAppointmentsForDate = (date) =>
    grouped[date?.toDateString()] || [];

  return (
    <div className="flex">
      <div className="grid grid-cols-7 gap-px bg-gray-200 flex-grow">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="p-2 text-center font-medium bg-white border-b"
          >
            {day}
          </div>
        ))}

        {days.map((date, i) => {
          if (!date) {
            return (
              <div
                key={"empty-" + i}
                className="min-h-[100px] bg-white border"
              />
            );
          }

          const isToday =
            today &&
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          const isSelected =
            selectedInDate &&
            date.toDateString() === selectedInDate.toDateString();

          const apps = getAppointmentsForDate(date);

          return (
            <div
              key={i}
              onClick={() => setSelectedInDate(date)}
              className={clsx(
                "min-h-[100px] p-1 bg-white border hover:bg-gray-50 cursor-pointer relative",
                isSelected && "bg-gray-100"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className={clsx(
                    "text-xs w-6 h-6 flex items-center justify-center rounded font-semibold",
                    isToday ? "bg-gray-900 text-white" : "text-gray-700"
                  )}
                >
                  {date.getDate()}
                </div>
              </div>

              {apps.map((app) => (
                <div
                  key={app.id}
                  className="truncate text-xs rounded px-2 py-0.5 mt-0.5 bg-gray-200 flex items-center"
                  style={{
                    borderLeft: `4px solid ${app.categories?.color || "transparent"}`,
                  }}
                >
                  {app.title.length > 20
                    ? app.title.slice(0, 20) + "…"
                    : app.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Sidebar for selected date */}
      <div className="w-[300px] border-l bg-gray-50 p-4 space-y-4">
        <h2 className="font-semibold text-base">
          {format(selectedInDate, "EEEE, d. MMMM", { locale: de })}{" "}
          {selectedInDate.toDateString() === today?.toDateString() && "(Heute)"}
        </h2>

        {getAppointmentsForDate(selectedInDate).length === 0 ? (
          <p className="text-sm text-gray-500">Keine weiteren Termine gefunden</p>
        ) : (
          getAppointmentsForDate(selectedInDate).map((app) => (
            <AppointmentCard key={app.id} appointment={app} />
          ))
        )}
      </div>
    </div>
  );
}
