import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Mobile Menu Button */}
            <div className="flex-shrink-0 flex items-center md:hidden">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <span className="material-icons">menu</span>
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-start">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-400">search</span>
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search molecules, literature..."
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Nav Items */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="material-icons">notifications</span>
            </Button>
            <Button variant="ghost" size="sm" className="ml-3 p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="material-icons">help_outline</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
