import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../app/server/api/firebase/firebaseConfig";

export default function Playerstats({ userId }) {
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


    // ---- computed values ----
    const {
        gamesPlayed = 0,
        totalPoints = 0,
        totalRoundPlayed = 0,
        questionsAnswered = 0,
        correctAnswers = 0,
    } = stats;

    const accuracy = questionsAnswered > 0 ? ((correctAnswers / questionsAnswered) * 100).toFixed(1) : "0.0";

    const avgScorePerGame = gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(1) : "0.0";

    const avgRoundsPerGame = gamesPlayed > 0 ? (totalRoundPlayed / gamesPlayed).toFixed(1) : "0.0";

    return (
        <div className="p-5 border rounded-xl shadow-md bg-white max-w-md mx-auto">
            <h2 className="text-xl font-bold text-center mb-4">Your Trivia Stats</h2>

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
                    value={correctAnswers}
                />

                <StatBlock
                    label="Accuracy"
                    value={accuracy + "%"}
                />

                <StatBlock
                    label="Avg / Game"
                    value={avgScorePerGame}
                />

                <StatBlock
                    label="Avg / Round"
                    value={avgRoundsPerGame}
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
