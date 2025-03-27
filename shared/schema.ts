import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("researcher"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Molecule model
export const molecules = pgTable("molecules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  smiles: text("smiles").notNull().unique(),
  formula: text("formula"),
  molecularWeight: decimal("molecular_weight", { precision: 10, scale: 2 }),
  inchiKey: text("inchi_key"),
  pubchemId: text("pubchem_id"),
  structure: jsonb("structure"),
  properties: jsonb("properties"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertMoleculeSchema = createInsertSchema(molecules).omit({
  id: true,
  createdAt: true,
});

// Drug Candidate model
export const drugCandidates = pgTable("drug_candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  moleculeId: integer("molecule_id").references(() => molecules.id),
  targetProtein: text("target_protein"),
  bindingAffinity: decimal("binding_affinity", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("active"),
  aiScore: decimal("ai_score", { precision: 5, scale: 2 }),
  properties: jsonb("properties"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertDrugCandidateSchema = createInsertSchema(drugCandidates).omit({
  id: true,
  createdAt: true,
});

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

// Activity model
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Research Paper model
export const researchPapers = pgTable("research_papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  abstract: text("abstract"),
  journal: text("journal"),
  year: integer("year"),
  doi: text("doi"),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResearchPaperSchema = createInsertSchema(researchPapers).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Molecule = typeof molecules.$inferSelect;
export type InsertMolecule = z.infer<typeof insertMoleculeSchema>;

export type DrugCandidate = typeof drugCandidates.$inferSelect;
export type InsertDrugCandidate = z.infer<typeof insertDrugCandidateSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ResearchPaper = typeof researchPapers.$inferSelect;
export type InsertResearchPaper = z.infer<typeof insertResearchPaperSchema>;
