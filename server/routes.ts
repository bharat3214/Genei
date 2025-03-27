import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertMoleculeSchema, 
  insertDrugCandidateSchema,
  insertActivitySchema,
  insertProjectSchema,
  insertResearchPaperSchema
} from "@shared/schema";
import { moleculeService } from "./services/moleculeService";
import { openaiService } from "./services/openaiService";

export async function registerRoutes(app: Express): Promise<Server> {
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
