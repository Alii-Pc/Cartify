import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
import path from "path";
import fs from "fs";

if (getApps().length === 0) {
  try {
    // Read the service account file from the root
    const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
      });
    } else {
      console.warn("firebase-service-account.json not found, skipping Admin SDK init");
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminAuth = getApps().length > 0 ? getAuth() : null;
export const adminDatabase = getApps().length > 0 ? getDatabase() : null;
export const adminMessaging = getApps().length > 0 ? getMessaging() : null;
