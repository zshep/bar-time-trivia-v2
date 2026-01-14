import { Link } from "react-router-dom";
import Logout from "./logout";

export default function Navbar() {
 

    return(
        <div className="flex flex-col items-center justify-between border-black border-2 ml-px px-4 rounded w-44 ">
            <div className="mt-4">
                <ul className="nav flex-column text-center  text-lg">
                    <li className="nav-item mb-1 border border-black rounded">
                        <Link className="nav-link active text-black" to="/dashboard">Home</Link>
                    </li>
                    <li className="nav-item mb-1 border border-black rounded">
                        <Link className="nav-link text-black" to="viewgamePage">View Trivia Games</Link>
                    </li>
                    <li className="nav-item mb-1 border border-black rounded">
                        <Link className="nav-link text-black" to="create-session">Create Trivia Session</Link>
                    </li>
                    <li className="nav-item mb-1 border border-black rounded">
                        <Link className="nav-link text-black" to="join-session">Join Trivia Session</Link>
                    </li>
                
                </ul>
            </div>

            <div className="mb-4">
                <Logout></Logout>
            </div>


        </div>
    )
}