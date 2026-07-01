import data from "../data/guests.json";

// Normalize an ID for comparison: keep alphanumerics (so passport letters
// like "YB8796642" are preserved), drop separators (dashes, spaces, dots),
// and uppercase. National IDs typed with or without dashes still match.
export const normalizeId = (s) =>
  String(s || "")
    .replace(/[^0-9a-zA-Z]/g, "")
    .toUpperCase();

export function findGuest(rawId) {
  const target = normalizeId(rawId);
  if (!target) return null;
  return (data.guests || []).find((g) => normalizeId(g.id) === target) || null;
}

// Event timing — floating local time (no Z / no TZID) so every device shows
// 7:00 PM regardless of its timezone, which is what we want for an in-person event.
const EVENT_START = "20260708T190000";
const EVENT_END = "20260708T230000";
const EVENT_LOCATION = "Aeropuerto Toncontín, Tegucigalpa";

// Escape per RFC 5545 (commas, semicolons, backslashes, newlines).
const icsEscape = (s) =>
  String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

function buildIcs(t) {
  // DTSTAMP must be a UTC timestamp; fixed value keeps the file deterministic.
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CM Airlines//Evento 2026//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:cm-airlines-2026@cmairlines.com",
    "DTSTAMP:20260101T000000Z",
    `DTSTART:${EVENT_START}`,
    `DTEND:${EVENT_END}`,
    `SUMMARY:${icsEscape(t.ics_summary)}`,
    `DESCRIPTION:${icsEscape(t.slogan)}`,
    `LOCATION:${icsEscape(EVENT_LOCATION)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function googleCalUrl(t) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: t.ics_summary,
    dates: `${EVENT_START}/${EVENT_END}`,
    details: t.slogan,
    location: EVENT_LOCATION,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function isIOS() {
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as Mac, detect via touch points
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isAndroid() {
  return /Android/.test(navigator.userAgent || "");
}

function triggerIcs(t, filename = "CM-Airlines-2026.ics") {
  const ics = buildIcs(t);
  const a = document.createElement("a");
  if (isIOS()) {
    // iOS Safari handles a text/calendar data URI by opening the
    // "Add to Calendar" sheet; blob downloads are unreliable here.
    a.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  } else {
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    a.href = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Add-to-calendar entry point with platform-aware UX:
//  - Android  → open Google Calendar template (most users have GCal, opens app)
//  - iOS/desktop → .ics (Apple Calendar, Outlook, etc.)
export function addToCalendar(t) {
  if (isAndroid()) {
    window.open(googleCalUrl(t), "_blank", "noopener");
    return;
  }
  triggerIcs(t);
}
