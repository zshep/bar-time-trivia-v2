//import game and round cards
import { useEffect, useState } from "react";
import RoundList from "./RoundList";
import { useLocation } from "react-router-dom";

export default function EditGame() {

        
    const [rounds, setRounds ] = useState({});

   
    const location = useLocation();
    const game = location.state?.game // grabbing passed game

    //console.log("Editing game:", game);
    //console.log(game.name);



    const  handleSubmit = async (event) =>
    {
        event.preventDefault();
        console.log("attempting to edit game");
        
    }


    return (
        <div className="flex flex-col w-full justify-items-center">
            <div className="mt-4 mb-3">
                <p className="text-3xl">Game Name</p>
                <p>"{game.name || "The Trivia Game"}"</p>

                <p className="mt-4 text-2xl">Description</p>
                <p>{game.description|| "this is a description"} </p>
            </div>
            <div>

                <RoundList rounds ={rounds} setRounds={setRounds} game={game}/>
                <button 
                    onClick={handleSubmit}
                    className="mt-3"
                    type="submit">Save Game</button>
            </div>
        </div>
    )
}