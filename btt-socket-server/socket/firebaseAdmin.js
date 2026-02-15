import admin from 'firebase-admin';


function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON env var (Firebase Admin credentials)."
    );
  }

  const serviceAccount = JSON.parse(json);

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