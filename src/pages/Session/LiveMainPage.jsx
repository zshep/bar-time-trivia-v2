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
  const currentRound = session.roundData?.[0]?.roundNumber || 1;


  console.log("session:", session);
  console.log(`gameId: ${gameId} sessionCode: ${sessionCode} hostId: ${hostId}`)


  // socket to grab question data
  useEffect(() => {
    if (!session) {
      console.log("You ain't got no session, Jack!");
      // complete socket handler to listen and deal with data
    }
    else {
      console.log("You have a session");

    }

  }, [session])

  //finding host
  const isHost = session.userId === session.hostId;
  console.log("isHost??", isHost);

  // determining who is the presenter
  const isPresenter = Boolean(
    new URLSearchParams(window.location.search).get("presenter")
  );

  // protecting with conditional rendering
  if (!sessionCode || !hostId || session.loading) {

    console.log(`gameId: ${gameId} sessionCode: ${sessionCode} hostId: ${hostId} session.loading: ${session.loading}`)

    return (
      <div>
        <p>Loading session...</p>
        <p>SessionCode: {sessionCode}</p>
        <p>HostId: {hostId}</p>
        <p>Loading status: {session.loading ? "true" : "false"}</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex border border-black justify-around w-1/3">
        <div>
          <p>Game: {gameName}</p>
        </div>
        <div>
          <p>Round: {currentRound}</p>
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