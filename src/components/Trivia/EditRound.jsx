import { useLocation } from "react-router-dom";
import { useState } from "react";
import QuestionCard from "./QuestionCard";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";

export default function EditRound() {

    //grabing state variabel passed from RoundCard
    const location = useLocation();
    const round = location.state?.roundData
    const roundId = round.id;

    const [questionsState, setQuestionsState] = useState([]); // list of all questions
    const [question, setQuestion] = useState(""); // actual question for question
    const [answer, setAnswer] = useState("");
    const [questionType, setQuestionType] = useState("");
    const [points, setPoints] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);


    console.log("Round Data: ", round);
    console.log("Round Id:", roundId);




    //grab question data from firestore
    const getQuestionData = async (roundId) => {

        const questionInfo = collection(db, "questions");
        const q = query(questionInfo, where("roundId", "==", roundId));
        const snapshot = await getDocs(q);

        const questionList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("list of questions: ", questionList);
        console.log("amount of questions: ", snapshot.size);

        setQuestionNumber(snapshot.size);
        setQuestionsState(questionList);
    }

    //open modal to add question
    const addQuestionModal = async () => {
        console.log("OPEN THE MODAL!")
        setIsAddModalOpen(true);
    }

    //add question
    const addQuestion = async (roundId, question, answer, questionType, points) => {
        try {

            console.log("adding Question to round, ", roundId);

            // creating newQuestion object
            const newQuestion = {
                roundId: roundId,
                questionNumber: questionNumber + 1,
                question: question,
                answer: answer,
                questionType: questionType,
                points: points,

            };

            //adding doc to firestore
            const docRef = await addDoc(collection(db, "questions"), newQuestion);
            console.log("added new question:", docRef.id);

            if (roundId) {
                await getQuestionData(roundId);
            }

            setIsAddModalOpen(false); // turn off modal
            return docRef;


        } catch (err) {
            console.log("Error adding question", err);
        }

    }

    const confirmDelete = (questionId) => {
        setDeleteModalOpen(true);
    }

    const deleteQuestion = async () => {


    }




    return (
        <div className="flex flex-col w-full items-center ">
            <div className="mt-3">
                <p className="text-xl">Round: {round.roundCategory}</p>
                <div>
                    {questionsState.map((question) => (
                        <QuestionCard
                            questionData={question}
                            deleteQuestion={deleteQuestion}
                        />
                    ))}

                </div>
                <button
                    type="button"
                    onClick={() => addQuestionModal()}>Add Question</button>
            </div>
            {isAddModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                        <h3 className="text-lg font-bold">Add Question</h3>
                        <label htmlFor="question">Question</label>
                        <textarea
                            className="border border-black p-2 mb-2"
                            id="question"
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="What is the question?"
                            autoComplete="off"
                        />
                        <label htmlFor="answer">Answer</label>
                        <input
                            className="mt-1 border px-2 border-black mb-2"
                            id="answer"
                            type="text"
                            placeholder="What's the answer?"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />

                        <label htmlFor="questionType">Question type</label>
                        <select id="questionType" name="questionType" className="border border-black mb-2" required>
                            <option disabled selected value="">-- Choose the Question Type --</option>
                            <option value="multipleChoice">Multiple Choice</option>
                            <option value="freeResponse">Free Response</option>
                            <option value="sort">Sort</option>
                        </select>

                        <label htmlFor="points">Points Available</label>
                        <input
                            className="border border-black text-center"
                            id="points"
                            type="number"
                            min="0"
                            max="10"
                            step="1"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                        />


                        <div className="flex justify-end mt-4 ">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="mr-2 px-4 py-2 bg-gray-300 rounded-full">
                                Cancel
                            </button>
                            <button onClick={() => addQuestion(roundId, question, answer, questionType, points)} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}