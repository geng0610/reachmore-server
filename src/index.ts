// src/index.ts
import './datadog'; // Ensure this is at the top of your file
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db';
import { ClerkExpressRequireAuth, StrictAuthProp } from '@clerk/clerk-sdk-node';
import audienceListRoutes from './routes/api/audienceListRoutes';
import audienceQueryRoutes from './routes/api/audienceQueryRoutes';


var StatsD = require('hot-shots');
var dogstatsd = new StatsD();

// Increment a counter.
dogstatsd.increment('page.views')


dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware to parse JSON requests
app.use(morgan('dev')); // Add morgan for request logging

// Extend the Express Request interface globally to include Clerk auth properties
declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

// Apply Clerk auth middleware globally for all subsequent routes
app.use(ClerkExpressRequireAuth());


// API Routes
app.use('/api/audience-lists', audienceListRoutes);
app.use('/api/audience-queries', audienceQueryRoutes);



// Error handling middleware with explicit types
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
