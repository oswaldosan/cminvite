import { normalizeId } from "./guests.js";

// The boarding-pass QR encodes a pipe-delimited string, e.g.:
//   "CM AIRLINES 2026|PAX:OSWALDO SANCHEZ|ID:0502199200553|FLT:CM2026|..."
// This extracts the passenger ID (and name) so the scanner can look them up.
export function parseQrPayload(raw) {
  const text = String(raw || "").trim();
  if (!text) return { id: "", name: "" };

  const fields = {};
  text.split("|").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx > 0) {
      const key = part.slice(0, idx).trim().toUpperCase();
      fields[key] = part.slice(idx + 1).trim();
    }
  });

  // Prefer the explicit ID field; fall back to treating the whole payload as an
  // ID if someone scans a plain identity number (no pipe structure).
  let id = fields.ID || "";
  if (!id && /^[0-9A-Za-z\s-]+$/.test(text) && !text.includes("|")) {
    id = text;
  }

  return { id: normalizeId(id), name: fields.PAX || "" };
}
