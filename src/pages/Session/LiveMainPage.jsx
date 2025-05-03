import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../main";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { orderBy, getDocs, collection, query, where } from "firebase/firestore";
import { doc } from "firebase/firestore/lite";


export default function LiveMainPage() {

    const { state } = useLocation();
    const { gameName, gameId, sessionCode, hostId } = state;

    //variables for game logic
    const [roundData, setRoundData] = useState({});
    const [roundId, setRoundId] = useState('');
    const [questionData, setQuestionData] =useState([]);
    const [questionType, setQuestionType] = useState("");
    const [questionCategory, setQuestionCatergory] = useState("");
    const [questionNumber, setQuestionNumber] = useState(1);
    const [roundNumber, setRoundNumber] = useState(1);
    const [question, setQuestion] = useState([]);
    const [players, setPlayers] = useState([]);

    
     // fetch rounds
  useEffect(() => {
    if (!gameId) return;
    (async () => {
      const col = collection(db, "rounds");
      const q   = query(col,
                        where("gameId", "==", gameId),
                        orderBy("roundNumber", "asc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("Round List:", list);
      setRoundData(list);
    })();
  }, [gameId]);

  //pick the correct roundId whenever rounds or roundNumber change
  useEffect(() => {
    if (roundData.length >= roundNumber) {
      setRoundId(roundData[roundNumber - 1].id);
    }
  }, [roundData, roundNumber]);

  //fetch all questions for that roundId
  useEffect(() => {
    if (!roundId) return;
    (async () => {
      const col = collection(db, "questions");
      const q   = query(col,
                        where("roundId", "==", roundId),
                        orderBy("questionNumber","asc"));
      const snap = await getDocs(q);
      setQuestionData(snap.docs.map(d => (
        { id: d.id, ...d.data() }
      )));
        console.log("QuestionData:", questionData);
    })();
  }, [roundId]);

  //extract questionType
  useEffect(() => {

  })

  //extract the single question when questionData or questionNumber change
  useEffect(() => {
    if (questionData.length >= questionNumber) {
      setQuestion(questionData[questionNumber - 1].question);
      //grabing question type
      setQuestionType(questionData[questionNumber - 1].questionType);
    }
  }, [questionData, questionNumber]);

    return (

        <div className="flex flex-col w-full items-center">
            <div className="flex border border-black justify-around w-1/3">

                <div>
                    <p>Game: {gameName}</p>
                </div>
                <div>
                    <p>Round: {roundNumber}</p>
                </div>
                            </div>
            <div>
                <div className="mt-10 text-2xl">
                  <p>{question || "Loading Question..."}</p>
                </div>
                <div>

                  <p>I am the answer choices</p>

                </div>

            </div>




        </div>
    )
}