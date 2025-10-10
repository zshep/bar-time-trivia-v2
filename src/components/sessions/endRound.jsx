import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGameSession } from "../../hooks/useGameSession";
import { useState, useEffect } from "react";
import socket from "../../main";

export default function EndRound() {

    const { sessionCode } = useParams();
    const location= useLocation();
    const state = location.state || {};
    //states
    const [resultsReady, setResultsReady] = useState(false);
    const [isHost, setIsHost] =useState(state.isHost);
    const [playersList, setPlayersList] = useState([]);



    //logic for talling up scores
    useEffect( () =>{
        if (!isHost) return;
        //send socket to grab player list
        socket.emit('request-player-list', {sessionCode});

        //grab list of players
        const handlePlayerAnswers = ({ players }) => {
            console.log("our list of players:", players);
            setPlayersList(players);
        }

        socket.on('player-list-update', handlePlayerAnswers);
        return () => {
            socket.off('player-list-updated', handlePlayerAnswers);
        }
    },[])

    //finalize round
    const handleFinalizeResults = () => {
        console.log("host has finalized results");

    }

    //grade FR question

    
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
            {isHost && !resultsReady  && (
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
            {isHost && resultsReady &&(
                <div>
                    <p>These are the results</p>
                </div>
            )

            }



        </div>
    )
}