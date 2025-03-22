import { useState } from "react";
import { useLocation } from "react-router-dom";
import CreateQuestionFr from "../../components/Trivia/CreateQuestionFr";
import CreateQuestionMc from "../../components/Trivia/CreateQuestionMc";


export default function CreateQuestionPage() {

      //grabing state variabel passed from Edit-Round
        const location = useLocation();
        const question = location.state?.questionType

        const CreateQuestion = async () => {
            console.log("adding question");


        }
        

    return(

        <div className="fixed inset-0 flex items-center justify-center bg-black ">
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
             
                <button onClick={() => CreateQuestion(roundId, question, answer, questionType, points)} className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-700">
                    Add Question
                </button>
            </div>
        </div>
    </div>
    )
}