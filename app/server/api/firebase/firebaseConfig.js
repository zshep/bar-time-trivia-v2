
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDgEFs_HJsuXt0vPxhFSyRFa54ei-R8M9E",
    authDomain: "bar-time-trivia-v2.firebaseapp.com",
    projectId: "bar-time-trivia-v2",
    storageBucket: "bar-time-trivia-v2.firebasestorage.app",
    messagingSenderId: "206655535184",
    appId: "1:206655535184:web:46093ee4869772d0a07955",
    measurementId: "G-DEHZ4SKR6T"
  };

  // initialize Firebase
const app = initializeApp(firebaseConfig);

// initial Firebase Auth
export const auth = getAuth(app);

// initialize Firestore
export const db = getFirestore(app);