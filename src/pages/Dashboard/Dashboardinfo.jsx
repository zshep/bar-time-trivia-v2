import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../app/server/api/firebase/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Playericon from "../../components/dashboard/playerIcon";
import Playerstats from "../../components/dashboard/playerstats";
import HostStats from "../../components/dashboard/hoststats.jsx"


export default function DashboardInfo() {

    const [username, setUsername] = useState(null);
    const [user, setUser] = useState(null);
    const db = getFirestore();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            

            console.log("HostStats userId prop:", u.uid);
            console.log("HostStats auth uid:", auth.currentUser.uid);

            if (u) {
                try {
                    const userDoc = await getDoc(doc(db, "users", u.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        console.log("user data:", data);
                        setUser(u);
                        setUsername(u.displayName || data.displayName || "User");
                    } else {
                        setUsername(user.displayName || "User");
                        console.log("user data:", userDoc);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
            else {
                console.log("There is no user");
            }

            
        })
        
        
        return () => unsub();
    }, []);


    
    
  
    return (
        <div className="flex w-full justify-around mt-4" >
            <div className="flex flex-col">
            
                
                <div className="d-flex flex-column mx-2 mt-3">

    
                    <Playerstats userId={user?.uid} userName={username}></Playerstats>
                </div>
                <div>
                    <HostStats userId={user?.uid} userName={username}></HostStats>
                </div>
            </div>
        </div>
    )
}