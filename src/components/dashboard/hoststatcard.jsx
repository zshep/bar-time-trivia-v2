import { useEffect } from "react";
import { toCSV } from "../../utils/csv";

export default function HostStatCard({ gameName, gameEndedAt, sessionData }) {
    
    // debugging sessiondata
    useEffect(() => {
        if (!sessionData) return;
        console.log("SessionData:", sessionData);
        console.log("players Data of Session:", sessionData.players);
        

    }, [sessionData]);

    //time formater
    const formatTime = (gameEndedAt) => {

        if (!gameEndedAt) return null;

        const date =
            typeof gameEndedAt === "number"
                ? new Date(gameEndedAt)
                : gameEndedAt.toDate
                    ? gameEndedAt.toDate()
                    : new Date(gameEndedAt);
        
        return date.toLocaleString(undefined, {
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    //leaderboard headers for csv download
      const headers = [
          "game_name",
          "player_name",
          "total_points",
          "accuracy_percent",
          "questions_answered",
          "questions_correct",
          "rounds_played",
      ];
  
      const rows = (sessionData.players || {}).map(p => {
          const questionsAnswered = p.questions_answered ?? 0;
          const questionsCorrect = p.questions_correct ?? 0;
  
          const accuracy =
              questionsAnswered > 0
                  ? Math.round((questionsCorrect / questionsAnswered) * 1000) / 10
                  : 0;
  
          return {
              game_name: gameName || "",
              player_name: p.name || "",
              total_points: p.total_points ?? 0,
              accuracy_percent: accuracy,
              questions_answered: questionsAnswered,
              questions_correct: questionsCorrect,
              rounds_played: p.rounds_played ?? "", // optional / safe default
          };
      });
  
      //downloading csv
      function downloadLeaderboardCSV() {
          if(!sessionData) return;
        
          const csv = toCSV(headers, rows);
          const blob = new Blob([csv], { type: "text/csv"});
          const url = URL.createObjectURL(blob);
  
          const a = document.createElement("a");
          a.href = url;
          a.download = `btt-leaderboard_${gameName || "game"}.csv`;
          a.click();
          
          URL.revokeObjectURL(url);
          
      }
    
    
    return (


   <li className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm">
  <div className="font-semibold">{gameName || "Session"}</div>
  <div className="text-md text-gray-600">{formatTime(gameEndedAt)}</div>
  <button
    className="text-sm font-semibold text-green-600 hover:underline"
    onClick={downloadLeaderboardCSV}
  >
    Download CSV
  </button>
</li>
  );
}
