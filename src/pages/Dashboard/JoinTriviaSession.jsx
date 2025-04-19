import { useState } from "react";


export default function JoinTriviaSession(){

    const [ joinCode, setJoinCode ] = useState(null);

    const handleSubmitJoinCode = () => {
        console.log("The joinCode is: ", joinCode);
    }


    return (
        <div className="flex flex-col w-full justify-center mt-20">
            <h3>Join a Trivia Session!</h3>

            <form>
                <p>Enter Join Code</p>
                <label></label>
                <input
                    value={joinCode}
                    type="string"
                    autoFocus="false"
                    placeholder=""
                    onChange={(e) => setJoinCode(e.target.value)}></input>
                
                <button onSubmit={handleSubmitJoinCode}>Submit</button>
            </form>
        </div>
    )
}