import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import AppShell from "@/components/layout/AppShell";
import MoleculeViewer from "@/components/dashboard/MoleculeViewer";
import MoleculeDisplay from "@/components/molecule/MoleculeDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { api } from "@/lib/api";
import { DrugCandidate, Molecule } from "@/lib/types";

export default function DrugCandidates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCandidate, setSelectedCandidate] = useState<DrugCandidate | null>(null);
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSeed, setGenerationSeed] = useState<string | null>(null);
  const [targetProtein, setTargetProtein] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  
  // Fetch drug candidates
  const candidatesQuery = useQuery({
    queryKey: ["/api/drug-candidates"],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch molecules for generation seed selection
  const moleculesQuery = useQuery({
    queryKey: ["/api/molecules"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch candidate details if selected
  const candidateDetailsQuery = useQuery({
    queryKey: ["/api/drug-candidates", selectedCandidate?.id],
    enabled: !!selectedCandidate?.id,
    queryFn: () => api.getDrugCandidate(selectedCandidate!.id),
  });
  
  // AI generation mutation
  const generateMutation = useMutation({
    mutationFn: ({ smiles, target }: { smiles: string; target?: string }) => 
      api.generateDrugCandidates(smiles, target),
    onSuccess: (data) => {
      setOpenDialog(false);
      setIsGenerating(false);
      toast({
        title: "Candidates Generated",
        description: `Successfully generated ${data.length} new drug candidates.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drug-candidates"] });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate drug candidates. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      api.updateDrugCandidate(id, { status }),
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Drug candidate status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drug-candidates"] });
      if (selectedCandidate) {
        queryClient.invalidateQueries({ queryKey: ["/api/drug-candidates", selectedCandidate.id] });
      }
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update drug candidate status.",
        variant: "destructive",
      });
    }
  });
  
  // Handle candidate selection
  const handleSelectCandidate = (candidate: DrugCandidate) => {
    setSelectedCandidate(candidate);
  };
  
  // Handle molecule selection for generation
  const handleSelectMolecule = (id: string) => {
    const molecule = moleculesQuery.data?.find(m => m.id === parseInt(id));
    if (molecule) {
      setSelectedMolecule(molecule);
      setGenerationSeed(molecule.smiles);
    }
  };
  
  // Handle generate candidates
  const handleGenerateCandidates = () => {
    if (!generationSeed) {
      toast({
        title: "Seed Required",
        description: "Please select a seed molecule to generate candidates.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    generateMutation.mutate({ 
      smiles: generationSeed,
      target: targetProtein || undefined
    });
  };
  
  // Handle status update
  const handleStatusUpdate = (status: string) => {
    if (selectedCandidate) {
      updateStatusMutation.mutate({ id: selectedCandidate.id, status });
    }
  };
  
  // Get color for status badge
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "testing":
        return "bg-yellow-100 text-yellow-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppShell>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Drug Candidates</h1>
            <p className="mt-1 text-sm text-gray-600">Manage and analyze AI-generated drug candidates</p>
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <span className="material-icons mr-1">add</span>
                Generate New Candidates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Drug Candidates</DialogTitle>
                <DialogDescription>
                  Generate new drug candidates using AI by selecting a seed molecule and target protein.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="seed-molecule" className="text-right">
                    Seed Molecule
                  </Label>
                  <Select onValueChange={handleSelectMolecule} value={selectedMolecule?.id?.toString()}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a molecule" />
                    </SelectTrigger>
                    <SelectContent>
                      {(moleculesQuery.data || []).map((molecule) => (
                        <SelectItem key={molecule.id} value={molecule.id.toString()}>
                          {molecule.name} ({molecule.formula || 'Unknown'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target-protein" className="text-right">
                    Target Protein
                  </Label>
                  <Input
                    id="target-protein"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                    placeholder="e.g., EGFR, JAK2, PI3K"
                    className="col-span-3"
                  />
                </div>
                
                {selectedMolecule && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1"></div>
                    <div className="col-span-3 border rounded-md p-2 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">Selected Molecule Structure:</p>
                      <div className="h-32 flex justify-center items-center">
                        <MoleculeViewer 
                          smiles={selectedMolecule.smiles} 
                          name={selectedMolecule.name}
                          formula={selectedMolecule.formula}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateCandidates}
                  disabled={!selectedMolecule || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin mr-2">●</span>
                      Generating...
                    </>
                  ) : (
                    <>Generate Candidates</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates List */}
          <div>
            <Card className="shadow">
              <CardHeader>
                <CardTitle>Drug Candidates</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {candidatesQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center p-3 border rounded-md">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3 space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : candidatesQuery.data && candidatesQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {candidatesQuery.data.map((candidate) => (
                      <div 
                        key={candidate.id}
                        className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                          selectedCandidate?.id === candidate.id ? 'border-primary-500 bg-primary-50' : ''
                        }`}
                        onClick={() => handleSelectCandidate(candidate)}
                      >
                        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full">
                          <span className="material-icons text-gray-600">science</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium">{candidate.name}</div>
                          <div className="text-xs text-gray-500">{candidate.targetProtein || 'Unknown target'}</div>
                        </div>
                        <Badge className={getStatusBadgeColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No drug candidates available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Candidate Details */}
          <div className="lg:col-span-2">
            {selectedCandidate ? (
              <div className="space-y-6">
                <Card className="shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedCandidate.name}</CardTitle>
                      <Badge className={getStatusBadgeColor(selectedCandidate.status)}>
                        {selectedCandidate.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {candidateDetailsQuery.isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-40 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    ) : candidateDetailsQuery.data ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Molecule Visualization */}
                          <div className="border rounded-lg p-4 bg-gray-50">
                            {candidateDetailsQuery.data.molecule ? (
                              <MoleculeViewer 
                                smiles={candidateDetailsQuery.data.molecule.smiles}
                                name={candidateDetailsQuery.data.name}
                                formula={candidateDetailsQuery.data.molecule.formula}
                              />
                            ) : (
                              <div className="h-40 flex items-center justify-center text-gray-500">
                                No molecular structure available
                              </div>
                            )}
                          </div>
                          
                          {/* Key Properties */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">Target Information</h3>
                              <div className="grid grid-cols-2 gap-y-2">
                                <div className="text-sm font-medium">Target Protein:</div>
                                <div className="text-sm">{candidateDetailsQuery.data.targetProtein || 'Unknown'}</div>
                                
                                <div className="text-sm font-medium">Binding Affinity:</div>
                                <div className="text-sm">{candidateDetailsQuery.data.bindingAffinity || 'N/A'}</div>
                                
                                <div className="text-sm font-medium">AI Score:</div>
                                <div className="text-sm">{(candidateDetailsQuery.data.aiScore || 0).toFixed(2)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium text-gray-500 mb-2">ADMET Properties</h3>
                              {candidateDetailsQuery.data.properties?.admet ? (
                                <div className="space-y-3">
                                  {Object.entries(candidateDetailsQuery.data.properties.admet).map(([key, value]) => (
                                    <div key={key} className="grid grid-cols-6 gap-2 items-center">
                                      <div className="col-span-2 text-sm capitalize">{key}:</div>
                                      <div className="col-span-3">
                                        <Progress value={typeof value === 'number' ? value * 100 : 0} />
                                      </div>
                                      <div className="text-sm text-right">{typeof value === 'number' ? (value * 100).toFixed(0) + '%' : 'N/A'}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No ADMET data available</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Failed to load candidate details
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-gray-500">
                      {candidateDetailsQuery.data?.createdAt && 
                        `Created: ${new Date(candidateDetailsQuery.data.createdAt).toLocaleDateString()}`}
                    </div>
                    <div className="flex space-x-2">
                      <Select onValueChange={handleStatusUpdate} value={selectedCandidate.status}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button>
                        <span className="material-icons mr-1 text-sm">description</span>
                        Export
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Card className="shadow h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <div className="flex justify-center mb-4">
                    <span className="material-icons text-4xl text-gray-400">science</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidate Selected</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Select a drug candidate from the list or generate new candidates to view detailed information.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
