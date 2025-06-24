"use client";

import { useState } from "react";

export default function DownloadAttachmentsButton({ appointmentID }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadAttachment = (base64, filename, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: mimeType || "application/octet-stream",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || "attachment";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(link.href);
  };

  const handleDownloadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentID }),
      });

      if (!res.ok) throw new Error("Fehler beim Laden der Anhänge.");

      const attachments = await res.json();

      if (!Array.isArray(attachments) || attachments.length === 0) {
        throw new Error("Keine Anhänge gefunden.");
      }

      attachments.forEach((dataUrl, idx) => {
        if (typeof dataUrl === "string" && dataUrl.startsWith("data:")) {
          const [header, base64] = dataUrl.split(",");
          const mimeType =
            header.match(/data:(.*);base64/)?.[1] || "application/octet-stream";
          const extension = mimeType.split("/")[1] || "bin";
          const filename = `attachment_${idx + 1}.${extension}`;
          downloadAttachment(base64, filename, mimeType);
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={() => {}}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 disabled:opacity-50"
          style={{ visibility: "hidden" }}
        >
          Abbrechen
        </button>
        <button
          onClick={handleDownloadAll}
          disabled={loading}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Lädt..." : "Alle Anhänge herunterladen"}
        </button>
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </>
  );
}
