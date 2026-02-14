import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useState, useEffect } from "react";
import socket from "../../main";
import { useNavigate } from "react-router-dom";
import QuestionSort from "./questionsort";

export default function PlayerView({
  sessionCode,
  currentQuestion,
  questionType,
  userId

}) {

  const navigate = useNavigate();
  const labels = (currentQuestion?.choices || []).map(c => c.label);
  const currentQuestionId = currentQuestion?.id || "no-ID";
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [playerFrAnswer, setPlayerFrAnswer] = useState("");
  const [answered, setAnswered] =useState(false);
  // end Round
    useEffect(() => {
      
      const endRoundHandler = ({ sessionCode }) => {
        console.log("The host is ending the round")
        navigate(`/session/live/${sessionCode}/end`, {
          state: {
            isHost: false,
          },
        });
      };
      socket.on('round-ended', endRoundHandler);
      return () => {
        socket.off('round-ended', endRoundHandler);
      }
  
    }, [navigate]);

  // make submitAnswerHadler
  const handleSubmitAnswer = () => {

    if (currentQuestion?.type === "multipleChoice") {
      if (selectedIndexes.length < 1) {
      console.log("Please select at least one answer");
      alert("Please select at least one answer");
      return;
    } 

    const choiceIndex = selectedIndexes;
    const choiceText = selectedIndexes.map(i => labels[i]);
      
      
      //socket handler emiting player MC answer
      socket.emit("player-answer", { 
        sessionCode, 
        questionId: currentQuestionId,
        choiceIndex, 
        choiceText 
      });
      setAnswered(true);
    }

    if (currentQuestion?.type === "freeResponse") {
      if (playerFrAnswer === "") {
      console.log("Please fill out answer");
      alert("Please fill out answer");
      return;
    } else {
      console.log("submitAnswer hit");
      console.log("Submitting these answers:", playerFrAnswer);
      console.log("questionId:", currentQuestionId)
      
      //socket handler emiting player FR answer
      socket.emit("player-answer", { 
        sessionCode, 
        questionId: currentQuestionId,
        choiceText: playerFrAnswer, 
      });
      setAnswered(true);
    }
    }
  };

  //reset answered marker
  useEffect(() => {
    setAnswered(false);
    setPlayerFrAnswer("");
  }, [currentQuestion]);


  return (
// PlayerView (styling only)
<div className="w-full">
  <div className="mx-auto w-full max-w-3xl px-4 py-6">
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex justify-center">
        {currentQuestion?.type === "multipleChoice" && (
          <QuestionMc
            choices={labels}
            selectedIndexes={selectedIndexes}
            setSelectedIndexes={setSelectedIndexes}
          />
        )}

        {currentQuestion?.type === "freeResponse" && (
          <QuestionFc setAnswer={setPlayerFrAnswer} playerAnswer={playerFrAnswer} />
        )}

        {currentQuestion?.type === "sort" && <QuestionSort />}
      </div>

      {answered && (
        <div className="mt-4 flex justify-center">
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            Answered
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => handleSubmitAnswer()}
          className="rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
          type="button"
        >
          Submit Answer
        </button>
      </div>
    </div>
  </div>
</div>

   
  )
}