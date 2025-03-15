import { Request } from 'express';

export interface User {
  _id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}