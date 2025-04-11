import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
// In a production environment, these values should come from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase if it hasn't been initialized yet
let firebaseApp: FirebaseApp;
let firestoreDb: Firestore;

function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  firestoreDb = getFirestore(firebaseApp);
  return { firebaseApp, firestoreDb };
}

// Export Firebase instances
export const getFirebaseInstances = () => {
  if (!firebaseApp || !firestoreDb) {
    return initializeFirebase();
  }
  return { firebaseApp, firestoreDb };
};

export const getDb = () => {
  const { firestoreDb } = getFirebaseInstances();
  return firestoreDb;
};

export default getFirebaseInstances;