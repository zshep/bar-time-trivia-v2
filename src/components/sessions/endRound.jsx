import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGameSession } from "../../hooks/useGameSession";
import { useState } from "react";

export default function EndRound() {

    const { sessionCode } = useParams();
    const location= useLocation();
    const state = location.state || {};
    //states
    const [resultsReady, setResultsReady] = useState(false);
    const [isHost, setIsHost] =useState(state.isHost);



    //logic for talling up scores

    //next
    
    //next round
    const handleNextRound = () => {
        console.log("host has click next round");


    }

    



    return(
        <div>
            <div className="flex flex-col mt-4">
            <h1>Round Results</h1>

            </div>
            <div className="flex flex-col">
                {!isHost && !resultsReady &&(
                    <div> 
                        <p>Waiting for Host to Finalize Results</p>
                    </div>
                )}



            </div>
            {isHost && (
                <div>
                    <div>
                        <p>You need to go through the results</p>
                    </div>
                    <div className="mt-4"> 
                        <button
                        onClick={handleNextRound}
                        >Start Next Round</button>
                    </div>
                    
                
                </div>

            )}



        </div>
    )
}