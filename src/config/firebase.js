import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize Firebase Admin SDK for Basket Reminders
 * Requires GOOGLE_APPLICATION_CREDENTIALS path in .env
 * OR the full service account JSON in FIREBASE_SERVICE_ACCOUNT
 */
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.app();

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Fallback to GOOGLE_APPLICATION_CREDENTIALS environment variable
      return admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
  } catch (err) {
    console.error("❌ Firebase Admin Init Error:", err.message);
    return null;
  }
};

export const firebaseAdmin = initFirebase();
