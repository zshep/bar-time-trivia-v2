import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../../../app/server/api/firebase/firebaseConfig";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import Gamecard from "../../components/Trivia/GameCard";

export default function ViewGamePage() {

    //create edit Games button logic
    const [games, setGames] = useState([]);
    const [ userId, setUserId ] = useState(null);
    const [ userName, setUsername ] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null); // Holds game info
    const navigate = useNavigate();


    //grabs list of games user has created
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user)
            {
                console.log("User Authenticated: ", user)
                
                setUserId(user.uid);
                setUsername(user.displayName);

                try{
                    
                    // grabbing game info from user
                    const gamesInfo = collection(db, "games");
            
                    const q = query(gamesInfo, where("user_id", "==", user.uid));
                    const querySnapshot = await getDocs(q);

                    // Convert Firestore docs to an array of game objects
                    const gameList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    
                    
                    // adding game info to games variabel
                    setGames(gameList);
                    console.log("games: ", gameList);

                   

                } catch (err) {
                    console.log("Error with grabbing games", err);

                }
            } else {
                console.log("No user Authenticated");
            }


        });

        return () => unsubscribe(); // cleanup subscription

    }, []);

      // Open confirmation modal
      const confirmDelete = (game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    // Edit game selected
    const editGame = (game) => {
        
        
        console.log("game id:", game);
        setSelectedGame(game);
        navigate("/dashboard/edit-game", { state: { game } });

    };

    // **Delete game from Firestore**
    const deleteGame = async () => {
        if (!selectedGame) return;
        console.log("Deleting game:", selectedGame.id);

        try {
            const gameRef = doc(db, "games", selectedGame.id);
            await deleteDoc(gameRef);

            // Remove the game from the UI instantly (Optimistic Update)
            setGames(prevGames => prevGames.filter(game => game.id !== selectedGame.id));

            console.log("Game deleted successfully");
        } catch (error) {
            console.error("Error deleting game:", error);
        }

        setIsModalOpen(false); // Close modal
    };


    //create delete games button logic

    return (

        <div className="w-full">
  {/* Page container */}
  <div className="mx-auto w-full max-w-4xl px-4 py-6">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      
        <h1 className="text-2xl font-bold text-gray-900">Trivia Games</h1>
        
      

      <Link
        to="/dashboard/create-game"
        className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
      >
        Create Trivia Game
      </Link>
    </div>

    {/* Divider */}
    <div className="mt-6 border-t border-gray-200" />

    {/* Section title */}
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Games created by {userName || "you"}
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Click a game card to review, edit, or delete.
      </p>
    </div>

    {/* Games list */}
    <div className="mt-4">
      {games.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {games.map((game) => (
            <Gamecard
              key={game.id}
              game={game}
              confirmDelete={confirmDelete}
              editGame={editGame}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-700 font-medium">No games found</p>
          <p className="text-sm text-gray-600 mt-1">
            Create your first trivia game to get started.
          </p>
          <div className="mt-4">
            <Link
              to="/dashboard/create-game"
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
            >
              Create Trivia Game
            </Link>
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Modal */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Confirm deletion</h3>
        <p className="mt-2 text-sm text-gray-700">
          Are you sure you want to delete{" "}
          <strong>{selectedGame?.name}</strong>? This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={deleteGame}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  )}
</div>

    )



}