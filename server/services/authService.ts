import { storage } from '../storage';
import { User, InsertUser } from '@shared/schema';
import * as bcrypt from 'bcryptjs';

export const authService = {
  /**
   * Register a new user with hashed password
   */
  async registerUser(userData: Omit<InsertUser, 'password'> & { password: string }): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Default role if not provided
    const role = userData.role || 'researcher';
    
    // Create the user with hashed password
    const newUser = await storage.createUser({
      ...userData,
      password: hashedPassword,
      role
    });
    
    return newUser;
  },
  
  /**
   * Validate user login credentials
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await storage.getUserByUsername(username);
    
    // If user not found or password is invalid
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    
    return user;
  },
  
  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    const user = await storage.getUser(id);
    return user || null;
  }
};