import express from 'express';
import { 
  getFirestoreCollection,
  getFirestoreDocument,
  addFirestoreDocument,
  updateFirestoreDocument,
  deleteFirestoreDocument,
  queryFirestoreCollection,
  getUserFirestoreDocuments
} from '../controllers/firestore';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// User specific documents
router.get('/:collection/user', getUserFirestoreDocuments);

// Query documents
router.post('/:collection/query', queryFirestoreCollection);

// Collection level routes
router.route('/:collection')
  .get(getFirestoreCollection)
  .post(addFirestoreDocument);

// Document level routes
router.route('/:collection/:id')
  .get(getFirestoreDocument)
  .put(updateFirestoreDocument)
  .delete(deleteFirestoreDocument);

export default router;