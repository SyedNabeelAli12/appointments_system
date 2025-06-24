"use client";
import { useState } from "react";
import AppointmentCard from "./AppointmentCard";
import { limit } from "../common/commonvar";

export default function ListView({
  appointments: initialAppointments,
  newAppointment,
  setNewAppointment,
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);

  const grouped = appointments.reduce((acc, app) => {
    const date = new Date(app.start);
    const label = date.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!acc[label]) acc[label] = [];
    acc[label].push(app);
    return acc;
  }, {});

  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const fetchOlderAppointments = async () => {
    if (loadingOlder || appointments.length === 0) return;
    setLoadingOlder(true);

    const oldest = appointments.reduce((a, b) =>
      new Date(a.start) < new Date(b.start) ? a : b
    );
    try {
      const res = await fetch("/api/appointments/previous", {
        method: "POST",
        body: JSON.stringify({ referenceDate: oldest.start, limit: limit }),
      });
      const json = await res.json();

      if (res.ok && json.appointments?.length) {
        const merged = [...appointments, ...json.appointments];
        const unique = Array.from(
          new Map(merged.map((a) => [a.id, a])).values()
        );
        unique.sort((a, b) => new Date(a.start) - new Date(b.start));
        setAppointments(unique);
      }
    } catch (err) {
      console.error("Failed to fetch previous appointments", err);
    }

    setLoadingOlder(false);
  };

  const fetchNewerAppointments = async () => {
    if (loadingNewer || appointments.length === 0) return;
    setLoadingNewer(true);

    const latest = appointments.reduce((a, b) =>
      new Date(a.start) > new Date(b.start) ? a : b
    );

    try {
      const res = await fetch("/api/appointments/next", {
        method: "POST",
        body: JSON.stringify({ referenceDate: latest.start, limit: limit }),
      });
      const json = await res.json();

      if (res.ok && json.appointments?.length) {
        const merged = [...appointments, ...json.appointments];
        const unique = Array.from(
          new Map(merged.map((a) => [a.id, a])).values()
        );
        unique.sort((a, b) => new Date(a.start) - new Date(b.start));
        setAppointments(unique);
      }
    } catch (err) {
      console.error("Failed to fetch newer appointments", err);
    }

    setLoadingNewer(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f8] p-6">
      {/* load older */}
      <div
        onClick={fetchOlderAppointments}
        className={`text-center text-gray-500 text-sm mb-6 cursor-pointer hover:text-blue-600 hover:underline select-none ${
          loadingOlder ? "opacity-50 pointer-events-none" : ""
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && fetchOlderAppointments()
        }
      >
        Frühere Termine laden
      </div>

      <div className="w-4/5 mx-auto space-y-6">
        {Object.entries(grouped).map(([dateLabel, apps]) => {
          const appDate = new Date(apps[0].start);
          return (
            <div key={dateLabel}>
              <div className="flex items-center justify-between text-lg font-semibold text-gray-800">
                <h2>{dateLabel}</h2>
                {isToday(appDate) && (
                  <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Heute
                  </span>
                )}
              </div>

              <div className="space-y-4 mt-2">
                {apps.map((app) => (
                  <AppointmentCard
                    key={app.id}
                    appointment={app}
                    newAppointment={newAppointment}
                    setNewAppointment={setNewAppointment}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <div className="text-center text-sm text-gray-500">
            Keine Termine gefunden
          </div>
        )}
      </div>

      {/* load newer */}
      <div
        onClick={fetchNewerAppointments}
        className={`text-center text-gray-500 text-sm mt-6 cursor-pointer hover:text-blue-600 hover:underline select-none ${
          loadingNewer ? "opacity-50 pointer-events-none" : ""
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && fetchNewerAppointments()
        }
      >
        Spätere Termine laden
      </div>
    </div>
  );
}
