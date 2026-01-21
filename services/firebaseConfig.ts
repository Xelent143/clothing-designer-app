
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCol2WPYlpqK4peJCHThUFj3dEkdI95jSc",
  authDomain: "streetwear-67882.firebaseapp.com",
  projectId: "streetwear-67882",
  storageBucket: "streetwear-67882.firebasestorage.app",
  messagingSenderId: "915572823262",
  appId: "1:915572823262:web:9be3e0f8f0158c3623de4f",
  measurementId: "G-BZR0354KKX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Explicitly connect to the (default) database
export const db = getFirestore(app, "(default)");

console.log("Firebase Initialized:", app.name);
