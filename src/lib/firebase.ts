import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey) as string,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain) as string,
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId) as string,
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket) as string,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId) as string,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId) as string,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId) as string);
export const auth = getAuth(app);
