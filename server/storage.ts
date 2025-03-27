import { 
  users, type User, type InsertUser,
  molecules, type Molecule, type InsertMolecule,
  drugCandidates, type DrugCandidate, type InsertDrugCandidate,
  projects, type Project, type InsertProject,
  activities, type Activity, type InsertActivity,
  researchPapers, type ResearchPaper, type InsertResearchPaper
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Molecules
  getMolecule(id: number): Promise<Molecule | undefined>;
  getMoleculeBySmiles(smiles: string): Promise<Molecule | undefined>;
  getMolecules(limit?: number, offset?: number): Promise<Molecule[]>;
  createMolecule(molecule: InsertMolecule): Promise<Molecule>;
  
  // Drug Candidates
  getDrugCandidate(id: number): Promise<DrugCandidate | undefined>;
  getDrugCandidates(limit?: number, offset?: number): Promise<DrugCandidate[]>;
  createDrugCandidate(candidate: InsertDrugCandidate): Promise<DrugCandidate>;
  updateDrugCandidate(id: number, candidate: Partial<InsertDrugCandidate>): Promise<DrugCandidate | undefined>;
  
  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjects(limit?: number, offset?: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(limit?: number, offset?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Research Papers
  getResearchPaper(id: number): Promise<ResearchPaper | undefined>;
  getResearchPapers(limit?: number, offset?: number): Promise<ResearchPaper[]>;
  createResearchPaper(paper: InsertResearchPaper): Promise<ResearchPaper>;
  
  // Dashboard data
  getDashboardStats(): Promise<{
    moleculeCount: number;
    drugCandidateCount: number;
    projectCount: number;
    researchPaperCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private molecules: Map<number, Molecule>;
  private drugCandidates: Map<number, DrugCandidate>;
  private projects: Map<number, Project>;
  private activities: Map<number, Activity>;
  private researchPapers: Map<number, ResearchPaper>;
  
  private userIdCounter: number;
  private moleculeIdCounter: number;
  private drugCandidateIdCounter: number;
  private projectIdCounter: number;
  private activityIdCounter: number;
  private researchPaperIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.molecules = new Map();
    this.drugCandidates = new Map();
    this.projects = new Map();
    this.activities = new Map();
    this.researchPapers = new Map();
    
    this.userIdCounter = 1;
    this.moleculeIdCounter = 1;
    this.drugCandidateIdCounter = 1;
    this.projectIdCounter = 1;
    this.activityIdCounter = 1;
    this.researchPaperIdCounter = 1;
    
    // Add some initial data
    this.seedInitialData();
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Molecules
  async getMolecule(id: number): Promise<Molecule | undefined> {
    return this.molecules.get(id);
  }
  
  async getMoleculeBySmiles(smiles: string): Promise<Molecule | undefined> {
    return Array.from(this.molecules.values()).find(
      (molecule) => molecule.smiles === smiles,
    );
  }
  
  async getMolecules(limit = 10, offset = 0): Promise<Molecule[]> {
    return Array.from(this.molecules.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
  }
  
  async createMolecule(insertMolecule: InsertMolecule): Promise<Molecule> {
    const id = this.moleculeIdCounter++;
    const now = new Date();
    const molecule: Molecule = {
      ...insertMolecule,
      id,
      createdAt: now
    };
    this.molecules.set(id, molecule);
    
    // Create activity for new molecule
    if (insertMolecule.userId) {
      await this.createActivity({
        type: "molecule_created",
        description: `New molecule "${molecule.name}" added to the database`,
        relatedEntityId: id,
        relatedEntityType: "molecule",
        userId: insertMolecule.userId,
        metadata: {}
      });
    }
    
    return molecule;
  }
  
  // Drug Candidates
  async getDrugCandidate(id: number): Promise<DrugCandidate | undefined> {
    return this.drugCandidates.get(id);
  }
  
  async getDrugCandidates(limit = 10, offset = 0): Promise<DrugCandidate[]> {
    return Array.from(this.drugCandidates.values())
      .sort((a, b) => Number(b.aiScore || 0) - Number(a.aiScore || 0))
      .slice(offset, offset + limit);
  }
  
  async createDrugCandidate(insertCandidate: InsertDrugCandidate): Promise<DrugCandidate> {
    const id = this.drugCandidateIdCounter++;
    const now = new Date();
    const candidate: DrugCandidate = {
      ...insertCandidate,
      id,
      createdAt: now
    };
    this.drugCandidates.set(id, candidate);
    
    // Create activity for new drug candidate
    if (insertCandidate.userId) {
      await this.createActivity({
        type: "drug_candidate_created",
        description: `New drug candidate "${candidate.name}" generated`,
        relatedEntityId: id,
        relatedEntityType: "drug_candidate",
        userId: insertCandidate.userId,
        metadata: { aiScore: candidate.aiScore }
      });
    }
    
    return candidate;
  }
  
  async updateDrugCandidate(id: number, candidateUpdate: Partial<InsertDrugCandidate>): Promise<DrugCandidate | undefined> {
    const existingCandidate = this.drugCandidates.get(id);
    if (!existingCandidate) return undefined;
    
    const updatedCandidate: DrugCandidate = {
      ...existingCandidate,
      ...candidateUpdate
    };
    this.drugCandidates.set(id, updatedCandidate);
    
    // Create activity for updated drug candidate
    if (candidateUpdate.userId) {
      await this.createActivity({
        type: "drug_candidate_updated",
        description: `Drug candidate "${updatedCandidate.name}" updated`,
        relatedEntityId: id,
        relatedEntityType: "drug_candidate",
        userId: candidateUpdate.userId,
        metadata: {}
      });
    }
    
    return updatedCandidate;
  }
  
  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjects(limit = 10, offset = 0): Promise<Project[]> {
    return Array.from(this.projects.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: now
    };
    this.projects.set(id, project);
    
    // Create activity for new project
    if (insertProject.userId) {
      await this.createActivity({
        type: "project_created",
        description: `New project "${project.name}" created`,
        relatedEntityId: id,
        relatedEntityType: "project",
        userId: insertProject.userId,
        metadata: {}
      });
    }
    
    return project;
  }
  
  // Activities
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivities(limit = 10, offset = 0): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Research Papers
  async getResearchPaper(id: number): Promise<ResearchPaper | undefined> {
    return this.researchPapers.get(id);
  }
  
  async getResearchPapers(limit = 10, offset = 0): Promise<ResearchPaper[]> {
    return Array.from(this.researchPapers.values())
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(offset, offset + limit);
  }
  
  async createResearchPaper(insertPaper: InsertResearchPaper): Promise<ResearchPaper> {
    const id = this.researchPaperIdCounter++;
    const now = new Date();
    const paper: ResearchPaper = {
      ...insertPaper,
      id,
      createdAt: now
    };
    this.researchPapers.set(id, paper);
    return paper;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    moleculeCount: number;
    drugCandidateCount: number;
    projectCount: number;
    researchPaperCount: number;
  }> {
    return {
      moleculeCount: this.molecules.size,
      drugCandidateCount: this.drugCandidates.size,
      projectCount: this.projects.size,
      researchPaperCount: this.researchPapers.size
    };
  }
  
  // Seed initial data
  private seedInitialData() {
    // Create a test user
    const user: InsertUser = {
      username: "johndoe",
      password: "password123", // In a real app, this would be hashed
      fullName: "John Doe",
      role: "Research Scientist"
    };
    const createdUser = this.createUser(user);
    
    // Create some molecules
    const aspirinMolecule: InsertMolecule = {
      name: "Aspirin",
      smiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
      formula: "C9H8O4",
      molecularWeight: 180.16,
      inchiKey: "BSYNRYMUTXBXSQ-UHFFFAOYSA-N",
      pubchemId: "2244",
      structure: {},
      properties: {
        logP: 1.24,
        hDonors: 1,
        hAcceptors: 4,
        bioavailability: 0.85,
        solubility: 0.62,
        bloodBrainBarrier: 0.27,
        toxicityRisk: 0.15
      },
      userId: 1
    };
    this.createMolecule(aspirinMolecule);
    
    // Create more molecules
    const molecules = [
      {
        name: "CMP-42X",
        smiles: "CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F",
        formula: "C22H28N4O2",
        molecularWeight: 380.48,
        structure: {},
        properties: {
          logP: 3.45,
          hDonors: 2,
          hAcceptors: 6,
          bioavailability: 0.92,
          solubility: 0.78,
          bloodBrainBarrier: 0.45,
          toxicityRisk: 0.22
        },
        userId: 1
      },
      {
        name: "CMP-18A",
        smiles: "CC1=CC=C(C=C1)C(=O)NC2=CC=C(C=C2)S(=O)(=O)NC3=NC=CS3",
        formula: "C18H22N2O3",
        molecularWeight: 314.39,
        structure: {},
        properties: {
          logP: 2.87,
          hDonors: 3,
          hAcceptors: 7,
          bioavailability: 0.76,
          solubility: 0.65,
          bloodBrainBarrier: 0.35,
          toxicityRisk: 0.31
        },
        userId: 1
      },
      {
        name: "CMP-73B",
        smiles: "C1=CC=C(C=C1)C2=CSC(=N2)NC3=CC=NC=C3",
        formula: "C16H20N6O1",
        molecularWeight: 328.37,
        structure: {},
        properties: {
          logP: 2.21,
          hDonors: 2,
          hAcceptors: 8,
          bioavailability: 0.81,
          solubility: 0.59,
          bloodBrainBarrier: 0.39,
          toxicityRisk: 0.25
        },
        userId: 1
      }
    ];
    
    molecules.forEach(mol => {
      this.createMolecule(mol as InsertMolecule);
    });
    
    // Create drug candidates
    const drugCandidates = [
      {
        name: "CMP-42X",
        moleculeId: 2,
        targetProtein: "EGFR",
        bindingAffinity: 8.7,
        status: "active",
        aiScore: 0.92,
        properties: {
          admet: {
            absorption: 0.85,
            distribution: 0.76,
            metabolism: 0.65,
            excretion: 0.72,
            toxicity: 0.22
          }
        },
        userId: 1
      },
      {
        name: "CMP-18A",
        moleculeId: 3,
        targetProtein: "PI3K",
        bindingAffinity: 7.9,
        status: "testing",
        aiScore: 0.87,
        properties: {
          admet: {
            absorption: 0.72,
            distribution: 0.68,
            metabolism: 0.59,
            excretion: 0.63,
            toxicity: 0.31
          }
        },
        userId: 1
      },
      {
        name: "CMP-73B",
        moleculeId: 4,
        targetProtein: "JAK2",
        bindingAffinity: 7.2,
        status: "review",
        aiScore: 0.81,
        properties: {
          admet: {
            absorption: 0.68,
            distribution: 0.64,
            metabolism: 0.55,
            excretion: 0.61,
            toxicity: 0.25
          }
        },
        userId: 1
      }
    ];
    
    drugCandidates.forEach(candidate => {
      this.createDrugCandidate(candidate as InsertDrugCandidate);
    });
    
    // Create projects
    const projects = [
      {
        name: "Project Artemis",
        description: "Targeting EGFR mutations in lung cancer",
        status: "active",
        userId: 1
      },
      {
        name: "Project Helios",
        description: "Novel JAK inhibitors for autoimmune diseases",
        status: "active",
        userId: 1
      },
      {
        name: "Project Athena",
        description: "Blood-brain barrier penetrating compounds",
        status: "active",
        userId: 1
      }
    ];
    
    projects.forEach(project => {
      this.createProject(project as InsertProject);
    });
    
    // Create research papers
    const papers = [
      {
        title: "Novel EGFR inhibitors with improved selectivity",
        authors: "Zhang, J., Smith, A., Johnson, B.",
        abstract: "This study presents a series of novel compounds targeting EGFR with improved selectivity profiles...",
        journal: "Journal of Medicinal Chemistry",
        year: 2023,
        doi: "10.1021/jm.2023.12345",
        url: "https://doi.org/10.1021/jm.2023.12345"
      },
      {
        title: "Structure-based design of PI3K inhibitors",
        authors: "Brown, L., Davis, M., Wilson, E.",
        abstract: "Using structure-based drug design approaches, we developed a series of potent PI3K inhibitors...",
        journal: "ACS Chemical Biology",
        year: 2022,
        doi: "10.1021/cb.2022.67890",
        url: "https://doi.org/10.1021/cb.2022.67890"
      },
      {
        title: "AI-guided optimization of kinase inhibitors",
        authors: "Lee, K., Wang, S., Garcia, R.",
        abstract: "Implementation of machine learning approaches for the optimization of kinase inhibitors resulted in compounds with improved properties...",
        journal: "Journal of Chemical Information and Modeling",
        year: 2023,
        doi: "10.1021/ci.2023.54321",
        url: "https://doi.org/10.1021/ci.2023.54321"
      }
    ];
    
    papers.forEach(paper => {
      this.createResearchPaper(paper as InsertResearchPaper);
    });
    
    // Create activities
    const activities = [
      {
        type: "drug_candidate_created",
        description: "New candidate generated",
        relatedEntityId: 1,
        relatedEntityType: "drug_candidate",
        metadata: { aiScore: 0.92 },
        userId: 1
      },
      {
        type: "property_analysis",
        description: "Property analysis completed",
        relatedEntityId: 2,
        relatedEntityType: "drug_candidate",
        metadata: { result: "favorable" },
        userId: 1
      },
      {
        type: "literature_update",
        description: "Literature update",
        metadata: { count: 12 },
        userId: 1
      }
    ];
    
    activities.forEach(activity => {
      this.createActivity(activity as InsertActivity);
    });
  }
}

export const storage = new MemStorage();
