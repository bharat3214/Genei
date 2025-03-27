import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { api } from "@/lib/api";
import { DrugCandidate, Molecule } from "@/lib/types";

export default function Reports() {
  const { toast } = useToast();
  
  const [selectedReportType, setSelectedReportType] = useState("molecule");
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Fetch molecules
  const moleculesQuery = useQuery({
    queryKey: ["/api/molecules"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch drug candidates
  const candidatesQuery = useQuery({
    queryKey: ["/api/drug-candidates"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch projects
  const projectsQuery = useQuery({
    queryKey: ["/api/projects"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle report generation
  const handleGenerateReport = () => {
    if (!selectedEntityId) {
      toast({
        title: "Selection Required",
        description: "Please select an entity to generate a report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: "Report Generated",
        description: "The report has been successfully generated and is ready for download.",
      });
    }, 2000);
  };
  
  // Get entity options based on report type
  const getEntityOptions = () => {
    switch (selectedReportType) {
      case "molecule":
        return moleculesQuery.data || [];
      case "drugCandidate":
        return candidatesQuery.data || [];
      case "project":
        return projectsQuery.data || [];
      default:
        return [];
    }
  };
  
  // Get loading state based on report type
  const isLoadingOptions = () => {
    switch (selectedReportType) {
      case "molecule":
        return moleculesQuery.isLoading;
      case "drugCandidate":
        return candidatesQuery.isLoading;
      case "project":
        return projectsQuery.isLoading;
      default:
        return false;
    }
  };
  
  // Get entity name based on id and report type
  const getEntityName = () => {
    if (!selectedEntityId) return null;
    
    switch (selectedReportType) {
      case "molecule":
        return moleculesQuery.data?.find(m => m.id === selectedEntityId)?.name;
      case "drugCandidate":
        return candidatesQuery.data?.find(c => c.id === selectedEntityId)?.name;
      case "project":
        return projectsQuery.data?.find(p => p.id === selectedEntityId)?.name;
      default:
        return null;
    }
  };
  
  // Sample report sections
  const reportSections = [
    { id: "overview", title: "Overview", icon: "info" },
    { id: "structure", title: "Structure Analysis", icon: "hub" },
    { id: "properties", title: "Physical Properties", icon: "science" },
    { id: "admet", title: "ADMET Prediction", icon: "analytics" },
    { id: "docking", title: "Docking Results", icon: "model_training" },
    { id: "literature", title: "Literature Review", icon: "menu_book" },
    { id: "synthesis", title: "Synthesis Pathways", icon: "architecture" },
    { id: "toxicity", title: "Toxicity Analysis", icon: "warning" },
  ];

  return (
    <AppShell>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">Generate and manage comprehensive reports for your drug discovery projects</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generator */}
          <div>
            <Card className="shadow">
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Type */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Report Type</h3>
                  <Tabs value={selectedReportType} onValueChange={setSelectedReportType}>
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="molecule">Molecule</TabsTrigger>
                      <TabsTrigger value="drugCandidate">Drug Candidate</TabsTrigger>
                      <TabsTrigger value="project">Project</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* Entity Selection */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select {selectedReportType === "molecule" ? "Molecule" : selectedReportType === "drugCandidate" ? "Drug Candidate" : "Project"}</h3>
                  {isLoadingOptions() ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select onValueChange={(value) => setSelectedEntityId(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a ${selectedReportType === "molecule" ? "molecule" : selectedReportType === "drugCandidate" ? "drug candidate" : "project"}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getEntityOptions().map((entity: any) => (
                          <SelectItem key={entity.id} value={entity.id.toString()}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {/* Report Sections */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Report Sections</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {reportSections.map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`section-${section.id}`}
                          className="rounded text-primary-500 focus:ring-primary-500"
                          defaultChecked
                        />
                        <label htmlFor={`section-${section.id}`} className="text-sm">
                          {section.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Format Selection */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Format</h3>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="format-pdf"
                        name="format"
                        className="text-primary-500 focus:ring-primary-500"
                        defaultChecked
                      />
                      <label htmlFor="format-pdf" className="text-sm">PDF</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="format-docx"
                        name="format"
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <label htmlFor="format-docx" className="text-sm">DOCX</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="format-csv"
                        name="format"
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <label htmlFor="format-csv" className="text-sm">CSV</label>
                    </div>
                  </div>
                </div>
                
                {/* Generate Button */}
                <Button 
                  className="w-full" 
                  onClick={handleGenerateReport}
                  disabled={!selectedEntityId || isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <span className="animate-spin mr-2">●</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-icons mr-1 text-sm">description</span>
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Report Preview */}
          <div className="lg:col-span-2">
            <Card className="shadow h-full">
              <CardHeader>
                <CardTitle>
                  {selectedEntityId && getEntityName() 
                    ? `Report Preview: ${getEntityName()}` 
                    : "Report Preview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEntityId ? (
                  <div className="space-y-6">
                    {/* Report Header */}
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold">{getEntityName()}</h2>
                          <p className="text-sm text-gray-500">
                            Report Type: {selectedReportType === "molecule" ? "Molecular Analysis" : selectedReportType === "drugCandidate" ? "Drug Candidate Assessment" : "Project Summary"}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {new Date().toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Report Content */}
                    <div className="space-y-4">
                      {reportSections.map((section) => (
                        <div key={section.id} className="border rounded-md p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="material-icons text-primary-500">{section.icon}</span>
                            <h3 className="text-lg font-medium">{section.title}</h3>
                          </div>
                          <Separator className="my-2" />
                          <div className="text-sm text-gray-600">
                            {section.id === "overview" ? (
                              <p>This report provides a comprehensive analysis of {getEntityName()} including its structural characteristics, physical properties, and potential as a drug candidate.</p>
                            ) : (
                              <div className="flex justify-center items-center h-20 bg-gray-100 rounded-md">
                                <span className="text-gray-400">{section.title} content will appear here</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <span className="material-icons text-4xl text-gray-400 mb-4">description</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Selected</h3>
                    <p className="text-gray-500 max-w-md">
                      Select a molecule, drug candidate, or project from the options on the left to preview and generate a report.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
