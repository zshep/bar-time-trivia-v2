import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";

export default function Playerstats({ userId }){
    const [stats, setStats] = useState(null);

    //grabbing users stats
    useEffect(() => {
    if (!userId) return;

    const ref = doc(db, "users", userId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setStats(data?.stats || null);
    });

    return () => unsub();
  }, [userId]);

  if (!stats) {
    return (
        <div className="p-4 border rounded shadow bg-gray-50">
        <p className="text-gray-500 italic">No stats yet — play your first game!</p>
      </div>
    );
  }
  

    return (
        <div>
            <p>I am the player stats</p>
        </div>
    )
}