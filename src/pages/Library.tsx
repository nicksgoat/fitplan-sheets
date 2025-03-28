
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const Library: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Library</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Program
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Link to="/sheets" key={i}>
            <div className="bg-dark-200 border border-dark-300 rounded-lg overflow-hidden hover:border-purple-500 transition-colors">
              <div className="h-40 bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
                <span className="text-2xl font-bold">Program {i}</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">
                  {["Strength Builder", "Hypertrophy Focus", "Full Body Split", "Upper/Lower Split", "Push Pull Legs", "Athletic Development"][i-1]}
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  {["4", "5", "3", "4", "6", "5"][i-1]} workouts • {["Intermediate", "Advanced", "Beginner", "Intermediate", "Advanced", "Intermediate"][i-1]}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Last edited: 2 days ago</span>
                  <span className="text-xs bg-dark-300 px-2 py-0.5 rounded">
                    {["Strength", "Hypertrophy", "Full Body", "Split", "PPL", "Athletic"][i-1]}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Library;
