import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../main";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { getDoc, getDocs, collection, query, where } from "firebase/firestore";


export default function LiveMainPage() {

    // grab state from Lobby
    const location = useLocation();
    const gameName = location.state.gameName;
    const sessionCode = location.state.sessionCode;
    const hostId = location.state.hostId;

    //variables for game logic
    const [questionNumber, setQuestionNumber] = useState(1);
    const [roundNumber, setRoundNumber] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [players, setPlayers] = useState([]);

    // logic to grab game data
    const grabGameData = async () => {
        console.log("grabing game data for ", gameName);

        try {
            const gameInfo = collection(db, "games");
            const q = query(gameInfo, where ("name", "==", gameName));
            const querySnapshot = await getDocs(q);
            const gameData = querySnapshot.data();
            console.log("game Data: ", gameData);
            
            return gameData;


        } catch(err){
            console.error("could not grab Game data")
        }

    };

    useEffect(() => {

        console.log("Initalizing Data grab");
        const gameStuff = grabGameData();
        console.log("gamestuff:", gameStuff);

    },[] )



    return (

        <div className="flex flex-col w-full">
            <div className="flex border border-black">
                
                    <div>
                        <p>Game: {gameName}</p>
                    </div>
                    <div>
                        <p>Round: {roundNumber}</p>
                    </div>
                    <div>
                        <p>Host: {hostId}</p>
                    </div>
                                
            </div>
            <div>
                <p>I am the question</p>
                <p>I am the answer choices</p>

            </div>




        </div>
    )
}