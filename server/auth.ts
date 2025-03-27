import { Request, Response, NextFunction } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';
import { log } from './vite';

if (!process.env.CLERK_SECRET_KEY) {
  console.error("Missing CLERK_SECRET_KEY environment variable");
}

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY || '' });

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    getToken: () => Promise<string | null>;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get the session token from the headers
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    try {
      // Verify the session token
      const session = await clerk.sessions.verifySession(sessionToken, "");
      
      // Add the auth details to the request
      req.auth = {
        userId: session.userId,
        sessionId: session.id,
        getToken: async () => sessionToken
      };
      
      next();
    } catch (error) {
      log('Authentication error:', String(error));
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    log('Server auth error:', String(error));
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get the session token from the headers
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      // No token, but that's ok for optional auth
      return next();
    }
    
    // Verify the session token
    clerk.sessions.verifySession(sessionToken, "")
      .then(session => {
        // Add the auth details to the request
        req.auth = {
          userId: session.userId,
          sessionId: session.id,
          getToken: async () => sessionToken
        };
        next();
      })
      .catch(error => {
        // Invalid token, but that's ok for optional auth
        log('Optional auth error (continuing):', String(error));
        next();
      });
  } catch (error) {
    log('Server optional auth error:', String(error));
    next();
  }
}