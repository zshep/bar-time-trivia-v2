import { useState, useEffect } from "react";
import socket from "../main";
import { db, auth } from "../../app/server/api/firebase/firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export function useGameSession({ gameId, sessionCode, hostId }) {

  //----------      states:     ----------
  //user data
  const [userData, setUserData] = useState([]);

  //general trivia info
  const [players, setPlayers] = useState([]);
  const [roundData, setRoundData] = useState([]);
  const [roundId, setRoundId] = useState('');
  const [roundNumber, setRoundNumber] = useState(1);
  const [questionCategory, setQuestionCatergory] = useState("");
  const [questionData, setQuestionData] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionType, setQuestionType] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answer, setAnswer] = useState([]);

  //For MC, storing array of an answer choices
  const [mcChoices, setMcChoices] = useState(["", "", "", ""]);
  const [mcPlayerChoice, setMcPlayerChoice] = useState([]);
  const [mcAnswers, setMcAnswers] = useState([]);

  // for FR, storing single string
  const [frAnswer, setFrAnswer] = useState("");
  // for Sort, store it in as array of objects???
  const [sortAnswers, setSortAnswers] = useState({});

  // ----- useEffects: -----

  function nextQuestion(){
    setQuestionNumber(q => q + 1);
  }

  function prevQuestion() {
    setQuestionNumber( q => Math.max(q - 1));
  }
  function endRound() {
    socket.emit("end-round", {sessionCode, roundNumber})
    setRoundNumber(r => r + 1);
  }
  function submitAnswer(finalAnswer) {
    socket.emit("player-answer", {sessionCode, roundNumber, questionNumber, answer:finalAnswer, playerId: userId});
  }


  //grabbing users data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("user: ", user);
        setUserId(user.uid);
        setUserData(user);

      } else {
        console.log("there is no user");
      }
    });

    return () => unsubscribe();
  }, []);

  // fetch rounds
  useEffect(() => {
    if (!gameId) return;
    (async () => {
      const col = collection(db, "rounds");
      const q = query(col,
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
    const col = collection(db, "questions");
    const q = query(col,
      where("roundId", "==", roundId),
      orderBy("questionNumber", "asc"));
    getDocs(q).then(snap => {
      setQuestionData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setQuestionNumber(1);              // reset to first question of the round
    });
  }, [roundId]);

  //extract the single question when questionData or questionNumber change
  useEffect(() => {

    if (questionData.length >= questionNumber) {
      const cq = questionData[questionNumber - 1];
      setCurrentQuestion(cq);
      setQuestionText(cq.question);
      setQuestionType(cq.questionType);
    } else {
      setCurrentQuestion(null);
      setQuestionText("");
      setQuestionType("");
    }
  }, [questionData, questionNumber]);


//----- sockets -----
  //emitting "send-question"
  useEffect(() => {
    if (currentQuestion && userId === hostId) {
      socket.emit("send-question", {
        roundNumber,
        questionNumber,
        question: currentQuestion,
        sessionCode
      });
    }
  }, [currentQuestion]);

//------ handlers -----


  return {
    // state
    currentQuestion,
    questionType,
    mcChoices,
    frAnswer,
    players,
    // metadata
    userId,
    hostId,
    // actions
    submitAnswer,
    nextQuestion,
    prevQuestion,
    endRound,
  };
}