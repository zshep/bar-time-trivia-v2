import { signOut } from "firebase/auth";
import { auth } from "../../../app/server/api/firebase/firebaseConfig";

export default function Logout() {

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Optionally, redirect the user after successful logout
            window.location.href = "/";
            console.log("User successfully logged out.");
          } catch (error) {
            console.error("Error logging out: ", error);
          }
    };

    return(

        <div className="flex align-bottom">
            <button  onClick={handleLogout} className="btn">
                Log Out
            </button>
        </div>
    )
}