import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import {
  deleteDoc,
  doc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";

export default function EditRound() {
  //grabing state variabel passed from RoundCard
  const location = useLocation();
  const round = location.state?.roundData;
  const roundId = round.id;
  const navigate = useNavigate();

  const [questionsState, setQuestionsState] = useState([]); // list of all questions
  const [question, setQuestion] = useState(""); // actual question for question
  const [answer, setAnswer] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [points, setPoints] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");

  console.log("Round Data: ", round);
  //console.log("Round Id:", roundId);

  //grab question data from firestore
  const getQuestionData = async () => {
    const questionInfo = collection(db, "questions");
    const q = query(
      questionInfo,
      where("roundId", "==", roundId),
      orderBy("questionNumber", "asc"),
    );
    const snapshot = await getDocs(q);

    const questionList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    //console.log("list of questions: ", questionList);
    //console.log("amount of questions: ", snapshot.size);

    setQuestionNumber(snapshot.size);
    setQuestionsState(questionList);
  };

  useEffect(() => {
    //console.log("grabbing question data");
    getQuestionData(roundId);
  }, [roundId]);

  //open modal to add question
  const addQuestionModal = async () => {
    console.log("OPEN THE MODAL!");
    setQuestionType("");

    setIsAddModalOpen(true);
  };

  //add question
  const getQuestionType = async (questionType) => {
    console.log("adding Question to round, ", roundId);
    console.log("they chose ", questionType);
    const questionData = {
      roundData: round,
      questionType: questionType,
      questionNumber: questionNumber,
    };

    navigate("/dashboard/questionpage", {
      state: { questionData },
    });
  };

  const editQuestion = (questionData) => {
    console.log("Edit the question", questionData);
    navigate("/dashboard/editQuestion", {
      state: {
        questionData,
        roundData: round,
      },
    });
  };

  const confirmDelete = (questionData) => {
    console.log("About to delete ", questionData.question);
    setSelectedQuestion(questionData);
    setDeleteModalOpen(true);
  };

  const deleteQuestion = async () => {
    if (!selectedQuestion) return;

    console.log("Deleting Question", selectedQuestion.id);

    try {
      const questionInfo = doc(db, "questions", selectedQuestion.id);
      await deleteDoc(questionInfo);

      //Optimistically updating questions
      setQuestionsState((prevQuestion) =>
        prevQuestion.filter((question) => question.id !== selectedQuestion.id),
      );

      // updating Round's Question count
      const roundRef = doc(db, "rounds", roundId);
      await updateDoc(roundRef, {
        numberQuestions: increment(-1),
      });
    } catch (err) {
      console.error("Error deleting Question:", err);
    }

    setDeleteModalOpen(false);
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4  sm:justify-between ">
          <div className="flex flex-col justify-self-center"> 
            <h1 className="text-2xl font-bold text-gray-900">
              Round: {round?.roundCategory || "Untitled"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Add, edit, or delete questions for this round.
            </p>
          </div>
          <div className="flex flex-row gap-2 justify-center">
            <button
              className="inline-flex w-fit items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              onClick={() =>
                navigate("/dashboard/edit-game", {
                  state: { gameId: round?.gameId, game: round?.game },
                })
              }
              type="button"
            >
              ← Back to Edit Game
            </button>

            <button
              type="button"
              onClick={() => addQuestionModal()}
              className="inline-flex w-fit items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
            >
              Add Question
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-6 border-t border-gray-200" />

        {/* Questions list */}
        <div className="mt-6 space-y-3">
          {questionsState.length > 0 ? (
            questionsState.map((question) => (
              <QuestionCard
                key={question.id}
                questionData={question}
                confirmDelete={confirmDelete}
                editQuestion={editQuestion}
              />
            ))
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="font-medium text-gray-900">No questions yet</p>
              <p className="mt-1 text-sm text-gray-600">
                Add your first question to start building this round.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Add question</h3>
            <p className="mt-1 text-sm text-gray-600">
              Choose what type of question you want to add.
            </p>

            <label
              htmlFor="questionType"
              className="mt-4 block text-sm font-semibold text-gray-700"
            >
              Question type
            </label>

            <select
              id="questionType"
              value={questionType}
              name="questionType"
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
              onChange={(e) => setQuestionType(e.target.value)}
            >
              <option disabled value="">
                -- Choose the Question Type --
              </option>
              <option value="multipleChoice">Multiple Choice</option>
              <option value="freeResponse">Free Response</option>
              <option value="sort" disabled>
                Sort (coming soon)
              </option>
            </select>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => getQuestionType(questionType)}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                Add question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Confirm deletion
            </h3>

            <p className="mt-2 text-sm text-gray-700">
              Are you sure you want to delete{" "}
              <strong>{selectedQuestion?.question}</strong>? This action cannot
              be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteQuestion}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
