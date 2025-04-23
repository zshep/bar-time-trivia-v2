import { auth, db } from "../../../app/server/api/firebase/firebaseConfig"
import { useEffect, useState } from "react";

import { deleteDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function CreateTriviaSession(){

    const [userId, setUserId] = useState(null);
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState("");
    
    //grabbing users data
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user)
            {
                //console.log("user: ", user);
                setUserId(user.uid);
                grabUserData(user.uid);
            } else {
                console.log("there is no user");
            }

        });

        return () => unsubscribe();
    }, []);

    
    
    //grab user Data
    const grabUserData = async (id) => {
        try {
            
            const userGameInfo = collection(db, "games");
            const q = query(userGameInfo, where("user_id", "==", id));
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

        if (selectedGame === "") {

            console.log("There is no game selected");
            alert("You didn't select a game!");
            return

        } else {

            console.log(`Session created for ${selectedGame} Game`);
            
            
            // generate a 6 digit code
            const joinCode = "123abc";
                
    
            //send code and selectedGame to Session Lobby 
        }

    }


    return (
        <div className="flex flex-col w-full mt-6">
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
                                <option
                                    disabled value=""
                                    >-- Choose Game --</option>
                            {
                                games.map((game) => (
                                  
                                    <option
                                        key={game.id}
                                        value={game.name || ""}
                                        >{game.name}
                                        

                                    </option>

                                ))
                                
                                
                                }
                            

                    </select>
                    
                </div>
                <button
                    className="mt-3 w-24 bg-green-400 text-white"
                    onClick={handleBtnClick}>Create Session</button>


            </div>
        </div>
    )
}