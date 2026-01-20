import { useState, useEffect } from "react";
import Roundcard from "./Roundcard";
import {
  deleteDoc,
  doc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";

export default function RoundList({ game, rounds, setRounds }) {
  const [roundsState, setRoundsState] = useState([]); // State for rounds data
  const [roundCategory, setRoundCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);

  const gameId = game.id;

  const getRoundData = async () => {
    const roundsInfo = collection(db, "rounds");
    const q = query(
      roundsInfo,
      where("gameId", "==", gameId),
      orderBy("roundNumber", "asc"),
    );
    const snapshot = await getDocs(q);

    const roundList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("List of Rounds", roundList);

    setRoundsState(roundList);
  };

  //getRoundData();

  //grabbing round data from user.
  useEffect(() => {
    if (gameId) {
      getRoundData(gameId);
    }
  }, [gameId]);

  // function to grab current number of rounds for game
  const getRoundCount = async (gameId) => {
    //console.log("counting rounds for gameid: ", gameId);
    const roundsInfo = collection(db, "rounds");
    const q = query(roundsInfo, where("gameId", "==", gameId));

    const snapshot = await getDocs(q);

    //converting Firestore docs to an array of game objects

    //console.log("total number of Rounds:", snapshot.size)

    return snapshot.size;
  };

  // open modal to add Round Category
  const chooseCategory = () => {
    setRoundCategory("");
    console.log("Choose the category for the round");
    setIsModalOpen(true);
  };

  // Function to add a new round (example)
  const addRound = async (gameId, category) => {
    try {
      setIsModalOpen(false);
      console.log("starting to add round");
      //getting number of rounds for game
      const roundCount = await getRoundCount(gameId);

      const newRound = {
        gameId: gameId,
        roundNumber: roundCount + 1,
        roundCategory: category,
        numberQuestions: 0,
        createdAt: new Date(),
      };
      //adding doc to firestore
      const roundRef = await addDoc(collection(db, "rounds"), newRound);
      console.log("New round added", roundRef.id);

      // updating game's count
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        numberRounds: increment(1),
      });

      // re-fetching data:

      await getRoundData();

      return roundRef;
    } catch (err) {
      console.log("Error adding Rounds", err);
    }
  };

  const confirmDeleteRound = (round) => {
    console.log("You are going to delete this round: ", round);
    setSelectedRound(round);
    setDeleteOpen(true);
  };

  //delete round
  const deleteRound = async () => {
    console.log(
      "we're going to delete YOU Round!!",
      selectedRound.roundCategory,
    );

    try {
      const roundRef = doc(db, "rounds", selectedRound.id);
      await deleteDoc(roundRef);

      //optimistically removing round
      setRoundsState((prevRound) =>
        prevRound.filter((roundsState) => roundsState.id !== selectedGame),
      );

      console.log("Round Delete Successfully");
      setDeleteOpen(false);

      // updating game's count
      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        numberRounds: increment(-1),
      });

      // re-fetching data:

      await getRoundData();
    } catch (err) {
      console.error("Error Deleting Round:", err);
    }
  };

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex flex-col items-center justify-between">
      

        <button
          type="button"
          onClick={() => chooseCategory()}
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          Add Round
        </button>
      </div>

      {/* List */}
      <div className="mt-4 space-y-3">
        {roundsState.map((round, index) => (
          <Roundcard
            key={round.id || index}
            roundData={round}
            confirmDeleteRound={confirmDeleteRound}
          />
        ))}
      </div>

      {/* Add Round Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Add round</h3>
            <p className="mt-1 text-sm text-gray-600">
              Choose a category for this round.
            </p>

            <label
              htmlFor="roundCategory"
              className="mt-4 block text-sm font-semibold text-gray-700"
            >
              Round category
            </label>

            <input
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              id="roundCategory"
              type="text"
              value={roundCategory}
              onChange={(e) => setRoundCategory(e.target.value)}
              placeholder="e.g., Science, Sports, Movies"
              autoComplete="off"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={() => addRound(gameId, roundCategory)}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                type="button"
              >
                Add round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              Confirm deletion
            </h3>

            <p className="mt-2 text-sm text-gray-700">
              Delete the round <strong>{selectedRound?.roundCategory}</strong>?
              This will delete all attached questions and cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={deleteRound}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                type="button"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
