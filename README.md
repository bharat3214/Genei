DrugGenAI: AI-Powered Drug Discovery Assistant

Overview
DrugGenAI is an innovative web application that accelerates the drug discovery process by leveraging artificial intelligence. This platform enables pharmaceutical researchers to identify, design, and optimize potential drug candidates with greater efficiency than traditional methods, reducing the time and cost associated with bringing new drugs to market.

Features
🔍 Molecule Explorer
Browse a comprehensive database of molecular compounds
Search for molecules by name, SMILES notation, or structural properties
View detailed molecular information and visualize structures in 2D
Track and manage molecule collections
🧪 Property Prediction
AI-powered prediction of key pharmacological properties:
Bioavailability
Solubility
Blood-brain barrier penetration
Toxicity risk assessment
Instant property estimates based on SMILES notation input
🧬 AI Drug Candidate Generation
Generate novel drug candidates using OpenAI's advanced models
Provide seed molecules and target proteins to guide generation
Receive multiple candidates with predicted binding affinities
Save promising candidates for further analysis
📊 Interactive Dashboard
Comprehensive overview of research portfolio
Real-time statistics on molecules and drug candidates
Activity feed showing recent platform actions
Quick access to frequently used tools
📚 Literature Research
Browse relevant scientific publications
Search for papers by topic, author, or molecular relevance
Save and organize research references
📝 Reporting
Generate structured research reports
Document findings and progress
Share results with team members
💬 Researcher Messaging
Direct communication between platform users
Private conversations with other researchers
Message history and notification system
Technical Stack
Frontend
React for component-based UI
TanStack Query for data fetching and state management
Tailwind CSS and Shadcn UI for responsive styling
RDKit.js for molecular visualization
Recharts for data visualization
Backend
Node.js with Express server
RESTful API architecture
Passport.js for authentication
OpenAI API integration for AI features
Data Management
Structured data models for molecules, drug candidates, and research data
Type-safe database operations with Drizzle ORM
Scalable storage architecture
Getting Started
Prerequisites
Node.js (v16+)
npm or yarn
OpenAI API key
Installation
Clone the repository:
git clone https://github.com/yourusername/DrugGenAI.git
cd DrugGenAI
Install dependencies:
npm install
Set up environment variables:
Create a .env file in the root directory with the following:
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
Start the development server:
npm run dev
Access the application at http://localhost:3000
Usage Guide
Authentication
Register for a new account or log in with existing credentials
All user data is securely stored and associated with user accounts
Exploring Molecules
Navigate to the Molecule Explorer
Use the search bar to find molecules by name or SMILES notation
Click on a molecule to view its detailed properties and structure
Predicting Properties
Go to the Property Prediction page
Enter a SMILES string for your molecule
Click "Predict Properties" to receive AI-generated property estimates
Generating Drug Candidates
Navigate to AI Generation
Select a seed molecule or enter a SMILES string
Specify target proteins and optimization parameters
Click "Generate Candidates" to receive AI suggestions



