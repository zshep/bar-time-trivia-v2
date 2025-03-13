import { useState } from "react";
import Roundcard from "./Roundcard";


export default function RoundList() {
    const [rounds, setRounds] = useState([]); // State for rounds data
    const [roundNum, setRoundNum] = useState(0);

    // function to grab current number of rounds for game
    const getRoundCount = async (gameId) => {
        const roundsInfo = colleciton(db, "rounds");
        const q = query(roundsInfo, where("gameid", "==", gameId));
        const snapshot = await getDocs(q);
        return snapshot.size;
    }

     // Function to add a new round (example)
    const addRound = async (gameId, roundType) => {
        try {

            //getting number of rounds for game
            const roundCount = await getRoundCount(gameId);
            const newRound = {
                gameId,
                roundNumber: roundCount + 1,
                roundType,
                numberQuestions: 0,
                createdAt: new Date()
            };
            //adding doc to firestore
            const docRef = await addDoc(collection(db, "rounds"), newRound);
            console.log("New round added", docRef.id);
            return doc.Ref.id;

        }catch (err){
            console.log("Error adding Rounds", err)
        }
      };


      //
      const handleAddRound = async() => {
        const gameId = "123"
        const roundType = "Multiple Choice"

      }



    return (

        <div>
            <p>Rounds</p>
            <div className="mb-1 justify-items-center">
                {rounds.map((round, index) => (
                    <Roundcard key={index} roundData={round} />
                ))}
            </div>

            <div>
                <button type="button" onClick={() => addRound(game.id)}>Add Round</button> 
                
            </div>
        </div>
    )
};