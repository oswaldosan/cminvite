import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase web config is not secret — it identifies the project to the client.
// Real access control lives in Firestore Security Rules, not here.
const firebaseConfig = {
  apiKey: "AIzaSyB2M0vTVGJ6klN-gAk1CbZv6_4eyRThsWU",
  authDomain: "cmairlines-a28da.firebaseapp.com",
  projectId: "cmairlines-a28da",
  storageBucket: "cmairlines-a28da.firebasestorage.app",
  messagingSenderId: "75107493754",
  appId: "1:75107493754:web:c1758846aaaf0721e1d8c3",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
