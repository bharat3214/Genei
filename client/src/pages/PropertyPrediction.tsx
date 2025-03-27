import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import AppShell from "@/components/layout/AppShell";
import MoleculeViewer from "@/components/dashboard/MoleculeViewer";
import PropertyPredictor from "@/components/dashboard/PropertyPredictor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { api } from "@/lib/api";
import { PropertyPrediction } from "@/lib/types";

export default function PropertyPredictionPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [smilesInput, setSmilesInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [activeTab, setActiveTab] = useState("input");
  const [predictionResults, setPredictionResults] = useState<PropertyPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Fetch molecules for example selection
  const moleculesQuery = useQuery({
    queryKey: ["/api/molecules"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Property prediction mutation
  const predictMutation = useMutation({
    mutationFn: (smiles: string) => api.predictMoleculeProperties(smiles),
    onSuccess: (data) => {
      setPredictionResults(data);
      setIsAnalyzing(false);
      setActiveTab("results");
      toast({
        title: "Analysis Complete",
        description: "Property prediction successfully completed.",
      });
    },
    onError: () => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: "Failed to predict molecular properties. Please check the SMILES string and try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle example selection
  const handleSelectExample = (molecule: any) => {
    setSmilesInput(molecule.smiles);
    setNameInput(molecule.name);
  };
  
  // Handle prediction
  const handlePredict = () => {
    if (!smilesInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a valid SMILES string.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    predictMutation.mutate(smilesInput);
  };
  
  // Handle clearing the form
  const handleClear = () => {
    setSmilesInput("");
    setNameInput("");
    setPredictionResults(null);
    setActiveTab("input");
  };
  
  // Generate report
  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: "Your report is being generated and will be available for download shortly.",
    });
  };

  return (
    <AppShell>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Property Prediction</h1>
          <p className="mt-1 text-sm text-gray-600">Analyze molecular properties using AI-powered prediction models</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="shadow">
              <CardHeader>
                <CardTitle>Molecule Input</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="input">Manual Input</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="input" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="molecule-name">Molecule Name</Label>
                      <Input
                        id="molecule-name"
                        placeholder="e.g., Aspirin"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smiles-input">SMILES Structure</Label>
                      <Textarea
                        id="smiles-input"
                        placeholder="Enter SMILES string..."
                        value={smilesInput}
                        onChange={(e) => setSmilesInput(e.target.value)}
                        rows={5}
                        className="font-mono text-sm resize-none"
                      />
                      <p className="text-xs text-gray-500">
                        Enter a valid SMILES notation for the molecule you want to analyze.
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handlePredict}
                        disabled={!smilesInput.trim() || isAnalyzing}
                        className="flex-1"
                      >
                        {isAnalyzing ? (
                          <>
                            <span className="animate-spin mr-2">●</span>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <span className="material-icons mr-1 text-sm">analytics</span>
                            Predict Properties
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleClear}
                        disabled={isAnalyzing}
                      >
                        Clear
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="examples">
                    {moleculesQuery.isLoading ? (
                      <div className="space-y-3">
                        {Array(4).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : moleculesQuery.data && moleculesQuery.data.length > 0 ? (
                      <div className="space-y-2">
                        {moleculesQuery.data.map((molecule) => (
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
                      <div className="text-center py-8 text-gray-500">
                        No example molecules available
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Molecule Visualization */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>
                    {nameInput ? nameInput : "Molecule Visualization"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {smilesInput ? (
                    <div className="flex justify-center">
                      <MoleculeViewer
                        smiles={smilesInput}
                        name={nameInput || "Molecule"}
                      />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 border rounded-md">
                      Enter a SMILES string to visualize the molecule
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Properties */}
              <Card className="shadow">
                <CardHeader>
                  <CardTitle>Predicted Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent mb-4"></div>
                      <p className="text-gray-500">Analyzing molecular properties...</p>
                      <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
                    </div>
                  ) : predictionResults ? (
                    <PropertyPredictor
                      properties={predictionResults}
                      onGenerateReport={handleGenerateReport}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <span className="material-icons text-4xl mb-2">analytics</span>
                      <p>Enter a molecule and click "Predict Properties" to see the analysis results.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
