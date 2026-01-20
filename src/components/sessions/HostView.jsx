import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import socket from "../../main";




export default function HostView({
    currentQuestion,
    sessionCode,
    goToNextQuestion,
    goToPrevQuestion,
    hasNextQuestion,
    hasPreviousQuestion,
}) {

    const navigate =useNavigate();

    //states for holding player data
    const [answers, setAnswers] = useState({});
    const [roundAnswers, setRoundAnswers] = useState({});


    const [isLocked, setIsLocked] = useState(false);
    const [players, setPlayers] = useState([]);
    const [isEndRoundModalOpen, setIsEndRoundModalOpen] = useState(false);

    const questionId = currentQuestion?.id || "no-ID";
   
    //console.log("current Question:", currentQuestion);
    //console.log("total round amount", roundData.length);
  
    

    // latest references 
    const sessionCodeRef = useRef(sessionCode);
    const questionIdRef = useRef(questionId);
    const isLockedRef = useRef(isLocked);

    // refrence to previous question meta
    const lastQuestionRef = useRef(currentQuestion || null);


    useEffect(() => { sessionCodeRef.current = sessionCode; }, [sessionCode]);
    useEffect(() => { questionIdRef.current = questionId }, [questionId]);
    useEffect(() => { isLockedRef.current = isLocked }, [isLocked]);

    //socket handlers to grab list of players
    useEffect(() => {
        if (!sessionCode) return;

        const handlePlayerListUpdate = ({ players }) => {
            setPlayers(players || []);
            //console.log("players", players);
        };

        socket.emit("request-player-list", { sessionCode });
        socket.on("player-list-update", handlePlayerListUpdate);

        return () => {
            socket.off("player-list-update", handlePlayerListUpdate);
        };
    }, [sessionCode]);

    // getting player answers
    useEffect(() => {
        const handleNewPlayerAnswer = ({ playerId, choiceIndex, choiceText, sessionCode, questionId }) => {
            //guards
            if (sessionCode && sessionCode !== sessionCodeRef.current) return;
            if (questionId && questionId !== questionIdRef.current) return;
            if (isLockedRef.current) return;

            //debug
            console.log(`Answer from ${playerId} for question ${questionId} playerids with this answer ${choiceText} and index ${choiceIndex}`);

            setAnswers(prev => ({
                ...prev,
                [playerId]: {
                    index: choiceIndex,
                    text: choiceText,
                    updatedAt: Date.now(),
                },
            }));
        };

        socket.on('submit-answer', handleNewPlayerAnswer);

        return () => {
            socket.off('submit-answer', handleNewPlayerAnswer);
        }
    }, []);

    // clear answers when question changes
    useEffect(() => {
        //saving answers to Round Array to pass onto host for end of round math
        const prevQ = lastQuestionRef.current;
        if (prevQ?.id) {

            setRoundAnswers(prev => ({
                ...prev,
                [prevQ.id]: {
                    question: {
                        id: prevQ.id,
                        type: prevQ.type,
                        choices: prevQ.choices ?? [],
                        correct: prevQ.correct ?? [],
                        correctText: prevQ.correctText ?? "",
                        points: prevQ.points?? 1,
                    },
                    answersByPlayer: answers,
                },
            }));

        }

        //preparing for new question
        setAnswers({});
        setIsLocked(false);

        //updating the ref so its piont to the *current* question for next time
        lastQuestionRef.current = currentQuestion || null;

    }, [questionId]);

    // snapshot the final quesiton of round before ending round
    const finalizeCurrentQuestionIntoRound = () => {
        const q = lastQuestionRef.current || currentQuestion;
        if (!q?.id) return;
        setRoundAnswers(prev => ({
            ...prev,
            [q.id]: {
                question: {
                    id: q.id,
                    type: q.type,
                    choices: q.choices ?? [],
                    correct: q.correct ?? [],
                    correctText: q.correctText ?? "",
                    points: q.points ?? 1,
                },
                answersByPlayer: answers,
            },
        }));
    }


    //handle next question
    const handleNextQuestion = () => {
        console.log("Host click next question");
        //lock question
        setIsLocked(true);
        //compute nextIndex
        goToNextQuestion();
    };

    //handle previous question
    const handlePreviousQuestion = () => {
        console.log("host clicked previous next question");
        setIsLocked(true);
        // compute previousIndex
        goToPrevQuestion()
    };

    // end round btn handler
    const handleEndRound = () => {
        console.log("host has clicked End Round");
        setIsLocked(true);
        setIsEndRoundModalOpen(true);   
    };

    const endRound = () => {
        console.log("Host has ended Round");
        finalizeCurrentQuestionIntoRound();
        setIsEndRoundModalOpen(false);
        socket.emit('end-round', { sessionCode });

        const q = lastQuestionRef.current || currentQuestion;
        const merged = q?.id ?
        {
            ...roundAnswers,
            [q.id]: {
                question: {
                    id: q.id,
                    type: q.type,
                    choices: q.choices ?? [],
                    correct: q.correct ?? [],
                    correctText: q.correctText ?? "",
                    points: q.points ?? 1,
                },
                answersByPlayer: answers,
            },

        } : roundAnswers;


        //navigate to endRound component 
          navigate(`/session/live/${sessionCodeRef.current}/end`, {
            state: {
                isHost: true,
                roundAnswers: merged,
                players,
            },
          });
    }


    return (
        <div className="w-full">
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    {currentQuestion?.type === "multipleChoice" && (
      <QuestionMc
        choices={currentQuestion.choices.map((c) => c.label)}
        correctAnswers={currentQuestion.correct}
        isHost
      />
    )}

    {currentQuestion?.type === "freeResponse" && (
      <QuestionFc answer={currentQuestion.correctText} isHost />
    )}
  </div>

  <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-gray-900 text-center">
      Players
    </h2>

    <div className="mt-4 space-y-2">
      {players.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-around rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
        >
          <span className="font-medium text-gray-900">{p.name}</span>
          <span className="text-sm text-gray-600">
            {answers[p.id] ? "answered" : "waiting"}
          </span>
        </div>
      ))}
    </div>

    <div className="mt-6 flex flex-wrap justify-center gap-2">
      {hasPreviousQuestion && (
        <button
          onClick={handlePreviousQuestion}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
          type="button"
        >
          Previous
        </button>
      )}

      {hasNextQuestion && (
        <button
          onClick={handleNextQuestion}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
          type="button"
        >
          Next
        </button>
      )}

      <button
        onClick={handleEndRound}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
        type="button"
      >
        End Round
      </button>
    </div>
  </div>

  {isEndRoundModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Confirm end round</h3>
        <p className="mt-2 text-sm text-gray-700">
          Are you sure you want to end the round?
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setIsEndRoundModalOpen(false)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={endRound}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
            type="button"
          >
            End Round
          </button>
        </div>
      </div>
    </div>
  )}
</div>


    )



}