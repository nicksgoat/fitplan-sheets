import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import WorkoutCard from "@/components/WorkoutCard";

const categories = [
  { id: 1, name: "Strength" },
  { id: 2, name: "Cardio" },
  { id: 3, name: "Flexibility" },
  { id: 4, name: "HIIT" },
  { id: 5, name: "Sports" },
  { id: 6, name: "Rehabilitation" },
  { id: 7, name: "Mobility" },
  { id: 8, name: "Functional" },
];

const recommendedWorkouts = [
  {
    id: "workout-1",
    name: "Full Body HIIT",
    exerciseCount: 12,
    duration: "30 min",
    category: "HIIT",
    difficulty: "Intermediate",
    createdBy: "Emma Johnson"
  },
  {
    id: "workout-2",
    name: "Upper Body Strength",
    exerciseCount: 8,
    duration: "45 min",
    category: "Strength",
    difficulty: "Intermediate",
    createdBy: "Marcus Lee"
  },
  {
    id: "workout-3",
    name: "Lower Body Burnout",
    exerciseCount: 10,
    duration: "40 min",
    category: "Strength",
    difficulty: "Advanced",
    createdBy: "Sophia Martinez"
  },
  {
    id: "workout-4",
    name: "Core Crusher",
    exerciseCount: 8,
    duration: "20 min",
    category: "Strength",
    difficulty: "Intermediate",
    createdBy: "Alex Thompson"
  },
  {
    id: "workout-5",
    name: "Mobility Flow",
    exerciseCount: 12,
    duration: "25 min",
    category: "Mobility",
    difficulty: "Beginner",
    createdBy: "Maya Williams"
  },
  {
    id: "workout-6",
    name: "Cardio Blast",
    exerciseCount: 10,
    duration: "35 min",
    category: "Cardio",
    difficulty: "Advanced",
    createdBy: "James Wilson"
  },
];

const trendingWorkouts = [...recommendedWorkouts];

const newReleases = [...recommendedWorkouts.slice(0, 3)];

const Home: React.FC = () => {
  return (
    <div className="p-6 pb-20">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Browse Categories</h2>
          <Link to="/library" className="text-purple-500 hover:underline">
            See All
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <Link 
              key={category.id} 
              to={`/search?category=${category.name.toLowerCase()}`}
            >
              <Badge 
                variant="outline" 
                className="py-2 px-4 rounded-full bg-dark-200 hover:bg-dark-300 border-dark-300 text-white cursor-pointer"
              >
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recommended For You</h2>
          <Link to="/library" className="text-purple-500 hover:underline">
            More
          </Link>
        </div>
        
        <Tabs defaultValue="workouts" className="mb-6">
          <TabsList className="bg-dark-200 p-1">
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="col-span-full text-center py-8 text-gray-400">
                No recommended exercises yet
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="workouts" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {recommendedWorkouts.map(workout => (
                <div key={workout.id} className="workout-card relative">
                  <div className="aspect-square bg-dark-200 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
                    <button 
                      className="absolute top-2 right-2 p-2 rounded-full bg-gray-800 bg-opacity-60 hover:bg-gray-700 z-10"
                      aria-label="Like"
                    >
                      <Heart className="h-5 w-5 text-white" />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{workout.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">WORKOUT</div>
                  <h3 className="font-semibold text-sm mb-1 truncate">{workout.name}</h3>
                  <p className="text-xs text-gray-400 mb-1">{workout.createdBy}</p>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{workout.duration}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                      {workout.category}
                    </Badge>
                    {workout.category === "Strength" && workout.name.includes("Upper") && (
                      <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                        Upper Body
                      </Badge>
                    )}
                    {workout.category === "Strength" && workout.name.includes("Lower") && (
                      <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                        Lower Body
                      </Badge>
                    )}
                    {workout.category === "HIIT" && (
                      <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                        Full Body
                      </Badge>
                    )}
                    {workout.name.includes("Core") && (
                      <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                        Abs
                      </Badge>
                    )}
                    {workout.category === "Mobility" && (
                      <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                        Recovery
                      </Badge>
                    )}
                    {workout.category === "Cardio" && (
                      <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                        Fat Burn
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="programs" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="col-span-full text-center py-8 text-gray-400">
                No recommended programs yet
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trending Workouts</h2>
          <Link to="/library" className="text-purple-500 hover:underline">
            More
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {trendingWorkouts.map(workout => (
            <div key={workout.id} className="workout-card relative">
              <div className="aspect-square bg-dark-200 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
                <button 
                  className="absolute top-2 right-2 p-2 rounded-full bg-gray-800 bg-opacity-60 hover:bg-gray-700 z-10"
                  aria-label="Like"
                >
                  <Heart className="h-5 w-5 text-white" />
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{workout.name.charAt(0)}</span>
                </div>
              </div>
              <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">WORKOUT</div>
              <h3 className="font-semibold text-sm mb-1 truncate">{workout.name}</h3>
              <p className="text-xs text-gray-400 mb-1">{workout.createdBy}</p>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{workout.duration}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                  {workout.category}
                </Badge>
                {workout.category === "Strength" && workout.name.includes("Upper") && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Upper Body
                  </Badge>
                )}
                {workout.category === "Strength" && workout.name.includes("Lower") && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Lower Body
                  </Badge>
                )}
                {workout.category === "HIIT" && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Full Body
                  </Badge>
                )}
                {workout.name.includes("Core") && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Abs
                  </Badge>
                )}
                {workout.category === "Mobility" && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Recovery
                  </Badge>
                )}
                {workout.category === "Cardio" && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Fat Burn
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">New Releases</h2>
          <Link to="/library" className="text-purple-500 hover:underline">
            More
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {newReleases.map(workout => (
            <div key={workout.id} className="workout-card relative">
              <div className="aspect-square bg-dark-200 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
                <button 
                  className="absolute top-2 right-2 p-2 rounded-full bg-gray-800 bg-opacity-60 hover:bg-gray-700 z-10"
                  aria-label="Like"
                >
                  <Heart className="h-5 w-5 text-white" />
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{workout.name.charAt(0)}</span>
                </div>
              </div>
              <div className="uppercase text-xs font-semibold tracking-wider text-gray-400 mb-1">WORKOUT</div>
              <h3 className="font-semibold text-sm mb-1 truncate">{workout.name}</h3>
              <p className="text-xs text-gray-400 mb-1">{workout.createdBy}</p>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{workout.duration}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                  {workout.category}
                </Badge>
                {workout.category === "Strength" && workout.name.includes("Upper") && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Upper Body
                  </Badge>
                )}
                {workout.category === "Strength" && workout.name.includes("Lower") && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Lower Body
                  </Badge>
                )}
                {workout.category === "HIIT" && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Full Body
                  </Badge>
                )}
                {workout.name.includes("Core") && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Abs
                  </Badge>
                )}
                {workout.category === "Mobility" && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Recovery
                  </Badge>
                )}
                {workout.category === "Cardio" && (
                  <Badge variant="secondary" className="text-xs bg-dark-300 hover:bg-dark-400">
                    Fat Burn
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
