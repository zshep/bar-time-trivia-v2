import { useState, useEffect } from "react";
import Roundcard from "./Roundcard";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";


export default function RoundList({game, rounds, setRounds}) {
    const [roundsState, setRoundsState] = useState([]); // State for rounds data
    const [roundNum, setRoundNum] = useState(0);
    const [ selectedGame, setSelectedGame ] = useState(null);

    const gameId = game.id;

    const getRoundData = async () => {
        const roundsInfo = collection(db, "rounds");
        const q = query(roundsInfo, where("gameId", "==", gameId), orderBy("roundNumber", "asc"));
        const snapshot = await getDocs(q);

        const roundList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log("List of Rounds", roundList);

        setRoundsState(roundList);
    }
    
   
    //grabbing round data from user.
    useEffect(() => {
        
        if (gameId){
            getRoundData();
        }

    }, [gameId]);

    // function to grab current number of rounds for game
    const getRoundCount = async (gameId) => {
        //console.log("counting rounds for gameid: ", gameId);
        const roundsInfo = collection(db, "rounds");
        const q = query(roundsInfo, where("gameId", "==", gameId));
        
        const snapshot = await getDocs(q);

        //converting Firestore docs to an array of game objects
        
        console.log("total number of Rounds:", snapshot.size)

        return snapshot.size;
    }

    

     // Function to add a new round (example)
    const addRound = async (gameId, roundType) => {
        try {

            console.log("starting to add round");
            //getting number of rounds for game
            const roundCount = await getRoundCount(gameId);
            
            const newRound = {
                gameId: gameId,
                roundNumber: roundCount + 1,
                roundType: "MC",
                numberQuestions: 0,
                createdAt: new Date()
            };
            //adding doc to firestore
            const docRef = await addDoc(collection(db, "rounds"), newRound);
            console.log("New round added", docRef.id);

            // re-fetching data:
            if (gameId) {
              await  getRoundData();
            }

            return docRef;

        }catch (err){
            console.log("Error adding Rounds", err)
        }
      };


      //delete round
      const deleteRound = async (id) => {
        console.log("we're going to delete YOU Round!!", id);
        setSelectedGame(id);

        try {
            
            const roundRef = doc(db, "rounds", id);
            await deleteDoc(roundRef);

            //optimistically removing round
            setRoundsState(prevRound => prevRound.filter(roundsState => roundsState.id !== selectedGame));

            console.log("Round Delete Successfully");

            // re-fetching data:
            if (gameId) {
               await getRoundData();
            }


        } catch (err) {
            console.error("Error Deleting Round:", err);
        }


      }



    return (

        <div>
            <p>Rounds</p>
            <div className="mb-1 justify-items-center">
                {roundsState.map((round, index) => (
                    <Roundcard 
                        key={index} 
                        roundData={round}
                        deleteRound={deleteRound} />
                ))}
            </div>

            <div>
                <button type="button" onClick={() => addRound(gameId)}>Add Round</button> 
                
            </div>
        </div>
    )
};