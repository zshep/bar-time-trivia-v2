import { useState } from "react";
import Roundcard from "./Roundcard";


export default function RoundList() {
    const [rounds, setRounds] = useState([]); // State for rounds data
    const [roundNum, setRoundNum] = useState(0);

     // Function to add a new round (example)
    const addRound = () => {
        setRounds([...rounds, { roundNumber: roundNum, type: "fish", numQuest: "0"}]);

        setRoundNum(roundNum + 1);

      };



    return (

        <div>
            <p>Rounds</p>
            <div className="mb-1 justify-items-center">
                {rounds.map((round, index) => (
                    <Roundcard key={index} roundData={round} />
                ))}
            </div>

            <div>
                <button type="button" onClick={addRound}>Add Round</button> 
                
            </div>
        </div>
    )
};