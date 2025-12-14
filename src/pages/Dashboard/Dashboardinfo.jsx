import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { auth } from "../../../app/server/api/firebase/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Playericon from "../../components/dashboard/playerIcon";
import Playerstats from "../../components/dashboard/playerstats";



export default function DashboardInfo() {

    const [username, setUsername] = useState(null);
    const [user, setUser] = useState(null);
    const db = getFirestore();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            setUser(user);
            
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        console.log("user data:", data);
                        setUsername(data.username || user.displayName || "User");
                    } else {
                        setUsername(user.displayName || "User");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            else {
                console.log("There is no user");
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="flex w-full justify-around mt-4" >
            <div className="flex flex-col">
            
                
                <div className="d-flex flex-column mx-2 mt-3">

    
                    <Playerstats userId={user?.uid} userName={username}></Playerstats>
                </div>
            </div>
        </div>
    )
}