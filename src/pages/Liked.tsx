
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Liked: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Liked</h1>
      
      <Tabs defaultValue="exercises" className="mb-8">
        <TabsList className="bg-dark-200 p-1">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="text-gray-400 text-center py-16">
        You haven't liked any items yet. Browse the library and click the heart icon to add items to your liked collection.
      </div>
    </div>
  );
};

export default Liked;
