import { Link } from "react-router-dom";
import Logout from "./logout";

export default function Navbar() {


    return(
        <div className="flex flex-col justify-between border-black border-2 ml-px px-4 rounded">
            <div className="mt-4">
                <ul className="nav flex-column text-center">
                    <li className="nav-item">
                        <Link className="nav-link active" to="/dashboard">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dashboard/makeTriviaSession">Make Trivia</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/dashboard/playTrivia">Play Trivia</Link>
                    </li>
                
                </ul>
            </div>

            <div className="mb-4">
                <Logout></Logout>
            </div>


        </div>
    )
}