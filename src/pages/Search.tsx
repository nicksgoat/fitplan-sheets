
import React from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const Search: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      
      <div className="relative mb-8 max-w-2xl">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input 
          placeholder="Search for workouts, programs, or exercises..." 
          className="pl-10 bg-dark-200 border-dark-300 h-12"
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Popular searches</h2>
        <div className="flex flex-wrap gap-2">
          {["Strength Training", "HIIT", "Bodybuilding", "5x5", "Mobility", "Endurance"].map((tag) => (
            <span key={tag} className="bg-dark-300 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            "Strength", "Hypertrophy", "Power", "Endurance", 
            "Flexibility", "Balance", "Functional", "Sport Specific"
          ].map((category) => (
            <div key={category} className="bg-dark-200 p-4 rounded-lg border border-dark-300 hover:bg-dark-300 cursor-pointer">
              {category}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
