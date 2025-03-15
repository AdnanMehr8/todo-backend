import { Request, Response, NextFunction } from 'express';
import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  queryCollection
} from '../services/firestore';

// @desc    Get all documents from a collection
// @route   GET /api/firestore/:collection
// @access  Private
export const getFirestoreCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection } = req.params;
    
    if (!collection) {
      res.status(400).json({
        success: false,
        message: 'Please provide a collection name'
      });
      return;
    }
    
    const documents = await getCollection(collection);
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a document from a collection
// @route   GET /api/firestore/:collection/:id
// @access  Private
export const getFirestoreDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection, id } = req.params;
    
    if (!collection || !id) {
      res.status(400).json({
        success: false,
        message: 'Please provide collection name and document ID'
      });
      return;
    }
    
    const document = await getDocument(collection, id);
    
    if (!document) {
      res.status(404).json({
        success: false,
        message: `Document not found in collection ${collection} with ID ${id}`
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a document to a collection
// @route   POST /api/firestore/:collection
// @access  Private
export const addFirestoreDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection } = req.params;
    const data = req.body;
    
    if (!collection) {
      res.status(400).json({
        success: false,
        message: 'Please provide a collection name'
      });
      return;
    }
    
    if (!data || Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide data to add'
      });
      return;
    }
    
    // Add user ID to the document if authenticated
    if (req.user) {
      data.userId = req.user._id.toString();
    }
    
    const docId = await addDocument(collection, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      docId,
      message: `Document added to collection ${collection}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a document in a collection
// @route   PUT /api/firestore/:collection/:id
// @access  Private
export const updateFirestoreDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection, id } = req.params;
    const data = req.body;
    
    if (!collection || !id) {
      res.status(400).json({
        success: false,
        message: 'Please provide collection name and document ID'
      });
      return;
    }
    
    if (!data || Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide data to update'
      });
      return;
    }
    
    // Check if document exists
    const document = await getDocument(collection, id);
    
    if (!document) {
      res.status(404).json({
        success: false,
        message: `Document not found in collection ${collection} with ID ${id}`
      });
      return;
    }
    
    // Check if user owns the document (if userId is stored)
    if (req.user && document.userId && document.userId !== req.user._id.toString()) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to update this document'
      });
      return;
    }
    
    await updateDocument(collection, id, {
      ...data,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: `Document updated in collection ${collection}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document from a collection
// @route   DELETE /api/firestore/:collection/:id
// @access  Private
export const deleteFirestoreDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection, id } = req.params;
    
    if (!collection || !id) {
      res.status(400).json({
        success: false,
        message: 'Please provide collection name and document ID'
      });
      return;
    }
    
    // Check if document exists
    const document = await getDocument(collection, id);
    
    if (!document) {
      res.status(404).json({
        success: false,
        message: `Document not found in collection ${collection} with ID ${id}`
      });
      return;
    }
    
    // Check if user owns the document (if userId is stored)
    if (req.user && document.userId && document.userId !== req.user._id.toString()) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
      return;
    }
    
    await deleteDocument(collection, id);
    
    res.status(200).json({
      success: true,
      message: `Document deleted from collection ${collection}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Query documents from a collection
// @route   POST /api/firestore/:collection/query
// @access  Private
export const queryFirestoreCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection } = req.params;
    const { field, operator, value } = req.body;
    
    if (!collection) {
      res.status(400).json({
        success: false,
        message: 'Please provide a collection name'
      });
      return;
    }
    
    if (!field || !operator) {
      res.status(400).json({
        success: false,
        message: 'Please provide field and operator for query'
      });
      return;
    }
    
    const documents = await queryCollection(collection, field, operator, value);
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user-specific documents from a collection
// @route   GET /api/firestore/:collection/user
// @access  Private
export const getUserFirestoreDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { collection } = req.params;
    
    if (!collection) {
      res.status(400).json({
        success: false,
        message: 'Please provide a collection name'
      });
      return;
    }
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }
    
    const documents = await queryCollection(collection, 'userId', '==', req.user._id.toString());
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};