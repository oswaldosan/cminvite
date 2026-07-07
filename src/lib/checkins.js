import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { normalizeId } from "./guests.js";

const COLLECTION = "checkins";

// Record a guest's entry. Returns:
//   { status: "confirmed", at }  → first time in
//   { status: "already", at }    → was already checked in (double scan)
// Throws on Firestore/permission errors so the UI can surface them.
export async function recordCheckin(guest, method = "qr") {
  const key = normalizeId(guest.id);
  const ref = doc(db, COLLECTION, key);

  const existing = await getDoc(ref);
  if (existing.exists()) {
    return { status: "already", at: existing.data().checkedInAt || null };
  }

  await setDoc(ref, {
    identidad: guest.id,
    nombre: guest.nombre,
    empresa: guest.empresa || null,
    method,
    checkedInAt: serverTimestamp(),
  });

  return { status: "confirmed", at: null };
}

// Live subscription to the total number of check-ins (for a counter).
export function subscribeCheckinCount(onCount) {
  return onSnapshot(collection(db, COLLECTION), (snap) => onCount(snap.size));
}

export function formatCheckinTime(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return date.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });
}
