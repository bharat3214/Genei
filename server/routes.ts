import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertMoleculeSchema, 
  insertDrugCandidateSchema,
  insertActivitySchema,
  insertProjectSchema,
  insertResearchPaperSchema,
  insertUserSchema
} from "@shared/schema";
import { moleculeService } from "./services/moleculeService";
import { openaiService } from "./services/openaiService";
import { authService } from "./services/authService";
import { apiAuth, getCurrentUser } from "./middleware/auth";
import passport from "passport";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes - these need to be defined before the auth middleware
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Invalid user data', errors: parseResult.error.format() });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(parseResult.data.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Register the user
      const user = await authService.registerUser(parseResult.data);
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to login after registration' });
        }
        
        // Return user without password
        const userResponse = { ...user };
        delete userResponse.password;
        
        return res.status(201).json(userResponse);
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  });
  
  app.post('/api/auth/login', (req: Request, res: Response, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Return user without password
        const userResponse = { ...user };
        delete userResponse.password;
        
        return res.json(userResponse);
      });
    })(req, res, next);
  });
  
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/status', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      return res.json(getCurrentUser(req));
    }
    res.status(401).json({ message: 'Not authenticated' });
  });
  
  // Apply authentication middleware to protect other API routes
  // This must come after the auth routes are defined
  app.use('/api', (req, res, next) => {
    // Skip auth middleware for auth routes
    if (req.path.startsWith('/api/auth/')) {
      return next();
    }
    
    // Apply auth middleware for all other API routes
    return apiAuth(req, res, next);
  });
  
  // API routes
  const apiRouter = app.route("/api");
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  // Molecules
  app.get("/api/molecules", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const molecules = await storage.getMolecules(limit, offset);
      res.json(molecules);
    } catch (error) {
      console.error("Error fetching molecules:", error);
      res.status(500).json({ message: "Failed to fetch molecules" });
    }
  });
  
  app.get("/api/molecules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const molecule = await storage.getMolecule(id);
      if (!molecule) {
        return res.status(404).json({ message: "Molecule not found" });
      }
      res.json(molecule);
    } catch (error) {
      console.error("Error fetching molecule:", error);
      res.status(500).json({ message: "Failed to fetch molecule" });
    }
  });
  
  app.post("/api/molecules", async (req, res) => {
    try {
      const parseResult = insertMoleculeSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid molecule data", errors: parseResult.error });
      }
      
      const molecule = await storage.createMolecule(parseResult.data);
      res.status(201).json(molecule);
    } catch (error) {
      console.error("Error creating molecule:", error);
      res.status(500).json({ message: "Failed to create molecule" });
    }
  });
  
  app.post("/api/molecules/search", async (req, res) => {
    try {
      const { query, source } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const result = await moleculeService.searchMolecules(query, source);
      res.json(result);
    } catch (error) {
      console.error("Error searching molecules:", error);
      res.status(500).json({ message: "Failed to search molecules" });
    }
  });
  
  // Drug Candidates
  app.get("/api/drug-candidates", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const candidates = await storage.getDrugCandidates(limit, offset);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching drug candidates:", error);
      res.status(500).json({ message: "Failed to fetch drug candidates" });
    }
  });
  
  app.get("/api/drug-candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const candidate = await storage.getDrugCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Drug candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching drug candidate:", error);
      res.status(500).json({ message: "Failed to fetch drug candidate" });
    }
  });
  
  app.post("/api/drug-candidates", async (req, res) => {
    try {
      const parseResult = insertDrugCandidateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid drug candidate data", errors: parseResult.error });
      }
      
      const candidate = await storage.createDrugCandidate(parseResult.data);
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating drug candidate:", error);
      res.status(500).json({ message: "Failed to create drug candidate" });
    }
  });
  
  app.patch("/api/drug-candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const candidate = await storage.getDrugCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Drug candidate not found" });
      }
      
      const updatedCandidate = await storage.updateDrugCandidate(id, req.body);
      res.json(updatedCandidate);
    } catch (error) {
      console.error("Error updating drug candidate:", error);
      res.status(500).json({ message: "Failed to update drug candidate" });
    }
  });
  
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const projects = await storage.getProjects(limit, offset);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  
  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const activities = await storage.getActivities(limit, offset);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  
  // Research Papers
  app.get("/api/research-papers", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const papers = await storage.getResearchPapers(limit, offset);
      res.json(papers);
    } catch (error) {
      console.error("Error fetching research papers:", error);
      res.status(500).json({ message: "Failed to fetch research papers" });
    }
  });
  
  // AI-powered endpoints
  app.post("/api/ai/generate-candidates", async (req, res) => {
    try {
      const { smiles, target, constraints } = req.body;
      
      if (!smiles) {
        return res.status(400).json({ message: "SMILES structure is required" });
      }
      
      const result = await openaiService.generateDrugCandidates(smiles, target, constraints);
      res.json(result);
    } catch (error) {
      console.error("Error generating drug candidates:", error);
      res.status(500).json({ message: "Failed to generate drug candidates" });
    }
  });
  
  app.post("/api/ai/predict-properties", async (req, res) => {
    try {
      const { smiles } = req.body;
      
      if (!smiles) {
        return res.status(400).json({ message: "SMILES structure is required" });
      }
      
      const result = await openaiService.predictMoleculeProperties(smiles);
      res.json(result);
    } catch (error) {
      console.error("Error predicting properties:", error);
      res.status(500).json({ message: "Failed to predict properties" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
