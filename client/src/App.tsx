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
import { ClerkProvider, SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key");
}

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

// Error boundary component for Clerk
function ClerkErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Clerk error caught:", event.error);
      setHasError(true);
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      // Only set error state if it's a Clerk-related error
      if (event.reason?.toString().includes('clerk')) {
        setHasError(true);
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
  
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="mb-4">There was a problem initializing the authentication system.</p>
          <p className="text-gray-700 mb-4">This might be due to network issues or an invalid API key.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

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
    <ClerkErrorBoundary>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <QueryClientProvider client={queryClient}>
          <Router />
          <Toaster />
        </QueryClientProvider>
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}

export default App;
