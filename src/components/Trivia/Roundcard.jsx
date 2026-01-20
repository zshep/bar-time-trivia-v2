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
       <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    {/* Info */}
    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Round
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {roundData.roundNumber !== undefined ? roundData.roundNumber : "N/A"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Category
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {roundData.roundCategory || "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Questions
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {roundData.numberQuestions !== undefined ? roundData.numberQuestions : "N/A"}
          </p>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => editRound(roundData)}
        className="rounded-md bg-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:bg-yellow-600 transition"
        type="button"
      >
        Edit
      </button>

      <button
        onClick={() => confirmDeleteRound(roundData)}
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
        type="button"
      >
        Delete
      </button>
    </div>
  </div>
</div>


    )
}