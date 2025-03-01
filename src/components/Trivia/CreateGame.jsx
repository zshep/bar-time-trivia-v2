
import { useState } from "react";
import { setDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../app/server/api/firebase/firebaseConfig.js"; // Import your firebase configuration


export default function CreateGame() {
  const [gameName, setGamename] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);


  const handleSubmit = (event) => {
    event.preventDefault();

    const newGameName = gameName;
    const newGameDescription = description;

    console.log("game name: ", newGameName)
    console.log("game description: ", newGameDescription)


    try {
      // creating newGame object to hold game details.
      const newGame = {
        Name_game: gameName,
        Description_game: description,
        // Round_number: roundNumber,
        // user_id: userid
      }

      // send data to Firebase backend, create new collection???

      // update user profile



    } catch (err) {
      setError(err.message);
      console.error("Error: Could not create game", err);
    }
  }
    ;


  return (
    <div>
      <div>
        <h1>Create a Trivia Game</h1>
      </div>
      <div className="mt-5">
        <fieldset onSubmit={handleSubmit}> {/* Add onSubmit handler */}
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
          <div className="mt-5">
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
        </fieldset>
      </div>
    </div>
  );
};