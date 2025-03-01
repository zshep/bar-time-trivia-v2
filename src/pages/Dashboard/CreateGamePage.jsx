import { useState } from "react"; // Import useState
import CreateGame from "../../components/Trivia/CreateGame";
import Roundcard from "../../components/Trivia/Roundcard";
import RoundList from "../../components/Trivia/RoundList";

export default function CreateGamePage() {
  const [rounds, setRounds] = useState([]); // State for rounds data

  const handleSubmit = (event) => {
    event.preventDefault();
    // ... gather data from CreateGame and rounds
    // ... send data to Firebase backend
  };

  // Function to add a new round (example)
  const addRound = () => {
    setRounds([...rounds, { /* ... default round data */ }]);
  };

  return (
    <div className="flex w-full justify-center mt-20">
      <form onSubmit={handleSubmit}> {/* Add form element */}
        <CreateGame />
        <RoundList />
        
      </form>
    </div>
  );
}