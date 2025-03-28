
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Workout Pro</h1>
      <p className="text-gray-400 mb-8">
        Start creating your custom workout programs or explore our templates
      </p>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/sheets">Create Workout Sheet</Link>
        </Button>
        
        <Button variant="outline">
          <Link to="/library">Browse Library</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-dark-200 p-6 rounded-lg border border-dark-300">
          <h3 className="text-xl font-semibold mb-2">Quick Start</h3>
          <p className="text-gray-400 mb-4">Jump back into your recent programs</p>
          <Link to="/sheets" className="text-purple-400 hover:underline">
            Continue where you left off →
          </Link>
        </div>
        
        <div className="bg-dark-200 p-6 rounded-lg border border-dark-300">
          <h3 className="text-xl font-semibold mb-2">Templates</h3>
          <p className="text-gray-400 mb-4">Browse our collection of workout templates</p>
          <Link to="/library" className="text-purple-400 hover:underline">
            Explore templates →
          </Link>
        </div>
        
        <div className="bg-dark-200 p-6 rounded-lg border border-dark-300">
          <h3 className="text-xl font-semibold mb-2">Learn</h3>
          <p className="text-gray-400 mb-4">Tutorials and guides to help you get started</p>
          <Link to="/help" className="text-purple-400 hover:underline">
            View tutorials →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
