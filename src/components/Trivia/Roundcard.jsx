import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";


export default function Roundcard( {roundData, confirmDeleteRound} ) {
  
    
   // console.log("roundData: ", roundData);

    const id = roundData.id;
    const navigate = useNavigate();

    const editRound = (roundData) => {

        console.log("YOU'RE GOIN TO EDIT THE ROUND!", roundData.roundCategory);

        navigate("/dashboard/edit-round", { state: { roundData }});
    }
    


    return(
        <div className="flex  w-1/2 mb-3 p-2">
            <div className="border border-black p-2">
                <p className="font-bold mx-2">Round number</p>
                <p >{roundData.roundNumber !== undefined ? roundData.roundNumber : "N/A"}</p>

            </div>
            <div className="border border-black">
                <p className="font-bold mx-2">Round Category</p>
                <p >{roundData.roundCategory || "Category not specified"}</p>
            </div>
            <div className="border border-black">
                <p className="font-bold mx-2">Number of Questions</p>
                <p>{roundData.numberQuestions !== undefined ? roundData.numberQuestions : "N/A"}</p>
            </div>
            <div className="flex flex-col">
                <button onClick={() => editRound(roundData)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full">Edit Round</button>
                <button onClick={() => confirmDeleteRound(roundData)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">Delete Round</button>
            </div>
        </div>

    )
}