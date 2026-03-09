import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import CreateQuestionMc from "../../components/Trivia/CreateQuestionMc";
import CreateQuestionFr from "../../components/Trivia/CreateQuestionFr";

export default function EditQuestion() {
  const location = useLocation();
  const navigate = useNavigate();

  const questionData = location.state?.questionData || null;
  const roundData = location.state?.roundData || null;
  const game = location.state?.game || null;

  useEffect(() => {
    if (!questionData || !roundData || !game) {
      console.error("Missing question, round, or game data.");
      navigate("/dashboard/viewgamePage");
    }
  }, [questionData, roundData, game, navigate]);

  if (!questionData || !roundData || !game) {
    return null;
  }

  const questionType = questionData.questionType;

  const [points, setPoints] = useState(questionData.points ?? 1);
  const [question, setQuestion] = useState(questionData.question ?? "");

  const [mcChoices, setMcChoices] = useState(
    questionType === "multipleChoice" && questionData.answer?.mcChoices
      ? questionData.answer.mcChoices
      : ["", "", "", ""]
  );

  const [mcAnswers, setMcAnswers] = useState(
    questionType === "multipleChoice" && questionData.answer?.mcAnswers
      ? questionData.answer.mcAnswers
      : []
  );

  const [frAnswer, setFrAnswer] = useState(
    questionType === "freeResponse" && typeof questionData.answer === "string"
      ? questionData.answer
      : ""
  );

  const handleEditQuestion = async () => {
    console.log("editing Question:", questionData.questionNumber);

    try {
      let finalAnswerData = null;

      if (questionType === "multipleChoice") {
        finalAnswerData = {
          mcChoices,
          mcAnswers,
        };
      }

      if (questionType === "freeResponse") {
        finalAnswerData = frAnswer.trim();
      }

      const updatedQuestion = {
        question: question.trim(),
        answer: finalAnswerData,
        points: Number(points),
        questionNumber: questionData.questionNumber,
        questionType: questionData.questionType,
        roundId: questionData.roundId,
        user_id: questionData.user_id,
      };

      const questionRef = doc(db, "questions", questionData.id);
      await updateDoc(questionRef, updatedQuestion);

      console.log("Edit successful");

      navigate("/dashboard/edit-round", {
        state: {
          roundData,
          game,
        },
      });
    } catch (err) {
      console.log("Error editing question", err);
    }
  };

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col justify-items-center">
        <h3 className="text-lg font-bold">Edit Question</h3>
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
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={handleEditQuestion}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700"
          >
            Edit Question
          </button>
        </div>
      </div>
    </div>
  );
}