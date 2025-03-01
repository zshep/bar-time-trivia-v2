
import { useState, useEffect } from "react";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig.js";
import { setDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";



export default function CreateGame() {
  const [gameName, setGameName] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [gameCount, setGameCount] = useState(0);
  const [error, setError] = useState(null);

  // grabs user id and number of games created
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);

        // Query Firestore to get user's created games count
        const gamesRef = collection(db, "games");
        const q = query(gamesRef, where("user_id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setGameCount(querySnapshot.size);
      } else {
        console.log("error grabbing user")
      }
    };

    fetchUserData();
  }, []);

  // updating game data change
 /*
  useEffect(() => {
    onGameDataChange({ gameName, description, userId });
  }, [gameName, description, userId]);
  */

  return (
    <div className="justify-items-center">
      <h1>Create a Trivia Game</h1>
      <p>You have created {gameCount} games.</p>
      <div className="flex flex-col w-1/2 justify-items-center">
        <label htmlFor="gameName">Trivia Game Name</label>
        <input id="gameName" type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} required />

        <label htmlFor="gameDescription">Description</label>
        <textarea id="gameDescription" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <p>Created by User ID: {userId || "Not logged in"}</p>
    </div>
  );
};