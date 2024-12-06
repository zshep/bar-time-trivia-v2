//need to import function to grab round data from server

export default function Roundcard() {


    return(
        <div className="flex border border-black">
            <div>
                <p>Round number</p>
            </div>
            <div>
                <p>Round Type</p>
            </div>
            <div>
                Number of Questions
            </div>
            <div className="flex flex-col">
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full">Edit Round</button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">Delete Round</button>
            </div>
        </div>

    )
}