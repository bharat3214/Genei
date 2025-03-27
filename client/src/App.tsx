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
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/molecules" component={MoleculeExplorer} />
      <ProtectedRoute path="/candidates" component={DrugCandidates} />
      <ProtectedRoute path="/properties" component={PropertyPrediction} />
      <ProtectedRoute path="/ai-generation" component={AIGeneration} />
      <ProtectedRoute path="/literature" component={Literature} />
      <ProtectedRoute path="/reports" component={Reports} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
