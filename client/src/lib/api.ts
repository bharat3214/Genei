import { apiRequest } from "./queryClient";
import { 
  Molecule, 
  DrugCandidate, 
  DashboardStats, 
  PropertyPrediction,
  AIGeneratedCandidate
} from "./types";

export const api = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiRequest("GET", "/api/dashboard/stats");
    return res.json();
  },

  // Molecules
  getMolecules: async (limit = 10, offset = 0): Promise<Molecule[]> => {
    const res = await apiRequest("GET", `/api/molecules?limit=${limit}&offset=${offset}`);
    return res.json();
  },
  
  getMolecule: async (id: number): Promise<Molecule> => {
    const res = await apiRequest("GET", `/api/molecules/${id}`);
    return res.json();
  },
  
  createMolecule: async (molecule: Partial<Molecule>): Promise<Molecule> => {
    const res = await apiRequest("POST", "/api/molecules", molecule);
    return res.json();
  },
  
  searchMolecules: async (query: string, source?: string): Promise<{ molecules: Molecule[], totalCount: number }> => {
    const res = await apiRequest("POST", "/api/molecules/search", { query, source });
    return res.json();
  },
  
  // Drug Candidates
  getDrugCandidates: async (limit = 10, offset = 0): Promise<DrugCandidate[]> => {
    const res = await apiRequest("GET", `/api/drug-candidates?limit=${limit}&offset=${offset}`);
    return res.json();
  },
  
  getDrugCandidate: async (id: number): Promise<DrugCandidate> => {
    const res = await apiRequest("GET", `/api/drug-candidates/${id}`);
    return res.json();
  },
  
  createDrugCandidate: async (candidate: Partial<DrugCandidate>): Promise<DrugCandidate> => {
    const res = await apiRequest("POST", "/api/drug-candidates", candidate);
    return res.json();
  },
  
  updateDrugCandidate: async (id: number, updates: Partial<DrugCandidate>): Promise<DrugCandidate> => {
    const res = await apiRequest("PATCH", `/api/drug-candidates/${id}`, updates);
    return res.json();
  },
  
  // Projects
  getProjects: async (limit = 10, offset = 0): Promise<any[]> => {
    const res = await apiRequest("GET", `/api/projects?limit=${limit}&offset=${offset}`);
    return res.json();
  },
  
  // Activities
  getActivities: async (limit = 10, offset = 0): Promise<any[]> => {
    const res = await apiRequest("GET", `/api/activities?limit=${limit}&offset=${offset}`);
    return res.json();
  },
  
  // Research Papers
  getResearchPapers: async (limit = 10, offset = 0): Promise<any[]> => {
    const res = await apiRequest("GET", `/api/research-papers?limit=${limit}&offset=${offset}`);
    return res.json();
  },
  
  // AI functionality
  predictMoleculeProperties: async (smiles: string): Promise<PropertyPrediction> => {
    const res = await apiRequest("POST", "/api/ai/predict-properties", { smiles });
    return res.json();
  },
  
  generateDrugCandidates: async (
    smiles: string, 
    targetProtein?: string, 
    constraints?: object
  ): Promise<AIGeneratedCandidate[]> => {
    const res = await apiRequest("POST", "/api/ai/generate-candidates", {
      smiles,
      target: targetProtein,
      constraints
    });
    return res.json();
  }
};
