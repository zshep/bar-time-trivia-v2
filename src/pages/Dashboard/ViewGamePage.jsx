

export default function ViewGamePage() {

    //create edit Games button logic


    //create delete games button logic



    return (

        <div>
            <div className="border border-black">
                <h1>Trivia Games</h1>
            </div>

            <div>

                <div>
                    <button type="button" className="border">Create Trivia Game</button>
                </div>
                        <p>Games you've created</p>
                <div>
                    {games.map((game, index) => (
                        <Gamecard />

                    ))}

                </div>
            </div>
        </div>
    )



}