import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBD9K7HKgQIIXU5zXkYI01e0BJbb3s6X2c",
    authDomain: "plan-b-canales.firebaseapp.com",
    projectId: "plan-b-canales",
    storageBucket: "plan-b-canales.appspot.com",
    messagingSenderId: "451817571128",
    appId: "1:451817571128:web:313c8b90517c58a45c37cd"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
