 export const germanyOffsetMs = 2 * 60 * 60 * 1000;
 export const limit= 2


   const date = new Date();

// Format for Berlin timezone
const DateParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).formatToParts(date);

// Extract parts
let mm, dd, yyyy;
for (const part of DateParts) {
  if (part.type === "month") mm = part.value;
  if (part.type === "day") dd = part.value;
  if (part.type === "year") yyyy = part.value;
}

export const formattedDate = `${mm}-${dd}-${yyyy}`;


 