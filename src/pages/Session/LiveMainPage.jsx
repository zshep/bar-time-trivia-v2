import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../main";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { orderBy, getDocs, collection, query, where } from "firebase/firestore";
import { doc } from "firebase/firestore/lite";
import QuestionMc from "../../components/sessions/questionMc";
import QuestionFc from "../../components/sessions/questionFc";
import QuestionSort from "../../components/sessions/questionsort";

export default function LiveMainPage() {

  const { state } = useLocation();
  const { gameName, gameId, sessionCode, hostId } = state;

  //variables for game logic
  const [roundData, setRoundData] = useState([]);
  const [roundId, setRoundId] = useState('');
  const [questionData, setQuestionData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionType, setQuestionType] = useState("");
  const [questionCategory, setQuestionCatergory] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [answer, setAnswer] = useState([]);
  const [players, setPlayers] = useState([]);

  //variables based on Question type
  //For MC, storing array of an answer choices
  const [mcChoices, setMcChoices] = useState(["", "", "", ""]);
  const [mcPlayerChoice, setMcPlayerChoice] = useState([]);
  const [mcAnswers, setMcAnswers] = useState([]);
  // for FR, storing single string
  const [frAnswer, setFrAnswer] = useState("");

  // for Sort, store it in as array of objects???
  const [sortAnswers, setSortAnswers] = useState({});


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

  //emitting "send-question"
  useEffect(() => {
    if (currentQuestion /*&& userId === hostId*/) {
      socket.emit("send-question", {
        roundNumber,
        questionNumber,
        question: currentQuestion,
        sessionCode
      });
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (questionType == 'multipleChoice') {
      console.log("It's MC");

      setMcChoices(currentQuestion.answers);
      setMcPlayerChoice([]);
    }

    else if (questionType == 'freeResponse') {
      console.log("it's a FR")
    }

    else if (questionType == 'sort') {
      console.log("it's a sort")
    }
  }, [])

  const handleSubmitAnswer = () => {

    const finalAnswer =
      questionType === "multipleChoice"
        ? mcPlayerChoice
        : frAnswer;


    socket.emit("player-answer", {
      sessionCode,
      roundNumber,
      questionNumber,
      answer: finalAnswer,
      playerId: myPlayerId
    });

  }

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
      <div className="">
        <div className="mt-10 text-2xl">
          <p>{questionText || "Loading Question..."}</p>
        </div>
        <div className="flex justify-center mt-24">

          {questionType === "freeResponse" && (
            <QuestionFc
              answer={frAnswer}
              setAnswer={setFrAnswer}
            />
          )}
          {questionType === "multipleChoice" && currentQuestion && (
            <QuestionMc
              choices={mcChoices}
              playerChoice={mcPlayerChoice}
              setPlayerChoice={setMcPlayerChoice}
            />
          )}
          {questionType === "sort" && (
            <QuestionSort />
          )}
        </div>

        <div className="flex justify-center mt-10 ">

          <button onClick={() => handleSubmitAnswer()} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
            Submit Answer
          </button>
        </div>

      </div>




    </div>
  )
}