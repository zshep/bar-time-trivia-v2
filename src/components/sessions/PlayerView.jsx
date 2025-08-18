import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useState } from "react";
import socket from "../../main";

export default function PlayerView({
  currentQuestion,
  questionType,
  userId

}) {

  const currentChoices = currentQuestion?.answer?.mcChoices || [];
  const [playerChoice, setPlayerChoice] = useState([]);

  // make submitAnswerHadler
  const handleSubmitAnswer = () => {


    if (playerChoice.length < 1) {
      console.log("Please select at least one answer");
      alert("Please select at least one answer");
      return;
    } else {
      console.log("submitAnswer hit");
      console.log("Submitting these answers:", playerChoice);

      //socket handler emiting player answer
      socket.emit("player-answer", { userId, playerChoice, sessionCode })
    }



  };



  return (

    <div className="flex flex-col w-full items-center mt-5">
      <div className="">

        <div className="flex justify-center mt-4">

          {questionType === "multipleChoice" && (
            <QuestionMc choices={currentChoices} playerChoice={playerChoice} setPlayerChoice={setPlayerChoice} />
          )}

          {questionType === "freeResponse" && (
            /*<QuestionFc
              answer={frAnswer}
              setAnswer={setFrAnswer}
            />*/
            <p>I'm a FR component</p>
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