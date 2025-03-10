//import game and round cards
import { useState } from "react";
import RoundList from "./RoundList";

export default function EditGame() {

    // grab game id (from prop) and grab other data
    // grab game name

    const [gameName, setGameName] = useState(null);
    const [gameDescription, setgameDescription] = useState();
    const [rounds, setRounds ] = useState({});

    const  handleSubmit = async (event) =>
    {
        event.preventDefault();
        console.log("attempting to edit game");
        
    }


    return (
        <div className="flex flex-col w-full justify-items-center">
            <div className="mt-4">
                <p className="text-3xl">Game Name</p>
                <p>"{gameName || "The Trivia Game"}"</p>

                <p className="mt-4 text-2xl">Description</p>
                <p>{gameDescription || "this is a description"} </p>
            </div>
            <form onSubmit={handleSubmit}>

                <RoundList rounds ={rounds} setRounds={setRounds} />
                <button type="submit">Save Game</button>
            </form>
        </div>
    )
}