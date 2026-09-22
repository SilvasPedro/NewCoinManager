// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Adicionado para o Banco de Dados

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC_4uHxa8NsmExmbZ602r8IsUZg6yvbO7o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "coinmanager-7e0bd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "coinmanager-7e0bd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "coinmanager-7e0bd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "812321893222",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:812321893222:web:b75756885a781ca09e36a7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // Exporta o banco de dados
export const googleProvider = new GoogleAuthProvider(); // Exporta o provedor do Google