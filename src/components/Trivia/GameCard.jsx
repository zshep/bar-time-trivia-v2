import { Link } from "react-router-dom"

export default function Gamecard({ name, description, rounds }) {

    const deleteGame = () => {
        console.log("whoops");
        alert("You're about to delete your game!");

    }
//create delete games button logic

    return (

        <div className="flex border border-black mb-2">
            <div className="border border-black pr-2 pl-2">
                <p className="font-bold">Game Name </p>
                <p className="">{name}</p>
            </div>
            <div className="border-r px-4 w-1/2">
                <p className="font-bold">Description</p>
                <p>{description}</p>
            </div>
            <div className="border-r px-4">
                <p className="font-bold">Rounds</p>
                <p>{rounds}</p>
            </div>
            
            <div className="flex flex-col text-sm py-2 ml-1">
                <Link className="bg-yellow-500 hover:bg-yellow-700 text-white rounded-full py-2" to="/dashboard/edit-game">Edit</Link>
                <button onClick={deleteGame} className="mt-2 bg-red-500 hover:bg-red-700 text-white rounded-full">Delete</button>
            </div>
        </div>
    )

}