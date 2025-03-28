
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import ExerciseCard from "@/components/ExerciseCard";
import { exerciseLibrary } from "@/utils/exerciseLibrary";

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("exercises");
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Library</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-dark-200 p-1">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="created">Created by me</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeTab === "exercises" && 
          exerciseLibrary.slice(0, 8).map((exercise) => (
            <ExerciseCard 
              key={exercise.id}
              exercise={exercise}
            />
          ))
        }
        
        {activeTab === "collections" && (
          <div className="col-span-full text-gray-400 text-center py-8">
            You don't have any collections yet.
          </div>
        )}
        
        {activeTab === "workouts" && (
          <div className="col-span-full text-gray-400 text-center py-8">
            You don't have any workouts yet.
          </div>
        )}
        
        {activeTab === "programs" && (
          <div className="col-span-full text-gray-400 text-center py-8">
            You don't have any programs yet.
          </div>
        )}
        
        {activeTab === "created" && (
          <div className="col-span-full text-gray-400 text-center py-8">
            You haven't created any content yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
