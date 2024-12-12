
import { useState } from "react";


export default function CreateGame() {
    const [gameName, setGamename] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        
        const newGameName = gameName;
        const newGameDescription = description;

        console.log("game name: ", newGameName)
        console.log("game description: ", newGameDescription)
        
        // ... send data to Firebase backend
      };
    

    return (
        <div>
        <div>
          <h1>Create a Trivia Game</h1>
        </div>
        <div>
          <form onSubmit={handleSubmit}> {/* Add onSubmit handler */}
            <div>
              <label htmlFor="gameName">Trivia Game Name</label>
              <input
                id="gameName"
                type="text"
                value={gameName}
                onChange={(e) => setGamename(e.target.value)}
                placeholder="Eg. My sports Trivia"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="gameDescription">Description of Game</label>
              <textarea
                id="gameDescription"
                required
                placeholder="What topics does your Trivia cover?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit">Create Game</button> {/* Add a submit button */}
          </form>
        </div>
      </div>
    );
  };