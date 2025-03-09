export default function Gamecard({ name, description, rounds }) {


//create delete games button logic

    return (

        <div className="flex border border-black">
            <div className="border border-black pr-2 pl-2">
                <p className="font-bold">Game Name: </p>
                <p>{name}</p>
            </div>
            <div className="border-r px-4">
                <p className="font-bold">Description:</p>
                <p>{description}</p>
            </div>
            <div className="border-r px-4">
                <p className="font-bold">Number of Rounds:</p>
                <p>{rounds}</p>
            </div>
            
            <div className="flex flex-col">
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full">Edit Game</button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">Delete Game</button>
            </div>
        </div>
    )

}