import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Molecule Explorer", href: "/molecules", icon: "hub" },
  { name: "Drug Candidates", href: "/candidates", icon: "science" },
  { name: "Property Prediction", href: "/properties", icon: "analytics" },
  { name: "AI Generation", href: "/ai-generation", icon: "model_training" },
  { name: "Literature", href: "/literature", icon: "menu_book" },
  { name: "Reports", href: "/reports", icon: "description" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary-500">biotech</span>
          <h1 className="text-xl font-semibold text-white">DrugAI</h1>
        </div>
      </div>
      
      {/* Sidebar Navigation */}
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
        <div className="px-4 space-y-1">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
            >
              <a
                className={cn(
                  item.href === location
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md group"
                )}
              >
                <span className="material-icons mr-3 h-6 w-6">{item.icon}</span>
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* User Profile Section */}
      <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="bg-gray-700 rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium text-white">
              {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.fullName || 'User'}</p>
              <p className="text-xs font-medium text-gray-400">{user?.role || 'Researcher'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
