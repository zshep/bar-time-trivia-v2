import { text } from "express";
import { useState } from "react";


export default function CreateGame() {
    const [gameName, setGamename] = useState("");
    const [description, setDescription] = useState("");


    return (
        <div>
            <div>

                <h1>Create a Trivia Game</h1>
            </div>
            <div>
                <form>
                    <div>
                        <label
                            htmlFor="gameName">Trivia Game Name</label>
                        <input
                            id="gameName"
                            type="text"
                            value={gameName}
                            onChange={(e) => setGamename(e.target.value)}
                            placeholder="Eg. My sports Trivia"
                            required
                            autoFocus
                        ></input>
                    </div>
                    <div>
                        <label htmlFor="gameDescription">

                        </label>
                        <input
                            id="gameDescription"
                            type="text"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            >
                            
                        
                        </input>

                    </div>

                </form>


            </div>

        </div>
    )
}