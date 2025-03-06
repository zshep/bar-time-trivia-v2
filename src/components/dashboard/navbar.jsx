import { Link } from "react-router-dom";
import Logout from "./logout";

export default function Navbar() {


    return(
        <div className="flex flex-col justify-between border-black border-2 ml-px px-4 rounded w-44">
            <div className="mt-4">
                <ul className="nav flex-column text-center">
                    <li className="nav-item mb-1">
                        <Link className="nav-link active" to="/dashboard">Home</Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link className="nav-link" to="viewgamePage">View Trivia Games</Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link className="nav-link" to="create-session">Create Trivia Session</Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link className="nav-link" to="join-session">Join Trivia Session</Link>
                    </li>
                
                </ul>
            </div>

            <div className="mb-4">
                <Logout></Logout>
            </div>


        </div>
    )
}