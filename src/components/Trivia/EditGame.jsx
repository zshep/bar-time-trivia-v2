//import game and round cards
import { useEffect, useState } from "react";
import RoundList from "./RoundList";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditGame() {
  const [rounds, setRounds] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const game = location.state?.game || {}; // grabbing passed game

  //console.log("Editing game:", game);
  //console.log(game.name);

  // double checking if game data is available
  useEffect(() => {
    if (!game) {
      console.error("no game Data found, redirecting...");
      navigate("/dashbaord"); // redirect if no game data
    }
  }, [game, navigate]);

  if (!game) return null;

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Game</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update rounds and questions for this trivia game.
            </p>
          </div>

          <button
            className="inline-flex w-fit items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
            onClick={() => navigate("/dashboard/viewgamePage")}
            type="button"
          >
            ← Back to Games
          </button>
        </div>

        {/* Game info card */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Game name
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {game.name || "The Trivia Game"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Description
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {game.description || "No description yet."}
              </p>
            </div>
          </div>
        </div>

        {/* Rounds */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Rounds</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add, remove, or edit rounds for this game.
          </p>

          <div className="mt-4">
            <RoundList rounds={rounds} setRounds={setRounds} game={game} />
          </div>
        </div>
      </div>
    </div>
  );
}
