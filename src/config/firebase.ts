import admin from 'firebase-admin';
import config from './config';

let firebaseApp: admin.app.App;

const initializeFirebase = (): void => {
  if (!firebaseApp && config.FIREBASE_PROJECT_ID) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.FIREBASE_PROJECT_ID,
          privateKey: config.FIREBASE_PRIVATE_KEY,
          clientEmail: config.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }
};

export const getFirestore = (): admin.firestore.Firestore | null => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  
  if (!firebaseApp) {
    return null;
  }
  
  return firebaseApp.firestore();
};

export default initializeFirebase;