import { adminDb } from "../socket/firebaseAdmin.js"; 


/**
 * Save final game session result to Firestore
 * @param {string} sessionCode - The session code / ID
 * @param {object} finalData - Object containing final scores, players, etc.
 */
export async function saveGameResult(sessionCode, finalData) {
    try {
        await adminDb.collection('sessions').doc(sessionCode).set(finalData);
        console.log(`✅ Game session ${sessionCode} saved to Firestore`);
      } catch (error) {
        console.error('❌ Failed to save game result:', error);
      }
}
