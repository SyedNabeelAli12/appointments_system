"use client";

import { useState, useEffect } from "react";
import { X as XIcon } from "lucide-react";
import DownloadAttachmentsButton from "./Downloader";
import { date_time, toBerlinDateTimeLocalString } from "../common/commonFunctions";

function Loader() {
  return (
    <div className="flex justify-center items-center py-4">
      <svg
        className="animate-spin h-6 w-6 text-gray-700"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
    </div>
  );
}

export default function AppointmentEditModal({
  appointment,
  isOpen,
  onClose,
  onSave,
  newAppointment,
  setNewAppointment,
}) {
  const [form, setForm] = useState({ ...appointment });
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm({ ...appointment });
    setError(null);
    setAssignees([]);

    async function fetchAssignees() {
      try {
        if (!appointment?.id) return;
        setAssigneesLoading(true);

        const res = await fetch(`/api/appointments_assignee/assignees/${appointment.id}`);
        const json = await res.json();

        if (res.ok && Array.isArray(json.assignees)) {
          setAssignees(json.assignees);
        } else {
          console.error("Unexpected response:", json);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Zuständigen:", err);
      } finally {
        setAssigneesLoading(false);
      }
    }

    fetchAssignees();
  }, [appointment]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validateForm() {
    const { title, start, end, location, notes } = form;

    if (!title || !start || !end || !location || !notes) {
      return "Bitte füllen Sie alle Pflichtfelder aus.";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    if (startDate < now || endDate < now) {
      return "Datum und Uhrzeit dürfen nicht in der Vergangenheit liegen.";
    }

    if (startDate >= endDate) {
      return "Startzeit muss vor der Endzeit liegen.";
    }

    const startHour = startDate.getHours();
    const endHour = endDate.getHours();

    if (startHour < 8 || startHour >= 18 || endHour < 8 || endHour > 18) {
      return "Uhrzeit muss zwischen 08:00 und 18:00 Uhr liegen.";
    }

    return null;
  }

  async function updateAppointment(appointmentId, formData) {
    const res = await fetch(`/api/appointments/edit/${appointmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Fehler beim Aktualisieren des Termins");
    }
    setNewAppointment(!newAppointment);
    return await res.json();
  }

  async function handleSave() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (form.id) {
        // Edit existing appointment
        await updateAppointment(form.id, form);
      } else {
        // Create new appointment - assuming your existing onSave does that
        await onSave(form);
        setNewAppointment(!newAppointment);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const editableFields = [
    {
      label: "Titel",
      name: "title",
      type: "text",
      required: true,
    },
    {
      label: "Startzeit",
      name: "start",
      type: "datetime-local",
      required: true,
      formatValue:  (v) => (v ? toBerlinDateTimeLocalString(v) : ""),
    },
    {
      label: "Endzeit",
      name: "end",
      type: "datetime-local",
      required: true,
      formatValue:  (v) => (v ? toBerlinDateTimeLocalString(v) : ""),
    },
    {
      label: "Ort",
      name: "location",
      type: "text",
      required: true,
    },
    {
      label: "Notizen",
      name: "notes",
      type: "textarea",
      required: true,
    },
  ];

  const disabledFields = [
    {
      label: "Kategorie",
      value: form.categories?.label || "Keine Kategorie",
    },
    {
      label: "Farbe der Kategorie",
      value: form.categories?.color || "Keine Farbe",
    },
    {
      label: "Patient",
      value: form.patients
        ? `${form.patients.firstname} ${form.patients.lastname}`
        : "Kein Patient",
    },

    ...assignees.flatMap((assignee) => [
      {
        label: `Zuständiger User`,
        value: assignee.user || "Unbekannt",
      },
      {
        label: `Zuständiger Typ`,
        value: assignee.user_type || "Unbekannt",
      },
    ]),
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          <XIcon size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Termin bearbeiten</h2>

        <div className="space-y-4 max-h-[70vh] overflow-auto">
          {editableFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  rows={4}
                  required={field.required}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={
                    field.formatValue
                      ? field.formatValue(form[field.name])
                      : form[field.name] || ""
                  }
                  onChange={handleChange}
                  required={field.required}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              )
          
              }
            </div>
          ))}

          {assigneesLoading ? (
            <Loader />
          ) : (
            disabledFields.map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  value={field.value}
                  disabled
                  className="w-full bg-gray-100 rounded-md border border-gray-300 p-2 text-sm text-gray-600"
                />
              </div>
            ))
          )}

          <DownloadAttachmentsButton appointmentID={appointment.id} />

          {error && (
            <p className="text-red-600 mt-2 text-sm font-medium">{error}</p>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100"
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 flex items-center justify-center space-x-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              <span>{loading ? "Speichern..." : "Speichern"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
