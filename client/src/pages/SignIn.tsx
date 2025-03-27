import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Card } from "@/components/ui/card";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="material-icons text-primary-500 text-5xl">biotech</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DrugAI Assistant</h1>
          <p className="mt-2 text-gray-600">Sign in to access the drug discovery platform</p>
        </div>
        
        <Card className="shadow-lg overflow-hidden">
          <div className="p-1">
            <ClerkSignIn 
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              redirectUrl="/"
              appearance={{
                variables: {
                  colorPrimary: '#4f46e5',
                  colorTextOnPrimaryBackground: 'white',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                },
                elements: {
                  formButtonPrimary: 'bg-primary-500 hover:bg-primary-600 text-white',
                  card: 'shadow-none',
                  footer: 'hidden',
                }
              }}
            />
          </div>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by secure authentication</p>
        </div>
      </div>
    </div>
  );
}