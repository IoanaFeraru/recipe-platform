/**
 * Firebase initialization and service access layer.
 *
 * This module is responsible for:
 * - initializing the Firebase application using environment configuration
 * - exporting singleton instances of Firebase services used throughout the app
 *
 * The initialization is intentionally centralized to avoid multiple app
 * instances and to keep infrastructure concerns isolated from business logic.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

/**
 * Singleton Firebase application instance.
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase service singletons.
 *
 * These exports should be reused across the application rather than
 * creating service instances ad-hoc.
 */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);