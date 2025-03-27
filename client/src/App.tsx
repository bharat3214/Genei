import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import MoleculeExplorer from "@/pages/MoleculeExplorer";
import DrugCandidates from "@/pages/DrugCandidates";
import PropertyPrediction from "@/pages/PropertyPrediction";
import Literature from "@/pages/Literature";
import Reports from "@/pages/Reports";
import AIGeneration from "@/pages/AIGeneration";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/molecules" component={MoleculeExplorer} />
      <Route path="/candidates" component={DrugCandidates} />
      <Route path="/properties" component={PropertyPrediction} />
      <Route path="/ai-generation" component={AIGeneration} />
      <Route path="/literature" component={Literature} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
