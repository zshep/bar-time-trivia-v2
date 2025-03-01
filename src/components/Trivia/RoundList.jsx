import Roundcard from "./Roundcard";
import { useState } from "react";


export default function RoundList() {
    const [rounds, setRounds] = useState([]); // State for rounds data

     // Function to add a new round (example)
    const addRound = () => {
        setRounds([...rounds, { /* ... default round data */ }]);
      };



    return (

        <div>
            <p>Rounds</p>
            <div className="border border-r-4">
                {rounds.map((round, index) => (
                    <Roundcard key={index} roundData={round} />
                ))}
            </div>

            <div>
                <button type="button" onClick={addRound}>Add Round</button> {/* Button to add a round */}
                <button type="submit">Save</button> {/* Move Save button inside form */}
            </div>
        </div>


    )
};