import data from "../data/guests.json";

const normalizeId = (s) =>
  String(s || "")
    .replace(/[^0-9a-zA-Z]/g, "")
    .toLowerCase();

export function findGuest(rawId) {
  const target = normalizeId(rawId);
  if (!target) return null;
  return (data.guests || []).find((g) => normalizeId(g.id) === target) || null;
}

function buildIcs(t) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CM Airlines//Evento 2027//ES",
    "BEGIN:VEVENT",
    "UID:cm-airlines-2027@cmairlines.com",
    "DTSTART:20270708T190000",
    "DTEND:20270708T230000",
    `SUMMARY:${t.ics_summary}`,
    `DESCRIPTION:${t.slogan}`,
    "LOCATION:Aeropuerto Toncontin\\, Tegucigalpa",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(t, filename = "CM-Airlines-2027.ics") {
  const blob = new Blob([buildIcs(t)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
