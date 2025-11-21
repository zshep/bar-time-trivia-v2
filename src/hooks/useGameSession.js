import { useState, useEffect } from "react";
import socket from "../main";
import { useNavigate } from "react-router-dom";
import { db } from "../../app/server/api/firebase/firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "./useAuth";
import { toWireQuestion } from "../utils/toWireQuestion";


export function useGameSession({ gameId: initialGameId, sessionCode, hostId, currentRoundIndex, currentRoundId }) {
  const user = useAuth();
  const userId = user?.uid;
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState([]);
  const [activeRoundId, setActiveRoundId] = useState(currentRoundId || null);
  const [currentRoundNumber, setCurrentRoundNumber] =useState(0);
  const [questionData, setQuestionData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [gameId, setGameId] = useState(initialGameId || "");
  const [gameName, setGameName] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [loading, setLoading] = useState(true);

  
  // ---- Get initial round meta data from server for first load/reconnect -----
  useEffect(() => {
    const handleSessionInfo = payload => {
      if (payload?.currentRound != null) {
        setCurrentRoundNumber(payload.currentRound);
      }
      if (payload?.gameId) setGameId(payload.gameId);
      if (payload?.gameName) setGameName(payload.gameName);
    };
    
    socket.on('session-info', handleSessionInfo);
    socket.emit('request-session-info', {sessionCode});
    return () => socket.off('session-info', handleSessionInfo);
  }, [sessionCode]);

  
  // ---- Fetch Rounds ----
  useEffect(() => {
    if (!gameId) return;

    const fetchRounds = async () => {
      try {
        const col = collection(db, "rounds");
        const q = query(col, where("gameId", "==", gameId), orderBy("roundNumber", "asc"));
        const snap = await getDocs(q);
        const rounds = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRoundData(rounds);
      } catch (err) {
        console.error("Error fetching rounds:", err);
      }
    };

    fetchRounds();
  }, [gameId]);

  // ---- Fetch Questions for host only ----
  useEffect(() => {
    if (!roundData.length || userId !== hostId) return;
    const idx = currentRoundNumber;
    const roundId = roundData[idx]?.id;
    if (!roundId) return;

    const fetchQuestions = async () => {
      try {
        const col = collection(db, "questions");
        const q = query(col, where("roundId", "==", roundId), orderBy("questionNumber", "asc"));
        const snap = await getDocs(q);
        const questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const wireQuestions = questions.map(toWireQuestion);
        setQuestionData(wireQuestions);
        setLoading(false);
        console.log("Wired Questions",wireQuestions);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, [roundData, userId, hostId, currentRoundNumber]);

  //listen for round change from server
  useEffect(() => {
    const onRoundChanged = ({ roundNumber }) => {
      console.log("Host is going to the next round")
      setCurrentRoundNumber(roundNumber);
      setQuestionData([]);
      setCurrentIndex(null);
      setCurrentQuestion(null);
      setQuestionText("");
      setQuestionType("");
      setLoading(true);
    };
    socket.on('round-changed', onRoundChanged);
    return () => socket.off('round-changed', onRoundChanged);
  }, []);

  // ---- Set Current Question ----
  useEffect(() => {
    if (!questionData.length) return;
    setCurrentIndex(0);
    const cq = questionData[0];
    console.log("wired questions", questionData[0]);
    setCurrentQuestion(cq);
    setQuestionText(cq.text);
    setQuestionType(cq.type);
    
  }, [questionData]);

  // ---- helper to jump to specific index ----
  const goToQuestionIndex = (idx) => {
    //guards
    if (!questionData.length) return;
    if (idx < 0 || idx >= questionData.length) return;

    setCurrentIndex(idx);
    const q = questionData[idx];
    setCurrentQuestion(q);
    setQuestionText(q.text);
    setQuestionType(q.type);
  };

  // ---- go to next question handler ----
  const goToNextQuestion = () => {
    if (currentIndex == null || !questionData.length) return;

    //console.log("current index is:", currentIndex);
    const next = currentIndex + 1;

    if (next >= questionData.length) {
      console.log("reached the last question of round");
      return;
    }

    setCurrentIndex(next);
    goToQuestionIndex(next);
  };

  // ---- go to previous question handler ----
  const goToPrevQuestion = () => {
     if (currentIndex == null || !questionData.length) return;
     //console.log("The current index is:", currentIndex);
    const prev = currentIndex - 1;
    if (prev < 0 ) {
      console.log("already at index 0");
      return;
    }
    setCurrentIndex(prev);
    goToQuestionIndex(prev);
  }



  // ---- Emit Question if Host ----
  useEffect(() => {
    if (!currentQuestion || !userId || userId !== hostId) return;

    console.log("Host emitting question to players...", currentQuestion);
    socket.emit("send-question", {
      sessionCode,
      question: {...currentQuestion, roundNumber: currentRoundNumber },
    });
  }, [currentQuestion, userId, hostId, sessionCode, currentRoundNumber]);

  // Client player recieving question
  useEffect(() => {

    const isHost = userId === hostId;

    if (!isHost) {

      const handleNewQuestion = (questionObj) => {
        console.log("Player getting new data:", questionObj);

        setGameId(questionObj.gameId);
        setGameName(questionObj.gameName);
        setCurrentQuestion(questionObj);
        setQuestionText(questionObj.text);
        setQuestionType(questionObj.type);
        setLoading(false);
      };

      socket.on('new-question', handleNewQuestion);

      return () => socket.off("new-question", handleNewQuestion);

    }


  }, [userId, hostId]);

  // end Round
  useEffect(() => {
    
    const endRoundHandler = ({ sessionCode }) => {
      navigate(`/session/live/${sessionCode}`);
    };
    socket.on('end-round', endRoundHandler);
    return () => {
      socket.off('end-round', endRoundHandler);
    }

  }, [navigate]);

 

  return {
    sessionCode,
    loading,
    currentRoundNumber,
    questionData,
    currentQuestion,
    questionText,
    questionType,
    userId,
    hostId,
    gameId,
    roundData,
    currentIndex,
    goToQuestionIndex,
    goToNextQuestion,
    goToPrevQuestion,
  };
}
