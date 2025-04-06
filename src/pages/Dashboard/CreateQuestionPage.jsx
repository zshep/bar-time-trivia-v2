import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs, addDoc, orderBy  } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import CreateQuestionFr from "../../components/Trivia/CreateQuestionFr";
import CreateQuestionMc from "../../components/Trivia/CreateQuestionMc";
import CreateQuestionSort from "../../components/Trivia/CreateQuestionSort";



export default function CreateQuestionPage() {

    //grabing state variabel passed from Edit-Round
    const location = useLocation();
    const questionData = location.state?.questionData;
    const navigate = useNavigate();
    
    //Generic Question Data
    const roundId = questionData.roundData.id;
    const questionType = questionData.questionType;
    const [questionNumber, setQuestionNumber] = useState(0);
    const [points, setPoints] = useState(1); 
    const [question, setQuestion] = useState(""); // actual question for question
    
    //For MC, storing array of an answer choices
    const [mcChoices, setMcChoices] = useState(["","","",""]);
    const [mcAnswers, setMcAnswers] =useState([]);
    // for FR, storing single string
    const [frAnswer, setFrAnswer]=useState("");

    // for Sort, store it in as array of objects???
    const [sortAnswers, setSortAnswers] = useState({});

    
    

        

    const handleAddQuestion = async () => {
        console.log("adding question");
        console.log("questionData:", questionData);
        console.log("number of questions:", questionData.questionNumber);
       

        try {

            //setting up final answer data based on question type
            let finalAnswerData = null;

            if (questionType === "multipleChoice"){

                console.log("It's MC");
                // check if mcFinalAnswer is in mcAnswers
                console.log("mcChoices: ", mcChoices);
                console.log("mcAnswers: ", mcAnswers);

                finalAnswerData = {
                    mcchoices : mcChoices,
                    mcAnswers: mcAnswers
                }
            }

            if (questionType === "freeResponse"){
                finalAnswerData = frAnswer;
            }

            // set up sorting 

            

            // creating newQuestion object
            const newQuestion = {
                roundId: roundId,
                questionNumber: questionData.questionNumber + 1,
                question: question,
                answer: finalAnswerData,
                questionType: questionType,
                points: points,

            };

            //adding doc to firestore
            const docRef = await addDoc(collection(db, "questions"), newQuestion);
            console.log("added new question:", docRef.id);


            
            navigate("/dashboard/edit-round", { state: {  roundData: questionData.roundData }});
            


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
                        <CreateQuestionMc answers={mcAnswers} setAnswers={setMcAnswers} choices={mcChoices} setChoices={setMcChoices}/>
                    )}
                    {questionType === "sort" &&(
                        <CreateQuestionSort />
                    )}
                </div>

                <div className="flex justify-center mt-10 ">

                    <button onClick={() => handleAddQuestion()} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                        Add Question
                    </button>
                </div>
            </div>
        </div>
    )
}