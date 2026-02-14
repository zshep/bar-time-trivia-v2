import admin from 'firebase-admin';
import fs from "fs";
import path from "path";

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve("path/to/serviceAccount.json"), "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

}


export const adminDb = admin.firestore();
export { admin };