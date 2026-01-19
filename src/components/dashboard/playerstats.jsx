import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";

export default function Playerstats({ userId, userName }) {
    const [stats, setStats] = useState(null);

    //rounding helper
    function toTenthPercent(correct, answered) {
        if (!answered) return 0;
        return Math.round((correct / answered) * 1000) / 10;
    }

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
            <div className="p-4 border rounded shadow bg-gray-50 w-full">
                <h2 className="text-xl font-bold text-center mb-4">{userName}'s Stats</h2>
                <p className="text-gray-500 italic">No stats yet — play your first game!</p>
            </div>
        );
    }
    console.log("Player stats:", stats);


    // ---- computed values ----
    const {
        gamesPlayed = 0,
        totalPoints = 0,
        questionsAnswered = 0,
        questionsCorrect = 0,
    } = stats;

    const accuracy = questionsAnswered > 0 ? (Math.round((questionsCorrect / questionsAnswered) * 1000) / 10) : "0.0";

    const avgScorePerGame = gamesPlayed > 0 ? (Math.round(totalPoints / gamesPlayed)) : "0.0";

    

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-gray-50 w-full">
            <h2 className="text-xl font-bold text-center mb-4">{userName}'s Stats</h2>

            <div className="grid grid-cols-2 gap-4">

                <StatBlock
                    label="Games Played"
                    value={gamesPlayed}
                />

                <StatBlock
                    label="Total Points"
                    value={totalPoints}
                />

                <StatBlock
                    label="Questions Answered"
                    value={questionsAnswered}
                />

                <StatBlock
                    label="Questions Correct"
                    value={questionsCorrect}
                />

                <StatBlock
                    label="Accuracy"
                    value={accuracy + "%"}
                />

                <StatBlock
                    label="Avg / Game"
                    value={avgScorePerGame}
                />


            </div>
        </div>

    );

}

function StatBlock({ label, value }) {
    return (
        <div className="flex flex-col items-center p-3 bg-gray-100 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-lg font-semibold">{value}</span>
        </div>
    );

}
