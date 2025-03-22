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

        <div className="flex flex-col w-full items-center">
            <div className=" mt-2 mb-2 pr-4">
                <h1>Trivia Games</h1>
            </div>

            <div>

                <div className="mt-4 mb-2 w-80 border justify-self-center border-black rounded-lg pt-1 bg-black">

                    <Link
                        className="text-3xl text-green-500  pt-2 pr-2 pl-2"
                        to="/dashboard/create-game"> Create Trivia Game
                    </Link>    
                </div>
                <p className="text-xl  border-b-2 border-0 border-black">Games Created By { userName || "You" }</p>
                <div className="mt-1">
                {games.length > 0 ? (
                        games.map((game) => (
                            <Gamecard 
                                key={game.id} 
                                game = {game}
                                confirmDelete={confirmDelete}
                                editGame={editGame}
                            />
                        ))
                    ) : (
                        <p>No games found</p>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold">Confirm Deletion</h3>
                        <p>Are you sure you want to delete <strong>{selectedGame?.name}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded-full">
                                Cancel
                            </button>
                            <button onClick={deleteGame} className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-700">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    )



}