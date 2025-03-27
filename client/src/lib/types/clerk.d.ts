// TypeScript declarations for Clerk global object
interface ClerkSession {
  getToken(): Promise<string | null>;
}

interface ClerkInstance {
  session?: ClerkSession;
}

interface Window {
  Clerk?: ClerkInstance;
}