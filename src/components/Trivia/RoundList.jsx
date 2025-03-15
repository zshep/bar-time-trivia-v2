import { useState, useEffect } from "react";
import Roundcard from "./Roundcard";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";


export default function RoundList(game) {
    const [rounds, setRounds] = useState([]); // State for rounds data
    const [roundNum, setRoundNum] = useState(0);

    
    const gameId = game.game.id;
    //console.log("game: ", game);
    //console.log("gameID: ",gameId);
    
    //grabbing nuber of rounds
    useEffect(() => {
        console.log("Fetching rounds...");
        const count =getRoundCount(gameId);
        setRoundNum(count);

    }, [gameId]);
    
    //grabbing round data from user.
    useEffect(() => {
        

    })

    // function to grab current number of rounds for game
    const getRoundCount = async (gameId) => {
        //console.log("counting rounds for gameid: ", gameId);
        const roundsInfo = collection(db, "rounds");
        const q = query(roundsInfo, where("gameId", "==", gameId));
        
        const snapshot = await getDocs(q);
        
        console.log("total number of Rounds:", snapshot.size)


        return snapshot.size;
    }

     // Function to add a new round (example)
    const addRound = async (gameId, roundType) => {
        try {

            console.log("starting to add round");
            //getting number of rounds for game
            //const roundCount = await getRoundCount(gameId);
            console.log("round count:", roundNum);
            const newRound = {
                gameId: gameId,
                roundNumber: roundNum + 1,
                roundType: "roundType",
                numberQuestions: 0,
                createdAt: new Date()
            };
            //adding doc to firestore
            const docRef = await addDoc(collection(db, "rounds"), newRound);
            console.log("New round added", docRef.id);

            return doc.Ref;

        }catch (err){
            console.log("Error adding Rounds", err)
        }
      };


      //
      const handleAddRound = async() => {
        const gameId = "123"
        const roundType = "Multiple Choice"

        await addRound(gameId, roundType);
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
                <button type="button" onClick={() => addRound(gameId)}>Add Round</button> 
                
            </div>
        </div>
    )
};