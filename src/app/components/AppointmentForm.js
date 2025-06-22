"use client";

import { useState, useEffect, useMemo } from "react";

export default function AppointmentForm(    {newAppointment ,setNewAppointment}) {
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

  const [patients, setPatients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients/fetch");
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
          console.error("Fehler beim Laden der Patienten:", result.error);
        }
      } catch (err) {
        console.error("Fehler beim Abrufen der Patienten:", err);
      }
    };
    fetchPatients();
  }, []);

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
        } else {
          console.error("Fehler beim Laden der Kategorien:", result.error);
        }
      } catch (err) {
        console.error("Fehler beim Abrufen der Kategorien:", err);
      }
    };
    fetchCategories();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients;
    return patients.filter((p) =>
      p.lastname.toLowerCase().includes(patientSearch.toLowerCase())
    );
  }, [patientSearch, patients]);

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
      // Reset form
      setApptStart("");
      setApptEnd("");
      setApptLocation("");
      setApptPatientId("");
      setApptCategoryId("");
      setApptNotes("");
      setApptTitle("");
      setPatientSearch("");
      setNewAppointment(!newAppointment)
      return json;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function handleAppointmentSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (
      !apptStart ||
      !apptEnd ||
      !apptLocation ||
      // !apptPatientId ||
      !apptCategoryId ||
      !apptNotes ||
      !apptTitle
    ) {
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
      patient: apptPatientId|| undefined,
      category: apptCategoryId,
      notes: apptNotes,
      title: apptTitle,
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Termin erstellen</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}

      <form onSubmit={handleAppointmentSubmit} className="space-y-4">
        <label>
          Start (Pflicht)
          <input
            type="datetime-local"
            value={apptStart}
            onChange={(e) => setApptStart(e.target.value)}
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
            required
          />
        </label>

        <label>
          Patient suchen (Nachname)
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="Nachname eingeben"
            className="w-full border p-2 rounded mb-2"
          />
        </label>

        <label>
          Patient
          <select
            value={apptPatientId}
            onChange={(e) => setApptPatientId(e.target.value)}
            className="w-full border p-2 rounded"
            // required
          >
            <option value="">Patient auswählen</option>
            {filteredPatients.map((p) => (
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
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
            required
          />
        </label>

        <label>
          Titel (Pflicht)
          <input
            type="text"
            value={apptTitle}
            onChange={(e) => setApptTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </label>

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
