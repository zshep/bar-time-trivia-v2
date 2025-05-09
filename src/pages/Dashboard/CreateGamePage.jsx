import { useState } from "react"; 
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { setDoc, doc, collection, addDoc } from "firebase/firestore";
import CreateGame from "../../components/Trivia/CreateGame";
import EditGame from "../../components/Trivia/EditGame";
import { useNavigate } from "react-router-dom";

export default function CreateGamePage() {
  

  const [gameData, setGameData] =useState({});
  const [rounds, setRounds] = useState({});
  
  const handleGameDataChange = (data) => {
    //console.log("Game data updated:", data);
    setGameData(data);
  };

  const navigate = useNavigate();

  const handleSubmit = async (event) => {

    event.preventDefault();
    console.log("game data: ", gameData.gameData);
    console.log("userid: ", gameData.userId);

    if (!gameData.gameName || !gameData.userId) {
      alert("Game Name and User must be set.");
      return;
    }

    try {
      // Create game document in firestore
      const gameRef = await addDoc(collection(db, "games"), {
        name: gameData.gameName,
        description: gameData.description,
        user_id: gameData.userId,
        createdAt: new Date(),
      });

      // used to pass as a state varilable going to edit-game
      const newGame = {
        id: gameRef.id,
        name: gameData.gameName,
        description: gameData.description,
        user_id: gameData.userId,
        createdAt: new Date(),
        numberRounds: 0,

      };
 

      alert("Game created successfully!");
      navigate("/dashboard/edit-game", { state: { game: newGame } });
      
      

    } catch (error) {
      console.error("Error creating game:", error);
    }
    

  }


  return (
    <div className="flex w-full justify-center mt-20">
      <form onSubmit={handleSubmit}> 
      <CreateGame onGameDataChange={handleGameDataChange} />
    
        <button className="mt-6" type="submit">Save Game </button>
        
      </form>
    </div>
  );
}