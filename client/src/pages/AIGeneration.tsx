import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import AppShell from "@/components/layout/AppShell";
import MoleculeViewer from "@/components/dashboard/MoleculeViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

import { api } from "@/lib/api";
import { AIGeneratedCandidate, Molecule } from "@/lib/types";

export default function AIGeneration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [seedSmiles, setSeedSmiles] = useState("");
  const [seedName, setSeedName] = useState("");
  const [targetProtein, setTargetProtein] = useState("");
  const [drugLikenessConstraint, setDrugLikenessConstraint] = useState(true);
  const [toxicityConstraint, setToxicityConstraint] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<AIGeneratedCandidate | null>(null);
  const [generatedCandidates, setGeneratedCandidates] = useState<AIGeneratedCandidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch molecules for reference
  const moleculesQuery = useQuery({
    queryKey: ["/api/molecules"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // AI Drug Generation mutation
  const generateMutation = useMutation({
    mutationFn: (data: { smiles: string; targetProtein: string; constraints: any }) => 
      api.generateDrugCandidates(data.smiles, data.targetProtein, data.constraints),
    onSuccess: (data) => {
      setGeneratedCandidates(data);
      setIsGenerating(false);
      
      if (data.length > 0) {
        setSelectedCandidate(data[0]);
        toast({
          title: "Generation Complete",
          description: `Successfully generated ${data.length} drug candidates.`,
        });
      } else {
        toast({
          title: "Generation Complete",
          description: "No viable candidates were generated. Try adjusting your parameters.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate drug candidates. Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle example selection
  const handleSelectExample = (molecule: Molecule) => {
    setSeedSmiles(molecule.smiles || "");
    setSeedName(molecule.name || "");
  };
  
  // Handle generation
  const handleGenerateCandidates = () => {
    if (!seedSmiles.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a valid SMILES string for the seed molecule.",
        variant: "destructive",
      });
      return;
    }
    
    const constraints = {
      drugLikeness: drugLikenessConstraint,
      lowToxicity: toxicityConstraint,
    };
    
    setIsGenerating(true);
    generateMutation.mutate({
      smiles: seedSmiles,
      targetProtein: targetProtein,
      constraints
    });
  };
  
  // Handle selecting a candidate
  const handleSelectCandidate = (candidate: AIGeneratedCandidate) => {
    setSelectedCandidate(candidate);
  };
  
  // Handle saving a candidate
  const handleSaveCandidate = () => {
    if (!selectedCandidate) return;
    
    toast({
      title: "Candidate Saved",
      description: `${selectedCandidate.name} has been saved to your drug candidates.`,
    });
    
    // In a real implementation, this would save the candidate to the database
  };
  
  // Clear form
  const handleClear = () => {
    setSeedSmiles("");
    setSeedName("");
    setTargetProtein("");
    setSelectedCandidate(null);
    setGeneratedCandidates([]);
  };

  return (
    <AppShell>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">AI Drug Generation</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate novel drug candidates using AI-powered molecular design
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Seed Molecule Card */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>Seed Molecule</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="manual">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="manual">Manual Input</TabsTrigger>
                      <TabsTrigger value="database">From Database</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="manual" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="seed-name">Molecule Name</Label>
                        <Input
                          id="seed-name"
                          placeholder="e.g., Imatinib"
                          value={seedName}
                          onChange={(e) => setSeedName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="seed-smiles">SMILES Structure</Label>
                        <Textarea
                          id="seed-smiles"
                          placeholder="Enter SMILES string..."
                          value={seedSmiles}
                          onChange={(e) => setSeedSmiles(e.target.value)}
                          rows={3}
                          className="font-mono text-sm resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          Enter a valid SMILES notation for the seed molecule
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="database">
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Select a molecule from your database to use as a seed:
                        </p>
                        
                        {moleculesQuery.isLoading ? (
                          <div className="space-y-2">
                            {Array(3).fill(0).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        ) : moleculesQuery.data && moleculesQuery.data.length > 0 ? (
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {moleculesQuery.data.map((molecule: Molecule) => (
                              <Button
                                key={molecule.id}
                                variant="outline"
                                className="w-full justify-start h-auto py-2 px-3"
                                onClick={() => handleSelectExample(molecule)}
                              >
                                <div className="text-left">
                                  <div className="font-medium">{molecule.name}</div>
                                  <div className="text-xs text-gray-500 font-mono truncate max-w-xs">
                                    {molecule.smiles}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            No molecules available in your database
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              {/* Target & Constraints Card */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>Target & Constraints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-protein">Target Protein (Optional)</Label>
                    <Input
                      id="target-protein"
                      placeholder="e.g., EGFR, BCR-ABL, etc."
                      value={targetProtein}
                      onChange={(e) => setTargetProtein(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Specify a target protein to optimize binding affinity
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Constraints</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="druglikeness">Drug-likeness</Label>
                        <p className="text-xs text-gray-500">Follow Lipinski's rule of five</p>
                      </div>
                      <Switch
                        id="druglikeness"
                        checked={drugLikenessConstraint}
                        onCheckedChange={setDrugLikenessConstraint}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="toxicity">Low Toxicity</Label>
                        <p className="text-xs text-gray-500">Minimize potential toxic effects</p>
                      </div>
                      <Switch
                        id="toxicity"
                        checked={toxicityConstraint}
                        onCheckedChange={setToxicityConstraint}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 px-6 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Clear
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleGenerateCandidates}
                    disabled={!seedSmiles.trim() || isGenerating}
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
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Candidate Visualization */}
              <Card className="shadow">
                <CardHeader className="pb-2">
                  <CardTitle>
                    {selectedCandidate ? selectedCandidate.name : "Candidate Visualization"}
                  </CardTitle>
                  {selectedCandidate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge className="bg-green-100 text-green-800">
                        AI Score: {(selectedCandidate.aiScore * 100).toFixed(0)}%
                      </Badge>
                      {selectedCandidate.targetProtein && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Target: {selectedCandidate.targetProtein}
                        </Badge>
                      )}
                      {selectedCandidate.bindingAffinity && (
                        <Badge className="bg-purple-100 text-purple-800">
                          Binding: {selectedCandidate.bindingAffinity.toFixed(1)}/10
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="h-64 flex flex-col items-center justify-center">
                      <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent mb-4"></div>
                      <p className="text-gray-500">Generating novel drug candidates...</p>
                      <p className="text-xs text-gray-400 mt-2">This may take a minute or two</p>
                    </div>
                  ) : selectedCandidate ? (
                    <div className="flex justify-center">
                      <MoleculeViewer
                        smiles={selectedCandidate.smiles}
                        name={selectedCandidate.name}
                      />
                    </div>
                  ) : seedSmiles ? (
                    <div className="flex justify-center">
                      <MoleculeViewer
                        smiles={seedSmiles}
                        name={seedName || "Seed Molecule"}
                      />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 border rounded-md">
                      Enter a seed SMILES string to start generating candidates
                    </div>
                  )}
                </CardContent>
                {selectedCandidate && (
                  <CardFooter className="border-t pt-4 px-6">
                    <Button 
                      className="w-full"
                      onClick={handleSaveCandidate}
                    >
                      <span className="material-icons mr-1 text-sm">save</span>
                      Save as Drug Candidate
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              {/* Generated Candidates */}
              {generatedCandidates.length > 0 && (
                <Card className="shadow">
                  <CardHeader>
                    <CardTitle>Generated Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedCandidates.map((candidate, index) => (
                        <Card 
                          key={index} 
                          className={`border cursor-pointer ${selectedCandidate?.name === candidate.name ? 'border-primary-500 bg-primary-50' : ''}`}
                          onClick={() => handleSelectCandidate(candidate)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{candidate.name}</h3>
                                <p className="text-xs font-mono text-gray-500 mt-1 truncate max-w-md">
                                  {candidate.smiles}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge className="bg-green-100 text-green-800">
                                  Score: {(candidate.aiScore * 100).toFixed(0)}%
                                </Badge>
                                {candidate.bindingAffinity && (
                                  <span className="text-xs text-gray-500">
                                    Binding: {candidate.bindingAffinity.toFixed(1)}/10
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Info Card */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>About AI Drug Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>How does it work?</AccordionTrigger>
                      <AccordionContent>
                        Our AI drug generation system uses advanced deep learning models to generate novel
                        molecular structures based on your input seed molecule. The AI understands molecular
                        patterns, drug-likeness criteria, and structure-activity relationships to propose
                        viable drug candidates.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>What is a seed molecule?</AccordionTrigger>
                      <AccordionContent>
                        A seed molecule is your starting point - a known chemical compound that has properties or
                        structural features you want to maintain or improve upon. The AI will generate variations of
                        this molecule while optimizing for your specified constraints.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>What constraints can I apply?</AccordionTrigger>
                      <AccordionContent>
                        You can specify drug-likeness constraints (following Lipinski's rule of five), toxicity
                        minimization, and a target protein to optimize binding affinity. The AI will attempt to
                        generate candidates that satisfy these constraints while maintaining structural similarity
                        to your seed molecule.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}