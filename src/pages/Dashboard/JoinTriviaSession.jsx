import { useState } from "react";


export default function JoinTriviaSession() {

    
    const [joinCode, setJoinCode] = useState("");

    const handleSubmitJoinCode = (event) => {
        event.preventDefault();
        console.log("The joinCode is: ", joinCode);
    }


    return (
        <div className="flex flex-col w-full mt-20">
            <h1>Join a Trivia Session!</h1>

            <form
                onSubmit={(event) => handleSubmitJoinCode(event)}
                className="mt-3">
                
                <div className="flex flex-col w-25 justify-self-center ">
                    <label>Enter Join Code</label>
                    <input
                        className ="text-center"
                        value={joinCode}
                        type="string"
                        autoFocus={false}
                        placeholder="XXXXXX"
                        onChange={(e) => setJoinCode(e.target.value)}></input>
                </div>
                <button 
                    className="mt-3" 
                    type="submit"
                    >Submit</button>
            </form>
        </div>
    )
}