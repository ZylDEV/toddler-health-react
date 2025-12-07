// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA2pvrkMaMFG-OgaVrvYT3vGlXJt8hMmPE",
  authDomain: "posyandu-bouhgenvil.firebaseapp.com",
  databaseURL: "https://posyandu-bouhgenvil-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "posyandu-bouhgenvil",
  storageBucket: "posyandu-bouhgenvil.firebasestorage.app",
  messagingSenderId: "955345269022",
  appId: "1:955345269022:web:bee534413eeee3f720590f",
  measurementId: "G-XCRBCFE0NE"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app); // <-- penting
