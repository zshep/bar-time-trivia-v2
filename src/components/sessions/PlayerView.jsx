import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useState, useEffect } from "react";
import socket from "../../main";
import { useNavigate } from "react-router-dom";

export default function PlayerView({
  sessionCode,
  currentQuestion,
  questionType,
  userId

}) {

  const navigate = useNavigate();
  const currentChoices = currentQuestion?.choices || [];
  const currentQuestionId = currentQuestion?.id || "no-ID";
  const [playerChoice, setPlayerChoice] = useState([]);
  const [playerFrAnswer, setPlayerFrAnswer] = useState("");

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
      if (playerChoice.length < 1) {
      console.log("Please select at least one answer");
      alert("Please select at least one answer");
      return;
    } else {
      console.log("submitAnswer hit");
      console.log("Submitting these answers:", playerChoice);
      console.log("questionId:", currentQuestionId)
      
      //socket handler emiting player answer
      socket.emit("player-answer", { choice: playerChoice, sessionCode, questionId: currentQuestionId });
    }

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
      
      //socket handler emiting player answer
      socket.emit("player-answer", { choice: playerFrAnswer, sessionCode, questionId: currentQuestionId });
    }
    }
  };



  return (

    <div className="flex flex-col w-full items-center mt-5">
      <div className="">

        <div className="flex justify-center mt-4">

          {currentQuestion?.type === "multipleChoice" && (
            <QuestionMc choices={currentQuestion.choices.map(c => c.label)} playerChoice={playerChoice} setPlayerChoice={setPlayerChoice} />
          )}

          {currentQuestion?.type === "freeResponse" && (
            <QuestionFc
              setAnswer={setPlayerFrAnswer}
              playerAnswer={playerFrAnswer}
            />
       
          )}

          {currentQuestion?.type === "sort" && (
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