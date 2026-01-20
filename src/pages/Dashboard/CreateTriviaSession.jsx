import { auth, db } from "../../../app/server/api/firebase/firebaseConfig"
import { useEffect, useState } from "react";
import socket from "../../main";
import { deleteDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


export default function CreateTriviaSession() {

    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState({})
    const [userName, setUserName] = useState("Unknown");
    const [games, setGames] = useState([]);
    const [selectedGameId, setSelectedGameId] = useState("");
    const navigate = useNavigate();

    //grabbing users data
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                //console.log("user: ", user);
                setUserId(user.uid);
                setUserData(user);
                setUserName(user.displayName);
                grabUserData(user.uid);
            } else {
                console.log("there is no user");
            }

        });

        return () => unsubscribe();
    }, []);



    //grab user Data
    const grabUserData = async (id) => {
        try {

            const userGameInfo = collection(db, "games");
            const q = query(userGameInfo, where("user_id", "==", id));
            const querySnapshot = await getDocs(q);


            //converting FS docs to array of game objects
            const gameList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setGames(gameList);
            console.log("games: ", gameList);



        } catch (err) {
            console.log("error grabbing user's games: ", err)
        }

    }

    const generateJoinCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleBtnClick = () => {

        if (!selectedGameId) {

            console.log("There is no game selected");
            alert("You didn't select a game!");
            return;

        }

        console.log(`Session created for ${selectedGameId} Game`);

        const game = games.find(g => g.id === selectedGameId);
        if (!game) {
            console.error("Selected game not found in state!");
            return;
        }

        // generate a 6 digit code
        const joinCode = generateJoinCode();
        console.log("joincode:", joinCode)


        // Emit the socket event to create the session
        socket.emit("create-session", {
            sessionCode: joinCode,
            hostId: userId,
            hostName: userName,
            gameId: game.id,
            gameName: game.name,

        });

        // Redirect user to lobby screen (assuming you have routing set up)
        navigate(`/session/lobby/${joinCode}`, {
            state: {
                gameName: game.name,
                gameId: game.id,
                sessionCode: joinCode,
                hostId: userData.uid,
                hostName: userName,
            }
        });



    }


    return (
       <div className="w-full">
  <div className="mx-auto w-full max-w-md px-4 py-6">
    {/* Header */}
    <div className="flex flex-col items-center text-center gap-2">
      <h1 className="text-2xl font-bold text-gray-900">
        Create Trivia Session
      </h1>
      <p className="text-sm text-gray-600">
        Choose a trivia game to start a live session.
      </p>
    </div>

    {/* Card */}
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <label
          htmlFor="game"
          className="text-sm font-semibold text-gray-700"
        >
          Select a game
        </label>

        <select
          value={selectedGameId}
          name="game"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
          onChange={(e) => setSelectedGameId(e.target.value)}
        >
          <option disabled value="">
            -- Choose Game --
          </option>

          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>

        <button
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
          onClick={handleBtnClick}
        >
          Create Session
        </button>
      </div>
    </div>
  </div>
</div>

    )
}