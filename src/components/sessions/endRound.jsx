import { useParams } from "react-router-dom";
import { useGameSession } from "../../hooks/useGameSession";

export default function EndRound() {

    const { sessionCode } = useParams();
    //states


    //logic for talling up scores

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



            </div>
            {/*isHost && (
                <div>
                    <button
                        onClick={handleNextRound}
                        >Start Next Round</button>
                
                </div>

            )*/}



        </div>
    )
}