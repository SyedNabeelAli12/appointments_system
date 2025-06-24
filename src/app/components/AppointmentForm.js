"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function AppointmentForm({ newAppointment, setNewAppointment }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [apptStart, setApptStart] = useState("");
  const [apptEnd, setApptEnd] = useState("");
  const [apptLocation, setApptLocation] = useState("");
  const [apptPatientId, setApptPatientId] = useState("");
  const [apptCategoryId, setApptCategoryId] = useState("");
  const [apptNotes, setApptNotes] = useState("");
  const [apptTitle, setApptTitle] = useState("");

  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");

  const [patients, setPatients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");

  // Only fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/labels");
        const result = await res.json();
        if (res.ok && result.labels) {
          const formatted = result.labels.map((item, index) => ({
            id: item.id ?? index.toString(),
            name: item.name ?? item.label,
            label: item.label ?? item.name,
          }));
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Fehler beim Abrufen der Kategorien:", err);
      }
    };
    fetchCategories();
  }, []);

  async function fetchPatientsBySearch() {
    if (!patientSearch.trim()) {
      setPatients([]);
      return;
    }

    try {
      const res = await fetch(`/api/patients/search?query=${encodeURIComponent(patientSearch)}`);
      const result = await res.json();

      if (res.ok && result.labels) {
        const formatted = result.labels.map((item, index) => ({
          id: item.id ?? index.toString(),
          firstname: item.firstname ?? "",
          lastname: item.lastname ?? "",
          birth_date: item.birth_date ?? null,
          name: item.name ?? item.lastname,
        }));
        setPatients(formatted);
      } else {
        setPatients([]);
        console.error("Fehler beim Suchen:", result.error);
      }
    } catch (err) {
      console.error("Netzwerkfehler bei der Suche:", err);
      setPatients([]);
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleFileChange(e) {
    setError(null);
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      setError("Datei darf maximal 200 KB groß sein.");
      e.target.value = "";
      setAttachment(null);
      setAttachmentName("");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setAttachment(base64);
      setAttachmentName(file.name);
    } catch {
      setError("Fehler beim Lesen der Datei.");
      setAttachment(null);
      setAttachmentName("");
    }
  }

  async function postData(url, body) {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fehler beim Speichern");
      setSuccessMsg("Termin erfolgreich erstellt!");

      setApptStart("");
      setApptEnd("");
      setApptLocation("");
      setApptPatientId("");
      setApptCategoryId("");
      setApptNotes("");
      setApptTitle("");
      setPatientSearch("");
      setAttachment(null);
      setAttachmentName("");
      setPatients([]);

      setNewAppointment(!newAppointment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAppointmentSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!apptStart || !apptEnd || !apptLocation || !apptCategoryId || !apptNotes || !apptTitle) {
      return setError("Bitte füllen Sie alle Pflichtfelder aus.");
    }

    const startDate = new Date(apptStart);
    const endDate = new Date(apptEnd);
    const now = new Date();

    if (startDate < now || endDate < now) {
      return setError("Datum und Uhrzeit dürfen nicht in der Vergangenheit liegen.");
    }

    if (startDate >= endDate) {
      return setError("Startzeit muss vor der Endzeit liegen.");
    }

    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    if (startHour < 8 || startHour >= 18 || endHour < 8 || endHour > 18) {
      return setError("Uhrzeit muss zwischen 08:00 und 18:00 Uhr liegen.");
    }

    await postData("/api/appointments", {
      start: apptStart,
      end: apptEnd,
      location: apptLocation,
      patient: apptPatientId || undefined,
      category: apptCategoryId,
      notes: apptNotes,
      title: apptTitle,
      attachment,
      attachmentName,
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-sm">
      <h1 className="text-xl font-bold mb-6">Termin erstellen</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}

      <form onSubmit={handleAppointmentSubmit} className="space-y-4">
        <label>
          Start (Pflicht)
          <input
            type="datetime-local"
            value={apptStart}
            onChange={(e) => setApptStart(e.target.value)}
            className="w-full border p-2 rounded text-[13px]"
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </label>

        <label>
          Ende (Pflicht)
          <input
            type="datetime-local"
            value={apptEnd}
            onChange={(e) => setApptEnd(e.target.value)}
            className="w-full border p-2 rounded text-[13px]"
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </label>

        <label>
          Ort (Pflicht)
          <input
            type="text"
            value={apptLocation}
            onChange={(e) => setApptLocation(e.target.value)}
            className="w-full border p-2 rounded text-[13px]"
            required
          />
        </label>

        <label>
          Patient suchen (Nachname)
          <div className="flex gap-2">
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Nachname eingeben"
              className="w-full border p-2 rounded text-[13px]"
            />
            <button
              type="button"
              onClick={fetchPatientsBySearch}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Suchen"
            >
              <Search size={16} />
            </button>
          </div>
        </label>

        <label>
          Patient
          <select
            value={apptPatientId}
            onChange={(e) => setApptPatientId(e.target.value)}
            className="w-full border p-2 rounded text-[13px]"
          >
            <option value="">Patient auswählen</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstname} {p.lastname}{" "}
                {p.birth_date ? `(${p.birth_date.slice(0, 10)})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          Kategorie (Pflicht)
          <select
            value={apptCategoryId}
            onChange={(e) => setApptCategoryId(e.target.value)}
            className="w-full border p-2 rounded text-[13px]"
            required
          >
            <option value="">Kategorie auswählen</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label || c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Notizen (Pflicht)
          <textarea
            value={apptNotes}
            onChange={(e) => setApptNotes(e.target.value)}
            className="w-full border p-2 rounded text-[13px]"
            required
          />
        </label>

        <label>
          Titel (Pflicht)
          <input
            type="text"
            value={apptTitle}
            onChange={(e) => setApptTitle(e.target.value)}
            className="w-full border p-2 rounded text-[13px]"
            required
          />
        </label>

        <label>
          Anhang (Datei, max. 200 KB)
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border p-2 rounded text-[13px]"
            accept="*"
          />
          {attachmentName && (
            <p className="mt-1 text-xs text-gray-600">
              Ausgewählt: {attachmentName}
            </p>
          )}
        </label>

        <p className="text-xs text-gray-500">
          💡 Tipp: Speichere nur den Pfad in der Datenbank – Datei in einem sicheren Verzeichnis ablegen.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          {loading ? "Speichert..." : "Termin erstellen"}
        </button>
      </form>
    </div>
  );
}
