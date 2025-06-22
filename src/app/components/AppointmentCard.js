"use client";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  CheckSquare,
  Square,
  Clock,
  MapPin,
  MessageSquare,
} from "lucide-react";

import AppointmentEditModal from "./AppointmentEditModal";

export default function AppointmentCard({ appointment, onUpdated }) {
  // const [color, setColor] = useState("#999999");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert ISO strings to Date objects (assumes appointment.start/end are ISO strings)
  const appointmentStart = new Date(appointment.start); // this is in UTC
  const germanyOffsetMs = 2 * 60 * 60 * 1000; // 2 hours offset for Berlin
  const start = new Date(appointmentStart.getTime() - germanyOffsetMs);

  // Using appointment.end might be better, but you had appointment.start for end as well, I assume a typo?
  const appointmentEnd = new Date(appointment.end || appointment.start);
  const end = new Date(appointmentEnd.getTime() - germanyOffsetMs);

  // Current time in Berlin timezone
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));

  // Date/time formatters in Berlin timezone
  const timeFormatter = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Compare two dates by Berlin local day
  const isSameDay = (a, b) =>
    dateTimeFormatter.format(a).slice(0, 10) === dateTimeFormatter.format(b).slice(0, 10);

  // Check if appointment ended before now and on the same day (past today)
  const isPastToday = isSameDay(end, now) && end.getTime() < now.getTime();

  const isChecked = appointment.completed || isPastToday;

  const highlightMentions = (text) =>
    text?.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <strong key={i} className="font-semibold text-blue-600">
          {part}
        </strong>
      ) : (
        part
      )
    );

  async function handleSave(updatedAppointment) {
    const res = await fetch("/api/appointments/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAppointment),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Update fehlgeschlagen");
    }
    if (onUpdated) onUpdated(updatedAppointment);
  }

  return (
    <>
      <HoverCard>
        <HoverCardTrigger>
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-white p-4 rounded-2xl border shadow-sm hover:bg-blue-50 transition cursor-pointer flex justify-between items-start"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: appointment.categories.color }}
                ></span>
                <p
                  className={clsx(
                    "font-semibold text-base",
                    isChecked && "line-through text-gray-400"
                  )}
                >
                  {appointment.title}
                </p>
              </div>

              <div className="flex items-center text-sm text-gray-700 space-x-2">
                <Clock size={16} className="text-gray-500" />
                <span>
                  {timeFormatter.format(start)} bis {timeFormatter.format(end)} Uhr
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-700 space-x-2">
                <MapPin size={16} className="text-gray-500" />
                <span>{appointment.location}</span>
              </div>

              {appointment.notes && (
                <div className="flex items-center text-sm text-gray-700 space-x-2">
                  <MessageSquare size={16} className="text-gray-500" />
                  <span>{highlightMentions(appointment.notes)}</span>
                </div>
              )}
            </div>

            <div className="pt-1">
              {isChecked ? (
                <CheckSquare className="text-black" />
              ) : (
                <Square className="text-gray-300" />
              )}
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent className="text-sm space-y-1">
          <p>
            <strong>Uhrzeit:</strong> {dateTimeFormatter.format(start)} – {timeFormatter.format(end)}
          </p>
          <p>
            <strong>Ort:</strong> {appointment.location}
          </p>
          <p>
            <strong>Notiz:</strong>{" "}
            {appointment.notes ? highlightMentions(appointment.notes) : "Keine"}
          </p>

           <p>
                <strong>Ende:</strong>{" "}
                {end.toLocaleString("de-DE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              <p>
                <strong>Ort:</strong> {appointment.location || "Keine Angabe"}
              </p>
              <p>
                <strong>Kategorie:</strong>{" "}
                {appointment.categories
                  ? `${appointment.categories.label} (Farbe: ${appointment.categories.color})`
                  : "Keine Kategorie"}
              </p>
              <p>
                <strong>Patient:</strong>{" "}
                {appointment.patients
                  ? `${appointment.patients.firstname} ${appointment.patients.lastname}`
                  : "Kein Patient"}
              </p>
        </HoverCardContent>
      </HoverCard>

      <AppointmentEditModal
        appointment={appointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
