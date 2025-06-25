"use client";

import {
  CheckSquare,
  Square,
  Clock,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import AppointmentEditModal from "./AppointmentEditModal";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { germanyOffsetMs } from "../common/commonvar";

export default function WeekCard({
  appointment,
  onUpdated,
  newAppointment,
  setNewAppointment,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!appointment) return null;

  const start = new Date(appointment.start);
  const end = new Date(appointment.end || appointment.start);
  const now = new Date(new Date().getTime() + germanyOffsetMs);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const isPastToday = isSameDay(end, now) && end.getTime() < now.getTime();
  const isChecked = appointment.completed || isPastToday;

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

  const highlightMentions = (text) =>
    text?.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <strong key={i} className="font-semibold underline">
          {part}
        </strong>
      ) : (
        part
      )
    );

  function lightenColor(hex, percent) {
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const num = parseInt(hex, 16);
    const r = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100));
    const g =
      ((num >> 8) & 0x00ff) +
      Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100));
    const b =
      (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100));

    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div
            className="relative flex h-full rounded-sm shadow-sm border overflow-hidden cursor-pointer text-[10px]"
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: appointment?.categories?.color }}
          >
            <div
              className="w-1.5"
              style={{
                backgroundColor: darkenColor(
                  appointment?.categories?.color,
                  0.2
                ),
              }}
            />

            <div className="flex-1 p-4 text-[10px] relative">
              <div className="absolute top-2 right-2 text-gray-500">
                {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
              </div>

              <div className="space-y-2 pr-6">
                <p className="font-bold text-[10px] leading-snug">
                  {appointment.title}
                </p>

                <div className="flex items-center gap-1 text-gray-700">
                  <Clock size={12} />
                  <span>
                    {start.toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    bis ~{" "}
                    {end.toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    Uhr
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin size={12} />
                  <span>{appointment.location}</span>
                </div>

                {appointment.notes && (
                  <div className="flex items-start gap-1 text-gray-700">
                    <MessageSquare size={12} className="mt-0.5" />
                    <span>{highlightMentions(appointment.notes)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </HoverCardTrigger>

        <HoverCardContent className="w-64 text-[10px] text-gray-800">
          <p>
            <strong>Titel:</strong> {appointment.title}
          </p>
          <p>
            <strong>Start:</strong>{" "}
            {start.toLocaleString("de-DE", {
              dateStyle: "short",
              timeStyle: "short",
            })}
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
            <strong>Notizen:</strong> {appointment.notes || "Keine Notizen"}
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
        newAppointment={newAppointment}
        setNewAppointment={setNewAppointment}
      />
    </>
  );
}

function darkenColor(hex, amount = 0.2) {
  try {
    let col = hex.replace("#", "");
    if (col.length === 3) {
      col = col
        .split("")
        .map((c) => c + c)
        .join("");
    }

    const num = parseInt(col, 16);
    let r = (num >> 16) - 255 * amount;
    let g = ((num >> 8) & 0x00ff) - 255 * amount;
    let b = (num & 0x0000ff) - 255 * amount;

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return `rgb(${r},${g},${b})`;
  } catch {
    return "#999";
  }
}
