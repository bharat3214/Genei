export interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface Molecule {
  id: number;
  name: string;
  smiles: string;
  formula?: string;
  molecularWeight?: number;
  inchiKey?: string;
  pubchemId?: string;
  structure?: any;
  properties?: MoleculeProperties;
  createdAt?: Date;
  userId?: number;
}

export interface MoleculeProperties {
  logP?: number;
  hDonors?: number;
  hAcceptors?: number;
  bioavailability?: number;
  solubility?: number;
  bloodBrainBarrier?: number;
  toxicityRisk?: number;
  [key: string]: any;
}

export interface DrugCandidate {
  id: number;
  name: string;
  moleculeId?: number;
  targetProtein?: string;
  bindingAffinity?: number;
  status: 'active' | 'testing' | 'review' | 'rejected' | 'approved';
  aiScore?: number;
  properties?: any;
  createdAt?: Date;
  userId?: number;
  molecule?: Molecule;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold';
  createdAt?: Date;
  userId?: number;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  metadata?: any;
  createdAt?: Date;
  userId?: number;
}

export interface ResearchPaper {
  id: number;
  title: string;
  authors: string;
  abstract?: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  createdAt?: Date;
}

export interface DashboardStats {
  moleculeCount: number;
  drugCandidateCount: number;
  projectCount: number;
  researchPaperCount: number;
}

export interface PropertyPrediction {
  bioavailability: number;
  solubility: number;
  bloodBrainBarrier: number;
  toxicityRisk: number;
  molecularWeight?: number;
  logP?: number;
  hDonors?: number;
  hAcceptors?: number;
}

export interface AIGeneratedCandidate {
  smiles: string;
  name: string;
  aiScore: number;
  targetProtein: string;
  bindingAffinity?: number;
}
