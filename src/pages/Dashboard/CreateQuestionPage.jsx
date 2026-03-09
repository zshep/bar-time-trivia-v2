import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";
import CreateQuestionFr from "../../components/Trivia/CreateQuestionFr";
import CreateQuestionMc from "../../components/Trivia/CreateQuestionMc";
import CreateQuestionSort from "../../components/Trivia/CreateQuestionSort";

export default function CreateQuestionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const questionData = location.state?.questionData;
  const game = location.state?.game;

  const roundId = questionData?.roundData?.id;
  const questionType = questionData?.questionType;

  const [points, setPoints] = useState(1);
  const [question, setQuestion] = useState("");

  const [mcChoices, setMcChoices] = useState(["", "", "", ""]);
  const [mcAnswers, setMcAnswers] = useState([]);
  const [frAnswer, setFrAnswer] = useState("");
  const [sortAnswers, setSortAnswers] = useState({});

  const handleAddQuestion = async () => {
    console.log("adding question");
    console.log("questionData:", questionData);

    try {
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user found.");
        return;
      }

      if (!questionData || !roundId || !questionType) {
        console.error("Missing question data, roundId, or questionType.");
        return;
      }

      if (!question.trim()) {
        console.error("Question text is required.");
        return;
      }

      let finalAnswerData = null;

      if (questionType === "multipleChoice") {
        console.log("It's MC");
        console.log("mcChoices:", mcChoices);
        console.log("mcAnswers:", mcAnswers);

        finalAnswerData = {
          mcChoices: mcChoices,
          mcAnswers: mcAnswers,
        };
      }

      if (questionType === "freeResponse") {
        finalAnswerData = frAnswer.trim();
      }

      if (questionType === "sort") {
        finalAnswerData = sortAnswers;
      }

      const newQuestion = {
        roundId: roundId,
        user_id: user.uid,
        questionNumber: questionData.questionNumber + 1,
        question: question.trim(),
        answer: finalAnswerData,
        questionType: questionType,
        points: Number(points),
      };

      const docRef = await addDoc(collection(db, "questions"), newQuestion);
      console.log("added new question:", docRef.id);

      const roundRef = doc(db, "rounds", roundId);
      await updateDoc(roundRef, {
        numberQuestions: increment(1),
      });

      navigate("/dashboard/edit-round", {
        state: { roundData: questionData.roundData, game },
      });
    } catch (err) {
      console.log("Error adding question", err);
    }
  };

  if (!questionData || !roundId || !questionType) {
    return (
      <div className="flex w-full justify-center">
        <div className="flex flex-col justify-items-center">
          <h3 className="text-lg font-bold">Missing question setup data.</h3>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-700 mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col justify-items-center">
        <h3 className="text-lg font-bold">Add Question</h3>
        <h3 className="text-lg font-bold">Question Type: {questionType}</h3>

        <label htmlFor="question">Question</label>
        <textarea
          className="border border-black p-2 mb-2"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What is the question?"
          autoComplete="off"
        />

        <label htmlFor="points">Points Available</label>
        <input
          className="border border-black text-center"
          id="points"
          type="number"
          min="1"
          max="10"
          step="1"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
        />

        <div>
          {questionType === "freeResponse" && (
            <CreateQuestionFr answer={frAnswer} setAnswer={setFrAnswer} />
          )}

          {questionType === "multipleChoice" && (
            <CreateQuestionMc
              answers={mcAnswers}
              setAnswers={setMcAnswers}
              choices={mcChoices}
              setChoices={setMcChoices}
            />
          )}

          {questionType === "sort" && (
            <CreateQuestionSort
              answers={sortAnswers}
              setAnswers={setSortAnswers}
            />
          )}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700"
          >
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
}