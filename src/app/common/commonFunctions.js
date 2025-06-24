import { DateTime } from 'luxon';

export function convertBerlinTimeToUTC(dateString) {
  return DateTime.fromISO(dateString, { zone: 'Europe/Berlin' }).toUTC().toISO();
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


// export function convertBerlinTimeToUTC(dateString) {
//   // Parse Berlin time as if it were UTC, then shift to real UTC
//   const berlinDate = new Date(dateString);
//   const offsetMs = -berlinDate.getTimezoneOffset() * 60 * 1000; // getTimezoneOffset gives the offset in minutes between UTC and local time
//   return new Date(berlinDate.getTime() - offsetMs).toISOString(); // convert to UTC ISO string
// }
