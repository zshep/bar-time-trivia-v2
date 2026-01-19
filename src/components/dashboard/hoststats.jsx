import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";
import { toCSV } from "../../utils/csv";
import HostStatCard from "./hoststatcard";

export default function HostStats({ userId, userName }) {
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // grab host stats
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setPastSessions([]);
      return;
    }
    let cancelled = false;

    const fetchHostData = async () => {
      setLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, "sessions"),
          where("hostId", "==", userId),
          where("status", "==", "completed"),
          orderBy("gameEndedAt", "desc"),
          limit(25),
        );

        const snap = await getDocs(q);

        const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (!cancelled) setPastSessions(sessions ?? []);
      } catch (err) {
        if (!cancelled) {
          console.error("HostStats getDocs error:", err);
          setError(err);
          setPastSessions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHostData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  //debugging sessionData:
  useEffect(() => {
    console.log("sessionData:", pastSessions);
  }, [pastSessions]);

   

  return (
    <div className="p-4 mt-2 border rounded shadow max-w-md mx-auto bg-gray-50">
      <h2 className="text-xl font-bold text-center mb-4">
        {userName}'s Host Stats
      </h2>

      {loading && <p className="text-gray-500 italic">Loading...</p>}

      {!loading && error && (
        <p className="text-red-600">
          Error loading sessions: {error.code || error.message}
        </p>
      )}

      {!loading && !error && pastSessions.length === 0 && (
        <p className="text-gray-500 italic"> No sessions hosted yet</p>
      )}

      {!loading && !error && pastSessions.length > 0 && (
        <ul className="space-y-2">
          {pastSessions.map((session) => (
              <HostStatCard
                key={session.id}
                gameName={session.gameName}
                gameEndedAt={session.gameEndedAt}
                sessionData={session.exportSummary}
              />
          ))}
        </ul>
      )}
    </div>
  );
}

