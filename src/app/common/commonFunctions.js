import { DateTime } from "luxon";

export function convertBerlinTimeToUTC(dateString) {
  return DateTime.fromISO(dateString, { zone: "Europe/Berlin" })
    .toUTC()
    .toISO();
}

export function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}


export function toBerlinDateTimeLocalString(utcDateString) {
  if (!utcDateString) {
    console.warn("toBerlinDateTimeLocalString: empty input");
    return "";
  }

  // Normalize input string to ISO 8601 format
  let isoString = utcDateString.trim();

  // Replace space between date and time with T, if exists and no T present
  if (!isoString.includes("T") && isoString.includes(" ")) {
    isoString = isoString.replace(" ", "T");
  }

  // Replace '+00' or '+00:00' with 'Z' (UTC)
  isoString = isoString.replace(/\+00(:00)?$/, "Z");

  // Now try to parse the date
  const utcDate = new Date(isoString);
  if (isNaN(utcDate)) {
    console.error("Invalid date passed to toBerlinDateTimeLocalString:", utcDateString, "->", isoString);
    return "";
  }

  // Format with Intl.DateTimeFormat in Berlin timezone
  const dtf = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(utcDate);
  const partMap = {};
  parts.forEach(({ type, value }) => {
    partMap[type] = value;
  });

  return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}`;
}

