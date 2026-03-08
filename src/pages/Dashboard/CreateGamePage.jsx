import { useState } from "react";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import CreateGame from "../../components/Trivia/CreateGame";
import { useNavigate } from "react-router-dom";

export default function CreateGamePage() {
  const [gameData, setGameData] = useState({
    gameName: "",
    description: "",
  });

  const navigate = useNavigate();

  const handleGameDataChange = (data) => {
    setGameData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to create a game.");
      return;
    }

    const gameName = gameData.gameName?.trim() || "";
    const description = gameData.description?.trim() || "";

    if (!gameName) {
      alert("Game name must be set.");
      return;
    }

    try {
      const createdAt = new Date();

      const newGameData = {
        name: gameName,
        description,
        user_id: user.uid,
        createdAt,
        numberRounds: 0,
      };

      const gameRef = await addDoc(collection(db, "games"), newGameData);

      const newGame = {
        id: gameRef.id,
        ...newGameData,
      };

      alert("Game created successfully!");
      navigate("/dashboard/edit-game", { state: { game: newGame } });
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Could not create game. Check console for details.");
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Create Trivia Game</h1>
          <p className="text-sm text-gray-600">
            Set up a new game and then add rounds and questions.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <CreateGame onGameDataChange={handleGameDataChange} />

            <div className="flex justify-center">
              <button
                className="inline-flex w-fit items-center justify-center rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
                type="submit"
              >
                Save Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}