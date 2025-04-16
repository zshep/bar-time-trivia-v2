import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs, addDoc, updateDoc  } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import CreateQuestionMc from "../../components/Trivia/CreateQuestionMc";
import CreateQuestionFr from "../../components/Trivia/CreateQuestionFr";

export default function EditQuestion() {

    console.log("Editing a question");
    
    const { state } = useLocation();
    const { questionData, roundData } = state || {};
    console.log(questionData);
    console.log(questionData.answer);
    console.log(questionData.answer.mcChoices);
    const navigate = useNavigate();

    //Generic Question Data
    const roundId = roundData;
    const questionType = questionData.questionType;
    const [questionNumber, setQuestionNumber] = useState(questionData.questionNumber);
    const [points, setPoints] = useState(questionData.points);
    const [question, setQuestion] = useState(questionData.question); // actual question for question

    //For MC, storing array of an answer choices
    const [mcChoices, setMcChoices] = useState(questionData.answer.mcChoices);
    const [mcAnswers, setMcAnswers] = useState(questionData.answer.mcAnswers);
    // for FR, storing single string
    const [frAnswer, setFrAnswer] = useState(questionData.answer);

    

    //edit answer
    const handleEditQuestion = async () => {
        console.log("editing Question: ", questionNumber);

        try{
             //setting up final answer data based on question type
                        let finalAnswerData = null;
            
                        if (questionType === "multipleChoice"){
            
                            console.log("It's MC");
                            // check if mcFinalAnswer is in mcAnswers
                            console.log("mcChoices: ", mcChoices);
                            console.log("mcAnswers: ", mcAnswers);
            
                            finalAnswerData = {
                                mcChoices : mcChoices,
                                mcAnswers: mcAnswers
                            }
                        }
            
                        if (questionType === "freeResponse"){
                            finalAnswerData = frAnswer;
                        }
            
                        // set up sorting 
                        
                        // creating newQuestion object
                        const updateQuestion = {
                            question: question,
                            answer: finalAnswerData,
                            points: points,
            
                        };
            
                        //adding doc to firestore
                        const docRef = doc(db, "questions", questionData.id);
                        await updateDoc(docRef, updateQuestion);
                        console.log("Edit successful");
                        
                        navigate("/dashboard/edit-round", { state: {  roundData }});
                        


        }catch(err){
            console.log("Error editing question", err);            
        }

    }


    return (
        <div className="flex w-full justify-center">
            <div className="  flex flex-col justify-items-center">
                <h3 className="text-lg font-bold">Edit Question</h3>
                <h3 className="text-lg font-bold">Question Type: { questionType } </h3>
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
                        <CreateQuestionMc answers={mcAnswers} setAnswers={setMcAnswers} choices={mcChoices} setChoices={setMcChoices} />
                    )}
                   
                </div>

                <div className="flex justify-center mt-10 ">

                    <button onClick={() => handleEditQuestion()} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                        Edit Question
                    </button>
                </div>
            </div>
        </div>
    )
}