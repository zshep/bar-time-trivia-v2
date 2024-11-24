import { Link } from "react-router-dom";
import Logout from "./logout";

export default function Navbar() {


    return(
        <div className="border-black border-4 ml-px px-3 ">
            <div>
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

            <div className="flex justify-self-end">
                <Logout></Logout>
                
            </div>


        </div>
    )
}