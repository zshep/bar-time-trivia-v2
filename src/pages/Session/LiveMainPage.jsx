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
  const [roundNumber, setRoundNumber] = useState(1);
  const session = useGameSession({ gameId, sessionCode, hostId });


  const isHost = sessionCode.userId === hostId;
  const isPresenter = Boolean(
    new URLSearchParams(window.location.search).get("presenter")
  );

  if (isHost) {
    return <HostView {...session} />;
  } else {
    return <PlayerView {...session} />;
  }


}