import { getFirestore } from '../config/firebase';
import * as admin from 'firebase-admin';
interface FirestoreDoc {
  id: string;
  [key: string]: any;
}

export const getCollection = async (collectionName: string): Promise<FirestoreDoc[]> => {
  try {
    const firestore = getFirestore();
    
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    const snapshot = await firestore.collection(collectionName).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, docId: string): Promise<FirestoreDoc | null> => {
  try {
    const firestore = getFirestore();
    
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    const doc = await firestore.collection(collectionName).doc(docId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error(`Error fetching document ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const addDocument = async (collectionName: string, data: any): Promise<string> => {
  try {
    const firestore = getFirestore();
    
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    const docRef = await firestore.collection(collectionName).add(data);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any): Promise<void> => {
  try {
    const firestore = getFirestore();
    
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    await firestore.collection(collectionName).doc(docId).update(data);
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  try {
    const firestore = getFirestore();
    
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    await firestore.collection(collectionName).doc(docId).delete();
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const queryCollection = async (
  collectionName: string, 
  field: string, 
  operator: admin.firestore.WhereFilterOp, 
  value: any
): Promise<FirestoreDoc[]> => {
  try {
    const firestore = getFirestore();
    
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    const snapshot = await firestore
      .collection(collectionName)
      .where(field, operator, value)
      .get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    throw error;
  }
};