import { db } from "../../app/server/api/firebase/firebaseConfig"; 
import { doc, setDoc } from 'firebase/firestore';

/**
 * Save final game session result to Firestore
 * @param {string} sessionCode - The session code / ID
 * @param {object} finalData - Object containing final scores, players, etc.
 */
export async function saveGameResult(sessionCode, finalData) {
  try {
    const ref = doc(db, 'completedSessions', sessionCode);
    await setDoc(ref, {
      ...finalData,
      endedAt: new Date()
    });
    console.log(`Session ${sessionCode} saved to Firestore.`);
  } catch (error) {
    console.error(`Failed to save session ${sessionCode}:`, error);
  }
}
