//import game and round cards
import { useState } from "react";
import RoundList from "./RoundList";

export default function EditGame() {

    // grab game id (from prop) and grab other data
    // grab game name

    const [gameName, setGameName] = useState(null);
    const [gameDescription, setgameDescription] = useState();

    //pull


    return (
        <div className="flex flex-col w-1/2 justify-items-center">
            <div>
                <p>Game Name</p>
                <p>{gameName || "The Trivia Game"} </p>

                <p>Description</p>
                <p>{gameDescription || "this is a description"} </p>
            </div>
        </div>
    )
}