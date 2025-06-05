import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../main";
import { db, auth } from "../../../app/server/api/firebase/firebaseConfig";
import { orderBy, getDocs, collection, query, where } from "firebase/firestore";
import QuestionMc from "../../components/sessions/questionMc";
import QuestionFc from "../../components/sessions/questionFc";
import QuestionSort from "../../components/sessions/questionsort";
import PlayerView from "../../components/sessions/PlayerView";


export default function LiveMainPage() {

  const { state } = useLocation();
  const { gameName, gameId, sessionCode, hostId } = state;

 

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
        <div className="flex justify-center mt-4">

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