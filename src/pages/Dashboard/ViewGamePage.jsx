import { useState } from "react";

export default function ViewGamePage() {

    //create edit Games button logic
    const [games, setGames] = useState([]);



    //create delete games button logic



    return (

        <div className="flex flex-col align-middle">
            <div className="border border-black">
                <h1>Trivia Games</h1>
            </div>

            <div>

                <div>
                    <button type="button" className="border">Create Trivia Game</button>
                </div>
                        <p>Games you've created</p>
                <div>
                    {games.map((game, index) => (
                        <Gamecard />

                    ))}

                </div>
            </div>
        </div>
    )



}