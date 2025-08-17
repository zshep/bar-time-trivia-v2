import { useState, useEffect } from "react";
import socket from "../main";
import { db } from "../../app/server/api/firebase/firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "./useAuth";

export function useGameSession({ gameId: initialGameId, sessionCode, hostId }) {
  const user = useAuth();
  const userId = user?.uid;

  const [roundData, setRoundData] = useState([]);
  const [questionData, setQuestionData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameId, setGameId] = useState(initialGameId || "");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("");

  const [loading, setLoading] = useState(true);

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
    const roundId = roundData[0]?.id;
    if (!roundId) return;

    const fetchQuestions = async () => {
      try {
        const col = collection(db, "questions");
        const q = query(col, where("roundId", "==", roundId), orderBy("questionNumber", "asc"));
        const snap = await getDocs(q);
        const questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setQuestionData(questions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, [roundData, userId, hostId]);

  // ---- Set Current Question ----
  useEffect(() => {
    if (!questionData.length) return;
    const cq = questionData[0];
    setCurrentQuestion(cq);
    setQuestionText(cq.question);
    setQuestionType(cq.questionType);
  }, [questionData]);

  // ---- Emit Question if Host ----
  useEffect(() => {
    if (!currentQuestion || !userId || userId !== hostId) return;

    console.log("Host emitting question to players...", currentQuestion);
    socket.emit("send-question", {
      sessionCode,
      question: currentQuestion,
    });
  }, [currentQuestion, userId, hostId, sessionCode]);

  // Client player recieving question
  useEffect(() => {

    const isHost = userId === hostId;

    if (!isHost) {

      const handleNewQuestion = (questionObj) => {
        console.log("Player getting new data:", questionObj);

        setGameId(questionObj.gameId);
        setCurrentQuestion(questionObj);
        setQuestionText(questionObj.question);
        setQuestionType(questionObj.questionType);
        setLoading(false);
      };

      socket.on('new-question', handleNewQuestion);

      return () => socket.off("new-question", handleNewQuestion);

    }


  }, [userId, hostId]);


  return {
    loading,
    currentQuestion,
    questionText,
    questionType,
    userId,
    hostId,
    gameId,
  };
}
