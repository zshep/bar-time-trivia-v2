import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDgEFs_HJsuXt0vPxhFSyRFa54ei-R8M9E",
    authDomain: "bar-time-trivia-v2.firebaseapp.com",
    projectId: "bar-time-trivia-v2",
    storageBucket: "bar-time-trivia-v2.firebasestorage.app",
    messagingSenderId: "206655535184",
    appId: "1:206655535184:web:46093ee4869772d0a07955",
    measurementId: "G-DEHZ4SKR6T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchDocuments() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, doc.data());
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
  }
}

fetchDocuments();
