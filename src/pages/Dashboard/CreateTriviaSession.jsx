import { auth, db } from "../../../app/server/api/firebase/firebaseConfig"
import { useEffect, useState } from "react";

import { deleteDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function CreateTriviaSession(){

    const [userId, setUserId] = useState(null);
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    
    useEffect(() => {
        //grabbing users id
    setUserId(auth.currentUser.uid);
    grabUserData();
       

    }, []);

    
    
    //grab user Data
    const grabUserData = async () => {
        try {
            
            const userGameInfo = collection(db, "games");
            const q = query(userGameInfo, where("user_id", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            

            //converting FS docs to array of game objects
            const gameList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setGames(gameList);
            console.log("games: ", gameList);



        } catch(err){
            console.log("error grabbing user's games: ", err)
        }

    }

    const handleBtnClick = () => {

        console.log("the btn was clicked");
        // generate a 6 digit code


        //send code and 

    }


    return (
        <div className="flex flex-col w-full justify-center mt-20">
            <h1>Create Trivia Session!</h1>
            <div className="self-center mt-3">
                <div className="flex flex-col">
                    
                    <label htmlFor="game">Select a Game</label>
                    <select
                        value={selectedGame}
                        name="game"
                        className="self-center text-center"
                        required
                        onChange={(e) => setSelectedGame(e.target.value)}
                        >
                            {
                                games.map((game) => (

                                    <option
                                        key={game.id}
                                        value={game.name}
                                        >{game.name}
                                        

                                    </option>

                                ))
                                
                                
                                }
                            

                    </select>
                    
                </div>
                <button
                    className="mt-3"
                    onClick={handleBtnClick}>Create Trivia Session</button>


            </div>
        </div>
    )
}