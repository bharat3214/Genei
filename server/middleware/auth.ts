import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized - Login required' });
};

// Middleware to handle API access - allows some endpoints without authentication
export const apiAuth = (req: Request, res: Response, next: NextFunction) => {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/status'
  ];

  // If requesting a public route or already authenticated, proceed
  if (publicRoutes.includes(req.path) || req.isAuthenticated()) {
    return next();
  }

  // Otherwise, return unauthorized
  res.status(401).json({ message: 'Unauthorized - Login required' });
};

// Get current user data to send to client
export const getCurrentUser = (req: Request) => {
  if (!req.user) return null;
  
  // Don't send password or sensitive fields to client
  const user = { ...req.user } as any;
  delete user.password;
  
  return user;
};