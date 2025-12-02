import admin from 'firebase-admin';
import serviceAccount from "../../app/server/api/firebase/serviceAccountKey.json" assert { type: "json"};

if (!admin.apps.length) {
  admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

}


export const adminDb = admin.firestore();
export { admin };