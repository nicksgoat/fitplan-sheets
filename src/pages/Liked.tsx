
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Liked: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("exercises");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Liked</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-200"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <Button variant="outline" className="w-full md:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-dark-200 p-1">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exercises">
          <div className="text-gray-400 text-center py-16">
            You haven't liked any exercises yet. Browse the library and click the heart icon to add exercises to your liked collection.
          </div>
        </TabsContent>
        
        <TabsContent value="workouts">
          <div className="text-gray-400 text-center py-16">
            You haven't liked any workouts yet. Browse the library and click the heart icon to add workouts to your liked collection.
          </div>
        </TabsContent>
        
        <TabsContent value="programs">
          <div className="text-gray-400 text-center py-16">
            You haven't liked any programs yet. Browse the library and click the heart icon to add programs to your liked collection.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Liked;
