
// "use client";

// import { useState, useEffect } from "react";

// export default function AppointmentForm() {
//   const [activeTab, setActiveTab] = useState("categories");

//   // --- Shared loading and error state ---
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMsg, setSuccessMsg] = useState(null);

//   // --- Categories form ---
//   const [catLabel, setCatLabel] = useState("");
//   const [catDescription, setCatDescription] = useState("");
//   const [catColor, setCatColor] = useState("#00ff00");
//   const [catIcon, setCatIcon] = useState("");

//   // --- Patients form ---
//   // const [patFirstName, setPatFirstName] = useState("");
//   // const [patLastName, setPatLastName] = useState("");
//   // const [patBirthDate, setPatBirthDate] = useState("");
//   // const [patCareLevel, setPatCareLevel] = useState("");
//   // const [patPronoun, setPatPronoun] = useState("");
//   // const [patEmail, setPatEmail] = useState("");
//   // const [patActive, setPatActive] = useState(false);
//   // const [patActiveSince, setPatActiveSince] = useState("");

//   // --- Relatives form ---
//   const [relPronoun, setRelPronoun] = useState("");
//   const [relFirstName, setRelFirstName] = useState("");
//   const [relLastName, setRelLastName] = useState("");
//   const [relNotes, setRelNotes] = useState("");

//   // --- Appointments form ---
//   const [apptStart, setApptStart] = useState("");
//   const [apptEnd, setApptEnd] = useState("");
//   const [apptLocation, setApptLocation] = useState("");
//   const [apptPatientId, setApptPatientId] = useState("");
//   const [apptCategoryId, setApptCategoryId] = useState("");
//   const [apptNotes, setApptNotes] = useState("");
//   const [apptTitle, setApptTitle] = useState("");
//   const [patients, setPatients] = useState([]);
//   const [categories, setCategories] = useState([]);

//   // --- Activities form ---
//   const [actAppointmentId, setActAppointmentId] = useState("");
//   const [actCreatedBy, setActCreatedBy] = useState("");
//   const [actType, setActType] = useState("");
//   const [actContent, setActContent] = useState("");
//   const [appointments, setAppointments] = useState([]);

//   // --- Appointment Assignee form ---
//   const [assigneeAppointmentId, setAssigneeAppointmentId] = useState("");
//   const [assigneeUserId, setAssigneeUserId] = useState("");
//   const [assigneeUserType, setAssigneeUserType] = useState("relatives");

