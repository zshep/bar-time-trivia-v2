export default function LiveMainPage() {


    return (

        <div className="flex flex-col">
            <div className="flex border border-black">
                <div>
                    <p>Game: {game.name}</p>
                </div>
                <div>
                    <p>Round: {game.roundNumber}</p>
                </div>
                <div>
                    <p>Host: {game.host}</p>
                </div>

            </div>
            <div>
                <p>I am the question</p>
                <p>I am the answer choices</p>
                
            </div>




        </div>
    )
}