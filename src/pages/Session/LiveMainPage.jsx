import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../main";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { doc } from "firebase/firestore/lite";


export default function LiveMainPage() {

    const { state } = useLocation();
    const { gameName, gameId, sessionCode, hostId } = state;

    //variables for game logic
    const [gameData, setGameData] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [roundNumber, setRoundNumber] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [players, setPlayers] = useState([]);


    /* 
    // logic to grab game data
    useEffect(() => {
        (async () => {
          try {
            // 1) reference your "games" collection
            const gamesCol = collection(db, "games");
            // 2) build a query on the "name" field
            const q = query(gamesCol, where("name", "==", gameName));
            // 3) run it
            const snap = await getDocs(q);
            if (snap.empty) {
              console.warn(`No game found with name "${gameName}"`);
              return;
            }
            // 4) grab the first matching doc
            const docSnap = snap.docs[0];
            setGameData({ id: docSnap.id, ...docSnap.data() });
            console.log("docs", gameData);
          } catch (err) {
            console.error("Error fetching game:", err);
          }
        })();
      }, [gameName]);
      */

      useEffect(() =>{
        console.log("gameName", gameName);
        console.log("gameId:", gameId);

      },[]);



    return (

        <div className="flex flex-col w-full">
            <div className="flex border border-black justify-around">

                <div>
                    <p>Game: {gameName}</p>
                </div>
                <div>
                    <p>Round: {/*roundNumber*/}</p>
                </div>
                            </div>
            <div>
                <p>I am the question</p>
                <p>I am the answer choices</p>

            </div>




        </div>
    )
}