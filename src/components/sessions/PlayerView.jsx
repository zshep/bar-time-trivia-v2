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
  const labels = (currentQuestion?.choices || []).map(c => c.label);
  const currentQuestionId = currentQuestion?.id || "no-ID";
  const [selectedIndexes, setSelectedIndexes] = useState([]);
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
    }
    }
  };



  return (

    <div className="flex flex-col w-full items-center mt-5">
      <div className="">

        <div className="flex justify-center mt-4">

          {currentQuestion?.type === "multipleChoice" && (
            <QuestionMc 
              choices={labels} 
              selectedIndexes={selectedIndexes} 
              setSelectedIndexes={setSelectedIndexes} />
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