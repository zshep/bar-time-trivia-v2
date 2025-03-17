
import { useState, useEffect } from "react";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig.js";
import { setDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";



export default function CreateGame({ onGameDataChange}) {
  const [gameName, setGameName] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [gameCount, setGameCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // grabs user id and number of games created
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("User authenticated:", user);
        setUserId(user.uid);

        try {
          const gamesRef = collection(db, "games");
          const q = query(gamesRef, where("user_id", "==", user.uid));
          const querySnapshot = await getDocs(q);
          setGameCount(querySnapshot.size);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching game count:", err);
          setError(err.message);
          setLoading(false);
        }
      } else {
        console.log("No user authenticated.");
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  
  useEffect(() => {
    if (onGameDataChange) {
      onGameDataChange({ gameName, description, userId });
    }
  }, [gameName, description, userId]);


  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>Error: {error}</p>;


  return (
    <div className="justify-items-center">
      <h1>Create a Trivia Game</h1>
      <p>You have created {gameCount} games.</p>
      <div className="flex flex-col w-1/2 justify-items-center">
        <label htmlFor="gameName">Trivia Game Name</label>
        <input 
          id="gameName" 
          type="text" 
          value={gameName} 
          onChange={(e) => setGameName(e.target.value)} required
          autoComplete="off" 
          />

        <label htmlFor="gameDescription">Description</label>
        <textarea id="gameDescription" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      
    </div>
  );
};