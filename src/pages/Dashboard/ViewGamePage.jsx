import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";
import { setDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import Gamecard from "../../components/Trivia/GameCard";

export default function ViewGamePage() {

    //create edit Games button logic
    const [games, setGames] = useState([]);
    const [ userId, setUserId ] = useState(null);
    const [ userName, setUsername ] = useState(null);


    //grabs list of games user has created
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user)
            {
                console.log("User Authenticated: ", user)
                
                setUserId(user.uid);
                setUsername(user.displayName);

                try{
                    
                    // grabbing game info from user
                    const gamesInfo = collection(db, "games");
            
                    const q = query(gamesInfo, where("user_id", "==", user.uid));
                    const querySnapshot = await getDocs(q);

                    // Convert Firestore docs to an array of game objects
                    const gameList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    
                    
                    // adding game info to games variabel
                    setGames(gameList);
                    console.log("games: ", gameList);

                   

                } catch (err) {
                    console.log("Error with grabbing games", err);

                }
            } else {
                console.log("No user Authenticated");
            }


        });

        return () => unsubscribe(); // cleanup subscription

    }, []);

    //create delete games button logic

    return (

        <div className="flex flex-col w-full items-center">
            <div className=" mt-2 mb-2 pr-4">
                <h1>Trivia Games</h1>
            </div>

            <div>

                <div className="mt-4 mb-2 border border-black rounded-lg pt-1 bg-black">

                    <Link
                        className="text-3xl text-green-500  pt-2 pr-2 pl-2 "
                        to="/dashboard/create-game"> Create Trivia Game
                    </Link>    
                </div>
                <p className="text-xl  border-b-2 border-0 border-black">Games Created By { userName || "Your Mom" }</p>
                <div>
                {games.length > 0 ? (
                        games.map((game) => (
                            <Gamecard 
                                key={game.id} 
                                name={game.name} 
                                description={game.description} 
                                rounds={game.rounds} 
                            />
                        ))
                    ) : (
                        <p>No games found.</p>
                    )}
                </div>
            </div>
        </div>
    )



}