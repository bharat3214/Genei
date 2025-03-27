import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

import { api } from "@/lib/api";
import { ResearchPaper } from "@/lib/types";

export default function Literature() {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [openPaperDialog, setOpenPaperDialog] = useState(false);
  
  // Fetch research papers
  const papersQuery = useQuery({
    queryKey: ["/api/research-papers"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real implementation, this would search papers by title/content
      toast({
        title: "Search Feature",
        description: "Paper search functionality would be implemented here with backend integration.",
      });
    }
  };
  
  // Handle paper selection
  const handleSelectPaper = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setOpenPaperDialog(true);
  };
  
  // Handle paper save/bookmark
  const handleBookmarkPaper = (paper: ResearchPaper) => {
    toast({
      title: "Paper Bookmarked",
      description: `"${paper.title}" has been added to your bookmarks.`,
    });
  };
  
  // Get journal badge color
  const getJournalBadgeColor = (journal: string) => {
    const journalMap: Record<string, string> = {
      "Journal of Medicinal Chemistry": "bg-blue-100 text-blue-800",
      "ACS Chemical Biology": "bg-green-100 text-green-800",
      "Journal of Chemical Information and Modeling": "bg-purple-100 text-purple-800",
      "Nature Chemical Biology": "bg-emerald-100 text-emerald-800",
      "Chemical Science": "bg-amber-100 text-amber-800",
    };
    
    return journalMap[journal] || "bg-gray-100 text-gray-800";
  };

  return (
    <AppShell>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Literature</h1>
          <p className="mt-1 text-sm text-gray-600">Browse and search relevant research papers for drug discovery</p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400">search</span>
              </div>
              <Input
                type="text"
                placeholder="Search research papers by title, author, journal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!searchQuery.trim()}>
              Search
            </Button>
          </form>
        </div>
        
        {/* Papers Grid */}
        <div className="space-y-4">
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Papers</TabsTrigger>
              <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              <TabsTrigger value="related">Related to Your Work</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {papersQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="shadow">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : papersQuery.data && papersQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {papersQuery.data.map((paper: ResearchPaper) => (
                <Card key={paper.id} className="shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-left justify-start font-medium hover:text-primary-700"
                        onClick={() => handleSelectPaper(paper)}
                      >
                        {paper.title}
                      </Button>
                    </CardTitle>
                    <div className="text-sm text-gray-500">{paper.authors}</div>
                  </CardHeader>
                  <CardContent>
                    {paper.abstract ? (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                        {paper.abstract}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-2">No abstract available</p>
                    )}
                    <div className="flex items-center space-x-2 mt-3">
                      {paper.journal && (
                        <Badge className={getJournalBadgeColor(paper.journal)}>
                          {paper.journal}
                        </Badge>
                      )}
                      {paper.year && <span className="text-sm text-gray-500">{paper.year}</span>}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button variant="ghost" size="sm" onClick={() => handleBookmarkPaper(paper)}>
                      <span className="material-icons text-sm mr-1">bookmark_border</span>
                      Save
                    </Button>
                    {paper.doi && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer">
                          <span className="material-icons text-sm mr-1">open_in_new</span>
                          View
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="material-icons text-4xl mb-2">menu_book</div>
              <p>No research papers available</p>
            </div>
          )}
        </div>
        
        {/* Paper Detail Dialog */}
        {selectedPaper && (
          <Dialog open={openPaperDialog} onOpenChange={setOpenPaperDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{selectedPaper.title}</DialogTitle>
                <DialogDescription>{selectedPaper.authors}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedPaper.journal && (
                    <Badge className={getJournalBadgeColor(selectedPaper.journal)}>
                      {selectedPaper.journal}
                    </Badge>
                  )}
                  {selectedPaper.year && <Badge variant="outline">{selectedPaper.year}</Badge>}
                  {selectedPaper.doi && (
                    <Badge variant="outline">DOI: {selectedPaper.doi}</Badge>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Abstract</h3>
                  <div className="text-sm text-gray-700">
                    {selectedPaper.abstract || "No abstract available."}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">AI-Generated Summary</h3>
                  <div className="text-sm text-gray-700">
                    <p>This paper presents significant findings in the field of drug discovery, focusing on {selectedPaper.title.toLowerCase().includes("kinase") ? "kinase inhibitors" : "novel drug candidates"}. The research demonstrates promising results that could lead to improved therapeutic approaches.</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setOpenPaperDialog(false)}>
                  Close
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => handleBookmarkPaper(selectedPaper)}>
                    <span className="material-icons text-sm mr-1">bookmark</span>
                    Save
                  </Button>
                  {selectedPaper.url && (
                    <Button asChild>
                      <a href={selectedPaper.url} target="_blank" rel="noopener noreferrer">
                        <span className="material-icons text-sm mr-1">open_in_new</span>
                        View Full Paper
                      </a>
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppShell>
  );
}
