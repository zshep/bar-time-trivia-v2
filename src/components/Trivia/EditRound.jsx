import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs, addDoc, orderBy, updateDoc, increment } from "firebase/firestore";
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
        const q = query(questionInfo, where("roundId", "==", roundId), orderBy("questionNumber", "asc"));
        const snapshot = await getDocs(q);

        const questionList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        //console.log("list of questions: ", questionList);
        //console.log("amount of questions: ", snapshot.size);

        setQuestionNumber(snapshot.size);
        setQuestionsState(questionList);
    }

    useEffect(() => {
        //console.log("grabbing question data");
        getQuestionData(roundId);

    }, [roundId])

    //open modal to add question
    const addQuestionModal = async () => {
        console.log("OPEN THE MODAL!");
        setQuestionType("");

        setIsAddModalOpen(true);
    }

    //add question
    const getQuestionType = async (questionType) => {

        console.log("adding Question to round, ", roundId);
        console.log("they chose ", questionType);
        const questionData = {
            roundData: round,
            questionType: questionType,
            questionNumber: questionNumber
        }

        navigate("/dashboard/questionpage", {
            state:
                { questionData }
        });
    }

    const editQuestion = (questionData) => {
        console.log("Edit the question", questionData);
        navigate("/dashboard/editQuestion", {
            state: {
                questionData,
                roundData: round
            }
        });

    }

    const confirmDelete = (questionData) => {
        console.log("About to delete ", questionData.question);
        setSelectedQuestion(questionData);
        setDeleteModalOpen(true);
    }

    const deleteQuestion = async () => {
        if (!selectedQuestion) return;

        console.log("Deleting Question", selectedQuestion.id);

        try {
            const questionInfo = doc(db, "questions", selectedQuestion.id);
            await deleteDoc(questionInfo);

            //Optimistically updating questions
            setQuestionsState(prevQuestion => prevQuestion.filter(question => question.id !== selectedQuestion.id));

            // updating Round's Question count
            const roundRef = doc(db, "rounds", roundId);
            await updateDoc(roundRef, {
                numberQuestions: increment(-1),
            })



        } catch (err) {
            console.error("Error deleting Question:", err);
        }

        setDeleteModalOpen(false);

    }




    return (
        <div className="flex flex-col w-full items-center ">
            <div className="mt-3 ">
                <p className="text-xl mb-3">Round: {round.roundCategory}</p>
                <div>
                    {questionsState.map((question) => (
                        <QuestionCard
                            key={question.id}
                            questionData={question}
                            confirmDelete={confirmDelete}
                            editQuestion={editQuestion}
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

                        <label htmlFor="questionType">Question type</label>
                        <select
                            value={questionType}
                            name="questionType"
                            className="border border-black mb-2"
                            required onChange={(e) => setQuestionType(e.target.value)}>
                                <option disabled value="">-- Choose the Question Type --</option>
                                <option value="multipleChoice">Multiple Choice</option>
                                <option value="freeResponse">Free Response</option>
                                <option value="sort" disabled>Sort (coming soon)</option>
                        </select>

                        <div className="flex justify-end mt-4 ">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="mr-2 px-4 py-2 bg-gray-300 rounded-full">
                                Cancel
                            </button>
                            <button onClick={() => getQuestionType(questionType)} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold">Confirm Deletion</h3>
                        <p>Are you sure you want to delete <strong>{selectedQuestion.question}?!?!</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setDeleteModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded-full">
                                Cancel
                            </button>
                            <button onClick={deleteQuestion} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    )
}