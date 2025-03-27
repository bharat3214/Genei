import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import AppShell from "@/components/layout/AppShell";
import StatsCard from "@/components/dashboard/StatsCard";
import MoleculeViewer from "@/components/dashboard/MoleculeViewer";
import PropertyPredictor from "@/components/dashboard/PropertyPredictor";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import CandidatesTable from "@/components/dashboard/CandidatesTable";

import { api } from "@/lib/api";

export default function Dashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch dashboard stats
  const statsQuery = useQuery({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch activities
  const activitiesQuery = useQuery({
    queryKey: ["/api/activities"],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch drug candidates
  const candidatesQuery = useQuery({
    queryKey: ["/api/drug-candidates"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch first molecule for the molecule viewer
  const moleculesQuery = useQuery({
    queryKey: ["/api/molecules"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get the first molecule's properties for the property predictor
  const firstMolecule = moleculesQuery.data?.[0];
  
  // For demo purposes, use the static properties from the molecule
  const properties = firstMolecule?.properties;
  
  useEffect(() => {
    // Show error toast if any query fails
    if (statsQuery.error) {
      toast({
        title: "Error loading dashboard statistics",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [statsQuery.error, toast]);
  
  const handleGenerateReport = () => {
    toast({
      title: "Generating report",
      description: "Your report is being generated and will be available soon.",
    });
  };
  
  return (
    <AppShell>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Your AI-powered drug discovery workspace</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Molecule Database"
            value={statsQuery.data?.moleculeCount.toLocaleString() || "..."}
            icon="hub"
            iconColor="text-primary-600"
            iconBgColor="bg-primary-100"
            linkText="View all molecules"
            linkHref="/molecules"
          />
          
          <StatsCard
            title="Active Projects"
            value={statsQuery.data?.projectCount || "..."}
            icon="science"
            iconColor="text-success-500"
            iconBgColor="bg-success-100"
            linkText="View all projects"
            linkHref="/projects"
          />
          
          <StatsCard
            title="Drug Candidates"
            value={statsQuery.data?.drugCandidateCount || "..."}
            icon="biotech"
            iconColor="text-accent-500"
            iconBgColor="bg-accent-100"
            linkText="View all candidates"
            linkHref="/candidates"
          />
          
          <StatsCard
            title="Research Papers"
            value={statsQuery.data?.researchPaperCount.toLocaleString() || "..."}
            icon="menu_book"
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100"
            linkText="View all papers"
            linkHref="/literature"
          />
        </div>
        
        {/* Molecule Viewer & Property Predictor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MoleculeViewer
              smiles={firstMolecule?.smiles}
              name={firstMolecule?.name}
              formula={firstMolecule?.formula}
            />
          </div>
          
          <div>
            <PropertyPredictor
              properties={properties as any}
              isLoading={moleculesQuery.isLoading}
              onGenerateReport={handleGenerateReport}
            />
          </div>
        </div>
        
        {/* Recent Activity & Drug Candidates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed
            activities={activitiesQuery.data}
            isLoading={activitiesQuery.isLoading}
            onViewAll={() => navigate("/activities")}
          />
          
          <CandidatesTable
            candidates={candidatesQuery.data}
            isLoading={candidatesQuery.isLoading}
            onViewAll={() => navigate("/candidates")}
          />
        </div>
      </div>
    </AppShell>
  );
}
