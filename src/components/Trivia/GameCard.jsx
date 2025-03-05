export default function Gamecard() {


    return (

        <div className="flex border border-black">
            <div className="border border-black">
                <p>Game Name</p>
            </div>
            <div className="border border-black">
                <p>Number of Rounds</p>
            </div>
            
            <div className="flex flex-col">
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full">Edit Game</button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">Delete Game</button>
            </div>
        </div>
    )

}