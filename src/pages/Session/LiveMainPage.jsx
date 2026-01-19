import { useEffect, useState } from "react";
import {useLocation, useParams } from "react-router-dom";
import socket from "../../main";
import { safeEmit } from "../../utils/safeEmit";
import { useReconnect } from "../../hooks/useReconnect";
import { db, auth } from "../../../app/server/api/firebase/firebaseConfig";
import { orderBy, getDocs, collection, query, where } from "firebase/firestore";
import { useGameSession } from "../../hooks/useGameSession";
import PlayerView from "../../components/sessions/PlayerView";
import HostView from "../../components/sessions/HostView";

export default function LiveMainPage() {

  const { state } = useLocation();
  const sessionCode = state?.sessionCode;
  
  //grabing game info if there
  const [meta, setMeta] = useState({
    gameName: state?.gameName,
    gameId: state?.gameId,
    hostId: state?.hostId,
    sessionCode
  });

  //grab game info if not there
  useEffect(() => {
    let requested = false;
    function onInfo(p) {
      setMeta(m => ({
        ...m,
        gameName: p.gameName ?? m.gameName,
        gameId: p.gameId ?? m.gameId,
        hostId: p.hostId ?? m.hostId,
        sessionCode: p.sessionCode ?? m.sessionCode,
        
        currentRoundId: p.currentRoundId ?? m.currentRoundId,

        //optional: currentRoundIndex, totalRounds, currentRoundID
      }))
    }

    if (sessionCode && (!meta.gameId || !meta.hostId)) {
      if (!requested) {
        requested = true;
        socket.emit('request-session-info', { sessionCode });
      }
    }
    socket.on('session-info', onInfo);
    return () => socket.off('session-info', onInfo);

  }, [sessionCode]);
  

  const session = useGameSession(meta);
  const currentRoundDisplay = (session.currentRoundNumber ?? 0) + 1;
  


  console.log("session:", session);
  //console.log(`gameId: ${gameId} sessionCode: ${sessionCode} hostId: ${hostId}`)
  //reconnect hook
  useReconnect();

 
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
  if (!sessionCode || !meta.hostId || session.loading) {

    console.log(`gameId: ${meta.gameId} sessionCode: ${sessionCode} hostId: ${meta.hostId} session.loading: ${session.loading}`)
    

    return (
      <div className="flex flex-col items-center w-full">
        <p>Loading session...</p>
        <p>SessionCode: {sessionCode}</p>
        <p>HostId: {meta.hostId}</p>
        <p>Loading status: {session.loading ? "true" : "false"}</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex border border-black justify-around w-1/3">
        <div>
          <p>Game: {meta.gameName}</p>
        </div>
        <div>
          <p>Round: {currentRoundDisplay}</p>
        </div>
      </div>

      <div className="mt-10 text-2xl">
        <p>{session.questionText || "Loading Question..."}</p>
      </div>


      <div>

        {isHost && (
          <HostView {...session}  />
        )}
        {!isHost && (
          <PlayerView {...session} />
        )}


      </div>



    </div>

  )




}