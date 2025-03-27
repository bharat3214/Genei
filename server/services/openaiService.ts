import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface PropertyPrediction {
  bioavailability: number;
  solubility: number;
  bloodBrainBarrier: number;
  toxicityRisk: number;
  molecularWeight?: number;
  logP?: number;
  hDonors?: number;
  hAcceptors?: number;
}

interface DrugCandidate {
  smiles: string;
  name: string;
  aiScore: number;
  targetProtein: string;
  bindingAffinity?: number;
  properties?: PropertyPrediction;
}

export const openaiService = {
  /**
   * Predicts properties of a molecule based on its SMILES string
   */
  async predictMoleculeProperties(smiles: string): Promise<PropertyPrediction> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert chemoinformatician specializing in drug property prediction. 
            Analyze the given SMILES structure and predict key ADMET properties. 
            Provide your estimates for bioavailability, solubility, blood-brain barrier penetration, 
            and toxicity risk. Also provide basic physical properties if possible.
            Respond with JSON in this format: 
            {
              "bioavailability": number (0-1),
              "solubility": number (0-1),
              "bloodBrainBarrier": number (0-1),
              "toxicityRisk": number (0-1),
              "molecularWeight": number,
              "logP": number,
              "hDonors": number,
              "hAcceptors": number
            }`
          },
          {
            role: "user",
            content: `Predict properties for this molecule: ${smiles}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const prediction = JSON.parse(response.choices[0].message.content);
      
      return {
        bioavailability: Math.max(0, Math.min(1, prediction.bioavailability || 0.5)),
        solubility: Math.max(0, Math.min(1, prediction.solubility || 0.5)),
        bloodBrainBarrier: Math.max(0, Math.min(1, prediction.bloodBrainBarrier || 0.5)),
        toxicityRisk: Math.max(0, Math.min(1, prediction.toxicityRisk || 0.5)),
        molecularWeight: prediction.molecularWeight,
        logP: prediction.logP,
        hDonors: prediction.hDonors,
        hAcceptors: prediction.hAcceptors
      };
    } catch (error) {
      console.error("Error predicting molecule properties:", error);
      throw new Error("Failed to predict molecule properties");
    }
  },

  /**
   * Generates drug candidates based on a seed molecule's SMILES string and target protein
   */
  async generateDrugCandidates(
    smiles: string, 
    targetProtein?: string, 
    constraints?: object
  ): Promise<DrugCandidate[]> {
    try {
      const constraintsText = constraints 
        ? `Consider these constraints: ${JSON.stringify(constraints)}` 
        : "";
      
      const targetText = targetProtein 
        ? `The target protein is ${targetProtein}.` 
        : "No specific target protein is specified.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a computational medicinal chemist and AI drug discovery expert.
            Given a seed molecule in SMILES format, generate 3 novel drug candidates that are structurally similar but optimized.
            ${targetText}
            ${constraintsText}
            Make the candidates diverse but maintain drug-likeness.
            For each candidate, provide:
            1. A valid SMILES string
            2. A proposed name (in the format "CMP-[number]")
            3. An AI confidence score (0-1)
            4. The target protein
            5. Estimated binding affinity (1-10 scale)
            
            Respond with JSON in this format:
            {
              "candidates": [
                {
                  "smiles": "SMILES string",
                  "name": "CMP-XX",
                  "aiScore": number (0-1),
                  "targetProtein": "protein name",
                  "bindingAffinity": number (1-10)
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Generate drug candidates based on this molecule: ${smiles}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.candidates || [];
    } catch (error) {
      console.error("Error generating drug candidates:", error);
      throw new Error("Failed to generate drug candidates");
    }
  }
};
