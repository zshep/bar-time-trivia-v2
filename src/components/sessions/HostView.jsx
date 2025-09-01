import QuestionMc from "./questionMc";
import QuestionFc from "./questionFc";
import { useEffect, useState } from "react";
import socket from "../../main";



export default function HostView({
    currentQuestion,
    questionType,
}) {

    //states for holding player data
    const [ playerData, setPlayerData ] = useState({});
    const playerAnsweredList = [];

    console.log("current Question:", currentQuestion);
    const currentChoices = currentQuestion?.answer?.mcChoices || [];
    const correctAnswers = currentQuestion?.answer?.mcAnswers || [];

    useEffect(() => {

        const handleNewPlayerAnswer = ({playerId, choice, sessionCode}) => {
            console.log(`Recieved answer from player ${playerId} give the answer ${choice} for session ${sessionCode} `);
            setPlayerData({playerId, choice});
            playerAnsweredList.push(playerId);
            console.log("playerData:", playerData);

        }
        
        socket.on('submit-answer', handleNewPlayerAnswer);
        
        return () => {
            socket.off('player-answer', handleNewPlayerAnswer );
        }
    }, [playerData]);

    //checking what the player data is
    useEffect(() =>{
        console.log("playerData:", playerData);
    },[playerData])



    return (
        <div>

            <div>

                {questionType === "multipleChoice" && (
                    <QuestionMc choices={currentChoices} correctAnswers={correctAnswers} isHost />


                )}
                {questionType === "freeResponse" && (
                    /*<QuestionFc /> */
                    <p>I'm a FR Section</p>
                )}
            </div>

            <div className="mt-10">
                <div>
                    {playerData.length > 0 ? (playerData.map((player) => (
                        <div key={player.playerid}>
                            <div> 
                                {player}
                            </div>
                            <div> 
                                <p>Answered??</p>
                            </div>
                        </div>
                    ))) : (<p>Players have not answered</p>)}
                </div>
                <div className="flex justify-between mt-4">
                    <button className="">Next Question</button>
                    <button>Previous Question</button>
                    <button>End Round</button>

                </div>
            </div>

        </div>

    )



}