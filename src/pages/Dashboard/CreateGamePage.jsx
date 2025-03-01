import { useState } from "react"; // Import useState
import CreateGame from "../../components/Trivia/CreateGame";
import RoundList from "../../components/Trivia/RoundList";

export default function CreateGamePage() {
  

  const handleSubmit = (event) => {
    event.preventDefault();
    // ... gather data from CreateGame and rounds
    // ... send data to Firebase backend
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