import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import config from './config/config';
import connectDB from './db/connection';
import initializeFirebase from './config/firebase';
import { errorHandler } from './middleware/error';
import './types/types';


import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import firestoreRoutes from './routes/firestore';


const app: Express = express();


connectDB();

initializeFirebase();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/firestore', firestoreRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Not found - ${req.originalUrl}`
  });
});

// Start the server
const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app;