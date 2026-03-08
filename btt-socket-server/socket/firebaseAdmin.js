import "dotenv/config";
import admin from "firebase-admin";
import fs from "fs";

function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const json = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8");
    serviceAccount = JSON.parse(json);
  } else {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
}

export const firebaseAdmin = initFirebaseAdmin();
export const firestoreAdmin = firebaseAdmin.firestore();
export default firebaseAdmin;

export const adminDb = admin.firestore();
export { admin };