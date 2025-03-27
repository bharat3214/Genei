import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MoleculeSearchBarProps {
  onSearch: (query: string, source: string) => void;
  isLoading?: boolean;
}

export default function MoleculeSearchBar({ 
  onSearch, 
  isLoading = false 
}: MoleculeSearchBarProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("pubchem");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, source);
    }
  };

  return (
    <Card className="shadow">
      <CardContent className="p-4">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search molecules by name, SMILES, or ID..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pr-10"
                  disabled={isLoading}
                />
                {query && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setQuery("")}
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={!query.trim() || isLoading}
              >
                {isLoading ? (
                  "Searching..."
                ) : (
                  <>
                    <span className="material-icons mr-1">search</span>
                    Search
                  </>
                )}
              </Button>
            </div>
            
            <Tabs defaultValue="pubchem" value={source} onValueChange={setSource}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="pubchem">PubChem</TabsTrigger>
                <TabsTrigger value="chembl">ChEMBL</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
