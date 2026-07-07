import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
const cfg = {
  apiKey: "AIzaSyB2M0vTVGJ6klN-gAk1CbZv6_4eyRThsWU",
  authDomain: "cmairlines-a28da.firebaseapp.com",
  projectId: "cmairlines-a28da",
  storageBucket: "cmairlines-a28da.firebasestorage.app",
  messagingSenderId: "75107493754",
  appId: "1:75107493754:web:c1758846aaaf0721e1d8c3",
};
const db = getFirestore(initializeApp(cfg));
try {
  const snap = await getDoc(doc(db, "checkins", "__conn_test__"));
  console.log("READ OK ✓ — Firestore accesible. existe doc?:", snap.exists());
  console.log("=> La base existe y las reglas permiten leer.");
} catch (e) {
  console.log("ERROR ✗");
  console.log("  code:", e.code);
  console.log("  message:", e.message);
}
process.exit(0);
