// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdOoUGdDyF6rFPgHg693Q27WNyw0GG67E",
  authDomain: "inputnilai-3b8e9.firebaseapp.com",
  projectId: "inputnilai-3b8e9",
  storageBucket: "inputnilai-3b8e9.firebasestorage.app",
  messagingSenderId: "270905570985",
  appId: "1:270905570985:web:af9d684f8e7485337f9bb8",
  measurementId: "G-S6R62TJQ4P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export db untuk digunakan di file lain
export { db };
