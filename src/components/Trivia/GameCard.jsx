


export default function Gamecard({ game, confirmDelete, editGame }) {

        
    return (

        <div className="flex border border-black mb-2">
            <div className="border border-black pr-2 pl-2">
                <p className="font-bold">Game Name </p>
                <p className="">{game.name}</p>
            </div>
            <div className="border-r px-4 w-1/2">
                <p className="font-bold">Description</p>
                <p>{game.description}</p>
            </div>
            <div className="border-r px-4">
                <p className="font-bold">Rounds</p>
                <p>{game.numberRounds || "unknown"}</p>
            </div>
            
            <div className="flex flex-col text-sm py-2 ml-1">
                <button onClick={() => editGame(game)} className="bg-yellow-500 hover:bg-yellow-700 text-white rounded-full py-2" to="/dashboard/edit-game">Edit</button>
                <button onClick={() => confirmDelete(game)} className="mt-2 bg-red-500 hover:bg-red-700 text-white rounded-full">Delete</button>
            </div>
        </div>
    )

}