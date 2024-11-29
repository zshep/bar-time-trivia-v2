import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { auth } from "../../../app/server/api/firebase/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Playericon from "../../components/dashboard/playerIcon";
import Playerstats from "../../components/dashboard/playerstats";



export default function DashboardInfo(){

    const [username, setUsername] = useState(null);
    const db = getFirestore();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUsername(userDoc.data().username);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, []);

    return (
        
            <div className="flex flex-col">
                <div className="flex flex-col mx-4">
                    <div className="border border-black p-2 text-center rounded mt-3">
                        <p>Welcome, {username}</p>
                    </div>
                    <Playericon></Playericon>
                </div>

                <div className="d-flex flex-column mx-4 mt-3">
                    
                    <div className=" border border-black p-2 rounded">
                        <p className="text-center">User Stats</p>
                    </div>
                    <Playerstats></Playerstats>
                </div>
            </div>
        
    )
}