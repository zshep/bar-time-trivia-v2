import { useState } from "react"; 
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { setDoc, doc, collection, addDoc } from "firebase/firestore";
import CreateGame from "../../components/Trivia/CreateGame";
import RoundList from "../../components/Trivia/RoundList";

export default function CreateGamePage() {
  

  const [gameData, setGameData] =useState({});
  const [rounds, setRounds] = useState({});
  
  const handleGameDataChange = (data) => {
    console.log("Game data updated:", data);
    setGameData(data);
  };

  const handleSubmit = async (event) => {

    event.preventDefault();
    console.log("game data: ", gameData.gameData);
    console.log("userid: ", gameData.userId);

    if (!gameData.gameName || !gameData.userId) {
      alert("Game Name and User must be set.");
      return;
    }

    try {
      // Create game document
      const gameRef = await addDoc(collection(db, "games"), {
        name: gameData.gameName,
        description: gameData.description,
        user_id: gameData.userId,
        createdAt: new Date(),
      });
      /*
      // Create rounds as a subcollection
      for (const round of rounds) {
        await addDoc(collection(db, "games", gameRef.id, "rounds"), round);
      }
        */

      alert("Game created successfully!");
    } catch (error) {
      console.error("Error creating game:", error);
    }
    

  }


  return (
    <div className="flex w-full justify-center mt-20">
      <form onSubmit={handleSubmit}> 
      <CreateGame onGameDataChange={handleGameDataChange} />
        <RoundList rounds={rounds} setRounds={setRounds} />
        <button type="submit">Save Game</button>
        
      </form>
    </div>
  );
}