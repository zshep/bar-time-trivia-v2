import { useState, useEffect } from "react";
import Roundcard from "./Roundcard";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";

export default function RoundList({ game }) {
  const [roundsState, setRoundsState] = useState([]);
  const [roundCategory, setRoundCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);

  const gameId = game?.id;

  const getRoundData = async () => {
    if (!gameId) return;

    try {
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user found.");
        return;
      }

      const roundsInfo = collection(db, "rounds");
      const q = query(
        roundsInfo,
        where("gameId", "==", gameId),
        where("user_id", "==", user.uid),
        orderBy("roundNumber", "asc"),
      );

      const snapshot = await getDocs(q);

      const roundList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      console.log("List of Rounds", roundList);
      setRoundsState(roundList);
    } catch (err) {
      console.error("Error getting rounds:", err);
    }
  };

  useEffect(() => {
    if (gameId) {
      getRoundData();
    }
  }, [gameId]);

  const getRoundCount = async (gameId) => {
    try {
      const user = auth.currentUser;
      const roundsInfo = collection(db, "rounds");
      const q = query(
        roundsInfo,
        where("gameId", "==", gameId),
        where("user_id", "==", user.uid),
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (err) {
      console.error("Error getting round count:", err);
      return 0;
    }
  };

  const chooseCategory = () => {
    setRoundCategory("");
    setIsModalOpen(true);
  };

  const addRound = async (gameId, category) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user found.");
        return;
      }

      const trimmedCategory = category.trim();

      if (!trimmedCategory) {
        console.error("Round category is required.");
        return;
      }

      setIsModalOpen(false);
      console.log("starting to add round");

      const roundCount = await getRoundCount(gameId);

      const newRound = {
        gameId: gameId,
        user_id: user.uid,
        roundNumber: roundCount + 1,
        roundCategory: trimmedCategory,
        numberQuestions: 0,
        createdAt: new Date(),
      };

      const roundRef = await addDoc(collection(db, "rounds"), newRound);
      console.log("New round added", roundRef.id);

      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        numberRounds: increment(1),
      });

      await getRoundData();

      return roundRef;
    } catch (err) {
      console.log("Error adding rounds", err);
    }
  };

  const confirmDeleteRound = (round) => {
    console.log("You are going to delete this round:", round);
    setSelectedRound(round);
    setDeleteOpen(true);
  };

  const deleteRound = async () => {
    if (!selectedRound) return;

    console.log("Deleting round:", selectedRound.roundCategory);

    try {
      const roundRef = doc(db, "rounds", selectedRound.id);
      await deleteDoc(roundRef);

      setRoundsState((prevRounds) =>
        prevRounds.filter((round) => round.id !== selectedRound.id),
      );

      console.log("Round deleted successfully");
      setDeleteOpen(false);

      const gameRef = doc(db, "games", gameId);
      await updateDoc(gameRef, {
        numberRounds: increment(-1),
      });

      await getRoundData();
    } catch (err) {
      console.error("Error deleting round:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-between">
        <button
          type="button"
          onClick={chooseCategory}
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          Add Round
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {roundsState.map((round, index) => (
          <Roundcard
            key={round.id || index}
            roundData={round}
            game={game}
            confirmDeleteRound={confirmDeleteRound}
          />
        ))}
      </div>

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
