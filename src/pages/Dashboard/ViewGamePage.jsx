import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";

export default function ViewGamePage() {

    //create edit Games button logic
    const [games, setGames] = useState([]);
    const [ userId, setUserId ] = useState(null);


    //grabs list of games user has created
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user)
            {
                console.log("User Authenticated: ", user)
                setUserId(user.uid);

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
                <p className="text-xl  border-b-2 border-0 border-black">Games you've created</p>
                <div>
                    {games.map((game, index) => (
                        <Gamecard />

                    ))}

                </div>
            </div>
        </div>
    )



}