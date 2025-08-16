import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../main";
import { db, auth } from "../../../app/server/api/firebase/firebaseConfig";
import { orderBy, getDocs, collection, query, where } from "firebase/firestore";
import { useGameSession } from "../../hooks/useGameSession";
import QuestionMc from "../../components/sessions/questionMc";
import QuestionFc from "../../components/sessions/questionFc";
import QuestionSort from "../../components/sessions/questionsort";
import PlayerView from "../../components/sessions/PlayerView";
import HostView from "../../components/sessions/HostView";


export default function LiveMainPage() {

  const { state } = useLocation();
  const { gameName, gameId, sessionCode, hostId } = state;

  const session = useGameSession({ gameId, sessionCode, hostId });

  console.log("session:", session);

  // socket to grab question data
  useEffect(() => {
    if (!session) {
      console.log("You ain't got no session, Jack!");
      // complete socket handler to listen and deal with data

      socket.on('new-question', ({ questionData }) => {
        console.log("here's the new data", questionData);
      })
      

    }
    else {
      console.log("You have a session");
     
    }

  }, [])

  //finding host
  const isHost = session.userId === session.hostId;
  console.log("isHost??", isHost);

  // determining who is the presenter
  const isPresenter = Boolean(
    new URLSearchParams(window.location.search).get("presenter")
  );

  // protecting with conditional rendering
    if (!gameId || !sessionCode || !hostId || session.loading) {
      console.log("Waiting for session data...")
      console.log("what we do have:", gameId, sessionCode, hostId, session.loading)
      //need socket handler in order to listen for question details

      socket.on('new-question', ({questionData}) => {
        console.log("Here's the new question", questionData);
        
      })
      
      
      

      return <p>Loading...</p>;
    }


  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex border border-black justify-around w-1/3">
        <div>
          <p>Game: {gameName}</p>
        </div>
        <div>
          <p>Round: {/*roundNumber*/}</p>
        </div>
      </div>

      <div className="mt-10 text-2xl">
        <p>{session.questionText || "Loading Question..."}</p>
      </div>


      <div>

        {isHost && (
          <HostView {...session} />
        )}
        {!isHost && (
          <PlayerView {...session} />
        )}


      </div>



    </div>

  )




}