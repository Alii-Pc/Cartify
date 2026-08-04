import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
import path from "path";
import fs from "fs";

if (getApps().length === 0) {
  try {
    let serviceAccount;
    
    // First check environment variable (for Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } 
    // Fallback to local file for development
    else {
      const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
      }
    }

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
      });
    } else {
      console.warn("No Firebase Service Account found in ENV or file, skipping Admin SDK init");
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminAuth = getApps().length > 0 ? getAuth() : null;
export const adminDatabase = getApps().length > 0 ? getDatabase() : null;
export const adminMessaging = getApps().length > 0 ? getMessaging() : null;
