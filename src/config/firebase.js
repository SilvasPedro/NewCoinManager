// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Adicionado para o Banco de Dados

const firebaseConfig = {
  apiKey: "AIzaSyC_4uHxa8NsmExmbZ602r8IsUZg6yvbO7o",
  authDomain: "coinmanager-7e0bd.firebaseapp.com",
  projectId: "coinmanager-7e0bd",
  storageBucket: "coinmanager-7e0bd.firebasestorage.app",
  messagingSenderId: "812321893222",
  appId: "1:812321893222:web:b75756885a781ca09e36a7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // Exporta o banco de dados
export const googleProvider = new GoogleAuthProvider(); // Exporta o provedor do Google