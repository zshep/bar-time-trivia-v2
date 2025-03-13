import { useEffect } from "react"


export default function Roundcard(roundData) {
    
    const deleteRound = () => {
        console.log("YOUR GOING TO DELETE THE ROUND!");

    }

    const editRound = () => {
        console.log("YOU'RE GOIN TO EDIT THE ROUND!");
    }
    
    console.log(roundData);
    console.log(roundData.roundData)
    


    return(
        <div className="flex border border-black w-1/2">
            <div className="border border-black">
                <p className="font-bold mx-2">Round number</p>
                <p>{"Numb" || roundData.roundData.roundNumber }</p>

            </div>
            <div className="border border-black">
                <p className="font-bold mx-2">Round Type</p>
                <p>{"Type" || roundData.type }</p>
            </div>
            <div className="border border-black">
                <p className="font-bold mx-2">Number of Questions</p>
                <p>{"Numb of Quest" || roundData.numQuest }</p>
            </div>
            <div className="flex flex-col">
                <button onClick={editRound} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full">Edit Round</button>
                <button onClick={deleteRound} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">Delete Round</button>
            </div>
        </div>

    )
}