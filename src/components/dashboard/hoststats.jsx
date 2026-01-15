import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig"


export default function HostStats({userId, userName}) {
    const [hostStats, setHostStats] = useState(null);
    

    // grab host stats
    useEffect(() => {
        if(!userId) return;

        const q = query(
            collection(db, "sessions"),
            where("hostId", "==", userId),
            where("status", "==", "completed"),
            orderBy("gameEndedAt", "desc"),
            limit(25)
        );

        const snap = getDocs(q);
        const pastSessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (pastSessions.length > 0) {
            setHostStats(pastSessions);
        }
        

    }, [userId])

    
    
    return(

        <div className="p-4 border rounded shadow bg-gray-50">
            <h2 className="text-xl font-bold text-center mb-4">{userName}'s Host Stats</h2>
            <div className="mt-1">
                {hostStats.length > 0 ? (
                    hostStats.map((session) => (
                        <p
                            key={session.id}>
                                {session}</p>
                    ))

                ) : (
                    <p>No Sessions Hosted </p>

                )}

            </div>

        </div>
    )
}