// API integrations with external molecule databases like PubChem or ChEMBL

interface MoleculeSearchResult {
  molecules: any[];
  totalCount: number;
}

export const moleculeService = {
  /**
   * Search for molecules using external APIs
   */
  async searchMolecules(query: string, source = "pubchem"): Promise<MoleculeSearchResult> {
    try {
      if (source === "pubchem") {
        return await searchPubChem(query);
      } else if (source === "chembl") {
        return await searchChEMBL(query);
      } else {
        throw new Error(`Unsupported source: ${source}`);
      }
    } catch (error) {
      console.error(`Error searching ${source}:`, error);
      throw new Error(`Failed to search ${source}`);
    }
  }
};

/**
 * Search PubChem for molecules
 */
async function searchPubChem(query: string): Promise<MoleculeSearchResult> {
  try {
    // Search PubChem
    const response = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
        query
      )}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,InChIKey/JSON`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { molecules: [], totalCount: 0 };
      }
      throw new Error(`PubChem API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.PropertyTable || !data.PropertyTable.Properties) {
      return { molecules: [], totalCount: 0 };
    }

    const molecules = data.PropertyTable.Properties.map((prop: any) => ({
      name: query, // PubChem doesn't return names directly in this endpoint
      pubchemId: prop.CID.toString(),
      formula: prop.MolecularFormula,
      molecularWeight: prop.MolecularWeight,
      smiles: prop.CanonicalSMILES,
      inchiKey: prop.InChIKey,
      source: "pubchem"
    }));

    return {
      molecules,
      totalCount: molecules.length
    };
  } catch (error) {
    console.error("Error searching PubChem:", error);
    throw new Error("Failed to search PubChem");
  }
}

/**
 * Search ChEMBL for molecules
 */
async function searchChEMBL(query: string): Promise<MoleculeSearchResult> {
  try {
    // Search ChEMBL
    const response = await fetch(
      `https://www.ebi.ac.uk/chembl/api/data/molecule.json?molecule_structures__canonical_smiles__flexmatch=${encodeURIComponent(
        query
      )}&limit=10`
    );

    if (!response.ok) {
      throw new Error(`ChEMBL API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const molecules = data.molecules.map((mol: any) => ({
      name: mol.pref_name || "Unknown",
      chemblId: mol.molecule_chembl_id,
      formula: mol.molecule_properties?.full_molformula,
      molecularWeight: mol.molecule_properties?.full_mwt,
      smiles: mol.molecule_structures?.canonical_smiles,
      source: "chembl"
    }));

    return {
      molecules,
      totalCount: data.page_meta.total_count
    };
  } catch (error) {
    console.error("Error searching ChEMBL:", error);
    throw new Error("Failed to search ChEMBL");
  }
}
