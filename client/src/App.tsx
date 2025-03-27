import { Switch, Route, Redirect } from "wouter";
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
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path?: string }) {
  return (
    <>
      <SignedIn>
        <Route {...rest} component={Component} />
      </SignedIn>
      <SignedOut>
        <Redirect to="/sign-in" />
      </SignedOut>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/molecules" component={MoleculeExplorer} />
      <ProtectedRoute path="/candidates" component={DrugCandidates} />
      <ProtectedRoute path="/properties" component={PropertyPrediction} />
      <ProtectedRoute path="/ai-generation" component={AIGeneration} />
      <ProtectedRoute path="/literature" component={Literature} />
      <ProtectedRoute path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
