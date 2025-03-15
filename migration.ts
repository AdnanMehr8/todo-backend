import mongoose from 'mongoose';
import { getFirestore } from './src/config/firebase';
import initializeFirebase from './src/config/firebase';
import config from './src/config/config';

// Initialize Firebase
initializeFirebase();

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

// Function to read data from MongoDB collection
const getMongoData = async (collectionName: string) => {
  try {
    // Check if connection is established and db is available
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    
    // Now TypeScript knows db is defined
    const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
    console.log(`Retrieved ${data.length} documents from MongoDB collection "${collectionName}"`);
    return data;
  } catch (error) {
    console.error(`Error reading from MongoDB collection "${collectionName}":`, error);
    throw error;
  }
};

// Helper function to convert MongoDB document to Firestore-compatible format
const convertToFirestoreFormat = (doc: any): any => {
  // Create a new object to avoid modifying the original
  const firestoreDoc: any = {};
  
  // Process each field
  Object.keys(doc).forEach(key => {
    // Skip _id field as we'll use it for the document ID
    if (key === '_id') return;
    
    const value = doc[key];
    
    // Convert ObjectId to string
    if (value && typeof value === 'object' && value._bsontype === 'ObjectID') {
      firestoreDoc[key] = value.toString();
    }
    // Handle nested ObjectId in arrays
    else if (Array.isArray(value)) {
      firestoreDoc[key] = value.map(item => {
        if (item && typeof item === 'object' && item._bsontype === 'ObjectID') {
          return item.toString();
        }
        return item;
      });
    }
    // Handle Date objects
    else if (value instanceof Date) {
      firestoreDoc[key] = value;
    }
    // Handle nested objects recursively
    else if (value && typeof value === 'object' && value !== null) {
      firestoreDoc[key] = convertToFirestoreFormat(value);
    }
    // Pass through primitive values
    else {
      firestoreDoc[key] = value;
    }
  });
  
  return firestoreDoc;
};

// Function to write data to Firestore
const writeToFirestore = async (collectionName: string, data: any[]) => {
  try {
    const firestore = getFirestore();
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    const batch = firestore.batch();
    let batchCount = 0;
    const batchSize = 500; // Firestore batch limit is 500
    let totalWritten = 0;
    
    console.log(`Starting to write ${data.length} documents to Firestore collection "${collectionName}"...`);
    
    for (let i = 0; i < data.length; i++) {
      const origDoc = data[i];
      const docId = origDoc._id.toString();
      
      // Convert MongoDB document to Firestore format
      const firestoreDoc = convertToFirestoreFormat(origDoc);
      
      // Add timestamps if they don't exist
      firestoreDoc.updatedAt = firestoreDoc.updatedAt || new Date();
      firestoreDoc.createdAt = firestoreDoc.createdAt || new Date();
      
      // Create a document reference with MongoDB's _id
      const docRef = firestore.collection(collectionName).doc(docId);
      
      // Add to batch
      batch.set(docRef, firestoreDoc);
      batchCount++;
      
      // Commit batch if it reaches the limit
      if (batchCount >= batchSize || i === data.length - 1) {
        await batch.commit();
        totalWritten += batchCount;
        console.log(`Batch committed: ${totalWritten}/${data.length} documents written`);
        batchCount = 0;
      }
    }
    
    console.log(`Successfully migrated ${totalWritten} documents to Firestore collection "${collectionName}"`);
    return totalWritten;
  } catch (error) {
    console.error(`Error writing to Firestore collection "${collectionName}":`, error);
    throw error;
  }
};

// Main migration function
const migrateCollection = async (mongoCollection: string, firestoreCollection: string = mongoCollection) => {
  console.log(`Starting migration from MongoDB "${mongoCollection}" to Firestore "${firestoreCollection}"...`);
  
  try {
    const data = await getMongoData(mongoCollection);
    if (data.length > 0) {
      await writeToFirestore(firestoreCollection, data);
      console.log(`Migration of "${mongoCollection}" completed successfully!`);
    } else {
      console.log(`No data found in MongoDB collection "${mongoCollection}". Skipping migration.`);
    }
  } catch (error) {
    console.error(`Migration failed for collection "${mongoCollection}":`, error);
  }
};

// Run the migration
const runMigration = async () => {
  try {
    await connectMongoDB();
    
    // List all collections to migrate
    // You can add all your collection names here
    const collectionsToMigrate = [
      'users',
      'todos',
      'tasks',
      // Add more collections as needed
    ];
    
    // Migrate each collection
    for (const collection of collectionsToMigrate) {
      await migrateCollection(collection);
    }
    
    console.log('All migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
};

// Start the migration
runMigration();