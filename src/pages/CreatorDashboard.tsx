
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Dumbbell, BookOpen, Users, BarChart4 } from 'lucide-react';
import { ProductsOverview } from '@/components/creator/ProductsOverview';
import { WorkoutsManagement } from '@/components/creator/WorkoutsManagement';
import { ProgramsManagement } from '@/components/creator/ProgramsManagement';
import { ClubsManagement } from '@/components/creator/ClubsManagement';
import { SalesAnalytics } from '@/components/creator/SalesAnalytics';

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container py-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Creator Dashboard</h1>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-dark-200 grid grid-cols-5 max-w-4xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span>Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Programs</span>
          </TabsTrigger>
          <TabsTrigger value="clubs" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Clubs</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <ProductsOverview onNavigate={setActiveTab} />
        </TabsContent>
        
        <TabsContent value="workouts" className="space-y-4">
          <WorkoutsManagement />
        </TabsContent>
        
        <TabsContent value="programs" className="space-y-4">
          <ProgramsManagement />
        </TabsContent>
        
        <TabsContent value="clubs" className="space-y-4">
          <ClubsManagement />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <SalesAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreatorDashboard;
