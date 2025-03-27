import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import AppShell from "@/components/layout/AppShell";
import MoleculeSearchBar from "@/components/molecule/MoleculeSearchBar";
import MoleculeDisplay from "@/components/molecule/MoleculeDisplay";
import PropertyPredictor from "@/components/dashboard/PropertyPredictor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/api";
import { Molecule } from "@/lib/types";

export default function MoleculeExplorer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSource, setSearchSource] = useState("pubchem");
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null);
  const [isGeneratingProperties, setIsGeneratingProperties] = useState(false);
  
  // Fetch default molecules
  const moleculesQuery = useQuery({
    queryKey: ["/api/molecules"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Search molecules query
  const moleculeSearchQuery = useQuery({
    queryKey: ['/api/molecules/search', searchQuery, searchSource],
    enabled: false,
  });
  
  // Properties prediction query for selected molecule
  const propertiesQuery = useQuery({
    queryKey: ['/api/ai/predict-properties', selectedMolecule?.smiles],
    enabled: false,
  });
  
  const handleSearch = async (query: string, source: string) => {
    setSearchQuery(query);
    setSearchSource(source);
    
    try {
      const result = await queryClient.fetchQuery({
        queryKey: ['/api/molecules/search', query, source],
        queryFn: () => api.searchMolecules(query, source),
      });
      
      if (result.molecules.length === 0) {
        toast({
          title: "No molecules found",
          description: `No molecules matching "${query}" found in ${source}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search for molecules. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSelectMolecule = (molecule: Molecule) => {
    setSelectedMolecule(molecule);
    setIsGeneratingProperties(false);
  };
  
  const handlePredictProperties = async () => {
    if (!selectedMolecule?.smiles) return;
    
    setIsGeneratingProperties(true);
    
    try {
      await queryClient.fetchQuery({
        queryKey: ['/api/ai/predict-properties', selectedMolecule.smiles],
        queryFn: () => api.predictMoleculeProperties(selectedMolecule.smiles),
      });
    } catch (error) {
      toast({
        title: "Property prediction failed",
        description: "Failed to predict properties for this molecule.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingProperties(false);
    }
  };
  
  const displayedMolecules = moleculeSearchQuery.data?.molecules || moleculesQuery.data || [];
  const isLoading = moleculesQuery.isLoading || moleculeSearchQuery.isFetching;
  
  return (
    <AppShell>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Molecule Explorer</h1>
          <p className="mt-1 text-sm text-gray-600">Search and explore chemical structures</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <MoleculeSearchBar 
            onSearch={handleSearch} 
            isLoading={moleculeSearchQuery.isFetching}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Molecules List */}
          <div className="lg:col-span-2">
            <Card className="shadow">
              <CardHeader>
                <CardTitle>
                  {moleculeSearchQuery.data 
                    ? `Search Results (${moleculeSearchQuery.data.totalCount})` 
                    : "Molecule Database"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-md" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : displayedMolecules.length > 0 ? (
                  <div className="space-y-4">
                    {displayedMolecules.map((molecule: Molecule, index: number) => (
                      <Card 
                        key={molecule.id || index} 
                        className={`p-4 cursor-pointer hover:border-primary-300 transition-colors ${selectedMolecule?.id === molecule.id ? 'border-primary-500' : ''}`}
                        onClick={() => handleSelectMolecule(molecule)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-md">
                            <span className="material-icons text-gray-600">hub</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{molecule.name}</div>
                            <div className="text-xs text-gray-500 font-mono">
                              {molecule.formula || (molecule.smiles || "").substring(0, 20) + (molecule.smiles && molecule.smiles.length > 20 ? "..." : "")}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No molecules found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Molecule Details & Properties */}
          <div className="space-y-6">
            <MoleculeDisplay 
              molecule={selectedMolecule || undefined} 
              isLoading={isLoading} 
            />
            
            {selectedMolecule && (
              <Card className="shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Properties</span>
                    {!propertiesQuery.data && (
                      <Button 
                        size="sm" 
                        onClick={handlePredictProperties} 
                        disabled={isGeneratingProperties}
                      >
                        <span className="material-icons mr-1 text-sm">analytics</span>
                        Predict
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {propertiesQuery.data ? (
                    <PropertyPredictor
                      properties={propertiesQuery.data}
                      isLoading={false}
                    />
                  ) : isGeneratingProperties ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                      <p className="mt-2 text-sm text-gray-500">Predicting properties...</p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Click the "Predict" button to analyze this molecule
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
