import { useState, useEffect } from "react";
import Roundcard from "./Roundcard";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import {  db } from "../../../app/server/api/firebase/firebaseConfig";


export default function RoundList({game, rounds, setRounds}) {
    const [roundsState, setRoundsState] = useState([]); // State for rounds data
    const [roundCategory, setRoundCategory] = useState(null);
    const [selectedGame, setSelectedGame ] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] =useState(false);
    const [selectedRound, setSelectedRound] = useState(null);

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
    
    //getRoundData();
   
    //grabbing round data from user.
    useEffect(() => {
        
        if (gameId){
            getRoundData(gameId);
        }

    }, [gameId]);

    // function to grab current number of rounds for game
    const getRoundCount = async (gameId) => {
        //console.log("counting rounds for gameid: ", gameId);
        const roundsInfo = collection(db, "rounds");
        const q = query(roundsInfo, where("gameId", "==", gameId));
        
        const snapshot = await getDocs(q);

        //converting Firestore docs to an array of game objects
        
        //console.log("total number of Rounds:", snapshot.size)

        return snapshot.size;
    }

     // open modal to add Round Category
     const chooseCategory = () => {
        setRoundCategory("");
        console.log("Choose the category for the round");
        setIsModalOpen(true);
     }

    

     // Function to add a new round (example)
    const addRound = async (gameId, category) => {
        try {

            setIsModalOpen(false);
            console.log("starting to add round");
            //getting number of rounds for game
            const roundCount = await getRoundCount(gameId);
            
            const newRound = {
                gameId: gameId,
                roundNumber: roundCount + 1,
                roundCategory: category,
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

      const confirmDeleteRound = (round) => {
        console.log("You are going to delete this round: ", round);
        setSelectedRound(round);
        setDeleteOpen(true);
      }


      //delete round
      const deleteRound = async () => {
        console.log("we're going to delete YOU Round!!", selectedRound.roundCategory);
        

        try {
            
            const roundRef = doc(db, "rounds", selectedRound.id);
            await deleteDoc(roundRef);

            //optimistically removing round
            setRoundsState(prevRound => prevRound.filter(roundsState => roundsState.id !== selectedGame));

            console.log("Round Delete Successfully");
            setDeleteOpen(false);

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
                        confirmDeleteRound={confirmDeleteRound} />
                ))}
            </div>

            <div className="mb-3">
                <button type="button" onClick={() => chooseCategory()}>Add Round</button> 
                
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
                        <h3 className="text-lg font-bold">Add Round</h3>
                        <label htmlFor="roundCategory">What is the cateogry for the round?</label>
                        <input
                            className="border border-black p-2" 
                            id="roundCategory"
                            type="text"
                            value={roundCategory}
                            onChange={(e) => setRoundCategory(e.target.value)}
                            placeholder="Category"
                            autoComplete="off"
                            />
                        
                        <div className="flex justify-end mt-4 ">
                            <button onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded-full">
                                Cancel
                            </button>
                            <button onClick={() =>addRound(gameId, roundCategory)} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                                Add Round
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteOpen && (
                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                 <div className="bg-white p-6 rounded-lg shadow-lg">
                     <h3 className="text-lg font-bold">Confirm Deletion</h3>
                     <p>Are you sure you want to delete the round <strong>{selectedRound.roundCategory}?!?!</strong>?This action will delete all attached questions and cannot be undone.</p>
                     <div className="flex justify-end mt-4">
                         <button onClick={() => setDeleteOpen(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded-full">
                             Cancel
                         </button>
                         <button onClick={deleteRound} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
                             Yes, Delete
                         </button>
                     </div>
                 </div>
             </div>
                
            )}
        </div>
    )
};