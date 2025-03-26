import { useState } from "react";
import { useLocation } from "react-router-dom";
import CreateQuestionFr from "../../components/Trivia/CreateQuestionFr";
import CreateQuestionMc from "../../components/Trivia/CreateQuestionMc";
import CreateQuestionSort from "../../components/Trivia/CreateQuestionSort";


export default function CreateQuestionPage() {

    //grabing state variabel passed from Edit-Round
    const location = useLocation();
    const questionData = location.state?.questionData;
    

    const roundId = questionData.roundId;
    const questionType = questionData.questionType;
    //console.log(roundId, questionType);


    const [questionsState, setQuestionsState] = useState([]); // list of all questions
    const [question, setQuestion] = useState(""); // actual question for question
    const [answer, setAnswer] = useState("");

    const [points, setPoints] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);



    const CreateQuestion = async (roundId, question, answer, questionType, points) => {
        console.log("adding question");

        try {

            console.log("adding Question to round, ", roundId);
            console.log("this question is number ", questionNumber);

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




    return (

        <div className="flex w-full justify-center">
            <div className="  flex flex-col justify-items-center">
                <h3 className="text-lg font-bold">Add Question</h3>
                <h3 className="text-lg font-bold">Question Type: {questionType}</h3>
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
            
               
                <div>
                    {questionType === "freeResponse" && (
                        <CreateQuestionFr />
                    )}
                    {questionType === "multipleChoice" && (
                        <CreateQuestionMc/>
                    )}
                    {questionType === "sort" &&(
                        <CreateQuestionSort />
                    )}
                </div>

                <div className="flex justify-center mt-10 ">

                    <button onClick={() => CreateQuestion(roundId, question, answer, questionType, points)} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                        Add Question
                    </button>
                </div>
            </div>
        </div>
    )
}