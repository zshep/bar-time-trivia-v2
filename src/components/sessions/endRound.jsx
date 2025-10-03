export default function endRound() {

    //states


    //logic for talling up scores

    //next round
    const handleNextRound = () => {
        console.log("host has click next round");


    }



    return(
        <div>
            <div className="flex flex-col">
            <h1>Round Results</h1>

            </div>
            <div className="flex flex-col">



            </div>
            {isHost && (
                <div>
                    <button
                        onClick={handleNextRound}
                        >Start Next Round</button>
                
                </div>

            )}



        </div>
    )
}