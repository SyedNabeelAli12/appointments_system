"use client";

import { useState, useEffect } from "react";
import { X as XIcon } from "lucide-react";

export default function AppointmentEditModal({
  appointment,
  isOpen,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({ ...appointment });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm({ ...appointment });
    setError(null);
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

  async function handleSave() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

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
          <label className="block text-sm font-medium text-gray-700">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title || ""}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />

          <label className="block text-sm font-medium text-gray-700">
            Startzeit <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="start"
            value={form.start ? form.start.slice(0, 16) : ""}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />

          <label className="block text-sm font-medium text-gray-700">
            Endzeit <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="end"
            value={form.end ? form.end.slice(0, 16) : ""}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />

          <label className="block text-sm font-medium text-gray-700">
            Ort <span className="text-red-500">*</span>
          </label>
          <input
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />

          <label className="block text-sm font-medium text-gray-700">
            Notizen <span className="text-red-500">*</span>
          </label>
          <textarea
            name="notes"
            value={form.notes || ""}
            onChange={handleChange}
            rows={4}
            required
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

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
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
          >
            {loading ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
