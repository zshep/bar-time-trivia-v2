import { db } from "../socket/firebaseAdmin.js"; 
import { doc, setDoc } from 'firebase/firestore';
import { Timestamp } from "firebase/firestore";

/**
 * Save final game session result to Firestore
 * @param {string} sessionCode - The session code / ID
 * @param {object} finalData - Object containing final scores, players, etc.
 */
export async function saveGameResult(sessionCode, finalData) {
    try {
        await db.collection('completedSessions').doc(sessionCode).set({
          ...finalData,
          endedAt: Timestamp.now()
        });
        console.log(`✅ Game session ${sessionCode} saved to Firestore`);
      } catch (error) {
        console.error('❌ Failed to save game result:', error);
      }
}