//   // Fetch patients, categories, appointments once
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         let [pRes, cRes, aRes] = await Promise.all([
//           fetch("/api/patients/fetch"),
//           fetch("/api/categories/fetch"),
//           // fetch("/api/appointments"),
//         ]);
//         let [pData, cData, aData] = await Promise.all([
//           pRes.json(),
//           cRes.json(),
//           aRes.json(),
//         ]);
//         if (pRes.ok) setPatients(pData.patients || []);
//         if (cRes.ok) setCategories(cData.categories || []);
//         if (aRes.ok) setAppointments(aData.appointments || []);
//       } catch (e) {
//         console.error(e);
//       }
//     }
//     fetchData();
//   }, []);


//     useEffect(() => {
//     async function loadCategories() {
//       try {
//         const res = await fetch('/api/categories/fetch');
//         if (!res.ok) {
//           throw new Error('Failed to fetch categories');
//         }
//         const data = await res.json();
//         setCategories(data.categories);  // <-- set the state here
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//         setCategories([]);  // optionally reset on error
//       }
//     }

//     loadCategories();
//   }, []);


//   // Generic post helper
//   async function postData(url, body) {
//     setLoading(true);
//     setError(null);
//     setSuccessMsg(null);
//     try {
//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.error || "Error");
//       setSuccessMsg("Erfolgreich gespeichert!");
//       return json;
//     } catch (err) {
//       setError(err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Handlers for each form submit
//   async function handleCategorySubmit(e) {
//     e.preventDefault();
//     if (!catLabel) return setError("Kategorie Label ist Pflicht");
//     await postData("/api/categories", {
//       label: catLabel,
//       description: catDescription,
//       color: catColor,
//       icon: catIcon,
//     });
//   }

//   async function handlePatientSubmit(e) {
//     e.preventDefault();
//     if (!patFirstName || !patLastName) return setError("Vorname und Nachname sind Pflicht");
//     await postData("/api/patients", {
//       firstname: patFirstName,
//       lastname: patLastName,
//       birth_date: patBirthDate || null,
//       care_level: patCareLevel || null,
//       pronoun: patPronoun,
//       email: patEmail,
//       active: patActive,
//       active_since: patActiveSince || null,
//     });
//   }

//   async function handleRelativeSubmit(e) {
//     e.preventDefault();
//     if (!relFirstName || !relLastName) return setError("Vorname und Nachname sind Pflicht");
//     await postData("/api/relatives", {
//       pronoun: relPronoun,
//       firstname: relFirstName,
//       lastname: relLastName,
//       notes: relNotes,
//     });
//   }

//   async function handleAppointmentSubmit(e) {
//     e.preventDefault();
//     if (!apptStart || !apptEnd || !apptPatientId) return setError("Start, End und Patient sind Pflicht");
//     await postData("/api/appointments", {
//       start: apptStart,
//       end: apptEnd,
//       location: apptLocation,
//       patient: apptPatientId,
//       category: apptCategoryId || null,
//       notes: apptNotes,
//       title: apptTitle,
//     });
//   }

//   async function handleActivitySubmit(e) {
//     e.preventDefault();
//     if (!actAppointmentId || !actType || !actContent) return setError("Termin, Typ und Inhalt sind Pflicht");
//     await postData("/api/activities", {
//       appointmentId: actAppointmentId,
//       type: actType,
//       content: actContent,
//       createdBy: actCreatedBy || null,
//     });
//   }

//   async function handleAssigneeSubmit(e) {
//     e.preventDefault();
//     if (!assigneeAppointmentId || !assigneeUserId) return setError("Termin und User sind Pflicht");
//     await postData("/api/appointment_assignee", {
//       appointment: assigneeAppointmentId,
//       user: assigneeUserId,
//       user_type: assigneeUserType,
//     });
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-6">Admin Multi-Table Form</h1>

//       {/* Tabs */}
//       <nav className="flex space-x-4 mb-6 border-b">
//         {[
//           { id: "categories", label: "Kategorien" },
//           { id: "patients", label: "Patienten" },
//           { id: "appointments", label: "Termine" },
//           { id: "relatives", label: "Angehörige" },
//           { id: "activities", label: "Aktivitäten" },
//           { id: "assignees", label: "Termin-Zuweisungen" },
//         ].map((tab) => (
//           <button
//             key={tab.id}
//             className={`pb-2 border-b-2 ${
//               activeTab === tab.id ? "border-black font-semibold" : "border-transparent"
//             }`}
//             onClick={() => {
//               setActiveTab(tab.id);
//               setError(null);
//               setSuccessMsg(null);
//             }}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </nav>

//       {/* Error and success messages */}
//       {error && <p className="text-red-600 mb-4">{error}</p>}
//       {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}

//       {/* Forms */}
//       {activeTab === "categories" && (
//         <form onSubmit={handleCategorySubmit} className="space-y-4 max-w-lg">
//           <label>
//             Label (Pflicht)
//             <input
//               type="text"
//               value={catLabel}
//               onChange={(e) => setCatLabel(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Beschreibung
//             <textarea
//               value={catDescription}
//               onChange={(e) => setCatDescription(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label>
//             Farbe
//             <input
//               type="color"
//               value={catColor}
//               onChange={(e) => setCatColor(e.target.value)}
//               className="w-full h-10 p-0 border rounded"
//             />
//           </label>
//           <label>
//             Icon
//             <input
//               type="text"
//               value={catIcon}
//               onChange={(e) => setCatIcon(e.target.value)}
//               className="w-full border p-2 rounded"
//               placeholder="Icon Name"
//             />
//           </label>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
//           >
//             {loading ? "Speichert..." : "Kategorie erstellen"}
//           </button>
//         </form>
//       )}

//       {activeTab === "patients" && (
//         <form onSubmit={handlePatientSubmit} className="space-y-4 max-w-lg">
//           <label>
//             Vorname (Pflicht)
//             <input
//               type="text"
//               value={patFirstName}
//               onChange={(e) => setPatFirstName(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Nachname (Pflicht)
//             <input
//               type="text"
//               value={patLastName}
//               onChange={(e) => setPatLastName(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Geburtsdatum
//             <input
//               type="date"
//               value={patBirthDate}
//               onChange={(e) => setPatBirthDate(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label>
//             Pflegegrad (Zahl)
//             <input
//               type="number"
//               step="0.1"
//               value={patCareLevel}
//               onChange={(e) => setPatCareLevel(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label>
//             Pronomen
//             <input
//               type="text"
//               value={patPronoun}
//               onChange={(e) => setPatPronoun(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label>
//             E-Mail
//             <input
//               type="email"
//               value={patEmail}
//               onChange={(e) => setPatEmail(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={patActive}
//               onChange={(e) => setPatActive(e.target.checked)}
//             />
//             <span>Aktiv</span>
//           </label>
//           <label>
//             Aktiv seit
//             <input
//               type="date"
//               value={patActiveSince}
//               onChange={(e) => setPatActiveSince(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
//           >
//             {loading ? "Speichert..." : "Patient erstellen"}
//           </button>
//         </form>
//       )}

//       {activeTab === "appointments" && (
//         <form onSubmit={handleAppointmentSubmit} className="space-y-4 max-w-lg">
//           <label>
//             Start (Pflicht)
//             <input
//               type="datetime-local"
//               value={apptStart}
//               onChange={(e) => setApptStart(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Ende (Pflicht)
//             <input
//               type="datetime-local"
//               value={apptEnd}
//               onChange={(e) => setApptEnd(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Ort
//             <input
//               type="text"
//               value={apptLocation}
//               onChange={(e) => setApptLocation(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label>
//             Patient (Pflicht)
//             <select
//               value={apptPatientId}
//               onChange={(e) => setApptPatientId(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             >
//               <option value="">Patient auswählen</option>
//               {patients.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.firstname} {p.lastname}
//                 </option>
//               ))}
//             </select>
//           </label>
//           <label>
//             Kategorie
//             <select
//               value={apptCategoryId}
//               onChange={(e) => setApptCategoryId(e.target.value)}
//               className="w-full border p-2 rounded"
//             >
//               <option value="">Keine Kategorie</option>
//               {categories.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {c.label || c.name}
//                 </option>
//               ))}
//             </select>
//           </label>
//           <label>
//             Notizen
//             <textarea
//               value={apptNotes}
//               onChange={(e) => setApptNotes(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label>
//             Titel
//             <input
//               type="text"
//               value={apptTitle}
//               onChange={(e) => setApptTitle(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
//           >
//             {loading ? "Speichert..." : "Termin erstellen"}
//           </button>
//         </form>
//       )}

//       {activeTab === "relatives" && (
//         <form onSubmit={handleRelativeSubmit} className="space-y-4 max-w-lg">
//           <label>
//             Pronomen
//             <input
//               type="text"
//               value={relPronoun}
//               onChange={(e) => setRelPronoun(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <label>
//             Vorname (Pflicht)
//             <input
//               type="text"
//               value={relFirstName}
//               onChange={(e) => setRelFirstName(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Nachname (Pflicht)
//             <input
//               type="text"
//               value={relLastName}
//               onChange={(e) => setRelLastName(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Notizen
//             <textarea
//               value={relNotes}
//               onChange={(e) => setRelNotes(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </label>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
//           >
//             {loading ? "Speichert..." : "Angehöriger erstellen"}
//           </button>
//         </form>
//       )}

//       {activeTab === "activities" && (
//         <form onSubmit={handleActivitySubmit} className="space-y-4 max-w-lg">
//           <label>
//             Termin (Pflicht)
//             <select
//               value={actAppointmentId}
//               onChange={(e) => setActAppointmentId(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             >
//               <option value="">Termin auswählen</option>
//               {appointments.map((a) => (
//                 <option key={a.id} value={a.id}>
//                   {a.title || new Date(a.start).toLocaleString()}
//                 </option>
//               ))}
//             </select>
//           </label>
//           <label>
//             Typ (Pflicht)
//             <input
//               type="text"
//               value={actType}
//               onChange={(e) => setActType(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Inhalt (Pflicht)
//             <textarea
//               value={actContent}
//               onChange={(e) => setActContent(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             />
//           </label>
//           <label>
//             Erstellt von (User ID, optional)
//             <input
//               type="text"
//               value={actCreatedBy}
//               onChange={(e) => setActCreatedBy(e.target.value)}
//               className="w-full border p-2 rounded"
//               placeholder="UUID"
//             />
//           </label>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
//           >
//             {loading ? "Speichert..." : "Aktivität erstellen"}
//           </button>
//         </form>
//       )}

//       {activeTab === "assignees" && (
//         <form onSubmit={handleAssigneeSubmit} className="space-y-4 max-w-lg">
//           <label>
//             Termin (Pflicht)
//             <select
//               value={assigneeAppointmentId}
//               onChange={(e) => setAssigneeAppointmentId(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//             >
//               <option value="">Termin auswählen</option>
//               {appointments.map((a) => (
//                 <option key={a.id} value={a.id}>
//                   {a.title || new Date(a.start).toLocaleString()}
//                 </option>
//               ))}
//             </select>
//           </label>
//           <label>
//             Benutzer-ID (Pflicht)
//             <input
//               type="text"
//               value={assigneeUserId}
//               onChange={(e) => setAssigneeUserId(e.target.value)}
//               className="w-full border p-2 rounded"
//               required
//               placeholder="UUID"
//             />
//           </label>
//           <label>
//             Benutzertyp (optional)
//             <input
//               type="text"
//               value={assigneeUserType}
//               onChange={(e) => setAssigneeUserType(e.target.value)}
//               className="w-full border p-2 rounded"
//               placeholder="z.B. relatives"
//             />
//           </label>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
//           >
//             {loading ? "Speichert..." : "Zuweisung erstellen"}
//           </button>
//         </form>
//       )}
//     </div>
//   );
// }



